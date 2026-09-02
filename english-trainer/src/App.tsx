import { useCallback, useEffect, useMemo, useState } from "react";
import { loadDataset } from "./lib/dataset";
import type { Dataset, ProgressState, Sentence, VocabEntry } from "./lib/types";
import {
  loadProgress,
  saveProgress,
  toggleCompleted,
  setPosition,
  startNewRound,
  nextUncompletedId,
  isCompleted
} from "./lib/progress";
import { loadVocab, saveVocab, addVocab, removeVocab } from "./lib/vocab";
import {
  type CourseState,
  type Drill,
  loadCourseState,
  saveCourseState,
  buildDrill,
  answerDrill,
  resetMastery,
  dueForReview
} from "./lib/course";
import type { CourseModule } from "./data/course";
import { CardView } from "./components/CardView";
import { AllView } from "./components/AllView";
import { HistoryView } from "./components/HistoryView";
import { VocabView } from "./components/VocabView";
import { CourseList, ModuleView, DrillView } from "./components/CourseView";
import { Menu, ResetModal, ExportModal, ImportModal, AddWordModal } from "./components/Modals";

export default function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset()
      .then(setDataset)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="app-loading">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }
  if (!dataset) {
    return <div className="app-loading">Загрузка…</div>;
  }
  return <TrainerApp dataset={dataset} />;
}

type View = "course" | "module" | "drill" | "card" | "all" | "vocab" | "history";
type Modal = "reset" | "export" | "import" | null;
type DrillSession = { label: string; list: Sentence[]; drill: Drill; total: number; includeMastered: boolean };

