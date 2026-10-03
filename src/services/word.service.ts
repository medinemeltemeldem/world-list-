import { Prisma } from "@prisma/client";
import { PAGE_SIZE, type Level } from "@/lib/constants";
import {
  dateInputToDate,
  dateInputToEnd,
  istanbulDateKey,
  istanbulEndOfDay,
  istanbulStartOfDay,
  istanbulStartOfMonth,
  istanbulStartOfWeek,
  addCalendarDays,
} from "@/lib/dates";
import type { WordFilters } from "@/lib/filters";
import { prisma } from "@/lib/prisma";
import { initialNextReviewAt } from "@/lib/srs";
import { emptyToNull, hashString, splitTerms } from "@/lib/utils";
import type { WordInput } from "@/lib/validators";

const wordListInclude = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.WordInclude;

const wordDetailInclude = {
  category: true,
  tags: { include: { tag: true } },
  sentences: { orderBy: { createdAt: "desc" as const } },
  reviews: { orderBy: { reviewedAt: "desc" as const }, take: 8 },
} satisfies Prisma.WordInclude;

export type WordListItem = Prisma.WordGetPayload<{ include: typeof wordListInclude }>;
export type WordDetail = Prisma.WordGetPayload<{ include: typeof wordDetailInclude }>;

function orderBy(sort: WordFilters["sort"]): Prisma.WordOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ learnedAt: "asc" }];
    case "alpha":
      return [{ englishWord: "asc" }];
    case "difficult":
      return [{ wrongCount: "desc" }, { correctCount: "asc" }];
    case "reviewed":
      return [{ reviewCount: "desc" }, { learnedAt: "desc" }];
    default:
      return [{ learnedAt: "desc" }, { createdAt: "desc" }];
  }
}

function learnedRange(filters: WordFilters): Prisma.DateTimeFilter | undefined {
  const now = new Date();
  if (filters.date === "today") return { gte: istanbulStartOfDay(now), lte: istanbulEndOfDay(now) };
  if (filters.date === "week") return { gte: istanbulStartOfWeek(now), lte: istanbulEndOfDay(now) };
  if (filters.date === "month") return { gte: istanbulStartOfMonth(now), lte: istanbulEndOfDay(now) };
  if (filters.date === "quarter") return { gte: addCalendarDays(istanbulStartOfDay(now), -90), lte: istanbulEndOfDay(now) };
  if (filters.date === "custom") {
    const range: Prisma.DateTimeFilter = {};
    if (filters.from) range.gte = dateInputToDate(filters.from);
    if (filters.to) range.lte = dateInputToEnd(filters.to);
    return range.gte || range.lte ? range : undefined;
  }
  return undefined;
}

