import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StartQuizButton } from "@/components/start-quiz-button";
import { buttonClass } from "@/components/ui/button";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { fill, successRate } from "@/lib/utils";
import { getOwnedQuiz } from "@/services/quiz.service";

export const metadata: Metadata = { title: "Quiz sonucu" };

export default async function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const { id } = await params;
  const quiz = await getOwnedQuiz(user.id, id);
  if (!quiz) notFound();

  const correct = quiz.questions.filter((question) => question.isCorrect).length;
  const wrong = quiz.questions.filter((question) => question.isCorrect === false).length;
  const rate = successRate(correct, wrong) ?? 0;
  const wrongIds = [...new Set(quiz.questions.filter((question) => question.isCorrect === false).map((question) => question.wordId))];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{copy.quiz.resultTitle}</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label={copy.quiz.total} value={String(quiz.questions.length)} />
        <Stat label={copy.detail.correct} value={String(correct)} />
        <Stat label={copy.detail.wrong} value={String(wrong)} />
      </div>
      <p className="mt-6 text-center font-serif text-6xl text-indigo-600">%{rate}</p>
      <p className="text-center text-sm text-muted">{copy.quiz.success}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/quiz" className={buttonClass("secondary")}>{copy.quiz.back}</Link>
        {wrongIds.length > 0 ? <StartQuizButton copy={copy} label={copy.quiz.retry} wordIds={wrongIds} /> : null}
      </div>
      <ul className="mt-8 space-y-3">
        {quiz.questions.map((question) => (
          <li key={question.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted">{copy.quiz.help[question.questionType]}</p>
            <p className="mt-1 font-medium">{question.prompt}</p>
            <p className={question.isCorrect ? "mt-2 text-sm text-emerald-600" : "mt-2 text-sm text-rose-600"}>
              {question.isCorrect ? `✓ ${copy.quiz.correct}` : `✗ ${copy.quiz.wrong}`}
            </p>
            <p className="mt-1 text-sm text-muted">
              {copy.quiz.yourAnswer}: {question.userAnswer || copy.quiz.emptyAnswer}
            </p>
            {question.isCorrect === false ? (
              <p className="text-sm">{fill(copy.quiz.answerWas, { answer: question.correctAnswer })}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
