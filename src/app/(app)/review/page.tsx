import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { ReviewSession } from "@/components/review-session";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy, localeOf } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { getDueWords } from "@/services/word.service";

export const metadata: Metadata = { title: "Bugünkü tekrar" };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const params = await searchParams;
  const wordId = typeof params.word === "string" ? params.word : undefined;
  const words = await getDueWords(user.id, wordId);

  return (
    <div>
      <PageHeader title={copy.review.title} description={copy.review.description} />
      {words.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="h-5 w-5" />}
          title={copy.review.emptyTitle}
          body={copy.review.emptyBody}
          actionHref="/words/new"
          actionLabel={copy.common.addWord}
        />
      ) : (
        <ReviewSession
          locale={locale}
          copy={copy}
          cards={words.map((word) => ({
            id: word.id,
            englishWord: word.englishWord,
            turkishMeaning: word.turkishMeaning,
            partOfSpeech: word.partOfSpeech,
            level: word.level,
            exampleSentence: word.exampleSentence,
            turkishExample: word.turkishExample,
          }))}
        />
      )}
    </div>
  );
}
