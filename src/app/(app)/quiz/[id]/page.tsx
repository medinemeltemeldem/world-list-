import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { QuizSession } from "@/components/quiz-session";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { asStringOptions } from "@/lib/utils";
import { getOwnedQuiz } from "@/services/quiz.service";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const { id } = await params;
  const quiz = await getOwnedQuiz(user.id, id);
  if (!quiz) notFound();

  const pending = quiz.questions.filter((question) => question.userAnswer === null);
  if (pending.length === 0) redirect(`/quiz/${quiz.id}/result`);

  return (
    <QuizSession
      quizId={quiz.id}
      copy={copy}
      cards={pending.map((question) => ({
        id: question.id,
        questionType: question.questionType,
        prompt: question.prompt,
        options: asStringOptions(question.options),
      }))}
    />
  );
}
