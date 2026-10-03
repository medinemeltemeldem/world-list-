import type { Metadata } from "next";
import { WordForm } from "@/components/word-form";
import { emptyWordForm } from "@/lib/word-defaults";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { listCategories, listTags } from "@/services/word.service";

export const metadata: Metadata = { title: "Yeni kelime" };

export default async function NewWordPage() {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const [categories, tags] = await Promise.all([listCategories(user.id), listTags(user.id)]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={copy.form.createTitle} description={copy.form.createBody} />
      <WordForm
        mode="create"
        initial={emptyWordForm()}
        copy={copy}
        categories={categories.map((category) => ({ name: category.name, unit: category.unit }))}
        tagSuggestions={tags.map((tag) => tag.name)}
      />
    </div>
  );
}
