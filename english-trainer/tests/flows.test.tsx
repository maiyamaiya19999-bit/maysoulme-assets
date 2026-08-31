// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { TrainerApp } from "../src/App";
import { STORAGE_KEY } from "../src/lib/progress";
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
      topicTags: ["travel"]
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

function renderApp() {
  return render(<TrainerApp dataset={dataset} />);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("основные сценарии UI", () => {
  // Сценарий 1 + 16 (первая половина): reveal не меняет progress
  it("«Показать перевод» показывает English, но не меняет completedIds", () => {
    renderApp();
    expect(screen.queryByText("I love traveling.")).toBeNull();
    fireEvent.click(screen.getByText("Показать перевод"));
    expect(screen.getByText("I love traveling.")).toBeTruthy();
    const p = storedProgress();
    // либо прогресс ещё не записан, либо completedIds пуст
    expect(p === null || p.completedIds.length === 0).toBe(true);
  });

  // Сценарии 2 и 16: «Выучено» сохраняет прогресс, следующая карточка снова скрыта
  it("«Выучено» отмечает и переходит дальше; English на следующей карточке скрыт", async () => {
    vi.useFakeTimers();
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    expect(storedProgress().completedIds).toEqual([1]);
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    // следующая карточка — №2, English скрыт
    expect(screen.getByText("Что ты сейчас делаешь?")).toBeTruthy();
    expect(screen.queryByText("What are you doing?")).toBeNull();
    expect(screen.getByText("Показать перевод")).toBeTruthy();
  });

  // Сценарий 3: снятие галочки
  it("повторное нажатие «Выучено» снимает отметку", async () => {
    vi.useFakeTimers();
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    // вернуться к №1
    fireEvent.click(screen.getByText("← Предыдущее"));
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    expect(storedProgress().completedIds).toEqual([]);
  });

  // Сценарий 6: Show All не меняет progress
  it("«Показать все» не меняет progress и не спойлерит English", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    const before = JSON.stringify(storedProgress());
    fireEvent.click(screen.getByLabelText("Показать все"));
    expect(screen.getByText("Ты когда-нибудь был в Италии?")).toBeTruthy();
    expect(screen.queryByText("Have you ever been to Italy?")).toBeNull();
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарий 7: search не меняет progress и не показывает English
  it("поиск (в т.ч. по English) не меняет progress и не показывает English", () => {
    renderApp();
    fireEvent.click(screen.getByLabelText("Показать все"));
    const before = JSON.stringify(storedProgress());
    const search = screen.getByPlaceholderText("Поиск: русский, English, №…");
    fireEvent.change(search, { target: { value: "ever been" } });
    // найдено по English, но показан только русский
    expect(screen.getByText("Ты когда-нибудь был в Италии?")).toBeTruthy();
    expect(screen.queryByText("Have you ever been to Italy?")).toBeNull();
    expect(screen.queryByText("Я люблю путешествовать.")).toBeNull();
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарий 8: фильтры не меняют progress
  it("фильтры не меняют progress", () => {
    renderApp();
    fireEvent.click(screen.getByLabelText("Показать все"));
    const before = JSON.stringify(storedProgress());
    fireEvent.click(screen.getByText("Фильтры"));
    fireEvent.click(screen.getByText("Вопросы"));
    fireEvent.click(screen.getByText("Не выучено"));
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарий 9: неверный код
  it("код 11111 ничего не меняет", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    const before = JSON.stringify(storedProgress());
    fireEvent.click(screen.getByLabelText("Меню"));
    fireEvent.click(screen.getByText("↻ Учить заново"));
    fireEvent.change(screen.getByPlaceholderText("Код"), { target: { value: "11111" } });
    fireEvent.click(screen.getByText("Продолжить"));
    expect(screen.getByText("Неверный код. Ничего не изменено.")).toBeTruthy();
    expect(JSON.stringify(storedProgress())).toBe(before);
  });

  // Сценарии 10–13: правильный код + confirm
  it("12345 + подтверждение начинает новый круг, старый уходит в историю", () => {
    renderApp();
    fireEvent.click(screen.getByText("Показать перевод"));
    fireEvent.click(screen.getByText("✓ Выучено"));
    fireEvent.click(screen.getByLabelText("Меню"));
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

  // Сценарии 4–5: перезапуск приложения сохраняет прогресс
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
