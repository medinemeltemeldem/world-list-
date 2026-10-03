"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { addSentenceAction } from "@/actions/word.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import type { Copy } from "@/lib/copy";

export function SentenceForm({ wordId, copy }: { wordId: string; copy: Copy }) {
  const router = useRouter();
  const [sentence, setSentence] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await addSentenceAction({ wordId, sentence });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setSentence("");
    toast.success(copy.toast.sentenceSaved);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Textarea value={sentence} placeholder={copy.detail.sentencePh} onChange={(event) => setSentence(event.target.value)} />
      <Button type="submit" disabled={pending}>{copy.detail.saveSentence}</Button>
    </form>
  );
}
