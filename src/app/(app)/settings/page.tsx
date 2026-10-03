import type { Metadata } from "next";
import { SettingsForms } from "@/components/settings-forms";
import { PageHeader } from "@/components/ui/page-header";
import { resolveLocale, resolveTheme } from "@/lib/constants";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const user = await requireUser();
  const copy = getCopy(user.locale);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={copy.settings.title} description={copy.settings.description} />
      <SettingsForms
        copy={copy}
        profile={{
          name: user.name,
          email: user.email,
          theme: resolveTheme(user.theme),
          locale: resolveLocale(user.locale),
          notifications: user.notifications,
          wordsPerDay: user.dailyGoal?.wordsPerDay ?? 10,
          reviewsPerDay: user.dailyGoal?.reviewsPerDay ?? 20,
        }}
      />
    </div>
  );
}
