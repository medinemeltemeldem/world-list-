import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WordCard } from "@/components/word-card";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { DATE_FILTERS, LEVELS, PARTS_OF_SPEECH, PRESET_TAGS, SORTS, STATUSES } from "@/lib/constants";
import { getCopy, localeOf } from "@/lib/copy";
import { filtersToSearchParams, parseWordFilters } from "@/lib/filters";
import { requireUser } from "@/lib/session";
import { fill } from "@/lib/utils";
import { countWords, listCategories, listTags, listWords } from "@/services/word.service";

export const metadata: Metadata = { title: "Kelime Defterim" };

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const locale = localeOf(user.locale);
  const copy = getCopy(locale);
  const filters = parseWordFilters(await searchParams);
  const [result, categories, tags, totalWords] = await Promise.all([
    listWords(user.id, filters),
    listCategories(user.id),
    listTags(user.id),
    countWords(user.id),
  ]);
  const tagOptions = [...new Set([...PRESET_TAGS, ...tags.map((tag) => tag.name)])];
  const dateLabels = {
    today: copy.common.today,
    week: copy.common.week,
    month: copy.common.month,
    quarter: copy.common.quarter,
    custom: copy.common.custom,
  };
  const sortLabels = {
    newest: copy.words.newest,
    oldest: copy.words.oldest,
    alpha: copy.words.alpha,
    difficult: copy.words.difficult,
    reviewed: copy.words.reviewed,
  };

  return (
    <div>
      <PageHeader
        title={copy.words.title}
        description={copy.words.description}
        action={
          <Link href="/words/new" className={buttonClass("primary")}>
            <Plus className="h-4 w-4" />
            {copy.common.addWord}
          </Link>
        }
      />

      <form action="/words" className="mb-5 grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-4">
        <Input name="q" defaultValue={filters.q} placeholder={copy.words.searchPlaceholder} className="md:col-span-2" />
        <Select name="partOfSpeech" defaultValue={filters.partOfSpeech ?? ""} aria-label={copy.words.partOfSpeech}>
          <option value="">{copy.words.partOfSpeech}</option>
          {PARTS_OF_SPEECH.map((item) => (
            <option key={item} value={item}>{copy.pos[item]}</option>
          ))}
        </Select>
        <Select name="level" defaultValue={filters.level ?? ""} aria-label={copy.words.level}>
          <option value="">{copy.words.level}</option>
          {LEVELS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
        <Select name="status" defaultValue={filters.status ?? ""} aria-label={copy.words.status}>
          <option value="">{copy.words.status}</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>{copy.status[item]}</option>
          ))}
        </Select>
        <Select name="tag" defaultValue={filters.tag ?? ""} aria-label={copy.words.tag}>
          <option value="">{copy.words.tag}</option>
          {tagOptions.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </Select>
        <Select name="categoryId" defaultValue={filters.categoryId ?? ""} aria-label={copy.words.category}>
          <option value="">{copy.words.category}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}{category.unit ? ` · ${category.unit}` : ""}</option>
          ))}
        </Select>
        <Select name="date" defaultValue={filters.date ?? ""} aria-label={copy.words.date}>
          <option value="">{copy.words.date}</option>
          {DATE_FILTERS.map((item) => (
            <option key={item} value={item}>{dateLabels[item]}</option>
          ))}
        </Select>
        <Select name="sort" defaultValue={filters.sort} aria-label={copy.words.sort}>
          {SORTS.map((item) => (
            <option key={item} value={item}>{sortLabels[item]}</option>
          ))}
        </Select>
        <Input name="from" type="date" defaultValue={filters.from} aria-label={copy.common.from} />
        <Input name="to" type="date" defaultValue={filters.to} aria-label={copy.common.to} />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="favorite" value="1" defaultChecked={filters.favorite} className="h-4 w-4 accent-indigo-600" />
          {copy.words.favoritesOnly}
        </label>
        <div className="flex gap-2 md:col-span-2 md:justify-end">
          <Link href="/words" className={buttonClass("ghost")}>{copy.common.clear}</Link>
          <button type="submit" className={buttonClass("secondary")}>{copy.common.apply}</button>
        </div>
      </form>

      <p className="mb-4 text-sm text-muted">{fill(copy.words.count, { count: result.total })}</p>

      {totalWords === 0 ? (
        <EmptyState icon={<Plus className="h-5 w-5" />} title={copy.words.emptyTitle} body={copy.words.emptyBody} actionHref="/words/new" actionLabel={copy.common.addWord} />
      ) : result.words.length === 0 ? (
        <EmptyState icon={<Plus className="h-5 w-5" />} title={copy.words.filteredTitle} body={copy.words.filteredBody} actionHref="/words" actionLabel={copy.common.clear} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {result.words.map((word) => (
            <WordCard key={word.id} word={word} copy={copy} locale={locale} />
          ))}
        </div>
      )}

      {result.pageCount > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <Link href={filtersToSearchParams(filters, Math.max(1, result.page - 1))} className={buttonClass("secondary", "sm", result.page === 1 ? "pointer-events-none opacity-40" : "")}>
            {copy.words.previous}
          </Link>
          <span className="text-sm text-muted">{fill(copy.words.page, { page: result.page, total: result.pageCount })}</span>
          <Link href={filtersToSearchParams(filters, Math.min(result.pageCount, result.page + 1))} className={buttonClass("secondary", "sm", result.page === result.pageCount ? "pointer-events-none opacity-40" : "")}>
            {copy.words.next}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
