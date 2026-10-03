import Link from "next/link";
import { Eye, Pencil, RotateCcw } from "lucide-react";
import { LevelBadge, PosBadge, StatusBadge } from "@/components/badges";
import { DeleteWordButton } from "@/components/delete-word-button";
import { FavoriteButton } from "@/components/favorite-button";
import type { Locale } from "@/lib/constants";
import type { Copy } from "@/lib/copy";
import { formatDate } from "@/lib/dates";
import type { WordListItem } from "@/services/word.service";

export function WordCard({ word, copy, locale }: { word: WordListItem; copy: Copy; locale: Locale }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/words/${word.id}`} className="block truncate font-serif text-2xl tracking-tight hover:text-indigo-700 dark:hover:text-indigo-300">
            {word.englishWord}
          </Link>
          <p className="mt-1 text-sm text-muted">{word.turkishMeaning}</p>
        </div>
        <FavoriteButton wordId={word.id} initial={word.isFavorite} copy={copy} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PosBadge value={word.partOfSpeech} copy={copy} />
        <LevelBadge level={word.level} />
        <StatusBadge status={word.status} copy={copy} />
      </div>
      <p className="mt-3 text-xs text-muted">
        {copy.words.learnedOn}: {formatDate(word.learnedAt, locale)}
      </p>
      {word.category ? <p className="mt-1 text-xs text-muted">{word.category.name}{word.category.unit ? ` · ${word.category.unit}` : ""}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <Link href={`/words/${word.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
          <Eye className="h-4 w-4" />
          {copy.common.view}
        </Link>
        <Link href={`/words/${word.id}/edit`} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
          <Pencil className="h-4 w-4" />
          {copy.common.edit}
        </Link>
        <Link href={`/review?word=${word.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
          <RotateCcw className="h-4 w-4" />
          {copy.common.review}
        </Link>
        <DeleteWordButton wordId={word.id} word={word.englishWord} copy={copy} />
      </div>
    </article>
  );
}
