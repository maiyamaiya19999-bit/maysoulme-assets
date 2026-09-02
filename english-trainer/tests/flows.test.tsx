// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { TrainerApp } from "../src/App";
import { STORAGE_KEY } from "../src/lib/progress";
import { VOCAB_KEY } from "../src/lib/vocab";
import type { Dataset } from "../src/lib/types";

const dataset: Dataset = {
  datasetVersion: 1,
  sentences: [
    {
      id: 1,
      russian: "Я люблю путешествовать.",
      english: "I love traveling.",
      explanation: "После love действие идёт в форме -ing: love traveling.",
      level: "A1",
      grammarTags: ["present-simple", "gerund"],
      topicTags: ["travel"],
      alternatives: ["I love to travel."],
      vocab: [{ word: "travel", translation: "путешествовать" }]
    },
    {
      id: 2,
      russian: "Что ты сейчас делаешь?",
      english: "What are you doing?",
      explanation: "Present Continuous: am/is/are + V-ing, are перед подлежащим.",
      level: "A1",
      grammarTags: ["present-continuous", "question"],
      topicTags: ["texting"]
    },
    {
      id: 3,
      russian: "Ты когда-нибудь был в Италии?",
      english: "Have you ever been to Italy?",
      explanation: "Present Perfect об опыте: have + V3, been to.",
      level: "A2",
      grammarTags: ["present-perfect", "question"],
      topicTags: ["travel"]
    }
  ]
};

function storedProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function storedVocab() {
  const raw = localStorage.getItem(VOCAB_KEY);
  return raw ? JSON.parse(raw) : null;
}

function renderApp() {
  return render(<TrainerApp dataset={dataset} />);
}

