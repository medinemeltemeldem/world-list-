import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { LevelBadge, PosBadge } from "@/components/badges";
import { getCopy, localeOf } from "@/lib/copy";
import { formatDate, formatDuration } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { fill, firstName } from "@/lib/utils";
import { getDashboard } from "@/services/stats.service";

export const metadata: Metadata = { title: "Panel" };

function goalPercent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export default async function DashboardPage() {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const data = await getDashboard(user.id, locale);
  const maxBar = Math.max(...data.last7Days.map((day) => day.count), 1);
  const wordGoal = goalPercent(data.wordsToday, data.goalWords);
  const reviewGoal = goalPercent(data.reviewsToday, data.goalReviews);
  const suggestions = [
    data.dueWords > 0 ? fill(copy.dashboard.due, { count: data.dueWords }) : copy.dashboard.dueNone,
    data.streak > 1 ? fill(copy.dashboard.streak, { count: data.streak }) : data.streak === 1 ? copy.dashboard.streakOne : copy.dashboard.streakStart,
    fill(copy.dashboard.weekAdded, { count: data.weekWords }),
    data.difficultWords > 0 ? fill(copy.dashboard.difficult, { count: data.difficultWords }) : null,
    data.quizSuccessRate !== null ? fill(copy.dashboard.quizRate, { rate: data.quizSuccessRate }) : copy.dashboard.noQuiz,
  ].filter((item): item is string => Boolean(item));

  return (
    <div>
      <PageHeader
        title={fill(copy.dashboard.hello, { name: firstName(user.name) })}
        description={
          data.streak > 1
            ? fill(copy.dashboard.streak, { count: data.streak })
            : data.streak === 1
              ? copy.dashboard.streakOne
              : copy.dashboard.streakStart
        }
        action={
          <Link href={data.dueWords > 0 ? "/review" : "/words/new"} className={buttonClass("primary")}>
            {data.dueWords > 0 ? copy.dashboard.startReview : copy.dashboard.addFirst}
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.dashboard.total} value={String(data.totalWords)} />
        <StatCard label={copy.dashboard.thisWeek} value={`+${data.weekWords}`} tone="default" />
        <StatCard label={copy.dashboard.thisMonth} value={`+${data.monthWords}`} />
        <StatCard label={copy.dashboard.learned} value={String(data.learnedWords)} tone="good" />
        <StatCard label={copy.dashboard.waiting} value={String(data.dueWords)} tone={data.dueWords > 0 ? "warn" : "good"} />
        <StatCard label={copy.dashboard.hard} value={String(data.difficultWords)} tone={data.difficultWords > 0 ? "bad" : "default"} />
        <StatCard label={copy.dashboard.todayWork} value={String(data.todayActivity)} />
        <StatCard label={copy.dashboard.totalTime} value={formatDuration(data.totalStudySeconds, locale)} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm text-muted">
              {data.todayStudySeconds > 0
                ? fill(copy.dashboard.studied, { duration: formatDuration(data.todayStudySeconds, locale) })
                : copy.dashboard.studiedNone}
            </p>
            <p className="mt-2 text-sm">
              {data.dueWords > 0 ? fill(copy.dashboard.due, { count: data.dueWords }) : copy.dashboard.dueNone}
            </p>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{copy.dashboard.goalTitle}</span>
                <span className="text-muted">{wordGoal}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${wordGoal}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{fill(copy.dashboard.goalWords, { done: data.wordsToday, total: data.goalWords })}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${reviewGoal}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{fill(copy.dashboard.goalReviews, { done: data.reviewsToday, total: data.goalReviews })}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">{copy.dashboard.suggestions}</h2>
            <ul className="mt-3 space-y-2">
              {suggestions.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/70">{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="space-y-4">
          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">{copy.dashboard.todayWord}</p>
            {data.wordOfTheDay ? (
              <>
                <h2 className="mt-3 font-serif text-4xl">{data.wordOfTheDay.englishWord}</h2>
                <p className="mt-1 text-muted">{data.wordOfTheDay.turkishMeaning}</p>
                <div className="mt-3 flex gap-2">
                  <PosBadge value={data.wordOfTheDay.partOfSpeech} copy={copy} />
                  <LevelBadge level={data.wordOfTheDay.level} />
                </div>
                {data.wordOfTheDay.exampleSentence ? (
                  <p className="mt-4 text-sm text-muted">
                    <span className="font-medium text-foreground">{copy.dashboard.example}: </span>
                    {data.wordOfTheDay.exampleSentence}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-muted">{formatDate(data.wordOfTheDay.learnedAt, locale)}</p>
                <Link href={`/words/${data.wordOfTheDay.id}`} className={buttonClass("secondary", "sm", "mt-4")}>
                  {copy.dashboard.openWord}
                </Link>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-muted">{copy.words.emptyBody}</p>
                <Link href="/words/new" className={buttonClass("primary", "sm", "mt-4")}>{copy.common.addWord}</Link>
              </div>
            )}
          </article>
          <article className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">{copy.dashboard.last7}</h2>
            <div className="mt-4 flex h-24 items-end gap-2">
              {data.last7Days.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-16 w-full items-end">
                    <div className="w-full rounded-md bg-indigo-500/80" style={{ height: `${Math.max(8, (day.count / maxBar) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-muted">{day.label}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{copy.dashboard.recent}</h2>
          <Link href="/words" className="text-sm font-medium text-indigo-600">{copy.dashboard.seeAll}</Link>
        </div>
        {data.recentWords.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">{copy.words.emptyTitle}</p>
        ) : (
          <div className="grid gap-3">
            {data.recentWords.map((word) => (
              <Link key={word.id} href={`/words/${word.id}`} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <span>
                  <span className="block font-medium">{word.englishWord}</span>
                  <span className="text-sm text-muted">{word.turkishMeaning}</span>
                </span>
                <span className="text-xs text-muted">{formatDate(word.learnedAt, locale)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
