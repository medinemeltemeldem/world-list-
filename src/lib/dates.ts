import type { Locale } from "@/lib/constants";

const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function addCalendarDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function istanbulDateKey(date: Date) {
  const shifted = new Date(date.getTime() + ISTANBUL_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function istanbulStartOfDay(date = new Date()) {
  const [year, month, day] = istanbulDateKey(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - ISTANBUL_OFFSET_MS);
}

export function istanbulEndOfDay(date = new Date()) {
  return new Date(istanbulStartOfDay(date).getTime() + DAY_MS - 1);
}

export function istanbulStartOfWeek(date = new Date()) {
  const start = istanbulStartOfDay(date);
  const shifted = new Date(start.getTime() + ISTANBUL_OFFSET_MS);
  const weekday = shifted.getUTCDay();
  const diff = weekday === 0 ? 6 : weekday - 1;
  return addCalendarDays(start, -diff);
}

export function istanbulStartOfMonth(date = new Date()) {
  const [year, month] = istanbulDateKey(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - ISTANBUL_OFFSET_MS);
}

export function dateInputToDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - ISTANBUL_OFFSET_MS);
}

export function dateInputToEnd(value: string) {
  return new Date(dateInputToDate(value).getTime() + DAY_MS - 1);
}

export function toDateInputValue(date: Date) {
  return istanbulDateKey(date);
}

export function formatDate(date: Date | string, locale: Locale) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(value);
}

export function formatShortDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

export function formatDuration(totalSeconds: number, locale: Locale) {
  const minutes = Math.max(0, Math.round(totalSeconds / 60));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (locale === "en") {
    if (hours === 0) return `${minutes} min`;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }
  if (hours === 0) return `${minutes} dakika`;
  return rest ? `${hours} sa ${rest} dk` : `${hours} sa`;
}
