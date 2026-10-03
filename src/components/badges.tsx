import type { LearningStatus, Level, PartOfSpeech } from "@/lib/constants";
import type { Copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

const statusTone: Record<LearningStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  LEARNING: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200",
  REVIEW: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  LEARNED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  DIFFICULT: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
};

const levelTone: Record<Level, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  A2: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200",
  B1: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
  B2: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-200",
};

export function StatusBadge({ status, copy }: { status: LearningStatus; copy: Copy }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusTone[status])}>{copy.status[status]}</span>;
}

export function LevelBadge({ level }: { level: Level }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", levelTone[level])}>{level}</span>;
}

export function PosBadge({ value, copy }: { value: PartOfSpeech; copy: Copy }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{copy.pos[value]}</span>;
}
