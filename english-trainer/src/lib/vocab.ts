import type { KVStorage } from "./progress";
import type { VocabEntry, VocabHint } from "./types";

export const VOCAB_KEY = "english-trainer:vocab:v1";

function isEntry(e: unknown): e is VocabEntry {
  if (typeof e !== "object" || e === null) return false;
  const r = e as Record<string, unknown>;
  return typeof r.word === "string" && typeof r.translation === "string" && typeof r.addedAt === "string";
}

export function isValidVocab(v: unknown): v is VocabEntry[] {
  return Array.isArray(v) && v.every(isEntry);
}

export function loadVocab(storage: KVStorage): VocabEntry[] {
  try {
    const raw = storage.getItem(VOCAB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return isValidVocab(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVocab(storage: KVStorage, list: VocabEntry[]): void {
  try {
    storage.setItem(VOCAB_KEY, JSON.stringify(list));
  } catch {
    // недоступное хранилище — словарик живёт в памяти до перезагрузки
  }
}

export function normalizeWord(w: string): string {
  return w.trim().toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");
}

// Добавление: одно слово — одна запись; повторное добавление обновляет перевод.
export function addVocab(list: VocabEntry[], entry: Omit<VocabEntry, "addedAt">, now: Date = new Date()): VocabEntry[] {
  const word = entry.word.trim();
  const translation = entry.translation.trim();
  if (!word) return list;
  const key = normalizeWord(word);
  const rest = list.filter((e) => normalizeWord(e.word) !== key);
  return [{ word, translation, sentenceId: entry.sentenceId, addedAt: now.toISOString() }, ...rest];
}

export function removeVocab(list: VocabEntry[], word: string): VocabEntry[] {
  const key = normalizeWord(word);
  return list.filter((e) => normalizeWord(e.word) !== key);
}

export function hasVocab(list: VocabEntry[], word: string): boolean {
  const key = normalizeWord(word);
  return list.some((e) => normalizeWord(e.word) === key);
}

// Подсказка перевода для нажатого слова из vocab-подсказок предложения.
// Совпадение по слову, по началу слова (формы: work/working) или по фразе,
// содержащей это слово (look forward to → forward).
export function findHint(hints: VocabHint[] | undefined, tapped: string): VocabHint | null {
  if (!hints || hints.length === 0) return null;
  const t = normalizeWord(tapped);
  if (!t) return null;
  const exact = hints.find((h) => normalizeWord(h.word) === t);
  if (exact) return exact;
  const stem = hints.find((h) => {
    const w = normalizeWord(h.word);
    return (w.startsWith(t) || t.startsWith(w)) && Math.min(w.length, t.length) >= 3;
  });
  if (stem) return stem;
  const phrase = hints.find((h) =>
    h.word
      .toLowerCase()
      .split(/\s+/)
      .map(normalizeWord)
      .some((p) => p === t || (p.length >= 3 && (p.startsWith(t) || t.startsWith(p))))
  );
  return phrase ?? null;
}
