import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { getCopy } from "@/lib/copy";
import { getRequestLocale } from "@/lib/locale";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const copy = getCopy(await getRequestLocale());

  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonClass("ghost", "sm")}>{copy.landing.login}</Link>
          <Link href="/register" className={buttonClass("primary", "sm")}>{copy.landing.start}</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:py-16">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">{copy.landing.kicker}</p>
          <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-6xl">{copy.landing.title}</h1>
          <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">{copy.landing.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className={buttonClass("primary", "lg")}>{copy.landing.start}</Link>
            <Link href="/login" className={buttonClass("secondary", "lg")}>{copy.landing.haveAccount}</Link>
          </div>
        </section>
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(79,70,229,0.12)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{copy.landing.mockDue}</p>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">18</span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">{copy.dashboard.todayWord}</p>
          <h2 className="mt-2 font-serif text-5xl">{copy.landing.mockWord}</h2>
          <p className="mt-2 text-lg text-muted">{copy.landing.mockMeaning}</p>
          <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">{copy.landing.mockExample}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-muted">{copy.dashboard.total}</p>
              <p className="mt-1 text-2xl font-semibold">342</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-muted">{copy.dashboard.thisWeek}</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600">+27</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-muted">{copy.dashboard.learned}</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">215</p>
            </div>
          </div>
        </section>
      </main>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
        {[
          [copy.landing.feature1Title, copy.landing.feature1Body],
          [copy.landing.feature2Title, copy.landing.feature2Body],
          [copy.landing.feature3Title, copy.landing.feature3Body],
        ].map(([title, body]) => (
          <article key={title} className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
