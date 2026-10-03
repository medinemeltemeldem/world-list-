"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeSync({ theme, locale }: { theme: string; locale: string }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (theme === "light" || theme === "dark" || theme === "system") setTheme(theme);
    document.documentElement.lang = locale === "en" ? "en" : "tr";
  }, [theme, locale, setTheme]);

  return null;
}
