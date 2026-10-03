"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteWordAction } from "@/actions/word.actions";
import { Button } from "@/components/ui/button";
import type { Copy } from "@/lib/copy";
import { fill } from "@/lib/utils";

export function DeleteWordButton({
  wordId,
  word,
  copy,
  redirectToList = false,
}: {
  wordId: string;
  word: string;
  copy: Copy;
  redirectToList?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await deleteWordAction(wordId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(copy.toast.wordDeleted);
      setOpen(false);
      if (redirectToList) router.push("/words");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
      >
        <Trash2 className="h-4 w-4" />
        {copy.common.delete}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-xl">
            <h2 className="text-lg font-semibold">{copy.detail.deleteTitle}</h2>
            <p className="mt-2 text-sm text-muted">{fill(copy.detail.deleteBody, { word })}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                {copy.common.cancel}
              </Button>
              <Button type="button" variant="danger" onClick={confirm} disabled={pending}>
                {copy.common.delete}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
