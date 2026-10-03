import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordCard } from "@/components/word-card";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy, localeOf } from "@/lib/copy";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { fill } from "@/lib/utils";
import { getWordsOnDate } from "@/services/word.service";

export const metadata: Metadata = { title: "Öğrenme günü" };

export default async function HistoryDayPage({ params }: { params: Promise<{ date: string }> }) {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const words = await getWordsOnDate(user.id, date);
  const label = formatDate(new Date(`${date}T12:00:00+03:00`), locale);

  return (
    <div>
      <PageHeader title={fill(copy.history.dayTitle, { date: label })} description={fill(copy.history.added, { count: words.length })} />
      {words.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">{copy.history.dayEmpty}</p>
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
