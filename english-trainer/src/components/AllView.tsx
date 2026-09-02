import { useMemo, useState } from "react";
import type { ProgressState, Sentence } from "../lib/types";
import { GRAMMAR_FILTERS, TOPIC_FILTERS } from "../lib/tags";

type Props = {
  sentences: Sentence[];
  progress: ProgressState;
  onOpen: (id: number) => void;
};

type StatusFilter = "all" | "done" | "todo";

// «Все предложения» — только способ просмотра. Никогда не меняет прогресс.
// В списке сразу и русский, и английский.
export function AllView({ sentences, progress, onOpen }: Props) {
  const [query, setQuery] = useState("");
  const [jump, setJump] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [grammar, setGrammar] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<Set<string>>(new Set());

  const completed = useMemo(() => new Set(progress.completedIds), [progress.completedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sentences.filter((s) => {
      if (status === "done" && !completed.has(s.id)) return false;
      if (status === "todo" && completed.has(s.id)) return false;
      if (grammar.size > 0) {
        const groups = GRAMMAR_FILTERS.filter((g) => grammar.has(g.key));
        if (!groups.some((g) => g.tags.some((t) => s.grammarTags.includes(t)))) return false;
      }
      if (topics.size > 0) {
        const groups = TOPIC_FILTERS.filter((g) => topics.has(g.key));
        if (!groups.some((g) => g.tags.some((t) => s.topicTags.includes(t)))) return false;
      }
      if (q) {
        const inId = String(s.id) === q || `№${s.id}` === q;
        const inRu = s.russian.toLowerCase().includes(q);
        const inEn = s.english.toLowerCase().includes(q);
        const inExp = s.explanation.toLowerCase().includes(q);
        if (!inId && !inRu && !inEn && !inExp) return false;
      }
      return true;
    });
  }, [sentences, completed, status, grammar, topics, query]);

  const toggleSet = (set: Set<string>, key: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    apply(next);
  };

  const doJump = () => {
    const id = parseInt(jump, 10);
    if (Number.isInteger(id) && sentences.some((s) => s.id === id)) {
      onOpen(id);
    }
  };

  const activeFilters = grammar.size + topics.size + (status !== "all" ? 1 : 0);

  return (
    <div className="all-view">
      <div className="all-toolbar">
        <div className="all-search-row">
          <input
            type="search"
            className="input all-search"
            placeholder="Поиск: русский, English, №…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="all-jump-row">
          <input
            type="number"
            inputMode="numeric"
            className="input all-jump"
            placeholder="Перейти к №"
            value={jump}
            min={1}
            onChange={(e) => setJump(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doJump()}
          />
          <button className="btn btn-secondary" onClick={doJump}>
            Перейти
          </button>
          <button
            className={"btn btn-secondary" + (filtersOpen || activeFilters > 0 ? " btn-secondary-active" : "")}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Фильтры{activeFilters > 0 ? ` · ${activeFilters}` : ""}
          </button>
        </div>

        {filtersOpen && (
          <div className="filters">
            <div className="filter-group">
              <div className="filter-label">Статус</div>
              <div className="chip-row">
                {(
                  [
                    ["all", "Все"],
                    ["done", "Выучено"],
                    ["todo", "Не выучено"]
                  ] as [StatusFilter, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={"chip" + (status === key ? " chip-active" : "")}
                    onClick={() => setStatus(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-label">Грамматика</div>
              <div className="chip-row">
                {GRAMMAR_FILTERS.map((g) => (
                  <button
                    key={g.key}
                    className={"chip" + (grammar.has(g.key) ? " chip-active" : "")}
                    onClick={() => toggleSet(grammar, g.key, setGrammar)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-label">Темы</div>
              <div className="chip-row">
                {TOPIC_FILTERS.map((t) => (
                  <button
                    key={t.key}
                    className={"chip" + (topics.has(t.key) ? " chip-active" : "")}
                    onClick={() => toggleSet(topics, t.key, setTopics)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="all-count">{filtered.length} из {sentences.length}</div>

      <ul className="all-list">
        {filtered.map((s) => (
          <li key={s.id}>
            <button className="all-row" onClick={() => onOpen(s.id)}>
              <span className={"all-status" + (completed.has(s.id) ? " all-status-done" : "")}>
                {completed.has(s.id) ? "✓" : "○"}
              </span>
              <span className="all-num">{s.id}.</span>
              <span className="all-text">
                <span className="all-russian" lang="ru">
                  {s.russian}
                </span>
                <span className="all-english" lang="en">
                  {s.english}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
