import { useMemo, useState } from "react";
import type { VocabEntry } from "../lib/types";

type Props = {
  vocab: VocabEntry[];
  onRemove: (word: string) => void;
  onOpenSentence: (id: number) => void;
};

// Словарик: слово — перевод. Слова добавляются нажатием на слово в карточке.
export function VocabView({ vocab, onRemove, onOpenSentence }: Props) {
  const [query, setQuery] = useState("");
  const [hideTranslations, setHideTranslations] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vocab;
    return vocab.filter((e) => e.word.toLowerCase().includes(q) || e.translation.toLowerCase().includes(q));
  }, [vocab, query]);

  return (
    <div className="vocab-view">
      <div className="vocab-head">
        <h2 className="section-title">Словарик</h2>
        <span className="vocab-count">{vocab.length}</span>
      </div>

      {vocab.length === 0 ? (
        <div className="card vocab-empty">
          <p>Пока пусто.</p>
          <p className="muted">
            Открой перевод предложения и нажми на любое английское слово — оно появится здесь.
          </p>
        </div>
      ) : (
        <>
          <div className="vocab-tools">
            <input
              type="search"
              className="input"
              placeholder="Найти слово…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className={"btn btn-secondary btn-compact" + (hideTranslations ? " btn-secondary-active" : "")}
              onClick={() => setHideTranslations(!hideTranslations)}
              title="Скрыть переводы, чтобы проверить себя"
            >
              {hideTranslations ? "Показать переводы" : "Скрыть переводы"}
            </button>
          </div>

          <ul className="vocab-list">
            {list.map((e) => (
              <li key={e.word} className="vocab-item">
                <div className="vocab-text">
                  <div className="vocab-word" lang="en">
                    {e.word}
                  </div>
                  <div className={"vocab-translation" + (hideTranslations ? " vocab-translation-hidden" : "")}>
                    {e.translation || "—"}
                  </div>
                  {e.sentenceId !== undefined && (
                    <button className="vocab-source" onClick={() => onOpenSentence(e.sentenceId!)}>
                      из №{e.sentenceId}
                    </button>
                  )}
                </div>
                <button className="vocab-remove" aria-label={`Убрать ${e.word}`} onClick={() => onRemove(e.word)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 && <p className="muted vocab-nomatch">Ничего не найдено</p>}
        </>
      )}
    </div>
  );
}
