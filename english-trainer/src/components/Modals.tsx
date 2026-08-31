import { useRef, useState } from "react";
import type { ProgressState } from "../lib/types";
import { RESET_CODE, exportProgress, parseImportedProgress } from "../lib/progress";

// ---------- Меню ----------

type MenuProps = {
  onClose: () => void;
  onShowAll: () => void;
  onHistory: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
};

export function Menu({ onClose, onShowAll, onHistory, onExport, onImport, onReset }: MenuProps) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-item" onClick={onShowAll}>Все предложения</button>
        <button className="sheet-item" onClick={onHistory}>История</button>
        <button className="sheet-item" onClick={onExport}>Экспорт прогресса</button>
        <button className="sheet-item" onClick={onImport}>Импорт прогресса</button>
        <div className="sheet-divider" />
        <button className="sheet-item sheet-item-danger" onClick={onReset}>
          ↻ Учить заново
        </button>
        <button className="sheet-item sheet-item-close" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

// ---------- Учить заново: код 12345 + подтверждение ----------
// Код — только защита от случайного сброса, не пароль.

export function ResetModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const checkCode = () => {
    if (code === RESET_CODE) {
      setConfirmStep(true);
      setError(false);
    } else {
      // неверный код — ничего не меняем
      setError(true);
    }
  };

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {!confirmStep ? (
          <>
            <h3 className="modal-title">Начать новый круг обучения?</h3>
            <p className="modal-text">
              Текущие отметки «Выучено» будут очищены, но история круга сохранится.
            </p>
            <p className="modal-text">Для подтверждения введи код.</p>
            <input
              className={"input modal-code" + (error ? " input-error" : "")}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Код"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && checkCode()}
            />
            {error && <p className="modal-error">Неверный код. Ничего не изменено.</p>}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onCancel}>Отмена</button>
              <button className="btn btn-danger" onClick={checkCode}>Продолжить</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="modal-title">Точно начать новый круг?</h3>
            <p className="modal-text">
              Текущий круг будет сохранён в истории, отметки очистятся, счёт начнётся с №1.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onCancel}>Отмена</button>
              <button className="btn btn-danger" onClick={onConfirm}>Да, начать новый круг</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Экспорт ----------

export function ExportModal({ progress, onClose }: { progress: ProgressState; onClose: () => void }) {
  const json = exportProgress(progress);
  const [copied, setCopied] = useState(false);

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-trainer-progress-round${progress.currentRound}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен — текст можно выделить вручную
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Экспорт прогресса</h3>
        <p className="modal-text">
          Сохрани этот файл — по нему можно восстановить прогресс на любом устройстве.
        </p>
        <textarea className="input modal-json" readOnly value={json} rows={6} />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={copy}>
            {copied ? "Скопировано ✓" : "Скопировать"}
          </button>
          <button className="btn btn-primary" onClick={download}>Скачать файлом</button>
        </div>
        <button className="btn btn-ghost btn-modal-close" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

// ---------- Импорт ----------
// Невалидный файл не меняет существующий прогресс.
// Замена state — только после явного подтверждения.

type ImportProps = {
  datasetVersion: number;
  validIds: Set<number>;
  onClose: () => void;
  onApply: (state: ProgressState) => void;
};

export function ImportModal({ datasetVersion, validIds, onClose, onApply }: ImportProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<ProgressState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = (raw: string) => {
    const result = parseImportedProgress(raw, datasetVersion, validIds);
    if (result.ok) {
      setPending(result.state);
      setError(null);
    } else {
      setPending(null);
      setError(result.error);
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      setText(raw);
      validate(raw);
    };
    reader.readAsText(f);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Импорт прогресса</h3>
        {!pending ? (
          <>
            <p className="modal-text">Выбери файл экспорта или вставь его содержимое.</p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="modal-file"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <textarea
              className="input modal-json"
              placeholder='{"datasetVersion": 1, ...}'
              value={text}
              rows={6}
              onChange={(e) => setText(e.target.value)}
            />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
              <button className="btn btn-primary" onClick={() => validate(text)} disabled={!text.trim()}>
                Проверить
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-text">Файл корректный. Будет восстановлено:</p>
            <ul className="modal-summary">
              <li>Круг {pending.currentRound}</li>
              <li>Выучено: {pending.completedIds.length}</li>
              <li>Позиция: №{pending.currentSentenceId}</li>
              <li>Кругов в истории: {pending.roundHistory.length}</li>
            </ul>
            <p className="modal-text">Текущий прогресс будет заменён этим.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
              <button className="btn btn-danger" onClick={() => onApply(pending)}>
                Заменить прогресс
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
