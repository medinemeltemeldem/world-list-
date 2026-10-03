import type { LearningStatus, Level, PartOfSpeech } from "@/lib/constants";
import { toDateInputValue } from "@/lib/dates";

export type WordFormValues = {
  englishWord: string;
  turkishMeaning: string;
  partOfSpeech: PartOfSpeech;
  level: Level;
  exampleSentence: string;
  turkishExample: string;
  note: string;
  learnedAt: string;
  categoryName: string;
  categoryUnit: string;
  tags: string[];
  isFavorite: boolean;
  status: LearningStatus;
  pronunciation: string;
  ipa: string;
  definition: string;
  synonyms: string;
  antonyms: string;
  relatedWords: string;
};

export function emptyWordForm(): WordFormValues {
  return {
    englishWord: "",
    turkishMeaning: "",
    partOfSpeech: "VERB",
    level: "A2",
    exampleSentence: "",
    turkishExample: "",
    note: "",
    learnedAt: toDateInputValue(new Date()),
    categoryName: "",
    categoryUnit: "",
    tags: [],
    isFavorite: false,
    status: "NEW",
    pronunciation: "",
    ipa: "",
    definition: "",
    synonyms: "",
    antonyms: "",
    relatedWords: "",
  };
}
