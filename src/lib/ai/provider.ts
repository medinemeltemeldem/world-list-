export type AiDefinition = {
  english: string;
  turkish: string;
};

export type SentenceCheck = {
  correct: boolean;
  feedback: string;
};

export interface VocabularyAiProvider {
  generateExample(word: string, meaning: string): Promise<string>;
  generateDefinition(word: string, meaning: string): Promise<AiDefinition>;
  checkSentence(sentence: string, word: string): Promise<SentenceCheck>;
  findSynonyms(word: string): Promise<string[]>;
  findAntonyms(word: string): Promise<string[]>;
  explainLevel(word: string): Promise<string>;
  generateQuiz(word: string): Promise<{ question: string; answer: string }>;
}

export class UnconfiguredAiProvider implements VocabularyAiProvider {
  private unavailable(): never {
    throw new Error("AI_PROVIDER_NOT_CONFIGURED");
  }

  generateExample(): Promise<string> {
    return this.unavailable();
  }

  generateDefinition(): Promise<AiDefinition> {
    return this.unavailable();
  }

  checkSentence(): Promise<SentenceCheck> {
    return this.unavailable();
  }

  findSynonyms(): Promise<string[]> {
    return this.unavailable();
  }

  findAntonyms(): Promise<string[]> {
    return this.unavailable();
  }

  explainLevel(): Promise<string> {
    return this.unavailable();
  }

  generateQuiz(): Promise<{ question: string; answer: string }> {
    return this.unavailable();
  }
}

export function getAiProvider(): VocabularyAiProvider {
  return new UnconfiguredAiProvider();
}
