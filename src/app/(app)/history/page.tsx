import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy, localeOf } from "@/lib/copy";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { fill } from "@/lib/utils";
import { getLearningHistory } from "@/services/word.service";

export const metadata: Metadata = { title: "Öğrenme geçmişi" };

export default async function HistoryPage() {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const days = await getLearningHistory(user.id);

  return (
    <div>
      <PageHeader title={copy.history.title} description={copy.history.description} />
      {days.length === 0 ? (
        <EmptyState icon={<CalendarDays className="h-5 w-5" />} title={copy.history.emptyTitle} body={copy.history.emptyBody} actionHref="/words/new" actionLabel={copy.common.addWord} />
      ) : (
        <ol className="relative ml-3 space-y-4 border-l border-border">
          {days.map((day) => (
            <li key={day.date} className="ml-6">
              <span className="absolute -left-1.5 mt-5 h-3 w-3 rounded-full bg-indigo-500" />
              <Link href={`/history/${day.date}`} className="block rounded-2xl border border-border bg-card p-4 hover:border-indigo-300">
                <p className="font-medium">{formatDate(new Date(`${day.date}T12:00:00+03:00`), locale)}</p>
                <p className="mt-1 text-sm font-medium text-indigo-600">{fill(copy.history.added, { count: day.count })}</p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
