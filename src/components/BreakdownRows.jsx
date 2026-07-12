export function BreakdownRows({ breakdown, rows }) {
  return (
    <>
      {rows.map(([key, label, max]) => {
        const raw = Number(breakdown?.[key]);
        const value = Number.isFinite(raw) ? Math.max(0, Math.min(max, raw)) : 0;
        const pct = max ? Math.round((value / max) * 100) : 0;
        return (
          <div className="breakdown-row" key={key}>
            <span className="breakdown-label">{label}</span>
            <div className="breakdown-track">
              <div className="breakdown-fill" style={{ "--target-width": `${pct}%` }}></div>
            </div>
            <span className="breakdown-value">
              {value}/{max}
            </span>
          </div>
        );
      })}
    </>
  );
}
