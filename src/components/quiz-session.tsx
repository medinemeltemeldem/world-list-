"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { answerQuizAction } from "@/actions/quiz.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import type { QuestionType } from "@/lib/constants";
import type { Copy } from "@/lib/copy";
import { cn, fill } from "@/lib/utils";

export type QuizCard = {
  id: string;
  questionType: QuestionType;
  prompt: string;
  options: string[];
};

export function QuizSession({ quizId, cards, copy }: { quizId: string; cards: QuizCard[]; copy: Copy }) {
  const router = useRouter();
  const [queue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string; finished: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const card = queue[index];
  const written = card?.questionType === "WRITTEN_EN" || card?.questionType === "WRITTEN_TR" || card?.questionType === "FILL_BLANK";

  if (!card) return null;

  async function check() {
    const answer = written ? typed : selected;
    if (!answer.trim()) return;
    setPending(true);
    const result = await answerQuizAction({
      questionId: card.id,
      answer,
      seconds: Math.round((Date.now() - startedAt) / 1000),
    });
    setPending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setFeedback({ correct: result.isCorrect, answer: result.correctAnswer, finished: result.finished });
  }

  function next() {
    if (feedback?.finished || index === queue.length - 1) {
      router.push(`/quiz/${quizId}/result`);
      router.refresh();
      return;
    }
    setIndex((current) => current + 1);
    setSelected("");
    setTyped("");
    setFeedback(null);
    setStartedAt(Date.now());
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col rounded-3xl border border-border bg-card p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-sm text-muted">{fill(copy.review.progress, { current: index + 1, total: queue.length })}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${((index + (feedback ? 1 : 0)) / queue.length) * 100}%` }} />
      </div>
      <p className="mt-8 text-sm text-muted">{copy.quiz.help[card.questionType]}</p>
      <h1 className="mt-3 break-words font-serif text-4xl tracking-tight sm:text-5xl">{card.prompt}</h1>

      {!feedback && !written ? (
        <div className="mt-8 grid gap-3">
          {card.options.map((option, optionIndex) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(option)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm",
                selected === option ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/15" : "border-border",
              )}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-semibold dark:bg-slate-800">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {!feedback && written ? (
        <Input className="mt-8" value={typed} placeholder={copy.quiz.placeholder} onChange={(event) => setTyped(event.target.value)} autoCapitalize="none" />
      ) : null}

      {!feedback ? (
        <Button type="button" className="mt-6 w-full" size="lg" disabled={pending || (written ? !typed.trim() : !selected)} onClick={() => void check()}>
          {copy.quiz.check}
        </Button>
      ) : (
        <div className="mt-8">
          <p className={cn("text-lg font-semibold", feedback.correct ? "text-emerald-600" : "text-rose-600")}>
            {feedback.correct ? `✓ ${copy.quiz.correct}` : `✗ ${copy.quiz.wrong}`}
          </p>
          {!feedback.correct ? <p className="mt-2 text-sm text-muted">{fill(copy.quiz.answerWas, { answer: feedback.answer })}</p> : null}
          <Button type="button" className="mt-6 w-full" size="lg" onClick={next}>
            {feedback.finished || index === queue.length - 1 ? copy.quiz.finish : copy.quiz.next}
          </Button>
        </div>
      )}
    </section>
  );
}
