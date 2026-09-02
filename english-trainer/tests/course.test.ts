import { describe, it, expect } from "vitest";
import {
  defaultCourseState,
  buildDrill,
  answerDrill,
  isMastered,
  resetMastery,
  sentencesForModule,
  filterSection,
  dueForReview,
  SPACING_AGAIN,
  SPACING_OK
} from "../src/lib/course";
import { COURSE } from "../src/data/course";
import type { Sentence } from "../src/lib/types";

function s(id: number, tags: string[], level: Sentence["level"] = "A1", topics: string[] = ["texting"]): Sentence {
  return { id, russian: `ru${id}`, english: `en${id}`, explanation: "x".repeat(200), level, grammarTags: tags, topicTags: topics };
}

const list = [
  s(1, ["present-simple"]),
  s(2, ["present-simple", "negation"]),
  s(3, ["present-simple", "question"], "A2"),
  s(4, ["past-simple"], "B1"),
  s(5, ["present-simple"], "B1"),
  s(6, ["present-simple", "question"], "A1"),
  s(7, ["present-simple"], "A1"),
  s(8, ["present-simple"], "A1"),
  s(9, ["present-simple"], "A1")
];

describe("курс: отбор", () => {
  it("модуль Present Simple берёт предложения по тегу и сортирует по уровню", () => {
    const mod = COURSE.find((m) => m.id === "present-simple")!;
    const pool = sentencesForModule(list, mod);
    expect(pool.map((x) => x.id)).toEqual([1, 2, 6, 7, 8, 9, 3, 5]);
  });
  it("разделы: утверждения / отрицания / вопросы", () => {
    const mod = COURSE.find((m) => m.id === "present-simple")!;
    const pool = sentencesForModule(list, mod);
    expect(filterSection(pool, "questions").map((x) => x.id)).toEqual([6, 3]);
    expect(filterSection(pool, "negatives").map((x) => x.id)).toEqual([2]);
    expect(filterSection(pool, "statements").map((x) => x.id)).toEqual([1, 7, 8, 9, 5]);
  });
  it("модуль по уровню берёт только этот уровень", () => {
    const mod = COURSE.find((m) => m.id === "level-b1")!;
    expect(sentencesForModule(list, mod).map((x) => x.id)).toEqual([4, 5]);
  });
});

describe("курс: дрилл до автоматизма", () => {
  it("предложение уходит из очереди только после двух «сразу» подряд", () => {
    let state = defaultCourseState();
    let drill = buildDrill(list.slice(0, 3), state);
    expect(drill.queue).toEqual([1, 2, 3]);
    ({ drill, state } = answerDrill(drill, state, "ok"));
    // после первого «сразу» №1 вернулся в очередь (в конец, т.к. очередь короткая)
    expect(drill.queue).toEqual([2, 3, 1]);
    expect(isMastered(state, 1)).toBe(false);
    ({ drill, state } = answerDrill(drill, state, "ok")); // 2
    ({ drill, state } = answerDrill(drill, state, "ok")); // 3
    ({ drill, state } = answerDrill(drill, state, "ok")); // 1 второй раз
    expect(isMastered(state, 1)).toBe(true);
    expect(drill.queue).not.toContain(1);
    expect(drill.done).toBe(1);
  });

  it("«ещё раз» сбрасывает streak и возвращает карточку через SPACING_AGAIN", () => {
    let state = defaultCourseState();
    let drill = buildDrill(list, state);
    ({ drill, state } = answerDrill(drill, state, "ok"));
    ({ drill, state } = answerDrill(drill, state, "again")); // №2
    expect(state.streaks["2"]).toBe(0);
    expect(drill.queue.indexOf(2)).toBe(SPACING_AGAIN);
  });

  it("«сразу» первый раз возвращает карточку через SPACING_OK", () => {
    let state = defaultCourseState();
    let drill = buildDrill(list, state);
    ({ drill, state } = answerDrill(drill, state, "ok"));
    expect(drill.queue.indexOf(1)).toBe(SPACING_OK);
  });

  it("выученные не попадают в новую очередь; сброс возвращает их", () => {
    let state = defaultCourseState();
    state = { ...state, streaks: { "1": 2, "2": 2 } };
    expect(buildDrill(list.slice(0, 3), state).queue).toEqual([3]);
    state = resetMastery(state, list.slice(0, 3));
    expect(buildDrill(list.slice(0, 3), state).queue).toEqual([1, 2, 3]);
  });

  it("повторение выбирает выученные, которые давно не показывались", () => {
    const old = new Date("2026-01-01T00:00:00Z").toISOString();
    const fresh = new Date("2026-09-01T00:00:00Z").toISOString();
    const state = { streaks: { "1": 2, "2": 2, "3": 1 }, lastSeen: { "1": old, "2": fresh, "3": old } };
    const due = dueForReview(list, state, new Date("2026-09-02T00:00:00Z"));
    expect(due.map((x) => x.id)).toEqual([1]);
  });

  it("дрилл не трогает прогресс кругов (отдельное состояние)", () => {
    const state = defaultCourseState();
    const drill = buildDrill(list, state);
    const res = answerDrill(drill, state, "ok");
    expect(Object.keys(res.state)).toEqual(["streaks", "lastSeen"]);
  });
});
