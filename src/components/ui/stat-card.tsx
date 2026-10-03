import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
          tone === "bad" && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}
