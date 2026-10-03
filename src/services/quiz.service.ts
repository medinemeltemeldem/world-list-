import { Prisma, type QuestionType, type QuizType } from "@prisma/client";
import type { Level } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { applyQuizResult } from "@/lib/srs";
import { answersMatch, blankSentence, normalizeLoose, shuffle } from "@/lib/utils";
import { applyActivity } from "@/services/study.service";

const FALLBACK_TR = [
  "unutmak",
  "kaybetmek",
  "beklemek",
  "başlamak",
  "anlamak",
  "kullanmak",
  "sevmek",
  "gitmek",
  "almak",
  "vermek",
  "görmek",
  "duymak",
];

const FALLBACK_EN = [
  "forget",
  "lose",
  "wait",
  "begin",
  "understand",
  "use",
  "love",
  "go",
  "take",
  "give",
  "see",
  "hear",
];

export type QuizErrorCode = "NO_WORDS" | "NEED_FIVE";

type QuizWord = {
  id: string;
  englishWord: string;
  turkishMeaning: string;
  exampleSentence: string | null;
};

function optionKey(value: string) {
  return normalizeLoose(value).toLocaleLowerCase("en-US");
}

function uniqueOptions(correct: string, pool: string[]) {
  const seen = new Set<string>();
  const options: string[] = [];
  const add = (value: string) => {
    const key = optionKey(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push(value);
  };
  add(correct);
  for (const item of shuffle(pool)) {
    add(item);
    if (options.length === 4) break;
  }
  return shuffle(options);
}

function pickType(quizType: QuizType, word: QuizWord): QuestionType {
  if (quizType === "EN_TO_TR") return "MULTIPLE_CHOICE_EN_TR";
  if (quizType === "TR_TO_EN") return "MULTIPLE_CHOICE_TR_EN";
  if (quizType === "WRITTEN") return Math.random() < 0.5 ? "WRITTEN_EN" : "WRITTEN_TR";
  const types: QuestionType[] = [
    "MULTIPLE_CHOICE_EN_TR",
    "MULTIPLE_CHOICE_TR_EN",
    "WRITTEN_EN",
    "WRITTEN_TR",
  ];
  if (word.exampleSentence && blankSentence(word.exampleSentence, word.englishWord)) {
    types.push("FILL_BLANK");
  }
  return types[Math.floor(Math.random() * types.length)] ?? "MULTIPLE_CHOICE_EN_TR";
}

function buildQuestion(word: QuizWord, type: QuestionType, pool: QuizWord[]) {
  if (type === "FILL_BLANK") {
    const prompt = word.exampleSentence ? blankSentence(word.exampleSentence, word.englishWord) : null;
    if (!prompt) return buildQuestion(word, "WRITTEN_EN", pool);
    return {
      questionType: "FILL_BLANK" as const,
      prompt,
      options: [] as string[],
      correctAnswer: word.englishWord,
    };
  }

  if (type === "WRITTEN_EN") {
    return {
      questionType: type,
      prompt: word.turkishMeaning,
      options: [] as string[],
      correctAnswer: word.englishWord,
    };
  }

  if (type === "WRITTEN_TR") {
    return {
      questionType: type,
      prompt: word.englishWord,
      options: [] as string[],
      correctAnswer: word.turkishMeaning,
    };
  }

  if (type === "MULTIPLE_CHOICE_TR_EN") {
    return {
      questionType: type,
      prompt: word.turkishMeaning,
      options: uniqueOptions(word.englishWord, [...pool.map((item) => item.englishWord), ...FALLBACK_EN]),
      correctAnswer: word.englishWord,
    };
  }

  return {
    questionType: "MULTIPLE_CHOICE_EN_TR" as const,
    prompt: word.englishWord,
    options: uniqueOptions(word.turkishMeaning, [...pool.map((item) => item.turkishMeaning), ...FALLBACK_TR]),
    correctAnswer: word.turkishMeaning,
  };
}

export async function createQuiz(
  userId: string,
  input: {
    count: 5 | 10 | 20;
    level: Level | "ALL";
    type: QuizType;
    pool?: "all" | "difficult";
    wordIds?: string[];
  },
) {
  const where: Prisma.WordWhereInput = { userId };
  if (input.level !== "ALL") where.level = input.level;
  if (input.pool === "difficult") where.wrongCount = { gt: 0 };
  if (input.wordIds && input.wordIds.length > 0) where.id = { in: input.wordIds };

  const words = await prisma.word.findMany({
    where,
    select: { id: true, englishWord: true, turkishMeaning: true, exampleSentence: true },
  });

  const remedial = input.pool === "difficult" || Boolean(input.wordIds && input.wordIds.length > 0);
  if (words.length === 0) return { error: "NO_WORDS" as const };
  if (!remedial && words.length < 5) return { error: "NEED_FIVE" as const };

  const selected = shuffle(words).slice(0, input.count);
  const quiz = await prisma.quiz.create({
    data: {
      userId,
      type: input.type,
      level: input.level === "ALL" ? null : input.level,
      questionCount: selected.length,
      questions: {
        create: selected.map((word, index) => {
          const question = buildQuestion(word, pickType(input.type, word), words);
          return {
            wordId: word.id,
            position: index,
            questionType: question.questionType,
            prompt: question.prompt,
            options: question.options.length > 0 ? question.options : undefined,
            correctAnswer: question.correctAnswer,
          };
        }),
      },
    },
    select: { id: true },
  });

  return { id: quiz.id };
}

export async function getOwnedQuiz(userId: string, quizId: string) {
  return prisma.quiz.findFirst({
    where: { id: quizId, userId },
    include: {
      questions: {
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function answerQuizQuestion(userId: string, questionId: string, userAnswer: string, seconds: number) {
  const question = await prisma.quizQuestion.findFirst({
    where: { id: questionId, quiz: { userId } },
    include: { word: true, quiz: true },
  });
  if (!question) return null;

  if (question.userAnswer !== null) {
    const remaining = await prisma.quizQuestion.count({
      where: { quizId: question.quizId, userAnswer: null },
    });
    return {
      isCorrect: question.isCorrect === true,
      correctAnswer: question.correctAnswer,
      finished: remaining === 0,
    };
  }

  const isCorrect = answersMatch(question.correctAnswer, userAnswer);
  const next = applyQuizResult({
    correct: isCorrect,
    reviewStep: question.word.reviewStep,
    correctCount: question.word.correctCount,
    wrongCount: question.word.wrongCount,
    nextReviewAt: question.word.nextReviewAt,
  });

  let finished = false;
  let saved = false;
  await prisma.$transaction(async (tx) => {
    const updated = await tx.quizQuestion.updateMany({
      where: { id: question.id, userAnswer: null },
      data: {
        userAnswer: userAnswer.trim(),
        isCorrect,
        answeredAt: new Date(),
      },
    });
    if (updated.count === 0) return;
    saved = true;
    await tx.word.update({ where: { id: question.wordId }, data: next });
    await tx.review.create({
      data: {
        userId,
        wordId: question.wordId,
        correct: isCorrect,
        source: "QUIZ",
      },
    });
    await tx.quiz.update({
      where: { id: question.quizId },
      data: {
        correctCount: { increment: isCorrect ? 1 : 0 },
        wrongCount: { increment: isCorrect ? 0 : 1 },
      },
    });
    const remaining = await tx.quizQuestion.count({
      where: { quizId: question.quizId, userAnswer: null },
    });
    if (remaining === 0) {
      finished = true;
      await tx.quiz.update({
        where: { id: question.quizId },
        data: { finishedAt: new Date() },
      });
    }
    await applyActivity(tx, userId, seconds, "QUIZ", 1);
  });

  if (!saved) {
    const remaining = await prisma.quizQuestion.count({
      where: { quizId: question.quizId, userAnswer: null },
    });
    const current = await prisma.quizQuestion.findUnique({ where: { id: question.id } });
    return {
      isCorrect: current?.isCorrect === true,
      correctAnswer: question.correctAnswer,
      finished: remaining === 0,
    };
  }

  return { isCorrect, correctAnswer: question.correctAnswer, finished };
}
