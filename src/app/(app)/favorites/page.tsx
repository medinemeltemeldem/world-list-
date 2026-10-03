import type { Metadata } from "next";
import { Star } from "lucide-react";
import { WordCard } from "@/components/word-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy, localeOf } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { getFavoriteWords } from "@/services/word.service";

export const metadata: Metadata = { title: "Favoriler" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const words = await getFavoriteWords(user.id);

  return (
    <div>
      <PageHeader title={copy.favorites.title} description={copy.favorites.description} />
      {words.length === 0 ? (
        <EmptyState icon={<Star className="h-5 w-5" />} title={copy.favorites.emptyTitle} body={copy.favorites.emptyBody} actionHref="/words" actionLabel={copy.nav.words} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {words.map((word) => (
            <WordCard key={word.id} word={word} copy={copy} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
