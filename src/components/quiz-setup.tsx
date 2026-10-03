"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createQuizAction } from "@/actions/quiz.actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { LEVELS, QUIZ_COUNTS, QUIZ_TYPES, type Level, type QuizType } from "@/lib/constants";
import type { Copy } from "@/lib/copy";
import { fill } from "@/lib/utils";

export function QuizSetup({
  copy,
  counts,
  difficult = false,
}: {
  copy: Copy;
  counts: Record<Level | "ALL", number>;
  difficult?: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState<(typeof QUIZ_COUNTS)[number]>(10);
  const [level, setLevel] = useState<Level | "ALL">("ALL");
  const [type, setType] = useState<QuizType>("MIXED");
  const [pending, setPending] = useState(false);
  const available = counts[level];
  const blocked = difficult ? available < 1 : available < 5;

  async function start(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await createQuizAction({
      count,
      level,
      type,
      pool: difficult ? "difficult" : "all",
    });
    setPending(false);
    if (result.error || !result.id) {
      toast.error(result.error ?? copy.validation.generic);
      return;
    }
    router.push(`/quiz/${result.id}`);
  }

  return (
    <form onSubmit={start} className="max-w-xl space-y-5 rounded-3xl border border-border bg-card p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-6">
      {difficult ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{copy.quiz.difficultBanner}</p> : null}
      <div>
        <Label htmlFor="count">{copy.quiz.count}</Label>
        <div className="grid grid-cols-3 gap-2">
          {QUIZ_COUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCount(value)}
              className={`h-11 rounded-xl border text-sm font-medium ${count === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-border bg-card"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="level">{copy.quiz.level}</Label>
        <Select id="level" value={level} onChange={(event) => setLevel(event.target.value as Level | "ALL")}>
          <option value="ALL">{copy.common.all}</option>
          {LEVELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="type">{copy.quiz.type}</Label>
        <Select id="type" value={type} onChange={(event) => setType(event.target.value as QuizType)}>
          {QUIZ_TYPES.map((item) => (
            <option key={item} value={item}>
              {item === "EN_TO_TR" ? copy.quiz.enToTr : item === "TR_TO_EN" ? copy.quiz.trToEn : item === "MIXED" ? copy.quiz.mixed : copy.quiz.written}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-sm text-muted">{fill(copy.quiz.available, { count: available })}</p>
      {blocked ? <p className="text-sm text-rose-600">{difficult || available > 0 ? copy.quiz.needLevel : copy.quiz.needFive}</p> : null}
      <Button type="submit" disabled={pending || blocked} className="w-full" size="lg">
        {copy.quiz.start}
      </Button>
    </form>
  );
}
