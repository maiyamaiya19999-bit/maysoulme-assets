import type { ProgressState } from "../lib/types";

type Props = {
  progress: ProgressState;
  total: number;
  completedCount: number;
  onBack: () => void;
};

export function HistoryView({ progress, total, completedCount, onBack }: Props) {
  return (
    <div className="history-view">
      <button className="btn btn-ghost btn-back" onClick={onBack}>
        ← К карточке
      </button>
      <h2 className="section-title">История</h2>
      <ul className="history-list">
        {progress.roundHistory.map((r, i) => (
          <li key={i} className="history-item card">
            <div className="history-round">Круг {r.round}</div>
            <div className="history-detail">
              {r.completedCount} / {r.total}
              {r.status === "completed" ? " ✓" : " · начат заново"}
            </div>
          </li>
        ))}
        <li className="history-item card history-current">
          <div className="history-round">Круг {progress.currentRound}</div>
          <div className="history-detail">
            {completedCount} / {total} · текущий
          </div>
        </li>
      </ul>
    </div>
  );
}