function TrainerApp({ dataset }: { dataset: Dataset }) {
  const sentences = dataset.sentences;
  const total = sentences.length;
  const byId = useMemo(() => {
    const m = new Map<number, Sentence>();
    for (const s of sentences) m.set(s.id, s);
    return m;
  }, [sentences]);
  const ids = useMemo(() => sentences.map((s) => s.id).sort((a, b) => a - b), [sentences]);

  const [progress, setProgress] = useState<ProgressState>(() =>
    loadProgress(localStorage, dataset.datasetVersion)
  );
  const [vocab, setVocab] = useState<VocabEntry[]>(() => loadVocab(localStorage));
  const [course, setCourse] = useState<CourseState>(() => loadCourseState(localStorage));

  // Каждое изменение сохраняется немедленно.
  const update = useCallback((fn: (s: ProgressState) => ProgressState) => {
    setProgress((prev) => {
      const next = fn(prev);
      if (next !== prev) saveProgress(localStorage, next);
      return next;
    });
  }, []);
  const updateVocab = useCallback((fn: (v: VocabEntry[]) => VocabEntry[]) => {
    setVocab((prev) => {
      const next = fn(prev);
      if (next !== prev) saveVocab(localStorage, next);
      return next;
    });
  }, []);
  const updateCourse = useCallback((fn: (c: CourseState) => CourseState) => {
    setCourse((prev) => {
      const next = fn(prev);
      if (next !== prev) saveCourseState(localStorage, next);
      return next;
    });
  }, []);

  const [view, setView] = useState<View>("course");
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [session, setSession] = useState<DrillSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [wordToAdd, setWordToAdd] = useState<{ word: string; sentence: Sentence } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const currentId = byId.has(progress.currentSentenceId) ? progress.currentSentenceId : ids[0];
  const current = byId.get(currentId)!;
  const completedCount = progress.completedIds.filter((id) => byId.has(id)).length;
  const roundDone = completedCount >= total;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const switchView = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const goTo = useCallback(
    (id: number) => {
      if (byId.has(id)) {
        update((s) => setPosition(s, id));
        switchView("card");
      }
    },
    [byId, update, switchView]
  );

  const idx = ids.indexOf(currentId);
  const prevId = idx > 0 ? ids[idx - 1] : null;
  const nextId = idx < ids.length - 1 ? ids[idx + 1] : null;

  // ---- Курс ----
  const startDrill = (list: Sentence[], label: string, includeMastered: boolean) => {
    setSession({ label, list, drill: buildDrill(list, course, includeMastered), total: list.length, includeMastered });
    switchView("drill");
  };
  const startReview = () => {
    const due = dueForReview(sentences, course);
    setSession({ label: "Повторение", list: due, drill: buildDrill(due, course, true), total: due.length, includeMastered: true });
    switchView("drill");
  };
  const onDrillAnswer = (result: "ok" | "again") => {
    if (!session) return;
    const res = answerDrill(session.drill, course, result);
    updateCourse(() => res.state);
    setSession({ ...session, drill: res.drill });
    window.scrollTo({ top: 0 });
  };

  const tabView = view === "module" || view === "drill" ? "course" : view;

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div className="header-title-block">
            <h1 className="header-title">English Trainer</h1>
            <div className="header-sub">
              Круг {progress.currentRound} · {completedCount}/{total} · {percent}%
            </div>
          </div>
          {view === "card" && (
            <button
              className="header-pos"
              onClick={() => {
                const n = nextUncompletedId(progress, ids, currentId);
                if (n !== null) goTo(n);
              }}
              title="К следующему невыученному"
            >
              №{currentId}
            </button>
          )}
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <main className="main">
        {view === "course" && (
          <CourseList
            sentences={sentences}
            course={course}
            onOpen={(mod) => {
              setActiveModule(mod);
              switchView("module");
            }}
            onReview={startReview}
          />
        )}
        {view === "module" && activeModule && (
          <ModuleView
            mod={activeModule}
            sentences={sentences}
            course={course}
            onBack={() => switchView("course")}
            onStart={startDrill}
            onReset={(list) => {
              updateCourse((c) => resetMastery(c, list));
              showToast("Отметки модуля сброшены");
            }}
          />
        )}
        {view === "drill" && session && (
          <DrillView
            label={session.label}
            list={session.list}
            drill={session.drill}
            total={session.total}
            course={course}
            vocab={vocab}
            onAnswer={onDrillAnswer}
            onWordTap={(word, sentence) => setWordToAdd({ word, sentence })}
            onExit={() => switchView(activeModule ? "module" : "course")}
            onRestart={() => {
              updateCourse((c) => resetMastery(c, session.list));
              setSession({ ...session, drill: buildDrill(session.list, resetMastery(course, session.list), false) });
            }}
          />
        )}
        {view === "card" && roundDone && (
          <div className="round-done card">
            <div className="round-done-emoji">✨</div>
            <h2>Круг завершён</h2>
            <p>
              Ты прошла все предложения — {total} / {total}.
            </p>
            <button className="btn btn-primary" onClick={() => setModal("reset")}>
              ↻ Учить заново
            </button>
          </div>
        )}
        {view === "card" && !roundDone && (
          <CardView
            key={`${progress.currentRound}:${currentId}`}
            sentence={current}
            completed={isCompleted(progress, currentId)}
            vocab={vocab}
            onToggleCompleted={() => update((s) => toggleCompleted(s, currentId))}
            onPrev={prevId !== null ? () => goTo(prevId) : undefined}
            onNext={nextId !== null ? () => goTo(nextId) : undefined}
            onSkip={() => {
              const n = nextId ?? ids[0];
              if (n !== undefined) goTo(n);
            }}
            onAdvance={() => {
              const n = nextUncompletedId(progress, ids, currentId) ?? nextId;
              if (n !== null && n !== undefined) goTo(n);
            }}
            onWordTap={(word) => setWordToAdd({ word, sentence: current })}
          />
        )}
        {view === "all" && <AllView sentences={sentences} progress={progress} onOpen={goTo} />}
        {view === "vocab" && (
          <VocabView
            vocab={vocab}
            onRemove={(word) => updateVocab((v) => removeVocab(v, word))}
            onOpenSentence={goTo}
          />
        )}
        {view === "history" && (
          <HistoryView
            progress={progress}
            total={total}
            completedCount={completedCount}
            onBack={() => switchView("card")}
          />
        )}
      </main>

      <nav className="tabbar" aria-label="Разделы">
        <button className={"tab" + (tabView === "course" ? " tab-active" : "")} onClick={() => switchView("course")}>
          <span className="tab-icon">◎</span>
          Курс
        </button>
        <button className={"tab" + (view === "card" ? " tab-active" : "")} onClick={() => switchView("card")}>
          <span className="tab-icon">✎</span>
          Марафон
        </button>
        <button className={"tab" + (view === "all" ? " tab-active" : "")} onClick={() => switchView("all")}>
          <span className="tab-icon">☰</span>
          Все
        </button>
        <button className={"tab" + (view === "vocab" ? " tab-active" : "")} onClick={() => switchView("vocab")}>
          <span className="tab-icon">✦</span>
          Словарик{vocab.length > 0 ? ` · ${vocab.length}` : ""}
        </button>
        <button className={"tab" + (menuOpen || view === "history" ? " tab-active" : "")} onClick={() => setMenuOpen(true)}>
          <span className="tab-icon">···</span>
          Ещё
        </button>
      </nav>

      {toast && <div className="toast">{toast}</div>}

      {menuOpen && (
        <Menu
          onClose={() => setMenuOpen(false)}
          onHistory={() => {
            switchView("history");
            setMenuOpen(false);
          }}
          onExport={() => {
            setModal("export");
            setMenuOpen(false);
          }}
          onImport={() => {
            setModal("import");
            setMenuOpen(false);
          }}
          onReset={() => {
            setModal("reset");
            setMenuOpen(false);
          }}
        />
      )}

      {wordToAdd && (
        <AddWordModal
          word={wordToAdd.word}
          sentence={wordToAdd.sentence}
          onCancel={() => setWordToAdd(null)}
          onAdd={(word, translation) => {
            updateVocab((v) => addVocab(v, { word, translation, sentenceId: wordToAdd.sentence.id }));
            setWordToAdd(null);
            showToast(`«${word}» — в словарике`);
          }}
        />
      )}

      {modal === "reset" && (
        <ResetModal
          onCancel={() => setModal(null)}
          onConfirm={() => {
            update((s) => startNewRound(s, total));
            setModal(null);
            switchView("card");
          }}
        />
      )}
      {modal === "export" && <ExportModal progress={progress} vocab={vocab} onClose={() => setModal(null)} />}
      {modal === "import" && (
        <ImportModal
          datasetVersion={dataset.datasetVersion}
          validIds={new Set(ids)}
          onClose={() => setModal(null)}
          onApply={(state, importedVocab) => {
            update(() => state);
            if (importedVocab) updateVocab(() => importedVocab);
            setModal(null);
            switchView("card");
          }}
        />
      )}
    </div>
  );
}

export { TrainerApp };
