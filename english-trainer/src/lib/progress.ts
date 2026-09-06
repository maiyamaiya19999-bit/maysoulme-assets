import type { ProgressState, RoundHistoryEntry, VocabEntry } from "./types";
import { isValidVocab } from "./vocab";

export const STORAGE_KEY = "english-trainer:progress:v1";
export const RESET_CODE = "12345";

// Минимальный интерфейс хранилища — в приложении это localStorage,
// в тестах — простая заглушка.
export type KVStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function defaultProgress(datasetVersion: number, now: Date = new Date()): ProgressState {
  return {
    datasetVersion,
    currentRound: 1,
    currentSentenceId: 1,
    completedIds: [],
    roundStartedAt: now.toISOString(),
    roundHistory: []
  };
}

function isValidHistoryEntry(e: unknown): e is RoundHistoryEntry {
  if (typeof e !== "object" || e === null) return false;
  const r = e as Record<string, unknown>;
  return (
    typeof r.round === "number" &&
    typeof r.completedCount === "number" &&
    (r.status === "completed" || r.status === "restarted") &&
    typeof r.startedAt === "string" &&
    typeof r.endedAt === "string"
  );
}

// Структурная проверка произвольного объекта (из storage или из импорта).
export function isValidProgress(obj: unknown): obj is ProgressState {
  if (typeof obj !== "object" || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.datasetVersion === "number" &&
    typeof r.currentRound === "number" &&
    r.currentRound >= 1 &&
    typeof r.currentSentenceId === "number" &&
    Array.isArray(r.completedIds) &&
    r.completedIds.every((id) => typeof id === "number" && Number.isInteger(id)) &&
    typeof r.roundStartedAt === "string" &&
    Array.isArray(r.roundHistory) &&
    r.roundHistory.every(isValidHistoryEntry)
  );
}

// Загрузка прогресса. Повреждённые данные не затираются молча:
// вызывающая сторона получает default только если сохранённого state нет вовсе.
export function loadProgress(storage: KVStorage, datasetVersion: number): ProgressState {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return defaultProgress(datasetVersion);
  }
  if (!raw) return defaultProgress(datasetVersion);
  try {
    const parsed = JSON.parse(raw);
    if (isValidProgress(parsed)) {
      // Обновление dataset (новые предложения в конце) не сбрасывает прогресс:
      // ID стабильные, completedIds остаются валидными.
      return { ...parsed, datasetVersion };
    }
  } catch {
    // повреждённый JSON — ниже вернём default, но не перезаписываем storage здесь
  }
  return defaultProgress(datasetVersion);
}

export function saveProgress(storage: KVStorage, state: ProgressState): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // например, приватный режим — приложение продолжает работать в памяти
  }
}

export function isCompleted(state: ProgressState, id: number): boolean {
  return state.completedIds.includes(id);
}

export function markCompleted(state: ProgressState, id: number): ProgressState {
  if (state.completedIds.includes(id)) return state;
  return { ...state, completedIds: [...state.completedIds, id] };
}

export function unmarkCompleted(state: ProgressState, id: number): ProgressState {
  if (!state.completedIds.includes(id)) return state;
  return { ...state, completedIds: state.completedIds.filter((x) => x !== id) };
}

export function toggleCompleted(state: ProgressState, id: number): ProgressState {
  return isCompleted(state, id) ? unmarkCompleted(state, id) : markCompleted(state, id);
}

export function setPosition(state: ProgressState, id: number): ProgressState {
  if (state.currentSentenceId === id) return state;
  return { ...state, currentSentenceId: id };
}

// Следующее невыученное предложение после from (по кругу).
export function nextUncompletedId(state: ProgressState, ids: number[], from: number): number | null {
  const sorted = [...ids].sort((a, b) => a - b);
  const after = sorted.filter((id) => id > from && !state.completedIds.includes(id));
  if (after.length > 0) return after[0];
  const before = sorted.filter((id) => id <= from && !state.completedIds.includes(id));
  if (before.length > 0) return before[0];
  return null;
}

// Единственная операция, очищающая completed-state текущего круга.
// Текущий круг всегда сохраняется в history (completed или restarted).
export function startNewRound(state: ProgressState, totalSentences: number, now: Date = new Date()): ProgressState {
  const finished = state.completedIds.length >= totalSentences;
  const entry: RoundHistoryEntry = {
    round: state.currentRound,
    completedCount: state.completedIds.length,
    total: totalSentences,
    status: finished ? "completed" : "restarted",
    startedAt: state.roundStartedAt,
    endedAt: now.toISOString()
  };
  return {
    ...state,
    currentRound: state.currentRound + 1,
    currentSentenceId: 1,
    completedIds: [],
    roundStartedAt: now.toISOString(),
    roundHistory: [...state.roundHistory, entry]
  };
}

// ---- Export / Import ----

export function exportProgress(state: ProgressState, vocab: VocabEntry[] = []): string {
  return JSON.stringify(
    {
      datasetVersion: state.datasetVersion,
      currentRound: state.currentRound,
      currentSentenceId: state.currentSentenceId,
      completedIds: state.completedIds,
      roundStartedAt: state.roundStartedAt,
      roundHistory: state.roundHistory,
      vocab
    },
    null,
    2
  );
}

export type ImportResult =
  | { ok: true; state: ProgressState; vocab: VocabEntry[] | null }
  | { ok: false; error: string };

// Валидация импортируемого файла. Невалидный файл не меняет существующий progress —
// вызывающая сторона заменяет state только при ok: true и после подтверждения.
export function parseImportedProgress(
  raw: string,
  datasetVersion: number,
  validIds: Set<number>
): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Файл не является корректным JSON." };
  }
  if (!isValidProgress(parsed)) {
    return { ok: false, error: "Структура файла не похожа на экспорт прогресса." };
  }
  if (parsed.datasetVersion > datasetVersion) {
    return { ok: false, error: "Файл создан для более новой версии базы предложений." };
  }
  const unknownIds = parsed.completedIds.filter((id) => !validIds.has(id));
  if (unknownIds.length > 0) {
    return { ok: false, error: `В файле есть неизвестные ID предложений: ${unknownIds.slice(0, 5).join(", ")}…` };
  }
  const state: ProgressState = {
    datasetVersion,
    currentRound: parsed.currentRound,
    currentSentenceId: validIds.has(parsed.currentSentenceId) ? parsed.currentSentenceId : 1,
    completedIds: [...new Set(parsed.completedIds)],
    roundStartedAt: parsed.roundStartedAt,
    roundHistory: parsed.roundHistory
  };
  const rawVocab = (parsed as unknown as Record<string, unknown>).vocab;
  const vocab = isValidVocab(rawVocab) ? rawVocab : null;
  return { ok: true, state, vocab };
}
