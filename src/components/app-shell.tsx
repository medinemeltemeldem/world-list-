"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MoreHorizontal,
  RotateCcw,
  Settings,
  Star,
  TriangleAlert,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { Logo } from "@/components/logo";
import type { Copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/words", key: "words", icon: BookOpen },
  { href: "/review", key: "review", icon: RotateCcw },
  { href: "/quiz", key: "quiz", icon: ListChecks },
  { href: "/difficult", key: "difficult", icon: TriangleAlert },
  { href: "/favorites", key: "favorites", icon: Star },
  { href: "/statistics", key: "statistics", icon: BarChart3 },
  { href: "/history", key: "history", icon: CalendarDays },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

const bottomNav = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/words", key: "words", icon: BookOpen },
  { href: "/review", key: "review", icon: RotateCcw },
  { href: "/quiz", key: "quiz", icon: ListChecks },
] as const;

function active(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  copy,
  name,
  email,
  dueCount,
  children,
}: {
  copy: Copy;
  name: string;
  email: string;
  dueCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card/90 px-4 py-5 backdrop-blur md:flex">
        <Link href="/dashboard" className="px-2">
          <Logo />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = active(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  isActive && "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{copy.nav[item.key]}</span>
                {item.href === "/review" && dueCount > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                    {dueCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-4">
          <p className="truncate px-2 text-sm font-medium">{name}</p>
          <p className="truncate px-2 text-xs text-muted">{email}</p>
          <form action={logoutAction} className="mt-3">
            <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <LogOut className="h-4 w-4" />
              {copy.nav.logout}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <Link href="/settings" className="rounded-xl p-2 text-slate-600 dark:text-slate-300" aria-label={copy.nav.settings}>
            <Settings className="h-5 w-5" />
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 md:px-8 md:py-8 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {moreOpen ? (
          <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
            {mainNav.slice(4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copy.nav[item.key]}
              </Link>
            ))}
            <form action={logoutAction}>
              <button type="submit" className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                {copy.nav.logout}
              </button>
            </form>
          </div>
        ) : null}
        <div className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = active(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium text-slate-500",
                  isActive && "text-indigo-600 dark:text-indigo-300",
                )}
              >
                <Icon className="h-5 w-5" />
                {copy.nav[item.key]}
                {item.href === "/review" && dueCount > 0 ? (
                  <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-amber-500" />
                ) : null}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn("flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium text-slate-500", moreOpen && "text-indigo-600")}
          >
            <MoreHorizontal className="h-5 w-5" />
            {copy.nav.more}
          </button>
        </div>
      </nav>
    </div>
  );
}
