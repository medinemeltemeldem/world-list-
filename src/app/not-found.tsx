import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { getCopy } from "@/lib/copy";
import { getRequestLocale } from "@/lib/locale";

export default async function NotFound() {
  const copy = getCopy(await getRequestLocale());

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">{copy.notFound.title}</h1>
      <p className="mt-3 text-sm text-muted">{copy.notFound.body}</p>
      <Link href="/dashboard" className={buttonClass("primary", "md", "mt-6")}>
        {copy.notFound.home}
      </Link>
    </main>
  );
}
