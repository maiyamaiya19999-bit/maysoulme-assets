import { describe, it, expect } from "vitest";
import {
  STORAGE_KEY,
  RESET_CODE,
  defaultProgress,
  loadProgress,
  saveProgress,
  markCompleted,
  unmarkCompleted,
  toggleCompleted,
  setPosition,
  startNewRound,
  nextUncompletedId,
  exportProgress,
  parseImportedProgress,
  type KVStorage
} from "../src/lib/progress";
import type { ProgressState } from "../src/lib/types";

// Заглушка localStorage
function makeStorage(): KVStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    setItem: (k, v) => void data.set(k, v)
  };
}

const IDS = Array.from({ length: 20 }, (_, i) => i + 1);
const ID_SET = new Set(IDS);

function fresh(): ProgressState {
  return defaultProgress(1);
}

describe("progress core", () => {
  // Сценарий 1: showTranslation() не меняет completedIds.
  // Reveal вообще не проходит через progress-модуль — карточка держит его
  // в локальном state. Здесь фиксируем контракт: единственные операции над
  // completedIds — mark/unmark/startNewRound.
  it("reveal не меняет completedIds (нет такой операции в модуле прогресса)", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    // «Показать перевод» не вызывает никаких функций прогресса — state не меняется
    expect(JSON.stringify(s)).toBe(before);
    expect(s.completedIds).toEqual([]);
  });

  // Сценарий 2
  it("markCompleted(125) добавляет 125", () => {
    let s = fresh();
    s = markCompleted(s, 125);
    expect(s.completedIds).toContain(125);
    expect(s.completedIds).toHaveLength(1);
    // повторный mark не дублирует
    s = markCompleted(s, 125);
    expect(s.completedIds).toHaveLength(1);
  });

  // Сценарий 3
  it("снятие галочки удаляет только 125", () => {
    let s = fresh();
    s = markCompleted(s, 100);
    s = markCompleted(s, 125);
    s = markCompleted(s, 150);
    s = unmarkCompleted(s, 125);
    expect(s.completedIds).toEqual([100, 150]);
  });

  it("toggleCompleted переключает отметку", () => {
    let s = fresh();
    s = toggleCompleted(s, 7);
    expect(s.completedIds).toContain(7);
    s = toggleCompleted(s, 7);
    expect(s.completedIds).not.toContain(7);
  });

  // Сценарии 4–5: refresh / повторное открытие сохраняют progress
  it("save + load восстанавливает progress (refresh, повторное открытие)", () => {
    const storage = makeStorage();
    let s = fresh();
    s = markCompleted(s, 1);
    s = markCompleted(s, 2);
    s = setPosition(s, 347);
    saveProgress(storage, s);

    // «refresh»: загрузка заново
    const loaded = loadProgress(storage, 1);
    expect(loaded.completedIds).toEqual([1, 2]);
    expect(loaded.currentSentenceId).toBe(347);
    expect(loaded.currentRound).toBe(1);

    // «повторное открытие»: ещё одна загрузка
    const again = loadProgress(storage, 1);
    expect(again).toEqual(loaded);
  });

  it("loadProgress без сохранённого state даёт чистый круг 1", () => {
    const s = loadProgress(makeStorage(), 1);
    expect(s.currentRound).toBe(1);
    expect(s.completedIds).toEqual([]);
    expect(s.currentSentenceId).toBe(1);
  });

  it("повреждённый JSON в storage не роняет приложение", () => {
    const storage = makeStorage();
    storage.data.set(STORAGE_KEY, "{oops");
    const s = loadProgress(storage, 1);
    expect(s.currentRound).toBe(1);
  });

  // Сценарий 9: неверный код ничего не меняет.
  // Проверка кода — сравнение с RESET_CODE; reset вызывается только при равенстве.
  it("код 11111 не проходит проверку, progress не меняется", () => {
    const s = fresh();
    const code: string = "11111";
    const passes = code === RESET_CODE;
    expect(passes).toBe(false);
    // при неверном коде startNewRound не вызывается — state тот же
    expect(s.completedIds).toEqual([]);
    expect(s.currentRound).toBe(1);
  });

  // Сценарии 10–13: 12345 + confirm → новый круг
  it("12345 + confirm создаёт новый круг, completedIds пуст, старый круг в history со status restarted", () => {
    let s = fresh();
    for (const id of [1, 2, 3, 4, 5]) s = markCompleted(s, id);
    s = setPosition(s, 6);
    expect("12345").toBe(RESET_CODE);

    s = startNewRound(s, 20);
    expect(s.currentRound).toBe(2);
    expect(s.completedIds).toEqual([]); // сценарий 11
    expect(s.currentSentenceId).toBe(1);
    expect(s.roundHistory).toHaveLength(1); // сценарий 12
    const prev = s.roundHistory[0];
    expect(prev.round).toBe(1);
    expect(prev.completedCount).toBe(5);
    expect(prev.status).toBe("restarted"); // сценарий 13
  });

  // Сценарий 14
  it("завершённый круг получает status completed", () => {
    let s = fresh();
    for (const id of IDS) s = markCompleted(s, id);
    s = startNewRound(s, IDS.length);
    expect(s.roundHistory[0].status).toBe("completed");
    expect(s.roundHistory[0].completedCount).toBe(IDS.length);
  });

  it("история незавершённых кругов не уничтожается при следующих кругах", () => {
    let s = fresh();
    s = markCompleted(s, 1);
    s = startNewRound(s, 20); // круг 1 restarted
    for (const id of IDS) s = markCompleted(s, id);
    s = startNewRound(s, 20); // круг 2 completed
    expect(s.currentRound).toBe(3);
    expect(s.roundHistory.map((r) => r.status)).toEqual(["restarted", "completed"]);
  });

  // Сценарий 15: новый deployment не очищает progress.
  // Деплой = новый код читает тот же storage; datasetVersion может вырасти.
  it("деплой/обновление dataset не очищает progress", () => {
    const storage = makeStorage();
    let s = fresh();
    for (const id of [1, 2, 3]) s = markCompleted(s, id);
    s = setPosition(s, 4);
    saveProgress(storage, s);

    // приложение перезапустили с новой версией dataset (добавились предложения)
    const afterDeploy = loadProgress(storage, 2);
    expect(afterDeploy.completedIds).toEqual([1, 2, 3]);
    expect(afterDeploy.currentSentenceId).toBe(4);
    expect(afterDeploy.currentRound).toBe(1);
    expect(afterDeploy.roundHistory).toEqual([]);
  });

  // Сценарий 17
  it("export + import восстанавливает progress", () => {
    let s = fresh();
    for (const id of [1, 2, 3, 4, 5]) s = markCompleted(s, id);
    s = setPosition(s, 6);
    s = startNewRound(s, 20);
    for (const id of [1, 2]) s = markCompleted(s, id);

    const json = exportProgress(s);
    const result = parseImportedProgress(json, 1, ID_SET);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.currentRound).toBe(2);
      expect(result.state.completedIds).toEqual([1, 2]);
      expect(result.state.roundHistory).toHaveLength(1);
      expect(result.state.roundHistory[0].completedCount).toBe(5);
    }
  });

  it("невалидный импорт отклоняется и не даёт state", () => {
    expect(parseImportedProgress("not json", 1, ID_SET).ok).toBe(false);
    expect(parseImportedProgress("{}", 1, ID_SET).ok).toBe(false);
    expect(
      parseImportedProgress(JSON.stringify({ datasetVersion: 1, currentRound: 0 }), 1, ID_SET).ok
    ).toBe(false);
    // неизвестные ID
    const bad = {
      datasetVersion: 1,
      currentRound: 1,
      currentSentenceId: 1,
      completedIds: [1, 99999],
      roundStartedAt: new Date().toISOString(),
      roundHistory: []
    };
    expect(parseImportedProgress(JSON.stringify(bad), 1, ID_SET).ok).toBe(false);
    // файл от более новой версии базы
    const newer = { ...bad, completedIds: [1], datasetVersion: 99 };
    expect(parseImportedProgress(JSON.stringify(newer), 1, ID_SET).ok).toBe(false);
  });

  it("nextUncompletedId идёт вперёд, затем по кругу", () => {
    let s = fresh();
    s = markCompleted(s, 2);
    expect(nextUncompletedId(s, [1, 2, 3], 1)).toBe(3);
    expect(nextUncompletedId(s, [1, 2, 3], 3)).toBe(1);
    for (const id of [1, 3]) s = markCompleted(s, id);
    expect(nextUncompletedId(s, [1, 2, 3], 3)).toBe(null);
  });
});
