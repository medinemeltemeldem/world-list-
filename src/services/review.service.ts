import { prisma } from "@/lib/prisma";
import { applyReview } from "@/lib/srs";
import { applyActivity } from "@/services/study.service";

export async function submitReview(userId: string, wordId: string, correct: boolean, seconds: number) {
  const word = await prisma.word.findFirst({ where: { id: wordId, userId } });
  if (!word) return null;

  const next = applyReview({
    correct,
    reviewStep: word.reviewStep,
    correctCount: word.correctCount,
    wrongCount: word.wrongCount,
  });

  await prisma.$transaction(async (tx) => {
    await tx.word.update({ where: { id: word.id }, data: next });
    await tx.review.create({
      data: { userId, wordId: word.id, correct, source: "REVIEW" },
    });
    await applyActivity(tx, userId, seconds, "REVIEW", 1);
  });

  return next;
}
