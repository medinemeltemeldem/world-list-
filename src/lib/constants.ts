export const PARTS_OF_SPEECH = [
  "NOUN",
  "VERB",
  "ADJECTIVE",
  "ADVERB",
  "PREPOSITION",
  "PHRASAL_VERB",
  "EXPRESSION",
  "OTHER",
] as const;

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const STATUSES = ["NEW", "LEARNING", "REVIEW", "LEARNED", "DIFFICULT"] as const;

export const QUIZ_TYPES = ["EN_TO_TR", "TR_TO_EN", "MIXED", "WRITTEN"] as const;

export const QUESTION_TYPES = [
  "MULTIPLE_CHOICE_EN_TR",
  "MULTIPLE_CHOICE_TR_EN",
  "WRITTEN_EN",
  "WRITTEN_TR",
  "FILL_BLANK",
] as const;

export const DATE_FILTERS = ["today", "week", "month", "quarter", "custom"] as const;

export const SORTS = ["newest", "oldest", "alpha", "difficult", "reviewed"] as const;

export const QUIZ_COUNTS = [5, 10, 20] as const;

export const PRESET_TAGS = [
  "School",
  "Work",
  "Daily Life",
  "Travel",
  "Technology",
  "Health",
  "Business",
  "Other",
] as const;

export const THEMES = ["system", "light", "dark"] as const;

export const LOCALES = ["tr", "en"] as const;

export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];
export type Level = (typeof LEVELS)[number];
export type LearningStatus = (typeof STATUSES)[number];
export type QuizType = (typeof QUIZ_TYPES)[number];
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type DateFilter = (typeof DATE_FILTERS)[number];
export type WordSort = (typeof SORTS)[number];
export type ThemePreference = (typeof THEMES)[number];
export type Locale = (typeof LOCALES)[number];

export function resolveLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "tr";
}

export function resolveTheme(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export const PAGE_SIZE = 12;

export function isOneOf<T extends string>(values: readonly T[], value: string | undefined): value is T {
  return !!value && (values as readonly string[]).includes(value);
}