const openAll = () => fireEvent.click(screen.getByRole("button", { name: /Все$/ }));
const openMenu = () => fireEvent.click(screen.getByRole("button", { name: /Ещё/ }));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("основные сценарии UI", () => {
  // Сценарий 1: reveal не меняет progress
  it("«Показать перевод» показывает English и альтернативы, но не меняет completedIds", () => {
    renderApp();
    expect(screen.queryByText("traveling.")).toBeNull();
    fireEvent.click(screen.getByText("Показать перевод"));
    expect(screen.getByText("traveling.")).toBeTruthy();
    expect(screen.getByText("Так тоже можно")).toBeTruthy();
    expect(screen.getByText("travel.")).toBeTruthy();
    const p = storedProgress();
    expect(p === null || p.completedIds.length === 0).toBe(true);
  });

  // Сценарии 2 и 16
  it("«Выучено» отмечает и переходит дальше; English на следующей карточке скрыт", async () => {
    vi.useFakeTimers();
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    expect(storedProgress().completedIds).toEqual([1]);
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText("Что ты сейчас делаешь?")).toBeTruthy();
    expect(screen.queryByText("doing?")).toBeNull();
    expect(screen.getByText("Показать перевод")).toBeTruthy();
  });

  // Сценарий 3
  it("повторное нажатие «Выучено» снимает отметку", async () => {
    vi.useFakeTimers();
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    fireEvent.click(screen.getByText("← Предыдущее"));
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    expect(storedProgress().completedIds).toEqual([]);
  });

  // Сценарий 6: список не меняет progress; показывает RU и EN
  it("«Все» не меняет progress и показывает русский вместе с английским", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    const before = JSON.stringify(storedProgress());
    openAll();
    expect(screen.getByText("Ты когда-нибудь был в Италии?")).toBeTruthy();
    expect(screen.getByText("Have you ever been to Italy?")).toBeTruthy();
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарий 7
  it("поиск не меняет progress", () => {
    renderApp();
    openAll();
    const before = JSON.stringify(storedProgress());
    const search = screen.getByPlaceholderText("Поиск: русский, English, №…");
    fireEvent.change(search, { target: { value: "ever been" } });
    expect(screen.getByText("Ты когда-нибудь был в Италии?")).toBeTruthy();
    expect(screen.queryByText("Я люблю путешествовать.")).toBeNull();
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарий 8
  it("фильтры не меняют progress", () => {
    renderApp();
    openAll();
    const before = JSON.stringify(storedProgress());
    fireEvent.click(screen.getByText("Фильтры"));
    fireEvent.click(screen.getByText("Вопросы"));
    fireEvent.click(screen.getByText("Не выучено"));
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарий 9
  it("код 11111 ничего не меняет", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    const before = JSON.stringify(storedProgress());
    openMenu();
    fireEvent.click(screen.getByText("↻ Учить заново"));
    fireEvent.change(screen.getByPlaceholderText("Код"), { target: { value: "11111" } });
    fireEvent.click(screen.getByText("Продолжить"));
    expect(screen.getByText("Неверный код. Ничего не изменено.")).toBeTruthy();
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарии 10–13
  it("12345 + подтверждение начинает новый круг, старый уходит в историю", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    openMenu();
    fireEvent.click(screen.getByText("↻ Учить заново"));
    fireEvent.change(screen.getByPlaceholderText("Код"), { target: { value: "12345" } });
    fireEvent.click(screen.getByText("Продолжить"));
    fireEvent.click(screen.getByText("Да, начать новый круг"));
    const p = storedProgress();
    expect(p.currentRound).toBe(2);
    expect(p.completedIds).toEqual([]);
    expect(p.currentSentenceId).toBe(1);
    expect(p.roundHistory).toHaveLength(1);
    expect(p.roundHistory[0].status).toBe("restarted");
    expect(p.roundHistory[0].completedCount).toBe(1);
  });

  // Сценарии 4–5
  it("повторный рендер (перезапуск) восстанавливает прогресс", () => {
    const first = renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    first.unmount();
    renderApp();
    expect(screen.getByText(/1\/3/)).toBeTruthy();
    expect(storedProgress().completedIds).toEqual([1]);
  });

  it("завершение круга показывает «Круг завершён»", async () => {
    vi.useFakeTimers();
    renderApp();
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("Показать перевод"));
      fireEvent.click(screen.getByText("✓ Выучено"));
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    }
    expect(screen.getByText("Круг завершён")).toBeTruthy();
  });
});

describe("словарик", () => {
  it("нажатие на слово добавляет его в словарик с подсказкой перевода, удаление убирает", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("traveling."));
    // подсказка из vocab предложения: travel → путешествовать
    const translation = screen.getByDisplayValue("путешествовать");
    expect(translation).toBeTruthy();
    fireEvent.click(screen.getByText("Добавить"));
    expect(storedVocab()).toHaveLength(1);
    expect(storedVocab()[0].word).toBe("travel");
    // прогресс не тронут
    const p = storedProgress();
    expect(p === null || p.completedIds.length === 0).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Словарик/ }));
    expect(screen.getByText("путешествовать")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Убрать travel"));
    expect(storedVocab()).toHaveLength(0);
    expect(screen.getByText("Пока пусто.")).toBeTruthy();
  });

  it("слово без подсказки добавляется с переводом, введённым вручную", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getAllByText("love")[0]);
    const translation = screen.getByPlaceholderText("например: ждать с нетерпением");
    fireEvent.change(translation, { target: { value: "любить" } });
    fireEvent.click(screen.getByText("Добавить"));
    expect(storedVocab()[0]).toMatchObject({ word: "love", translation: "любить", sentenceId: 1 });
  });

  it("словарик переживает перезапуск и «Учить заново»", () => {
    const first = renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("traveling."));
    fireEvent.click(screen.getByText("Добавить"));
    first.unmount();
    renderApp();
    openMenu();
    fireEvent.click(screen.getByText("↻ Учить заново"));
    fireEvent.change(screen.getByPlaceholderText("Код"), { target: { value: "12345" } });
    fireEvent.click(screen.getByText("Продолжить"));
    fireEvent.click(screen.getByText("Да, начать новый круг"));
    expect(storedVocab()).toHaveLength(1);
  });
});
