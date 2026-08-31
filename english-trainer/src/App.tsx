import { useCallback, useEffect, useMemo, useState } from "react";
import { loadDataset } from "./lib/dataset";
import type { Dataset, ProgressState, Sentence } from "./lib/types";
import {
  loadProgress,
  saveProgress,
  toggleCompleted,
  setPosition,
  startNewRound,
  nextUncompletedId,
  isCompleted
} from "./lib/progress";
import { CardView } from "./components/CardView";
import { AllView } from "./components/AllView";
import { HistoryView } from "./components/HistoryView";
import { Menu, ResetModal, ExportModal, ImportModal } from "./components/Modals";

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

type View = "card" | "all" | "history";

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

  // Каждое изменение прогресса сохраняется немедленно.
  const update = useCallback((fn: (s: ProgressState) => ProgressState) => {
    setProgress((prev) => {
      const next = fn(prev);
      if (next !== prev) saveProgress(localStorage, next);
      return next;
    });
  }, []);

  const [view, setView] = useState<View>("card");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<"reset" | "export" | "import" | null>(null);
  const [resumeNote, setResumeNote] = useState<number | null>(null);

  // «Продолжить с №…» — при повторном открытии с сохранённой позицией
  useEffect(() => {
    if (progress.completedIds.length > 0 || progress.currentSentenceId > 1 || progress.currentRound > 1) {
      setResumeNote(progress.currentSentenceId);
      const t = setTimeout(() => setResumeNote(null), 2600);
      return () => clearTimeout(t);
    }
    // только при первом монтировании
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentId = byId.has(progress.currentSentenceId) ? progress.currentSentenceId : ids[0];
  const current = byId.get(currentId)!;
  const completedCount = progress.completedIds.filter((id) => byId.has(id)).length;
  const roundDone = completedCount >= total;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const goTo = useCallback(
    (id: number) => {
      if (byId.has(id)) {
        update((s) => setPosition(s, id));
        setView("card");
        window.scrollTo({ top: 0 });
      }
    },
    [byId, update]
  );

  const idx = ids.indexOf(currentId);
  const prevId = idx > 0 ? ids[idx - 1] : null;
  const nextId = idx < ids.length - 1 ? ids[idx + 1] : null;

  const openMenu = useCallback(() => setMenuOpen(true), []);

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
          <div className="header-actions">
            <button
              className={"icon-btn" + (view === "all" ? " icon-btn-active" : "")}
              aria-label="Показать все"
              onClick={() => setView(view === "all" ? "card" : "all")}
            >
              <ListIcon />
            </button>
            <button className="icon-btn" aria-label="Меню" onClick={openMenu}>
              <MenuIcon />
            </button>
          </div>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <main className="main">
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
          />
        )}
        {view === "all" && (
          <AllView
            sentences={sentences}
            progress={progress}
            onOpen={goTo}
            onBack={() => setView("card")}
          />
        )}
        {view === "history" && (
          <HistoryView
            progress={progress}
            total={total}
            completedCount={completedCount}
            onBack={() => setView("card")}
          />
        )}
      </main>

      {resumeNote !== null && view === "card" && !roundDone && (
        <div className="toast">Продолжаем с №{resumeNote}</div>
      )}

      {menuOpen && (
        <Menu
          onClose={() => setMenuOpen(false)}
          onShowAll={() => {
            setView("all");
            setMenuOpen(false);
          }}
          onHistory={() => {
            setView("history");
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

      {modal === "reset" && (
        <ResetModal
          onCancel={() => setModal(null)}
          onConfirm={() => {
            update((s) => startNewRound(s, total));
            setModal(null);
            setView("card");
            window.scrollTo({ top: 0 });
          }}
        />
      )}
      {modal === "export" && <ExportModal progress={progress} onClose={() => setModal(null)} />}
      {modal === "import" && (
        <ImportModal
          datasetVersion={dataset.datasetVersion}
          validIds={new Set(ids)}
          onClose={() => setModal(null)}
          onApply={(state) => {
            update(() => state);
            setModal(null);
            setView("card");
          }}
        />
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 5h10M7 10h10M7 15h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="3.5" cy="5" r="1.2" fill="currentColor" />
      <circle cx="3.5" cy="10" r="1.2" fill="currentColor" />
      <circle cx="3.5" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

// Экспортируется для тестов сборки, не используется напрямую
export { TrainerApp };
