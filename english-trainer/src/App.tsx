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
import { CardView } from "./components/CardView";
import { AllView } from "./components/AllView";
import { HistoryView } from "./components/HistoryView";
import { VocabView } from "./components/VocabView";
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

type View = "card" | "all" | "vocab" | "history";
type Modal = "reset" | "export" | "import" | null;

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

  // Каждое изменение прогресса сохраняется немедленно.
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

  const [view, setView] = useState<View>("card");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [wordToAdd, setWordToAdd] = useState<{ word: string; sentence: Sentence } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // «Продолжаем с №…» — при повторном открытии с сохранённой позицией
  useEffect(() => {
    if (progress.completedIds.length > 0 || progress.currentSentenceId > 1 || progress.currentRound > 1) {
      showToast(`Продолжаем с №${progress.currentSentenceId}`);
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

  const switchView = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

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
        <button className={"tab" + (view === "card" ? " tab-active" : "")} onClick={() => switchView("card")}>
          <span className="tab-icon">✎</span>
          Учить
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
