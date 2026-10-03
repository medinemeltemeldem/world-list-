import { cookies } from "next/headers";
import { resolveLocale, type Locale } from "@/lib/constants";

export async function getRequestLocale(): Promise<Locale> {
  const jar = await cookies();
  return resolveLocale(jar.get("lexora-locale")?.value);
}