function whereFor(userId: string, filters: WordFilters): Prisma.WordWhereInput {
  const q = filters.q?.trim();
  return {
    userId,
    ...(filters.partOfSpeech ? { partOfSpeech: filters.partOfSpeech } : {}),
    ...(filters.level ? { level: filters.level } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.favorite ? { isFavorite: true } : {}),
    ...(filters.tag ? { tags: { some: { tag: { userId, name: filters.tag } } } } : {}),
    ...(learnedRange(filters) ? { learnedAt: learnedRange(filters) } : {}),
    ...(q
      ? {
          OR: [
            { englishWord: { contains: q, mode: "insensitive" } },
            { turkishMeaning: { contains: q, mode: "insensitive" } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

async function resolveCategory(userId: string, name: string, unit: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return prisma.category.upsert({
    where: { userId_name: { userId, name: trimmed } },
    update: unit.trim() ? { unit: unit.trim() } : {},
    create: { userId, name: trimmed, unit: unit.trim() || null },
  });
}

async function syncTags(userId: string, wordId: string, tagNames: string[]) {
  const unique = [...new Set(tagNames.map((tag) => tag.trim()).filter(Boolean))].slice(0, 12);
  await prisma.wordTag.deleteMany({ where: { wordId } });
  for (const name of unique) {
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId, name } },
      update: {},
      create: { userId, name },
    });
    await prisma.wordTag.create({ data: { wordId, tagId: tag.id } });
  }
}

function wordData(input: WordInput, categoryId: string | null) {
  return {
    englishWord: input.englishWord,
    turkishMeaning: input.turkishMeaning,
    partOfSpeech: input.partOfSpeech,
    level: input.level,
    exampleSentence: emptyToNull(input.exampleSentence),
    turkishExample: emptyToNull(input.turkishExample),
    note: emptyToNull(input.note),
    learnedAt: dateInputToDate(input.learnedAt),
    isFavorite: input.isFavorite,
    categoryId,
    pronunciation: emptyToNull(input.pronunciation),
    ipa: emptyToNull(input.ipa),
    definition: emptyToNull(input.definition),
    synonyms: splitTerms(input.synonyms),
    antonyms: splitTerms(input.antonyms),
    relatedWords: splitTerms(input.relatedWords),
  };
}

export async function listWords(userId: string, filters: WordFilters) {
  const where = whereFor(userId, filters);
  const [total, words] = await prisma.$transaction([
    prisma.word.count({ where }),
    prisma.word.findMany({
      where,
      orderBy: orderBy(filters.sort),
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: wordListInclude,
    }),
  ]);

  return {
    words,
    total,
    page: filters.page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function countWords(userId: string) {
  return prisma.word.count({ where: { userId } });
}

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function listTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getWord(userId: string, id: string) {
  return prisma.word.findFirst({
    where: { id, userId },
    include: wordDetailInclude,
  });
}

export async function createWord(userId: string, input: WordInput) {
  const category = await resolveCategory(userId, input.categoryName, input.categoryUnit);
  const learnedAt = dateInputToDate(input.learnedAt);
  const word = await prisma.word.create({
    data: {
      userId,
      ...wordData(input, category?.id ?? null),
      learnedAt,
      nextReviewAt: initialNextReviewAt(learnedAt),
      status: "NEW",
    },
  });
  await syncTags(userId, word.id, input.tags);
  return word;
}

export async function updateWord(userId: string, id: string, input: WordInput) {
  const existing = await prisma.word.findFirst({ where: { id, userId } });
  if (!existing) return null;
  const category = await resolveCategory(userId, input.categoryName, input.categoryUnit);
  const learnedAt = dateInputToDate(input.learnedAt);
  const word = await prisma.word.update({
    where: { id: existing.id },
    data: {
      ...wordData(input, category?.id ?? null),
      learnedAt,
      status: input.status ?? existing.status,
      ...(existing.reviewCount === 0 ? { nextReviewAt: initialNextReviewAt(learnedAt) } : {}),
    },
  });
  await syncTags(userId, word.id, input.tags);
  return word;
}

export async function deleteWord(userId: string, id: string) {
  const existing = await prisma.word.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return false;
  await prisma.word.delete({ where: { id: existing.id } });
  return true;
}

export async function toggleFavorite(userId: string, id: string) {
  const existing = await prisma.word.findFirst({
    where: { id, userId },
    select: { id: true, isFavorite: true },
  });
  if (!existing) return null;
  return prisma.word.update({
    where: { id: existing.id },
    data: { isFavorite: !existing.isFavorite },
    select: { isFavorite: true },
  });
}

export async function getDueWords(userId: string, wordId?: string) {
  if (wordId) {
    const word = await prisma.word.findFirst({
      where: { id: wordId, userId },
      include: wordListInclude,
    });
    return word ? [word] : [];
  }

  return prisma.word.findMany({
    where: {
      userId,
      nextReviewAt: { lte: istanbulEndOfDay() },
    },
    orderBy: [{ nextReviewAt: "asc" }, { wrongCount: "desc" }],
    include: wordListInclude,
  });
}

export async function countDueWords(userId: string) {
  return prisma.word.count({
    where: { userId, nextReviewAt: { lte: istanbulEndOfDay() } },
  });
}

export async function getDifficultWords(userId: string) {
  return prisma.word.findMany({
    where: { userId, wrongCount: { gt: 0 } },
    orderBy: [{ wrongCount: "desc" }, { correctCount: "asc" }],
    include: wordListInclude,
  });
}

export async function getFavoriteWords(userId: string) {
  return prisma.word.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: wordListInclude,
  });
}

export async function getWordOfTheDay(userId: string) {
  const words = await prisma.word.findMany({
    where: { userId },
    include: wordListInclude,
    orderBy: { createdAt: "asc" },
  });
  if (words.length === 0) return null;
  const end = istanbulEndOfDay();
  const priority = words.filter(
    (word) => word.status === "DIFFICULT" || (word.nextReviewAt !== null && word.nextReviewAt <= end),
  );
  const learning = words.filter((word) => word.status !== "LEARNED");
  const pool = priority.length > 0 ? priority : learning.length > 0 ? learning : words;
  const index = hashString(`${userId}:${istanbulDateKey(new Date())}`) % pool.length;
  return pool[index] ?? null;
}

export async function getLearningHistory(userId: string) {
  const words = await prisma.word.findMany({
    where: { userId },
    select: { learnedAt: true },
    orderBy: { learnedAt: "desc" },
  });
  const counts = new Map<string, number>();
  for (const word of words) {
    const key = istanbulDateKey(word.learnedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([date, count]) => ({ date, count }));
}

export async function getWordsOnDate(userId: string, dateKey: string) {
  return prisma.word.findMany({
    where: {
      userId,
      learnedAt: {
        gte: dateInputToDate(dateKey),
        lte: dateInputToEnd(dateKey),
      },
    },
    orderBy: { createdAt: "asc" },
    include: wordListInclude,
  });
}

export async function addSentence(userId: string, wordId: string, sentence: string) {
  const word = await prisma.word.findFirst({ where: { id: wordId, userId }, select: { id: true } });
  if (!word) return null;
  return prisma.userSentence.create({
    data: { userId, wordId: word.id, sentence },
  });
}

export async function getLevelCounts(userId: string, difficultOnly = false) {
  const grouped = await prisma.word.groupBy({
    by: ["level"],
    where: {
      userId,
      ...(difficultOnly ? { wrongCount: { gt: 0 } } : {}),
    },
    _count: { _all: true },
  });
  const counts: Record<Level | "ALL", number> = { ALL: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const row of grouped) {
    counts[row.level] = row._count._all;
    counts.ALL += row._count._all;
  }
  return counts;
}
