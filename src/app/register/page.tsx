import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { getCopy } from "@/lib/copy";
import { getRequestLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Kayıt" };

export default async function RegisterPage() {
  const copy = getCopy(await getRequestLocale());

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/">
        <Logo />
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">{copy.auth.registerTitle}</h1>
      <p className="mt-2 text-sm text-muted">{copy.auth.registerBody}</p>
      <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <AuthForm mode="register" copy={copy} />
      </div>
    </main>
  );
}
