export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
