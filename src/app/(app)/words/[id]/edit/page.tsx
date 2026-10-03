import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordForm } from "@/components/word-form";
import type { WordFormValues } from "@/lib/word-defaults";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy } from "@/lib/copy";
import { toDateInputValue } from "@/lib/dates";
import { requireUser } from "@/lib/session";
import { getWord, listCategories, listTags } from "@/services/word.service";

export const metadata: Metadata = { title: "Kelimeyi düzenle" };

export default async function EditWordPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const { id } = await params;
  const [word, categories, tags] = await Promise.all([
    getWord(user.id, id),
    listCategories(user.id),
    listTags(user.id),
  ]);
  if (!word) notFound();

  const initial: WordFormValues = {
    englishWord: word.englishWord,
    turkishMeaning: word.turkishMeaning,
    partOfSpeech: word.partOfSpeech,
    level: word.level,
    exampleSentence: word.exampleSentence ?? "",
    turkishExample: word.turkishExample ?? "",
    note: word.note ?? "",
    learnedAt: toDateInputValue(word.learnedAt),
    categoryName: word.category?.name ?? "",
    categoryUnit: word.category?.unit ?? "",
    tags: word.tags.map((item) => item.tag.name),
    isFavorite: word.isFavorite,
    status: word.status,
    pronunciation: word.pronunciation ?? "",
    ipa: word.ipa ?? "",
    definition: word.definition ?? "",
    synonyms: word.synonyms.join(", "),
    antonyms: word.antonyms.join(", "),
    relatedWords: word.relatedWords.join(", "),
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={copy.form.editTitle} description={copy.form.editBody} />
      <WordForm
        mode="edit"
        wordId={word.id}
        initial={initial}
        copy={copy}
        categories={categories.map((category) => ({ name: category.name, unit: category.unit }))}
        tagSuggestions={tags.map((tag) => tag.name)}
      />
    </div>
  );
}
