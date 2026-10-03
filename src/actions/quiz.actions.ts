"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { quizSetupSchema } from "@/lib/validators";
import { answerQuizQuestion, createQuiz } from "@/services/quiz.service";

export async function createQuizAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = quizSetupSchema().safeParse(input);
  if (!parsed.success) return { error: copy.validation.generic };

  const result = await createQuiz(user.id, parsed.data);
  if ("error" in result) {
    return { error: result.error === "NEED_FIVE" ? copy.quiz.needFive : copy.quiz.needLevel };
  }

  revalidatePath("/quiz");
  return { id: result.id };
}

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().max(300),
  seconds: z.number().min(0).max(600),
});

export async function answerQuizAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { error: copy.validation.generic };

  const result = await answerQuizQuestion(user.id, parsed.data.questionId, parsed.data.answer, parsed.data.seconds);
  if (!result) return { error: copy.validation.notFound };

  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  revalidatePath("/difficult");
  revalidatePath("/review");
  return result;
}
