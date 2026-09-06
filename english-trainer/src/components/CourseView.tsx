import { useMemo, useState } from "react";
import type { Sentence, VocabEntry } from "../lib/types";
import { BLOCKS, COURSE, type CourseModule } from "../data/course";
import {
  type CourseState,
  type Drill,
  type Section,
  SECTIONS,
  sentencesForModule,
  filterSection,
  filterLevel,
  masteredCount,
  buildDrill,
  answerDrill,
  resetMastery,
  dueForReview,
  isMastered
} from "../lib/course";
import { TappableText } from "./CardView";

// ---------- Список блоков и модулей ----------

type ListProps = {
  sentences: Sentence[];
  course: CourseState;
  onOpen: (mod: CourseModule) => void;
  onReview: () => void;
};

export function CourseList({ sentences, course, onOpen, onReview }: ListProps) {
  const pools = useMemo(() => {
    const m = new Map<string, Sentence[]>();
    for (const mod of COURSE) m.set(mod.id, sentencesForModule(sentences, mod));
    return m;
  }, [sentences]);
  const due = useMemo(() => dueForReview(sentences, course), [sentences, course]);
  const totalMastered = sentences.filter((s) => isMastered(course, s.id)).length;

  return (
    <div className="course-view">
      <div className="course-head">
        <h2 className="section-title">Курс</h2>
        <span className="muted">на автомате: {totalMastered} / {sentences.length}</span>
      </div>
      <p className="course-intro">
        Теория → утверждения → отрицания → вопросы → микс. Предложение считается «на автомате», когда ты
        вспомнила его сразу два раза подряд.
      </p>

      {due.length > 0 && (
        <button className="card course-review" onClick={onReview}>
          <div>
            <div className="course-mod-title">Повторение</div>
            <div className="muted">{due.length} выученных предложений давно не встречались</div>
          </div>
          <span className="course-arrow">→</span>
        </button>
      )}

      {BLOCKS.map((block) => (
        <section key={block.id} className="course-block">
          <div className="course-block-title">{block.title}</div>
          <div className="course-block-note">{block.note}</div>
          <ul className="course-mods">
            {COURSE.filter((m) => m.block === block.id).map((mod) => {
              const pool = pools.get(mod.id) ?? [];
              const done = masteredCount(course, pool);
              const pct = pool.length ? Math.round((done / pool.length) * 100) : 0;
              return (
                <li key={mod.id}>
                  <button className="course-mod" onClick={() => onOpen(mod)} disabled={pool.length === 0}>
                    <div className="course-mod-text">
                      <div className="course-mod-title">{mod.title}</div>
                      <div className="course-mod-sub">{mod.subtitle}</div>
                      <div className="course-mod-progress">
                        <div className="course-mod-track">
                          <div className="course-mod-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="course-mod-count">
                          {done}/{pool.length}
                        </span>
                      </div>
                    </div>
                    <span className="course-arrow">→</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

// ---------- Модуль: теория + разделы ----------

type ModuleProps = {
  mod: CourseModule;
  sentences: Sentence[];
  course: CourseState;
  onBack: () => void;
  onStart: (list: Sentence[], label: string, includeMastered: boolean) => void;
  onReset: (list: Sentence[]) => void;
};

const LEVELS = ["A1", "A2", "B1", "B2"];

export function ModuleView({ mod, sentences, course, onBack, onStart, onReset }: ModuleProps) {
  const pool = useMemo(() => sentencesForModule(sentences, mod), [sentences, mod]);
  const [level, setLevel] = useState<string | null>(null);
  const [theoryOpen, setTheoryOpen] = useState(true);
  const byLevel = filterLevel(pool, level);
  const useSections = mod.sections !== false;
  const sections = useSections ? SECTIONS : SECTIONS.filter((s) => s.key === "all");
  const availableLevels = LEVELS.filter((l) => pool.some((s) => s.level === l));

  return (
    <div className="module-view">
      <button className="btn btn-ghost btn-back" onClick={onBack}>
        ← Курс
      </button>
      <h2 className="section-title">{mod.title}</h2>
      <div className="muted">{mod.subtitle}</div>

      <div className="card theory">
        <button className="theory-toggle" onClick={() => setTheoryOpen(!theoryOpen)}>
          <span className="answer-label">Теория</span>
          <span className="muted">{theoryOpen ? "свернуть" : "развернуть"}</span>
        </button>
        {theoryOpen && <div className="theory-text">{mod.theory}</div>}
      </div>

      {availableLevels.length > 1 && (
        <div className="chip-row">
          <button className={"chip" + (level === null ? " chip-active" : "")} onClick={() => setLevel(null)}>
            Все уровни
          </button>
          {availableLevels.map((l) => (
            <button key={l} className={"chip" + (level === l ? " chip-active" : "")} onClick={() => setLevel(l)}>
              {l}
            </button>
          ))}
        </div>
      )}

      <div className="answer-label">Практика</div>
      <ul className="section-list">
        {sections.map((sec) => {
          const list = filterSection(byLevel, sec.key as Section);
          const done = masteredCount(course, list);
          const left = list.length - done;
          if (list.length === 0) return null;
          return (
            <li key={sec.key} className="card section-item">
              <div className="section-text">
                <div className="section-name">{sec.label}</div>
                <div className="muted">
                  {done}/{list.length} на автомате{left > 0 ? ` · осталось ${left}` : " · готово ✓"}
                </div>
              </div>
              <div className="section-actions">
                {left > 0 ? (
                  <button className="btn btn-primary btn-compact" onClick={() => onStart(list, `${mod.title} · ${sec.label}`, false)}>
                    {done > 0 ? "Продолжить" : "Начать"}
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-compact" onClick={() => onStart(list, `${mod.title} · ${sec.label}`, true)}>
                    Прогнать снова
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {masteredCount(course, byLevel) > 0 && (
        <button className="btn btn-ghost course-reset" onClick={() => onReset(byLevel)}>
          Сбросить отметки этого модуля и пройти заново
        </button>
      )}
    </div>
  );
}

// ---------- Дрилл ----------

type DrillProps = {
  label: string;
  list: Sentence[]; // исходный список (для лукапа)
  drill: Drill;
  total: number;
  course: CourseState;
  vocab: VocabEntry[];
  onAnswer: (result: "ok" | "again") => void;
  onWordTap: (word: string, sentence: Sentence) => void;
  onExit: () => void;
  onRestart: () => void;
};

export function DrillView({ label, list, drill, total, course, vocab, onAnswer, onWordTap, onExit, onRestart }: DrillProps) {
  const byId = useMemo(() => new Map(list.map((s) => [s.id, s])), [list]);
  const currentId = drill.queue[0];
  const current = currentId !== undefined ? byId.get(currentId) : undefined;
  const [revealed, setRevealed] = useState(false);
  const streak = current ? course.streaks[String(current.id)] ?? 0 : 0;

  const answer = (r: "ok" | "again") => {
    setRevealed(false);
    onAnswer(r);
  };

  if (!current) {
    return (
      <div className="drill-view">
        <div className="card round-done">
          <div className="round-done-emoji">✓</div>
          <h2>Раздел на автомате</h2>
          <p>
            {label}
            <br />
            {total} предложений · {drill.seen} показов
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onRestart}>
              Прогнать ещё раз
            </button>
            <button className="btn btn-primary" onClick={onExit}>
              Дальше →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const alternatives = (current.alternatives ?? []).filter((a) => a && a.trim() !== current.english.trim());

  return (
    <div className="drill-view">
      <div className="drill-head">
        <button className="btn btn-ghost btn-back" onClick={onExit}>
          ← Выйти
        </button>
        <div className="drill-status">
          <span className="drill-label">{label}</span>
          <span className="muted">
            на автомате {drill.done}/{total} · в очереди {drill.queue.length}
          </span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${total ? Math.round((drill.done / total) * 100) : 0}%` }} />
      </div>

      <article className="card sentence-card">
        <div className="card-meta">
          <span className="card-num">
            №{current.id} · {current.level}
          </span>
          <span className="drill-streak">{streak === 1 ? "второй раз — и на автомате" : "первый раз"}</span>
        </div>
        <p className="card-russian" lang="ru">
          {current.russian}
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
              <TappableText text={current.english} vocab={vocab} onWordTap={(w) => onWordTap(w, current)} />
            </p>
            {alternatives.length > 0 && (
              <div className="card-alternatives">
                <div className="alt-label">Так тоже можно</div>
                {alternatives.map((alt, i) => (
                  <p key={i} className="card-alt">
                    <TappableText text={alt} vocab={vocab} onWordTap={(w) => onWordTap(w, current)} />
                  </p>
                ))}
              </div>
            )}
            <div className="answer-label">Почему так?</div>
            <p className="card-explanation" lang="ru">
              {current.explanation}
            </p>
          </div>
        )}
      </article>

      {revealed && (
        <div className="drill-actions">
          <button className="btn btn-again" onClick={() => answer("again")}>
            ↻ Ещё раз
          </button>
          <button className="btn btn-mark" onClick={() => answer("ok")}>
            ✓ Сразу вспомнила
          </button>
        </div>
      )}
    </div>
  );
}

export { buildDrill, answerDrill, resetMastery };
