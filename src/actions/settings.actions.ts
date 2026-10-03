"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { signOut } from "@/auth";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { firstFieldErrors, goalsSchema, passwordSchema, preferencesSchema, profileSchema } from "@/lib/validators";
import { changePassword, deleteAccount, updateGoals, updatePreferences, updateProfile } from "@/services/user.service";

export async function updateProfileAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = profileSchema(copy).safeParse(input);
  if (!parsed.success) return { error: Object.values(firstFieldErrors(parsed.error))[0] ?? copy.validation.generic };
  await updateProfile(user.id, parsed.data.name);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateGoalsAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = goalsSchema(copy).safeParse(input);
  if (!parsed.success) return { error: Object.values(firstFieldErrors(parsed.error))[0] ?? copy.validation.generic };
  await updateGoals(user.id, parsed.data.wordsPerDay, parsed.data.reviewsPerDay);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true };
}

export async function updatePreferencesAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = preferencesSchema().safeParse(input);
  if (!parsed.success) return { error: copy.validation.generic };
  await updatePreferences(user.id, parsed.data);
  const jar = await cookies();
  jar.set("lexora-locale", parsed.data.locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePasswordAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = passwordSchema(copy).safeParse(input);
  if (!parsed.success) return { error: Object.values(firstFieldErrors(parsed.error))[0] ?? copy.validation.generic };
  const changed = await changePassword(user.id, parsed.data.current, parsed.data.nextPassword);
  if (!changed) return { error: copy.validation.currentPassword };
  return { ok: true };
}

export async function deleteAccountAction(confirmation: string) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  if (confirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { error: copy.validation.deleteMismatch };
  }
  await deleteAccount(user.id);
  await signOut({ redirectTo: "/" });
}
