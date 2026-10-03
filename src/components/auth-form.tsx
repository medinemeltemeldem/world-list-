"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, registerAction, type AuthState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import type { Copy } from "@/lib/copy";

const initial: AuthState = { error: "" };

export function AuthForm({ mode, copy }: { mode: "login" | "register"; copy: Copy }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "register" ? (
        <div>
          <Label htmlFor="name">{copy.auth.name}</Label>
          <Input id="name" name="name" autoComplete="name" required />
          <FieldError>{state.fields?.name}</FieldError>
        </div>
      ) : null}
      <div>
        <Label htmlFor="email">{copy.auth.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError>{state.fields?.email}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">{copy.auth.password}</Label>
        <Input id="password" name="password" type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} />
        <FieldError>{state.fields?.password}</FieldError>
      </div>
      {mode === "register" ? (
        <div>
          <Label htmlFor="confirm">{copy.auth.confirm}</Label>
          <Input id="confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} />
          <FieldError>{state.fields?.confirm}</FieldError>
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} className="h-4 w-4 accent-indigo-600" />
        {copy.auth.showPassword}
      </label>
      {state.error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{state.error}</p> : null}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {mode === "login" ? copy.auth.login : copy.auth.register}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? copy.auth.noAccount : copy.auth.hasAccount}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-medium text-indigo-600">
          {mode === "login" ? copy.auth.register : copy.auth.login}
        </Link>
      </p>
    </form>
  );
}
