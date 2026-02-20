import { CHART_HEIGHT, BAR_COLORS, THEME } from "./chartColors";

const { SURFACE, BORDER, TEXT, MUTED } = THEME;

export default function PositionBarChart({ position }) {
  const maxVotes = Math.max(...position.candidates.map((c) => c.vote_count), 1);
  const total = position.candidates.reduce((s, c) => s + c.vote_count, 0);
  const sorted = [...position.candidates].sort((a, b) => a.rank - b.rank);

  const colW = sorted.length <= 4 ? 72 : sorted.length <= 6 ? 58 : 46;
  const gap  = sorted.length <= 4 ? 24 : sorted.length <= 6 ? 16 : 10;

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 700, color: TEXT, fontSize: "0.95rem" }}>{position.position_name}</span>
        <span style={{ color: MUTED, fontSize: "0.8rem", marginLeft: 8 }}>
          {total} vote{total !== 1 ? "s" : ""} · top {position.winners_count} win
        </span>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", height: CHART_HEIGHT, display: "flex", alignItems: "flex-end", gap, paddingBottom: 0 }}>
        {/* Gridlines */}
        {[25, 50, 75].map((pct) => (
          <div key={pct} style={{
            position: "absolute", left: 0, right: 0,
            bottom: `${pct}%`, borderTop: `1px dashed ${BORDER}`, pointerEvents: "none",
          }} />
        ))}

        {sorted.map((c, idx) => {
          const heightPct = maxVotes > 0 ? (c.vote_count / maxVotes) * 100 : 0;
          const barH      = Math.max((heightPct / 100) * CHART_HEIGHT, c.vote_count > 0 ? 8 : 2);
          const isWinning = c.is_leading;
          const color     = BAR_COLORS[idx] ?? BAR_COLORS[BAR_COLORS.length - 1];

          return (
            <div key={c.candidate_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: colW }}>
              {isWinning && <div style={{ fontSize: "0.7rem", marginBottom: 2 }}>⭐</div>}
              {c.vote_count > 0 && (
                <div style={{ color: TEXT, fontSize: "0.75rem", fontWeight: 700, marginBottom: 4 }}>{c.vote_count}</div>
              )}
              <div style={{
                width: "100%", height: barH, borderRadius: "4px 4px 0 0",
                background: color,
                opacity: isWinning ? 1 : 0.6,
                transition: "height 0.4s ease",
              }} />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: "flex", gap, marginTop: 8 }}>
        {sorted.map((c, idx) => {
          const isWinning = c.is_leading;
          const color     = BAR_COLORS[idx] ?? BAR_COLORS[BAR_COLORS.length - 1];
          const isTied    = sorted.filter((x) => x.vote_count === c.vote_count && c.vote_count > 0).length > 1;

          return (
            <div key={c.candidate_id} style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.65rem", color: MUTED }}>#{String(c.rank).padStart(2, "0")}</span>
              <img
                src={c.photo_url || `https://i.pravatar.cc/150?u=${c.candidate_id}`}
                alt={c.full_name}
                onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${isWinning ? color : BORDER}` }}
              />
              <span style={{ fontSize: "0.7rem", color: isWinning ? color : MUTED, textAlign: "center", fontWeight: isWinning ? 700 : 400 }}>
                {c.full_name.split(" ")[0]}
              </span>
              {isTied && (
                <span style={{ fontSize: "0.6rem", color: "#f59e0b", background: "rgba(245,158,11,0.15)", borderRadius: 3, padding: "1px 4px" }}>
                  TIED
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}