import { useEffect, useRef, useState } from "react";
import type { Sentence, VocabEntry } from "../lib/types";
import { hasVocab, normalizeWord } from "../lib/vocab";

type Props = {
  sentence: Sentence;
  completed: boolean;
  vocab: VocabEntry[];
  onToggleCompleted: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSkip: () => void; // «Оставить на повтор» — дальше без отметки
  onAdvance: () => void; // после «Выучено» — к следующему невыученному
  onWordTap: (word: string) => void;
};

// Английский текст, разбитый на нажимаемые слова.
// Нажатие на слово открывает «Добавить в словарик».
export function TappableText({
  text,
  vocab,
  onWordTap,
  className
}: {
  text: string;
  vocab: VocabEntry[];
  onWordTap: (word: string) => void;
  className?: string;
}) {
  const parts = text.split(/(\s+)/);
  return (
    <span className={className} lang="en">
      {parts.map((part, i) => {
        if (/^\s+$/.test(part) || part === "") return part;
        const clean = normalizeWord(part);
        if (!clean) return part;
        const saved = hasVocab(vocab, clean);
        return (
          <button
            key={i}
            type="button"
            className={"word" + (saved ? " word-saved" : "")}
            onClick={() => onWordTap(clean)}
          >
            {part}
          </button>
        );
      })}
    </span>
  );
}

// Карточка предложения. Reveal — локальный state: сбрасывается при смене
// предложения (компонент пересоздаётся по key) и не влияет на прогресс.
export function CardView({
  sentence,
  completed,
  vocab,
  onToggleCompleted,
  onPrev,
  onNext,
  onSkip,
  onAdvance,
  onWordTap
}: Props) {
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

  const alternatives = (sentence.alternatives ?? []).filter((a) => a && a.trim() && a.trim() !== sentence.english.trim());

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
            <p className="card-english">
              <TappableText text={sentence.english} vocab={vocab} onWordTap={onWordTap} />
            </p>
            {alternatives.length > 0 && (
              <div className="card-alternatives">
                <div className="alt-label">Так тоже можно</div>
                {alternatives.map((alt, i) => (
                  <p key={i} className="card-alt">
                    <TappableText text={alt} vocab={vocab} onWordTap={onWordTap} />
                  </p>
                ))}
              </div>
            )}
            <p className="word-hint">Нажми на любое слово, чтобы добавить его в словарик</p>
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
