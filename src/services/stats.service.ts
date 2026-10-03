import {
  addCalendarDays,
  formatShortDate,
  istanbulDateKey,
  istanbulEndOfDay,
  istanbulStartOfDay,
  istanbulStartOfMonth,
  istanbulStartOfWeek,
} from "@/lib/dates";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { successRate } from "@/lib/utils";
import { getWordOfTheDay } from "@/services/word.service";

export async function getDashboard(userId: string, locale: Locale) {
  const now = new Date();
  const startToday = istanbulStartOfDay(now);
  const startWeek = istanbulStartOfWeek(now);
  const startMonth = istanbulStartOfMonth(now);
  const chartStart = addCalendarDays(startToday, -6);

  const [
    totalWords,
    weekWords,
    monthWords,
    learnedWords,
    dueWords,
    difficultWords,
    todayReviews,
    todayQuizAnswers,
    wordsToday,
    todaySessions,
    progress,
    goal,
    quizAgg,
    recentWords,
    wordOfTheDay,
    createdForChart,
  ] = await Promise.all([
    prisma.word.count({ where: { userId } }),
    prisma.word.count({ where: { userId, createdAt: { gte: startWeek } } }),
    prisma.word.count({ where: { userId, createdAt: { gte: startMonth } } }),
    prisma.word.count({ where: { userId, status: "LEARNED" } }),
    prisma.word.count({ where: { userId, nextReviewAt: { lte: istanbulEndOfDay(now) } } }),
    prisma.word.count({ where: { userId, status: "DIFFICULT" } }),
    prisma.review.count({ where: { userId, source: "REVIEW", reviewedAt: { gte: startToday } } }),
    prisma.quizQuestion.count({
      where: { answeredAt: { gte: startToday }, quiz: { userId } },
    }),
    prisma.word.count({ where: { userId, createdAt: { gte: startToday } } }),
    prisma.learningSession.findMany({
      where: { userId, createdAt: { gte: startToday } },
      select: { duration: true },
    }),
    prisma.userProgress.findUnique({ where: { userId } }),
    prisma.dailyGoal.findUnique({ where: { userId } }),
    prisma.quiz.aggregate({
      where: { userId, finishedAt: { not: null } },
      _sum: { correctCount: true, wrongCount: true },
    }),
    prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, tags: { include: { tag: true } } },
    }),
    getWordOfTheDay(userId),
    prisma.word.findMany({
      where: { userId, createdAt: { gte: chartStart } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, number>();
  for (let index = 0; index < 7; index += 1) {
    const day = addCalendarDays(chartStart, index);
    buckets.set(istanbulDateKey(day), 0);
  }
  for (const word of createdForChart) {
    const key = istanbulDateKey(word.createdAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const quizCorrect = quizAgg._sum.correctCount ?? 0;
  const quizWrong = quizAgg._sum.wrongCount ?? 0;

  return {
    totalWords,
    weekWords,
    monthWords,
    learnedWords,
    dueWords,
    difficultWords,
    todayActivity: todayReviews + todayQuizAnswers,
    todayStudySeconds: todaySessions.reduce((sum, session) => sum + session.duration, 0),
    totalStudySeconds: progress?.totalStudySeconds ?? 0,
    streak: progress?.currentStreak ?? 0,
    wordsToday,
    reviewsToday: todayReviews,
    goalWords: goal?.wordsPerDay ?? 10,
    goalReviews: goal?.reviewsPerDay ?? 20,
    quizSuccessRate: successRate(quizCorrect, quizWrong),
    recentWords,
    wordOfTheDay,
    last7Days: [...buckets.entries()].map(([key, count]) => ({
      label: formatShortDate(new Date(`${key}T12:00:00+03:00`), locale),
      count,
    })),
  };
}

export async function getStatistics(userId: string, locale: Locale) {
  const today = istanbulStartOfDay();
  const start30 = addCalendarDays(today, -29);
  const startWeeks = addCalendarDays(istanbulStartOfWeek(), -49);
  const thisMonthStart = istanbulStartOfMonth();
  const lastMonthStart = istanbulStartOfMonth(addCalendarDays(thisMonthStart, -1));

  const [words, progress, reviewCount, quizAgg, statusGroups, levelGroups, thisMonth, lastMonth] = await Promise.all([
    prisma.word.findMany({
      where: { userId, createdAt: { gte: startWeeks } },
      select: { createdAt: true },
    }),
    prisma.userProgress.findUnique({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
    prisma.quiz.aggregate({
      where: { userId, finishedAt: { not: null } },
      _sum: { correctCount: true, wrongCount: true },
    }),
    prisma.word.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.word.groupBy({
      by: ["level"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.word.count({ where: { userId, createdAt: { gte: thisMonthStart } } }),
    prisma.word.count({
      where: { userId, createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
    }),
  ]);

  const daily = new Map<string, number>();
  for (let index = 0; index < 30; index += 1) {
    daily.set(istanbulDateKey(addCalendarDays(start30, index)), 0);
  }
  const weekly = new Map<string, number>();
  for (let index = 0; index < 8; index += 1) {
    weekly.set(istanbulDateKey(addCalendarDays(startWeeks, index * 7)), 0);
  }

  for (const word of words) {
    const key = istanbulDateKey(word.createdAt);
    if (daily.has(key)) daily.set(key, (daily.get(key) ?? 0) + 1);
    const weekKey = istanbulDateKey(istanbulStartOfWeek(word.createdAt));
    if (weekly.has(weekKey)) weekly.set(weekKey, (weekly.get(weekKey) ?? 0) + 1);
  }

  const learned = statusGroups.find((row) => row.status === "LEARNED")?._count._all ?? 0;
  const difficult = statusGroups.find((row) => row.status === "DIFFICULT")?._count._all ?? 0;
  const correct = quizAgg._sum.correctCount ?? 0;
  const wrong = quizAgg._sum.wrongCount ?? 0;

  return {
    daily: [...daily.entries()].map(([key, count]) => ({
      label: formatShortDate(new Date(`${key}T12:00:00+03:00`), locale),
      count,
    })),
    weekly: [...weekly.entries()].map(([key, count]) => ({
      label: formatShortDate(new Date(`${key}T12:00:00+03:00`), locale),
      count,
    })),
    thisMonth,
    lastMonth,
    quizSuccessRate: successRate(correct, wrong),
    learned,
    difficult,
    reviewCount,
    streak: progress?.currentStreak ?? 0,
    longestStreak: progress?.longestStreak ?? 0,
    totalStudySeconds: progress?.totalStudySeconds ?? 0,
    statuses: statusGroups.map((row) => ({ status: row.status, count: row._count._all })),
    levels: levelGroups.map((row) => ({ level: row.level, count: row._count._all })),
  };
}
