"use server";

import { revalidatePath } from "next/cache";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { firstFieldErrors, sentenceSchema, wordSchema } from "@/lib/validators";
import { addSentence, createWord, deleteWord, toggleFavorite, updateWord } from "@/services/word.service";

function refreshWords(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/words");
  revalidatePath("/review");
  revalidatePath("/favorites");
  revalidatePath("/difficult");
  revalidatePath("/statistics");
  revalidatePath("/history");
  revalidatePath("/quiz");
  if (id) revalidatePath(`/words/${id}`);
}

export async function createWordAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = wordSchema(copy).safeParse(input);
  if (!parsed.success) {
    const fields = firstFieldErrors(parsed.error);
    return { error: Object.values(fields)[0] ?? copy.validation.generic, fields };
  }
  const word = await createWord(user.id, parsed.data);
  refreshWords(word.id);
  return { id: word.id };
}

export async function updateWordAction(id: string, input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = wordSchema(copy).safeParse(input);
  if (!parsed.success) {
    const fields = firstFieldErrors(parsed.error);
    return { error: Object.values(fields)[0] ?? copy.validation.generic, fields };
  }
  const word = await updateWord(user.id, id, parsed.data);
  if (!word) return { error: copy.validation.notFound };
  refreshWords(word.id);
  return { id: word.id };
}

export async function deleteWordAction(id: string) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const deleted = await deleteWord(user.id, id);
  if (!deleted) return { error: copy.validation.notFound };
  refreshWords();
  return { ok: true };
}

export async function toggleFavoriteAction(id: string) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const word = await toggleFavorite(user.id, id);
  if (!word) return { error: copy.validation.notFound };
  refreshWords(id);
  return { isFavorite: word.isFavorite };
}

export async function addSentenceAction(input: unknown) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const parsed = sentenceSchema(copy).safeParse(input);
  if (!parsed.success) {
    return { error: firstFieldErrors(parsed.error).sentence ?? copy.validation.sentence };
  }
  const sentence = await addSentence(user.id, parsed.data.wordId, parsed.data.sentence);
  if (!sentence) return { error: copy.validation.notFound };
  revalidatePath(`/words/${parsed.data.wordId}`);
  return { id: sentence.id };
}
