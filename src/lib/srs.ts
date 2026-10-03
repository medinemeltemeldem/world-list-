import type { LearningStatus } from "@/lib/constants";
import { addCalendarDays, istanbulStartOfDay } from "@/lib/dates";

const SUCCESS_INTERVALS_DAYS = [3, 7, 14, 30] as const;

export function initialNextReviewAt(learnedAt: Date) {
  return addCalendarDays(istanbulStartOfDay(learnedAt), 1);
}

export function deriveStatus(input: {
  correctCount: number;
  wrongCount: number;
  reviewStep: number;
}): LearningStatus {
  const total = input.correctCount + input.wrongCount;
  if (total === 0) return "NEW";
  const rate = input.correctCount / total;
  if (input.reviewStep >= 4 && rate >= 0.7 && input.correctCount >= 4) return "LEARNED";
  if (total >= 3 && input.wrongCount >= 2 && rate < 0.6) return "DIFFICULT";
  if (input.reviewStep >= 2) return "REVIEW";
  return "LEARNING";
}

export function applyReview(input: {
  correct: boolean;
  reviewStep: number;
  correctCount: number;
  wrongCount: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const correctCount = input.correctCount + (input.correct ? 1 : 0);
  const wrongCount = input.wrongCount + (input.correct ? 0 : 1);
  const reviewStep = input.correct ? Math.min(input.reviewStep + 1, 4) : 0;
  const days = input.correct
    ? SUCCESS_INTERVALS_DAYS[Math.min(input.reviewStep, SUCCESS_INTERVALS_DAYS.length - 1)]
    : 1;

  return {
    correctCount,
    wrongCount,
    reviewCount: correctCount + wrongCount,
    reviewStep,
    nextReviewAt: addCalendarDays(istanbulStartOfDay(now), days),
    lastReviewedAt: now,
    status: deriveStatus({ correctCount, wrongCount, reviewStep }),
  };
}

export function applyQuizResult(input: {
  correct: boolean;
  reviewStep: number;
  correctCount: number;
  wrongCount: number;
  nextReviewAt: Date | null;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const correctCount = input.correctCount + (input.correct ? 1 : 0);
  const wrongCount = input.wrongCount + (input.correct ? 0 : 1);
  let reviewStep = input.reviewStep;
  let nextReviewAt = input.nextReviewAt;

  if (!input.correct) {
    reviewStep = 0;
    const tomorrow = addCalendarDays(istanbulStartOfDay(now), 1);
    if (!nextReviewAt || nextReviewAt > tomorrow) nextReviewAt = tomorrow;
  }

  return {
    correctCount,
    wrongCount,
    reviewCount: correctCount + wrongCount,
    reviewStep,
    nextReviewAt,
    lastReviewedAt: now,
    status: deriveStatus({ correctCount, wrongCount, reviewStep }),
  };
}
