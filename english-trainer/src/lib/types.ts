export type Level = "A1" | "A2" | "B1" | "B2";

export type Sentence = {
  id: number;
  russian: string;
  english: string;
  explanation: string;
  level: Level;
  grammarTags: string[];
  topicTags: string[];
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
