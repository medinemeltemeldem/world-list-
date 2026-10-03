import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, RotateCcw } from "lucide-react";
import { LevelBadge, PosBadge, StatusBadge } from "@/components/badges";
import { DeleteWordButton } from "@/components/delete-word-button";
import { FavoriteButton } from "@/components/favorite-button";
import { SentenceForm } from "@/components/sentence-form";
import { buttonClass } from "@/components/ui/button";
import { getCopy, localeOf } from "@/lib/copy";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { successRate } from "@/lib/utils";
import { getWord } from "@/services/word.service";

export const metadata: Metadata = { title: "Kelime" };

export default async function WordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const { id } = await params;
  const word = await getWord(user.id, id);
  if (!word) notFound();
  const rate = successRate(word.correctCount, word.wrongCount);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="break-words font-serif text-5xl tracking-tight">{word.englishWord}</h1>
            <p className="mt-2 text-xl text-muted">{word.turkishMeaning}</p>
          </div>
          <FavoriteButton wordId={word.id} initial={word.isFavorite} copy={copy} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PosBadge value={word.partOfSpeech} copy={copy} />
          <LevelBadge level={word.level} />
          <StatusBadge status={word.status} copy={copy} />
          {word.tags.map((item) => (
            <span key={item.tagId} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800">{item.tag.name}</span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/words/${word.id}/edit`} className={buttonClass("secondary", "sm")}>
            <Pencil className="h-4 w-4" />
            {copy.common.edit}
          </Link>
          <Link href={`/review?word=${word.id}`} className={buttonClass("primary", "sm")}>
            <RotateCcw className="h-4 w-4" />
            {copy.common.review}
          </Link>
          <DeleteWordButton wordId={word.id} word={word.englishWord} copy={copy} redirectToList />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label={copy.detail.learned} value={formatDate(word.learnedAt, locale)} />
        <Info label={copy.detail.added} value={formatDate(word.createdAt, locale)} />
        <Info label={copy.detail.category} value={word.category ? `${word.category.name}${word.category.unit ? ` · ${word.category.unit}` : ""}` : copy.common.none} />
        <Info label={copy.detail.next} value={word.nextReviewAt ? formatDate(word.nextReviewAt, locale) : copy.common.none} />
      </div>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{copy.detail.examples}</h2>
        {word.exampleSentence ? <p className="mt-3 text-sm">{word.exampleSentence}</p> : <p className="mt-3 text-sm text-muted">{copy.common.none}</p>}
        {word.turkishExample ? <p className="mt-2 text-sm text-muted">{copy.detail.turkish}: {word.turkishExample}</p> : null}
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Info label={copy.detail.reviewCount} value={String(word.reviewCount)} />
        <Info label={copy.detail.correct} value={String(word.correctCount)} />
        <Info label={copy.detail.wrong} value={String(word.wrongCount)} />
        <Info label={copy.detail.rate} value={rate === null ? copy.common.none : `%${rate}`} />
        <Info label={copy.detail.last} value={word.lastReviewedAt ? formatDate(word.lastReviewedAt, locale) : copy.common.none} />
        <Info label={copy.detail.next} value={word.nextReviewAt ? formatDate(word.nextReviewAt, locale) : copy.common.none} />
      </section>

      {word.note ? (
        <section className="mt-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-semibold">{copy.detail.note}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{word.note}</p>
        </section>
      ) : null}

      {(word.pronunciation || word.ipa || word.definition || word.synonyms.length || word.antonyms.length || word.relatedWords.length) ? (
        <section className="mt-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-semibold">{copy.detail.lexical}</h2>
          <div className="mt-3 grid gap-3 text-sm">
            {word.pronunciation ? <p><span className="text-muted">{copy.detail.pronunciation}: </span>{word.pronunciation}</p> : null}
            {word.ipa ? <p><span className="text-muted">{copy.detail.ipa}: </span>{word.ipa}</p> : null}
            {word.definition ? <p><span className="text-muted">{copy.detail.definition}: </span>{word.definition}</p> : null}
            {word.synonyms.length ? <p><span className="text-muted">{copy.detail.synonyms}: </span>{word.synonyms.join(", ")}</p> : null}
            {word.antonyms.length ? <p><span className="text-muted">{copy.detail.antonyms}: </span>{word.antonyms.join(", ")}</p> : null}
            {word.relatedWords.length ? <p><span className="text-muted">{copy.detail.related}: </span>{word.relatedWords.join(", ")}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{copy.detail.sentences}</h2>
        <p className="mt-1 text-sm text-muted">{copy.detail.sentencesHint}</p>
        <div className="mt-4">
          <SentenceForm wordId={word.id} copy={copy} />
        </div>
        <h3 className="mt-6 text-sm font-semibold">{copy.detail.yourSentences}</h3>
        {word.sentences.length === 0 ? <p className="mt-2 text-sm text-muted">{copy.detail.noSentences}</p> : (
          <ul className="mt-3 space-y-2">
            {word.sentences.map((sentence) => (
              <li key={sentence.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">{sentence.sentence}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{copy.detail.history}</h2>
        {word.reviews.length === 0 ? <p className="mt-2 text-sm text-muted">{copy.detail.noReviews}</p> : (
          <ul className="mt-3 space-y-2">
            {word.reviews.map((review) => (
              <li key={review.id} className="flex items-center justify-between text-sm">
                <span className={review.correct ? "text-emerald-600" : "text-rose-600"}>{review.correct ? copy.detail.correctMark : copy.detail.wrongMark}</span>
                <span className="text-muted">{formatDate(review.reviewedAt, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
