import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function emptyToNull(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function splitTerms(value: string | undefined) {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 20);
}

export function successRate(correct: number, wrong: number) {
  const total = correct + wrong;
  if (total === 0) return null;
  return Math.round((correct / total) * 100);
}

export function normalizeLoose(value: string) {
  return value.trim().replace(/[.,!?;:]+$/g, "").replace(/\s+/g, " ");
}

export function answersMatch(expected: string, given: string) {
  const variants = (value: string) => {
    const base = normalizeLoose(value);
    if (!base) return [];
    return [base.toLocaleLowerCase("tr-TR"), base.toLocaleLowerCase("en-US")];
  };
  const givenVariants = variants(given);
  if (givenVariants.length === 0) return false;
  const expectedVariants = expected.split(/[,/;|]/).flatMap(variants);
  return givenVariants.some((answer) => expectedVariants.includes(answer));
}

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function blankSentence(sentence: string, word: string) {
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, "______");
}

export function asStringOptions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function hashString(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}
