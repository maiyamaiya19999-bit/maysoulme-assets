import type { KVStorage } from "./progress";
import type { Sentence } from "./types";
import type { CourseModule } from "../data/course";

export const COURSE_KEY = "english-trainer:course:v1";

// Мастерство по каждому предложению: streak — сколько раз подряд «сразу»,
// lastSeen — когда последний раз видела. «На автомате» = streak ≥ 2.
export type CourseState = {
  streaks: Record<string, number>;
  lastSeen: Record<string, string>;
};

export const MASTERED_AT = 2;

export function defaultCourseState(): CourseState {
  return { streaks: {}, lastSeen: {} };
}

export function loadCourseState(storage: KVStorage): CourseState {
  try {
    const raw = storage.getItem(COURSE_KEY);
    if (!raw) return defaultCourseState();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.streaks === "object" && typeof parsed.lastSeen === "object") {
      return { streaks: parsed.streaks ?? {}, lastSeen: parsed.lastSeen ?? {} };
    }
  } catch {
    // повреждённое состояние — начинаем с чистого, прогресс кругов не трогаем
  }
  return defaultCourseState();
}

export function saveCourseState(storage: KVStorage, state: CourseState): void {
  try {
    storage.setItem(COURSE_KEY, JSON.stringify(state));
  } catch {
    // недоступное хранилище
  }
}

export function isMastered(state: CourseState, id: number): boolean {
  return (state.streaks[String(id)] ?? 0) >= MASTERED_AT;
}

// ---- Отбор предложений для модуля ----

export type Section = "all" | "statements" | "negatives" | "questions";

export const SECTIONS: { key: Section; label: string }[] = [
  { key: "statements", label: "Утверждения" },
  { key: "negatives", label: "Отрицания" },
  { key: "questions", label: "Вопросы" },
  { key: "all", label: "Микс" }
];

const LEVEL_ORDER: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

export function sentencesForModule(sentences: Sentence[], mod: CourseModule): Sentence[] {
  const s = mod.selector;
  const out = sentences.filter((x) => {
    if (s.grammarAny && !s.grammarAny.some((t) => x.grammarTags.includes(t))) return false;
    if (s.topicAny && !s.topicAny.some((t) => x.topicTags.includes(t))) return false;
    if (s.levels && !s.levels.includes(x.level)) return false;
    return true;
  });
  // от простого к сложному, внутри уровня — по номеру
  return out.sort((a, b) => (LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]) || a.id - b.id);
}

export function sectionOf(s: Sentence): Exclude<Section, "all"> {
  if (s.grammarTags.includes("question") || s.grammarTags.includes("indirect-question")) return "questions";
  if (s.grammarTags.includes("negation")) return "negatives";
  return "statements";
}

export function filterSection(list: Sentence[], section: Section): Sentence[] {
  if (section === "all") return list;
  return list.filter((s) => sectionOf(s) === section);
}

export function filterLevel(list: Sentence[], level: string | null): Sentence[] {
  if (!level) return list;
  return list.filter((s) => s.level === level);
}

export function masteredCount(state: CourseState, list: Sentence[]): number {
  return list.filter((s) => isMastered(state, s.id)).length;
}

// ---- Дрилл ----
// Очередь — id предложений, которые ещё не «на автомате».
// «Сразу» → streak + 1; если достигнут MASTERED_AT — из очереди уходит,
// иначе возвращается через SPACING_OK карточек (второй проход).
// «Ещё раз» → streak = 0, возвращается через SPACING_AGAIN карточек.

export const SPACING_OK = 6;
export const SPACING_AGAIN = 3;

export type Drill = {
  queue: number[];
  done: number; // сколько предложений доведено до автомата в этой сессии
  seen: number; // сколько карточек показано
};

export function buildDrill(list: Sentence[], state: CourseState, includeMastered = false): Drill {
  const queue = list.filter((s) => includeMastered || !isMastered(state, s.id)).map((s) => s.id);
  return { queue, done: 0, seen: 0 };
}

export function answerDrill(
  drill: Drill,
  state: CourseState,
  result: "ok" | "again",
  now: Date = new Date()
): { drill: Drill; state: CourseState } {
  if (drill.queue.length === 0) return { drill, state };
  const [id, ...rest] = drill.queue;
  const key = String(id);
  const streaks = { ...state.streaks };
  const lastSeen = { ...state.lastSeen, [key]: now.toISOString() };
  let queue = rest;
  let done = drill.done;
  if (result === "ok") {
    const next = (streaks[key] ?? 0) + 1;
    streaks[key] = next;
    if (next >= MASTERED_AT) {
      done += 1;
    } else {
      queue = insertAt(rest, id, SPACING_OK);
    }
  } else {
    streaks[key] = 0;
    queue = insertAt(rest, id, SPACING_AGAIN);
  }
  return { drill: { queue, done, seen: drill.seen + 1 }, state: { streaks, lastSeen } };
}

function insertAt(arr: number[], id: number, pos: number): number[] {
  const p = Math.min(pos, arr.length);
  return [...arr.slice(0, p), id, ...arr.slice(p)];
}

// Сброс мастерства по списку предложений — «прогнать заново»
export function resetMastery(state: CourseState, list: Sentence[]): CourseState {
  const streaks = { ...state.streaks };
  for (const s of list) delete streaks[String(s.id)];
  return { ...state, streaks };
}

// Повторение: выученные предложения, которые давно не показывались
export function dueForReview(sentences: Sentence[], state: CourseState, now: Date = new Date(), days = 2, limit = 30): Sentence[] {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return sentences
    .filter((s) => isMastered(state, s.id))
    .map((s) => ({ s, t: Date.parse(state.lastSeen[String(s.id)] ?? "") || 0 }))
    .filter((x) => x.t <= cutoff)
    .sort((a, b) => a.t - b.t)
    .slice(0, limit)
    .map((x) => x.s);
}
