import { useEffect, useRef, useState } from "react";
import type { Sentence } from "../lib/types";

type Props = {
  sentence: Sentence;
  completed: boolean;
  onToggleCompleted: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSkip: () => void; // «Оставить на повтор» — дальше без отметки
  onAdvance: () => void; // после «Выучено» — к следующему невыученному
};

// Карточка предложения. Reveal — локальный state: сбрасывается при смене
// предложения (компонент пересоздаётся по key) и не влияет на прогресс.
export function CardView({ sentence, completed, onToggleCompleted, onPrev, onNext, onSkip, onAdvance }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [justMarked, setJustMarked] = useState(false);
  const advanceRef = useRef(onAdvance);
  advanceRef.current = onAdvance;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleMark = () => {
    if (completed) {
      // повторное нажатие снимает отметку — без перехода
      onToggleCompleted();
      return;
    }
    onToggleCompleted(); // прогресс сохраняется сразу
    setJustMarked(true); // короткий feedback
    timerRef.current = setTimeout(() => {
      advanceRef.current(); // переход через ~400 мс
    }, 420);
  };

  return (
    <div className="card-screen">
      <article className={"card sentence-card" + (justMarked ? " card-marked" : "")}>
        <div className="card-meta">
          <span className="card-num">№{sentence.id}</span>
          {completed && <span className="card-done-badge">✓ выучено</span>}
        </div>
        <p className="card-russian" lang="ru">
          {sentence.russian}
        </p>

        {!revealed && (
          <button className="btn btn-primary btn-reveal" onClick={() => setRevealed(true)}>
            Показать перевод
          </button>
        )}

        {revealed && (
          <div className="card-answer">
            <div className="answer-label">English</div>
            <p className="card-english" lang="en">
              {sentence.english}
            </p>
            <div className="answer-label">Почему так?</div>
            <p className="card-explanation" lang="ru">
              {sentence.explanation}
            </p>
          </div>
        )}
      </article>

      {revealed && (
        <div className="card-actions">
          <button
            className={"btn btn-mark" + (completed ? " btn-mark-done" : "")}
            aria-pressed={completed}
            onClick={handleMark}
          >
            ✓ Выучено
          </button>
          <button className="btn btn-ghost" onClick={onSkip}>
            ↻ Оставить на повтор
          </button>
        </div>
      )}

      <nav className="card-nav">
        <button className="btn btn-nav" onClick={onPrev} disabled={!onPrev}>
          ← Предыдущее
        </button>
        <button className="btn btn-nav" onClick={onNext} disabled={!onNext}>
          Следующее →
        </button>
      </nav>
    </div>
  );
}
