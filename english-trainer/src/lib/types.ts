export type Level = "A1" | "A2" | "B1" | "B2";

export type VocabHint = {
  word: string;
  translation: string;
};

export type Sentence = {
  id: number;
  russian: string;
  english: string;
  explanation: string;
  level: Level;
  grammarTags: string[];
  topicTags: string[];
  // Ещё 1–3 естественных варианта, как можно сказать то же самое
  alternatives?: string[];
  // Ключевые слова предложения с переводом — подсказки для словарика
  vocab?: VocabHint[];
};

export type Dataset = {
  datasetVersion: number;
  sentences: Sentence[];
};

export type RoundHistoryEntry = {
  round: number;
  completedCount: number;
  total: number;
  status: "completed" | "restarted";
  startedAt: string;
  endedAt: string;
};

export type ProgressState = {
  datasetVersion: number;
  currentRound: number;
  currentSentenceId: number;
  completedIds: number[];
  roundStartedAt: string;
  roundHistory: RoundHistoryEntry[];
};

export type VocabEntry = {
  word: string;
  translation: string;
  sentenceId?: number;
  addedAt: string;
};
