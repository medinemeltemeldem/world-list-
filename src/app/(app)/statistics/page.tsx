import type { Metadata } from "next";
import { DailyChart, WeeklyChart } from "@/components/stats-charts";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { LEVELS, STATUSES } from "@/lib/constants";
import { getCopy, localeOf } from "@/lib/copy";
import { formatDuration } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { fill } from "@/lib/utils";
import { getStatistics } from "@/services/stats.service";

export const metadata: Metadata = { title: "İstatistikler" };

export default async function StatisticsPage() {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const data = await getStatistics(user.id, locale);
  const change = data.lastMonth === 0 ? null : Math.round(((data.thisMonth - data.lastMonth) / data.lastMonth) * 100);
  const comparison = data.lastMonth === 0
    ? fill(copy.stats.firstMonth, { count: data.thisMonth })
    : change === null || change === 0
      ? copy.stats.same
      : change > 0
        ? fill(copy.stats.more, { rate: change })
        : fill(copy.stats.less, { rate: Math.abs(change) });
  const statusMax = Math.max(...data.statuses.map((item) => item.count), 1);
  const levelMax = Math.max(...data.levels.map((item) => item.count), 1);

  return (
    <div>
      <PageHeader title={copy.stats.title} description={copy.stats.description} />
      <p className="mb-5 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-100">{comparison}</p>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.stats.learned} value={String(data.learned)} tone="good" />
        <StatCard label={copy.stats.difficult} value={String(data.difficult)} tone={data.difficult > 0 ? "bad" : "default"} />
        <StatCard label={copy.stats.reviews} value={String(data.reviewCount)} />
        <StatCard label={copy.stats.quiz} value={data.quizSuccessRate === null ? "—" : `%${data.quizSuccessRate}`} />
        <StatCard label={copy.stats.streak} value={fill(copy.stats.days, { count: data.streak })} />
        <StatCard label={copy.stats.longest} value={fill(copy.stats.days, { count: data.longestStreak })} />
        <StatCard label={copy.stats.thisMonth} value={String(data.thisMonth)} />
        <StatCard label={copy.stats.lastMonth} value={String(data.lastMonth)} hint={formatDuration(data.totalStudySeconds, locale)} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">{copy.stats.daily}</h2>
          <DailyChart data={data.daily} empty={copy.stats.emptyChart} />
        </article>
        <article className="rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">{copy.stats.weekly}</h2>
          <WeeklyChart data={data.weekly} empty={copy.stats.emptyChart} />
        </article>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-semibold">{copy.stats.byStatus}</h2>
          <div className="mt-4 space-y-3">
            {STATUSES.map((status) => {
              const count = data.statuses.find((item) => item.status === status)?.count ?? 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{copy.status[status]}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(count / statusMax) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
        <article className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-semibold">{copy.stats.byLevel}</h2>
          <div className="mt-4 space-y-3">
            {LEVELS.map((level) => {
              const count = data.levels.find((item) => item.level === level)?.count ?? 0;
              return (
                <div key={level}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{level}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(count / levelMax) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
      {data.quizSuccessRate === null ? <p className="mt-4 text-sm text-muted">{copy.stats.noQuiz}</p> : null}
    </div>
  );
}
