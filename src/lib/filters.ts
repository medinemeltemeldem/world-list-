import {
  DATE_FILTERS,
  LEVELS,
  PARTS_OF_SPEECH,
  SORTS,
  STATUSES,
  isOneOf,
  type DateFilter,
  type Level,
  type PartOfSpeech,
  type WordSort,
  type LearningStatus,
} from "@/lib/constants";

export type WordFilters = {
  q?: string;
  partOfSpeech?: PartOfSpeech;
  level?: Level;
  status?: LearningStatus;
  tag?: string;
  categoryId?: string;
  favorite?: boolean;
  date?: DateFilter;
  from?: string;
  to?: string;
  sort: WordSort;
  page: number;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseWordFilters(params: Record<string, string | string[] | undefined>): WordFilters {
  const q = first(params.q)?.trim();
  const part = first(params.partOfSpeech);
  const level = first(params.level);
  const status = first(params.status);
  const date = first(params.date);
  const sort = first(params.sort);
  const page = Number(first(params.page) ?? "1");
  const from = first(params.from);
  const to = first(params.to);

  return {
    q: q || undefined,
    partOfSpeech: isOneOf(PARTS_OF_SPEECH, part) ? part : undefined,
    level: isOneOf(LEVELS, level) ? level : undefined,
    status: isOneOf(STATUSES, status) ? status : undefined,
    tag: first(params.tag)?.trim() || undefined,
    categoryId: first(params.categoryId)?.trim() || undefined,
    favorite: first(params.favorite) === "1",
    date: isOneOf(DATE_FILTERS, date) ? date : undefined,
    from: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : undefined,
    to: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : undefined,
    sort: isOneOf(SORTS, sort) ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function filtersToSearchParams(filters: WordFilters, page = filters.page) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.partOfSpeech) params.set("partOfSpeech", filters.partOfSpeech);
  if (filters.level) params.set("level", filters.level);
  if (filters.status) params.set("status", filters.status);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.favorite) params.set("favorite", "1");
  if (filters.date) params.set("date", filters.date);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/words?${query}` : "/words";
}
