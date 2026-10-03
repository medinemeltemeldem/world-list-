import { AppShell } from "@/components/app-shell";
import { ThemeSync } from "@/components/theme-sync";
import { resolveTheme } from "@/lib/constants";
import { getCopy, localeOf } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { countDueWords } from "@/services/word.service";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const dueCount = await countDueWords(user.id);

  return (
    <>
      <ThemeSync theme={resolveTheme(user.theme)} locale={localeOf(user.locale)} />
      <AppShell copy={getCopy(user.locale)} name={user.name} email={user.email} dueCount={dueCount}>
        {children}
      </AppShell>
    </>
  );
}
