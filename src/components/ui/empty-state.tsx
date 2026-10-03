import { buttonClass } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState({
  icon,
  title,
  body,
  actionHref,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={buttonClass("primary", "md", "mt-6")}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
