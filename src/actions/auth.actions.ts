"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { getCopy } from "@/lib/copy";
import { getRequestLocale } from "@/lib/locale";
import { firstFieldErrors, loginSchema, registerSchema } from "@/lib/validators";
import { registerUser } from "@/services/user.service";

export type AuthState = { error: string; fields?: Record<string, string> };

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const copy = getCopy(await getRequestLocale());
  const parsed = loginSchema(copy).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: Object.values(firstFieldErrors(parsed.error))[0] ?? copy.validation.generic, fields: firstFieldErrors(parsed.error) };
  }

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
    if (!result || result.error) return { error: copy.validation.credentials };
  } catch (error) {
    if (error instanceof AuthError) return { error: copy.validation.credentials };
    throw error;
  }

  redirect("/dashboard");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const copy = getCopy(await getRequestLocale());
  const parsed = registerSchema(copy).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fields = firstFieldErrors(parsed.error);
    return { error: Object.values(fields)[0] ?? copy.validation.generic, fields };
  }

  const user = await registerUser(parsed.data);
  if (!user) return { error: copy.validation.emailTaken };

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
    if (!result || result.error) return { error: copy.validation.credentials };
  } catch (error) {
    if (error instanceof AuthError) return { error: copy.validation.credentials };
    throw error;
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
