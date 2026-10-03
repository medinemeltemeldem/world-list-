"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { submitReview } from "@/services/review.service";

const reviewSchema = z.object({
  wordId: z.string().min(1),
  correct: z.boolean(),
  seconds: z.number().min(0).max(600),
});

export async function submitReviewAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: copy.validation.generic };

  const result = await submitReview(user.id, parsed.data.wordId, parsed.data.correct, parsed.data.seconds);
  if (!result) return { error: copy.validation.notFound };

  revalidatePath("/dashboard");
  revalidatePath("/review");
  revalidatePath("/statistics");
  revalidatePath("/difficult");
  revalidatePath(`/words/${parsed.data.wordId}`);

  return {
    status: result.status,
    nextReviewAt: result.nextReviewAt.toISOString(),
  };
}
