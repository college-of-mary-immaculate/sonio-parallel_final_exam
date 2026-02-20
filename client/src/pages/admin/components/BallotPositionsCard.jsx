const selectStyle = {
  border: "1px solid #d1d5db", borderRadius: 6,
  padding: "6px 10px", fontSize: "0.875rem",
  background: "#fff", minWidth: 220,
};

const candidateRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "8px 12px", borderRadius: 6,
  background: "#f9fafb", border: "1px solid #f3f4f6",
};

export default function BallotPositionsCard({
  isDraft,
  positions,
  candidates,
  availablePositions,
  availableCandidates,
  addingPositionId,
  addingCandidateMap,
  onPositionIdChange,
  onAddPosition,
  onRemovePosition,
  onCandidateIdChange,
  onAddCandidate,
  onRemoveCandidate,
}) {
  const candidatesForPosition = (positionId) =>
    candidates.filter((c) => String(c.position_id) === String(positionId));

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={sectionTitle}>Ballot Positions</h3>
        {!isDraft && <span style={lockedLabel}>read-only</span>}
      </div>

      {/* Add position row */}
      {isDraft && availablePositions.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <select value={addingPositionId} onChange={(e) => onPositionIdChange(e.target.value)} style={selectStyle}>
            <option value="">Select position to add…</option>
            {availablePositions.map((p) => (
              <option key={p.position_id} value={p.position_id}>{p.name}</option>
            ))}
          </select>
          <button onClick={onAddPosition} disabled={!addingPositionId} style={addBtnStyle}>
            + Add
          </button>
        </div>
      )}

      {positions.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No positions configured.</p>
      ) : (
        positions.map((pos) => {
          const posCandidates = candidatesForPosition(pos.position_id);
          const avail         = availableCandidates(pos.position_id);
          const isFull        = posCandidates.length >= pos.candidate_count;

          return (
            <div key={pos.position_id} style={positionBlock}>
              {/* Position header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pos.name}</span>
                  {pos.description && <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#6b7280" }}>{pos.description}</p>}
                  <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
                    Slots: {pos.candidate_count} · Winners: {pos.winners_count} · Votes/Voter: {pos.votes_per_voter}
                  </p>
                </div>
                {isDraft && (
                  <button onClick={() => onRemovePosition(pos.position_id)} style={removeBtnStyle}>
                    Remove Position
                  </button>
                )}
              </div>

              {/* Candidates */}
              {posCandidates.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No candidates assigned yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {posCandidates.map((c) => (
                    <div key={c.candidate_id} style={candidateRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={c.photo_url || `https://i.pravatar.cc/150?u=${c.candidate_id}`}
                          alt={c.full_name}
                          onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{c.full_name}</div>
                          {c.primary_advocacy && (
                            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.primary_advocacy}</div>
                          )}
                        </div>
                      </div>
                      {isDraft && (
                        <button onClick={() => onRemoveCandidate(pos.position_id, c.candidate_id)} style={removeBtnStyle}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add candidate row */}
              {isDraft && !isFull && avail.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <select
                    value={addingCandidateMap[pos.position_id] || ""}
                    onChange={(e) => onCandidateIdChange(pos.position_id, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select candidate to add…</option>
                    {avail.map((c) => (
                      <option key={c.candidate_id} value={c.candidate_id}>{c.full_name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onAddCandidate(pos.position_id)}
                    disabled={!addingCandidateMap[pos.position_id]}
                    style={addBtnStyle}
                  >
                    + Add Candidate
                  </button>
                </div>
              )}

              {isDraft && isFull && (
                <p style={{ fontSize: "0.78rem", color: "#22c55e", marginTop: 6 }}>
                  ✓ All {pos.candidate_count} slot(s) filled
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff", border: "1px solid #e5e7eb",
  borderRadius: 10, padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 20,
};
const sectionTitle  = { margin: 0, fontSize: "0.95rem", fontWeight: 700 };
const lockedLabel   = {
  fontSize: "0.72rem", fontWeight: 500, color: "#9ca3af",
  background: "#f3f4f6", border: "1px solid #e5e7eb",
  borderRadius: 4, padding: "1px 6px",
};
const positionBlock = {
  border: "1px solid #e5e7eb", borderRadius: 8,
  padding: "14px 16px", marginBottom: 14, background: "#fafafa",
};
const addBtnStyle = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db",
  background: "#f3f4f6", cursor: "pointer", fontSize: "0.875rem",
};
const removeBtnStyle = {
  padding: "4px 10px", borderRadius: 5, border: "1px solid #fca5a5",
  background: "#fff1f2", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem",
};