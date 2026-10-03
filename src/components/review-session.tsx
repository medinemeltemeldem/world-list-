"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { submitReviewAction } from "@/actions/review.actions";
import { LevelBadge, PosBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import type { LearningStatus, Level, PartOfSpeech } from "@/lib/constants";
import type { Copy } from "@/lib/copy";
import { formatDate } from "@/lib/dates";
import { fill } from "@/lib/utils";

export type ReviewCard = {
  id: string;
  englishWord: string;
  turkishMeaning: string;
  partOfSpeech: PartOfSpeech;
  level: Level;
  exampleSentence: string | null;
  turkishExample: string | null;
};

export function ReviewSession({ cards, copy, locale }: { cards: ReviewCard[]; copy: Copy; locale: "tr" | "en" }) {
  const [queue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; nextReviewAt?: string } | null>(null);
  const [counts, setCounts] = useState({ correct: 0, wrong: 0 });
  const [pending, setPending] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const card = queue[index];

  if (!card) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-medium text-indigo-600">{copy.review.doneTitle}</p>
        <h1 className="mt-2 font-serif text-4xl">{counts.correct + counts.wrong}</h1>
        <p className="mt-3 text-sm text-muted">
          {fill(copy.review.doneBody, { total: counts.correct + counts.wrong, correct: counts.correct, wrong: counts.wrong })}
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white">
          {copy.review.again}
        </Link>
      </section>
    );
  }

  async function answer(correct: boolean) {
    setPending(true);
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    const result = await submitReviewAction({ wordId: card.id, correct, seconds });
    setPending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCounts((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    }));
    setFeedback({ correct, nextReviewAt: result.nextReviewAt });
  }

  function next() {
    setIndex((current) => current + 1);
    setRevealed(false);
    setFeedback(null);
    setStartedAt(Date.now());
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col rounded-3xl border border-border bg-card p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-sm font-medium text-muted">{fill(copy.review.progress, { current: index + 1, total: queue.length })}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${((index + (feedback ? 1 : 0)) / queue.length) * 100}%` }} />
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <PosBadge value={card.partOfSpeech} copy={copy} />
        <LevelBadge level={card.level} />
      </div>
      <h1 className="mt-4 break-words font-serif text-5xl tracking-tight sm:text-6xl">{card.englishWord}</h1>

      {!revealed && !feedback ? (
        <Button type="button" className="mt-10 w-full" size="lg" onClick={() => setRevealed(true)}>
          {copy.review.show}
        </Button>
      ) : null}

      {revealed || feedback ? (
        <div className="mt-8">
          <p className="text-2xl font-medium">{card.turkishMeaning}</p>
          {card.exampleSentence ? (
            <p className="mt-4 text-sm text-muted">
              <span className="font-medium text-foreground">{copy.review.example}: </span>
              {card.exampleSentence}
            </p>
          ) : null}
          {card.turkishExample ? <p className="mt-2 text-sm text-muted">{card.turkishExample}</p> : null}
        </div>
      ) : null}

      {revealed && !feedback ? (
        <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-2">
          <Button type="button" variant="success" size="lg" disabled={pending} onClick={() => void answer(true)}>
            {copy.review.knew}
          </Button>
          <Button type="button" variant="danger" size="lg" disabled={pending} onClick={() => void answer(false)}>
            {copy.review.missed}
          </Button>
        </div>
      ) : null}

      {feedback ? (
        <div className="mt-auto pt-8">
          <p className={feedback.correct ? "text-emerald-600" : "text-rose-600"}>
            {feedback.correct
              ? fill(copy.review.correct, { date: feedback.nextReviewAt ? formatDate(feedback.nextReviewAt, locale) : "" })
              : copy.review.wrong}
          </p>
          <Button type="button" className="mt-4 w-full" size="lg" onClick={next}>
            {copy.common.continue}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export type ReviewStatus = LearningStatus;
