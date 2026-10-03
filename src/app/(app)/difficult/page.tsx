import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { StartQuizButton } from "@/components/start-quiz-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy, localeOf } from "@/lib/copy";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { successRate } from "@/lib/utils";
import { getDifficultWords } from "@/services/word.service";

export const metadata: Metadata = { title: "Zorlandığım kelimeler" };

export default async function DifficultPage() {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const words = await getDifficultWords(user.id);

  return (
    <div>
      <PageHeader
        title={copy.difficult.title}
        description={copy.difficult.description}
        action={words.length > 0 ? <StartQuizButton copy={copy} label={copy.difficult.start} pool="difficult" /> : null}
      />
      {words.length === 0 ? (
        <EmptyState icon={<TriangleAlert className="h-5 w-5" />} title={copy.difficult.emptyTitle} body={copy.difficult.emptyBody} />
      ) : (
        <ol className="space-y-3">
          {words.map((word, index) => {
            const rate = successRate(word.correctCount, word.wrongCount);
            return (
              <li key={word.id}>
                <Link href={`/words/${word.id}`} className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <span className="text-sm font-semibold text-muted">{index + 1}</span>
                  <span>
                    <span className="block font-serif text-2xl">{word.englishWord}</span>
                    <span className="text-sm text-muted">{word.turkishMeaning}</span>
                  </span>
                  <span className="text-sm text-muted">
                    {copy.difficult.correct} {word.correctCount} · {copy.difficult.wrong} {word.wrongCount} · {copy.difficult.rate} {rate === null ? "—" : `%${rate}`}
                    <span className="mt-1 block">{copy.difficult.last}: {word.lastReviewedAt ? formatDate(word.lastReviewedAt, locale) : copy.common.none}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
