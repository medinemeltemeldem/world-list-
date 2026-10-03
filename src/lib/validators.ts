import { z } from "zod";
import { LEVELS, LOCALES, PARTS_OF_SPEECH, QUIZ_COUNTS, QUIZ_TYPES, STATUSES, THEMES } from "@/lib/constants";
import type { Copy } from "@/lib/copy";

export function firstFieldErrors(error: z.ZodError) {
  const flat = error.flatten().fieldErrors;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (!Array.isArray(value)) continue;
    const message = value.find((item) => typeof item === "string");
    if (message) fields[key] = message;
  }
  return fields;
}

export function registerSchema(copy: Copy) {
  return z
    .object({
      name: z.string().trim().min(2, copy.validation.name).max(60, copy.validation.tooLong),
      email: z.string().trim().email(copy.validation.email).max(120),
      password: z.string().min(8, copy.validation.password).max(80),
      confirm: z.string(),
    })
    .refine((value) => value.password === value.confirm, {
      message: copy.validation.confirm,
      path: ["confirm"],
    });
}

export function loginSchema(copy: Copy) {
  return z.object({
    email: z.string().trim().email(copy.validation.email),
    password: z.string().min(8, copy.validation.password),
  });
}

export function wordSchema(copy: Copy) {
  return z.object({
    englishWord: z.string().trim().min(1, copy.validation.englishWord).max(120, copy.validation.tooLong),
    turkishMeaning: z.string().trim().min(1, copy.validation.turkishMeaning).max(300, copy.validation.tooLong),
    partOfSpeech: z.enum(PARTS_OF_SPEECH, { message: copy.validation.partOfSpeech }),
    level: z.enum(LEVELS, { message: copy.validation.level }),
    exampleSentence: z.string().trim().max(500, copy.validation.tooLong),
    turkishExample: z.string().trim().max(500, copy.validation.tooLong),
    note: z.string().trim().max(1000, copy.validation.tooLong),
    learnedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, copy.validation.date),
    categoryName: z.string().trim().max(80, copy.validation.tooLong),
    categoryUnit: z.string().trim().max(40, copy.validation.tooLong),
    tags: z.array(z.string().trim().min(1).max(40)).max(12, copy.validation.tags),
    isFavorite: z.boolean(),
    status: z.enum(STATUSES).optional(),
    pronunciation: z.string().trim().max(120, copy.validation.tooLong),
    ipa: z.string().trim().max(120, copy.validation.tooLong),
    definition: z.string().trim().max(500, copy.validation.tooLong),
    synonyms: z.string().trim().max(300, copy.validation.tooLong),
    antonyms: z.string().trim().max(300, copy.validation.tooLong),
    relatedWords: z.string().trim().max(300, copy.validation.tooLong),
  });
}

export function sentenceSchema(copy: Copy) {
  return z.object({
    wordId: z.string().min(1),
    sentence: z.string().trim().min(1, copy.validation.sentence).max(400, copy.validation.tooLong),
  });
}

export function goalsSchema(copy: Copy) {
  return z.object({
    wordsPerDay: z.number().int().min(1, copy.validation.goal).max(200, copy.validation.goal),
    reviewsPerDay: z.number().int().min(1, copy.validation.goal).max(200, copy.validation.goal),
  });
}

export function profileSchema(copy: Copy) {
  return z.object({
    name: z.string().trim().min(2, copy.validation.name).max(60, copy.validation.tooLong),
  });
}

export function preferencesSchema() {
  return z.object({
    theme: z.enum(THEMES),
    locale: z.enum(LOCALES),
    notifications: z.boolean(),
  });
}

export function passwordSchema(copy: Copy) {
  return z
    .object({
      current: z.string().min(8, copy.validation.password),
      nextPassword: z.string().min(8, copy.validation.password).max(80),
      confirm: z.string(),
    })
    .refine((value) => value.nextPassword === value.confirm, {
      message: copy.validation.confirm,
      path: ["confirm"],
    });
}

export function quizSetupSchema() {
  return z.object({
    count: z.union([z.literal(5), z.literal(10), z.literal(20)]),
    level: z.union([z.literal("ALL"), z.enum(LEVELS)]),
    type: z.enum(QUIZ_TYPES),
    pool: z.enum(["all", "difficult"]).optional(),
    wordIds: z.array(z.string().min(1)).max(100).optional(),
  });
}

export type WordInput = z.infer<ReturnType<typeof wordSchema>>;

export const quizCounts = QUIZ_COUNTS;
