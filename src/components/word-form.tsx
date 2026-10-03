"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createWordAction, updateWordAction } from "@/actions/word.actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { LEVELS, PARTS_OF_SPEECH, PRESET_TAGS, STATUSES, type LearningStatus, type Level, type PartOfSpeech } from "@/lib/constants";
import type { Copy } from "@/lib/copy";
import { emptyWordForm, type WordFormValues } from "@/lib/word-defaults";

export function WordForm({
  mode,
  wordId,
  initial,
  copy,
  categories,
  tagSuggestions,
}: {
  mode: "create" | "edit";
  wordId?: string;
  initial: WordFormValues;
  copy: Copy;
  categories: { name: string; unit: string | null }[];
  tagSuggestions: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [customTag, setCustomTag] = useState("");
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [advancedOpen, setAdvancedOpen] = useState(
    Boolean(initial.definition || initial.pronunciation || initial.synonyms || initial.antonyms || initial.relatedWords || initial.ipa),
  );
  const suggestions = useMemo(
    () => [...new Set([...PRESET_TAGS, ...tagSuggestions, ...values.tags])],
    [tagSuggestions, values.tags],
  );

  function set<K extends keyof WordFormValues>(key: K, value: WordFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tag: string) {
    set(
      "tags",
      values.tags.includes(tag) ? values.tags.filter((item) => item !== tag) : [...values.tags, tag].slice(0, 12),
    );
  }

  function addCustomTag() {
    const tag = customTag.trim();
    if (!tag) return;
    if (!values.tags.includes(tag)) set("tags", [...values.tags, tag].slice(0, 12));
    setCustomTag("");
  }

  async function submit(addAnother: boolean) {
    setPending(true);
    const result = mode === "create" ? await createWordAction(values) : await updateWordAction(wordId ?? "", values);
    setPending(false);
    if (result.error) {
      setFields(result.fields ?? {});
      toast.error(result.error);
      return;
    }
    setFields({});
    toast.success(mode === "create" ? copy.toast.wordSaved : copy.toast.wordUpdated);
    if (addAnother) {
      setValues(emptyWordForm());
      router.refresh();
      return;
    }
    router.push(`/words/${result.id}`);
    router.refresh();
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="englishWord">{copy.form.english}</Label>
          <Input id="englishWord" value={values.englishWord} placeholder={copy.form.englishPh} onChange={(event) => set("englishWord", event.target.value)} required />
          <FieldError>{fields.englishWord}</FieldError>
        </div>
        <div>
          <Label htmlFor="turkishMeaning">{copy.form.turkish}</Label>
          <Input id="turkishMeaning" value={values.turkishMeaning} placeholder={copy.form.turkishPh} onChange={(event) => set("turkishMeaning", event.target.value)} required />
          <FieldError>{fields.turkishMeaning}</FieldError>
        </div>
        <div>
          <Label htmlFor="partOfSpeech">{copy.form.partOfSpeech}</Label>
          <Select id="partOfSpeech" value={values.partOfSpeech} onChange={(event) => set("partOfSpeech", event.target.value as PartOfSpeech)}>
            {PARTS_OF_SPEECH.map((item) => (
              <option key={item} value={item}>{copy.pos[item]}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="level">{copy.form.level}</Label>
          <Select id="level" value={values.level} onChange={(event) => set("level", event.target.value as Level)}>
            {LEVELS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="exampleSentence">{copy.form.example}</Label>
        <Textarea id="exampleSentence" value={values.exampleSentence} placeholder={copy.form.examplePh} onChange={(event) => set("exampleSentence", event.target.value)} />
      </div>
      <div>
        <Label htmlFor="turkishExample">{copy.form.turkishExample}</Label>
        <Textarea id="turkishExample" value={values.turkishExample} placeholder={copy.form.turkishExamplePh} onChange={(event) => set("turkishExample", event.target.value)} />
      </div>
      <div>
        <Label htmlFor="note">{copy.form.note}</Label>
        <Textarea id="note" value={values.note} placeholder={copy.form.notePh} onChange={(event) => set("note", event.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="learnedAt">{copy.form.learnedAt}</Label>
          <Input id="learnedAt" type="date" value={values.learnedAt} onChange={(event) => set("learnedAt", event.target.value)} required />
          <p className="mt-1 text-xs text-muted">{copy.form.learnedHint}</p>
          <FieldError>{fields.learnedAt}</FieldError>
        </div>
        {mode === "edit" ? (
          <div>
            <Label htmlFor="status">{copy.form.status}</Label>
            <Select id="status" value={values.status} onChange={(event) => set("status", event.target.value as LearningStatus)}>
              {STATUSES.map((item) => (
                <option key={item} value={item}>{copy.status[item]}</option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryName">{copy.form.category}</Label>
          <Input id="categoryName" list="categories" value={values.categoryName} placeholder={copy.form.categoryPh} onChange={(event) => set("categoryName", event.target.value)} />
          <datalist id="categories">
            {categories.map((category) => (
              <option key={category.name} value={category.name} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="categoryUnit">{copy.form.unit}</Label>
          <Input id="categoryUnit" value={values.categoryUnit} placeholder={copy.form.unitPh} onChange={(event) => set("categoryUnit", event.target.value)} />
        </div>
      </div>

      <div>
        <Label>{copy.form.tags}</Label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => {
            const selected = values.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-sm ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-border bg-card"}`}
                aria-pressed={selected}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={customTag} placeholder={copy.form.customTag} onChange={(event) => setCustomTag(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomTag();
            }
          }} />
          <Button type="button" variant="secondary" onClick={addCustomTag}>{copy.form.addTag}</Button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.isFavorite} onChange={(event) => set("isFavorite", event.target.checked)} className="h-4 w-4 accent-indigo-600" />
        {copy.form.favorite}
      </label>

      <details
        className="rounded-2xl border border-border bg-card p-4"
        open={advancedOpen}
        onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer text-sm font-medium">{copy.form.advanced}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pronunciation">{copy.form.pronunciation}</Label>
            <Input id="pronunciation" value={values.pronunciation} onChange={(event) => set("pronunciation", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="ipa">{copy.form.ipa}</Label>
            <Input id="ipa" value={values.ipa} onChange={(event) => set("ipa", event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="definition">{copy.form.definition}</Label>
            <Textarea id="definition" value={values.definition} onChange={(event) => set("definition", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="synonyms">{copy.form.synonyms}</Label>
            <Input id="synonyms" value={values.synonyms} placeholder={copy.form.comma} onChange={(event) => set("synonyms", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="antonyms">{copy.form.antonyms}</Label>
            <Input id="antonyms" value={values.antonyms} placeholder={copy.form.comma} onChange={(event) => set("antonyms", event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="relatedWords">{copy.form.related}</Label>
            <Input id="relatedWords" value={values.relatedWords} placeholder={copy.form.comma} onChange={(event) => set("relatedWords", event.target.value)} />
          </div>
        </div>
      </details>

      <div className="sticky bottom-24 z-10 flex flex-col gap-2 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur sm:flex-row md:bottom-4">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? copy.common.loading : copy.common.save}
        </Button>
        {mode === "create" ? (
          <Button type="button" variant="secondary" disabled={pending} className="w-full sm:w-auto" onClick={() => void submit(true)}>
            {copy.common.saveAndAnother}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
