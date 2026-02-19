// PositionCard.jsx
// One expandable position block: checkbox header + config inputs + candidate grid.

import { FieldLabel, inputStyle } from "./formHelpers";
import CandidateCheckbox from "./CandidateCheckbox";

export default function PositionCard({
  pos,              // global position object { position_id, name, description }
  selPos,           // selectedPositions[pos.position_id] or undefined
  isSelected,
  isDraft,
  globalCandidates,
  assignedCandidateIds,
  onTogglePosition,
  onConfigChange,
  onToggleCandidate,
}) {
  return (
    <div style={{
      border: isSelected ? "1.5px solid #3b82f6" : "1.5px solid #e5e7eb",
      borderRadius: 8,
      overflow: "hidden",
      transition: "border-color 0.15s",
      background: isSelected ? "#fafcff" : "#fafafa",
    }}>

      {/* ── Position header row ── */}
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

      {/* ── Expanded: config + candidate picker ── */}
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

          {/* Candidate picker */}
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
                const pickedHere     = selPos.candidates.some((sc) => sc.candidate_id === c.candidate_id);
                const takenElsewhere = !pickedHere && assignedCandidateIds.has(c.candidate_id);
                const slotsFull      = !pickedHere && selPos.candidates.length >= selPos.config.candidate_count;

                return (
                  <CandidateCheckbox
                    key={c.candidate_id}
                    candidate={c}
                    pickedHere={pickedHere}
                    takenElsewhere={takenElsewhere}
                    slotsFull={slotsFull}
                    isDraft={isDraft}
                    onToggle={() => onToggleCandidate(pos.position_id, c)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}