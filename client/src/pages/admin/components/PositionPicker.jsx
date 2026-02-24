/* ─── PositionPicker ─────────────────────────────────────────────
   Renders the full positions + candidates selection panel.
   Props:
     globalPositions      — array of all positions from the API
     globalCandidates     — array of all candidates from the API
     selectedPositions    — map of { [position_id]: { ...pos, config, candidates[] } }
     assignedCandidateIds — Set of candidate_ids already picked in any position
     isDraft              — whether edits are allowed
     onTogglePosition     — (pos) => void
     onConfigChange       — (positionId, field, value) => void
     onToggleCandidate    — (positionId, candidate) => void
     loading              — boolean while data is fetching
─────────────────────────────────────────────────────────────── */
import { FieldLabel, inputStyle } from "./formStyles";

export default function PositionPicker({
  globalPositions,
  globalCandidates,
  selectedPositions,
  assignedCandidateIds,
  isDraft,
  onTogglePosition,
  onConfigChange,
  onToggleCandidate,
  loading,
}) {
  const selectedCount = Object.keys(selectedPositions).length;

  if (loading) {
    return <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading positions and candidates...</p>;
  }

  if (globalPositions.length === 0) {
    return <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No positions found. Create positions first.</p>;
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ ...sectionLabel, margin: 0 }}>
          Positions
          {!isDraft && (
            <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "#9ca3af", fontWeight: 400 }}>
              (locked)
            </span>
          )}
        </p>
        {selectedCount > 0 && (
          <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {selectedCount} selected
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {globalPositions.map((pos) => {
          const isSelected = !!selectedPositions[pos.position_id];
          const selPos = selectedPositions[pos.position_id];

          return (
            <div
              key={pos.position_id}
              style={{
                border: isSelected ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
                transition: "border-color 0.15s",
                background: isSelected ? "#fafcff" : "#fafafa",
              }}
            >
              {/* Position header row */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                cursor: isDraft ? "pointer" : "default",
                userSelect: "none",
              }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onTogglePosition(pos)}
                  disabled={!isDraft}
                  style={{ width: 16, height: 16, accentColor: "#3b82f6", flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pos.name}</span>
                  {pos.description && (
                    <span style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: 6 }}>
                      {pos.description}
                    </span>
                  )}
                </div>
                {isSelected && selPos && (
                  <span style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: 500 }}>
                    {selPos.candidates.length}/{selPos.config.candidate_count} candidates
                  </span>
                )}
              </label>

              {/* Expanded section */}
              {isSelected && selPos && (
                <div style={{ borderTop: "1px solid #e5e7eb", padding: "14px" }}>

                  {/* Config row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[
                      { field: "candidate_count", label: "Slots" },
                      { field: "winners_count",   label: "Winners" },
                      { field: "votes_per_voter", label: "Votes/Voter" },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <FieldLabel>{label}</FieldLabel>
                        <input
                          type="number"
                          min={1}
                          value={selPos.config[field]}
                          onChange={(e) => onConfigChange(pos.position_id, field, e.target.value)}
                          disabled={!isDraft}
                          style={{ ...inputStyle(isDraft), textAlign: "center" }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Candidates */}
                  <FieldLabel>
                    Candidates — select {selPos.config.candidate_count} required
                  </FieldLabel>

                  {globalCandidates.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 4 }}>
                      No candidates found. Add candidates first.
                    </p>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: 6,
                      marginTop: 6,
                    }}>
                      {globalCandidates.map((c) => {
                        const pickedHere = selPos.candidates.some(
                          (sc) => sc.candidate_id === c.candidate_id
                        );
                        const takenElsewhere = !pickedHere && assignedCandidateIds.has(c.candidate_id);
                        const slotsFull = !pickedHere && selPos.candidates.length >= selPos.config.candidate_count;
                        const isDisabled = !isDraft || takenElsewhere || slotsFull;

                        const hint = takenElsewhere
                          ? "Already assigned to another position"
                          : slotsFull
                          ? "Slot limit reached for this position"
                          : undefined;

                        return (
                          <label
                            key={c.candidate_id}
                            title={hint}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              padding: "7px 10px",
                              borderRadius: 6,
                              border: pickedHere
                                ? "1.5px solid #3b82f6"
                                : takenElsewhere
                                ? "1.5px solid #fca5a5"
                                : "1.5px solid #e5e7eb",
                              background: pickedHere
                                ? "#eff6ff"
                                : takenElsewhere
                                ? "#fff5f5"
                                : slotsFull
                                ? "#f9fafb"
                                : "#fff",
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              opacity: (slotsFull && !pickedHere) ? 0.45 : 1,
                              fontSize: "0.82rem",
                              fontWeight: pickedHere ? 600 : 400,
                              color: pickedHere
                                ? "#1d4ed8"
                                : takenElsewhere
                                ? "#ef4444"
                                : "#374151",
                              transition: "all 0.12s",
                              userSelect: "none",
                              position: "relative",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={pickedHere}
                              onChange={() => onToggleCandidate(pos.position_id, c)}
                              disabled={isDisabled}
                              style={{ width: 13, height: 13, accentColor: "#3b82f6", flexShrink: 0 }}
                            />
                            <img
                              src={c.image_url}
                              alt={c.full_name}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: takenElsewhere ? "1.5px solid #fca5a5" : "1.5px solid #e5e7eb",
                                flexShrink: 0,
                                filter: takenElsewhere ? "grayscale(60%)" : "none",
                              }}
                              onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                            />
                            <span style={{
                              flex: 1, minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                              {c.full_name}
                            </span>
                            {takenElsewhere && (
                              <span style={{
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                color: "#ef4444",
                                background: "#fee2e2",
                                borderRadius: 4,
                                padding: "1px 5px",
                                flexShrink: 0,
                                letterSpacing: "0.02em",
                              }}>
                                taken
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// local only — sectionLabel isn't exported elsewhere
const sectionLabel = {
  margin: "0 0 12px",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};