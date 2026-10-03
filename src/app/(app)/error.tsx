"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [english, setEnglish] = useState(false);

  useEffect(() => {
    setEnglish(document.documentElement.lang === "en");
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card px-6 py-14 text-center">
      <h1 className="text-xl font-semibold">{english ? "Something went wrong." : "Bir şeyler ters gitti."}</h1>
      <Button type="button" className="mt-6" onClick={reset}>
        {english ? "Try again" : "Tekrar dene"}
      </Button>
    </div>
  );
}
