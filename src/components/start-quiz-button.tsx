"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createQuizAction } from "@/actions/quiz.actions";
import { Button } from "@/components/ui/button";
import type { Copy } from "@/lib/copy";

export function StartQuizButton({
  copy,
  label,
  pool,
  wordIds,
}: {
  copy: Copy;
  label: string;
  pool?: "difficult";
  wordIds?: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    const result = await createQuizAction({
      count: 10,
      level: "ALL",
      type: "MIXED",
      pool,
      wordIds,
    });
    setPending(false);
    if (result.error || !result.id) {
      toast.error(result.error ?? copy.validation.generic);
      return;
    }
    router.push(`/quiz/${result.id}`);
  }

  return (
    <Button type="button" onClick={() => void start()} disabled={pending}>
      {label}
    </Button>
  );
}
