"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  changePasswordAction,
  deleteAccountAction,
  updateGoalsAction,
  updatePreferencesAction,
  updateProfileAction,
} from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import type { Locale, ThemePreference } from "@/lib/constants";
import type { Copy } from "@/lib/copy";

export function SettingsForms({
  copy,
  profile,
}: {
  copy: Copy;
  profile: {
    name: string;
    email: string;
    theme: ThemePreference;
    locale: Locale;
    notifications: boolean;
    wordsPerDay: number;
    reviewsPerDay: number;
  };
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [name, setName] = useState(profile.name);
  const [wordsPerDay, setWordsPerDay] = useState(profile.wordsPerDay);
  const [reviewsPerDay, setReviewsPerDay] = useState(profile.reviewsPerDay);
  const [theme, setThemeValue] = useState(profile.theme);
  const [locale, setLocale] = useState(profile.locale);
  const [notifications, setNotifications] = useState(profile.notifications);
  const [current, setCurrent] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState("");

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setPending("profile");
    const result = await updateProfileAction({ name });
    setPending("");
    if (result.error) return toast.error(result.error);
    toast.success(copy.toast.profileSaved);
    router.refresh();
  }

  async function saveGoals(event: React.FormEvent) {
    event.preventDefault();
    setPending("goals");
    const result = await updateGoalsAction({ wordsPerDay, reviewsPerDay });
    setPending("");
    if (result.error) return toast.error(result.error);
    toast.success(copy.toast.goalsSaved);
    router.refresh();
  }

  async function savePreferences(event: React.FormEvent) {
    event.preventDefault();
    setPending("preferences");
    const result = await updatePreferencesAction({ theme, locale, notifications });
    setPending("");
    if (result.error) return toast.error(result.error);
    setTheme(theme);
    toast.success(copy.toast.preferencesSaved);
    router.refresh();
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setPending("password");
    const result = await changePasswordAction({ current, nextPassword, confirm });
    setPending("");
    if (result.error) return toast.error(result.error);
    setCurrent("");
    setNextPassword("");
    setConfirm("");
    toast.success(copy.toast.passwordSaved);
  }

  async function removeAccount(event: React.FormEvent) {
    event.preventDefault();
    setPending("delete");
    const result = await deleteAccountAction(confirmation);
    setPending("");
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={saveProfile} className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{copy.settings.profile}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">{copy.settings.name}</Label>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">{copy.settings.email}</Label>
            <Input id="email" value={profile.email} disabled />
          </div>
        </div>
        <Button type="submit" className="mt-4" disabled={pending === "profile"}>{copy.settings.saveProfile}</Button>
      </form>

      <form onSubmit={saveGoals} className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{copy.settings.goals}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="wordsPerDay">{copy.settings.wordsGoal}</Label>
            <Input id="wordsPerDay" type="number" min={1} max={200} value={wordsPerDay} onChange={(event) => setWordsPerDay(Number(event.target.value))} />
          </div>
          <div>
            <Label htmlFor="reviewsPerDay">{copy.settings.reviewsGoal}</Label>
            <Input id="reviewsPerDay" type="number" min={1} max={200} value={reviewsPerDay} onChange={(event) => setReviewsPerDay(Number(event.target.value))} />
          </div>
        </div>
        <Button type="submit" className="mt-4" disabled={pending === "goals"}>{copy.settings.saveGoals}</Button>
      </form>

      <form onSubmit={savePreferences} className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{copy.settings.preferences}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="theme">{copy.settings.theme}</Label>
            <Select id="theme" value={theme} onChange={(event) => setThemeValue(event.target.value as ThemePreference)}>
              <option value="system">{copy.settings.system}</option>
              <option value="light">{copy.settings.light}</option>
              <option value="dark">{copy.settings.dark}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="locale">{copy.settings.language}</Label>
            <Select id="locale" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              <option value="tr">{copy.settings.turkish}</option>
              <option value="en">{copy.settings.english}</option>
            </Select>
          </div>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="mt-1 h-4 w-4 accent-indigo-600" />
          <span>
            <span className="block font-medium">{copy.settings.notifications}</span>
            <span className="text-muted">{copy.settings.notificationsHint}</span>
          </span>
        </label>
        <Button type="submit" className="mt-4" disabled={pending === "preferences"}>{copy.settings.savePreferences}</Button>
      </form>

      <form onSubmit={savePassword} className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{copy.settings.password}</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="current">{copy.settings.current}</Label>
            <Input id="current" type="password" value={current} onChange={(event) => setCurrent(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="nextPassword">{copy.settings.nextPassword}</Label>
            <Input id="nextPassword" type="password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirm">{copy.settings.confirm}</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </div>
        </div>
        <Button type="submit" className="mt-4" disabled={pending === "password"}>{copy.settings.savePassword}</Button>
      </form>

      <form onSubmit={removeAccount} className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
        <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-200">{copy.settings.danger}</h2>
        <p className="mt-2 text-sm text-rose-700/80 dark:text-rose-100/80">{copy.settings.dangerBody}</p>
        <div className="mt-4">
          <Label htmlFor="confirmation">{copy.settings.confirmEmail}</Label>
          <Input id="confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={profile.email} />
        </div>
        <Button type="submit" variant="danger" className="mt-4" disabled={pending === "delete"}>{copy.settings.delete}</Button>
      </form>
    </div>
  );
}
