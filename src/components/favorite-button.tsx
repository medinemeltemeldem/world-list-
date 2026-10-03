"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/actions/word.actions";
import type { Copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  wordId,
  initial,
  copy,
}: {
  wordId: string;
  initial: boolean;
  copy: Copy;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !favorite;
    setFavorite(next);
    startTransition(async () => {
      const result = await toggleFavoriteAction(wordId);
      if ("error" in result) {
        setFavorite(!next);
        toast.error(result.error);
        return;
      }
      setFavorite(result.isFavorite);
      toast.success(next ? copy.toast.favoriteOn : copy.toast.favoriteOff);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? copy.common.removeFavorite : copy.common.addFavorite}
      className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-amber-500"
    >
      <Star className={cn("h-4 w-4", favorite && "fill-current")} />
    </button>
  );
}
