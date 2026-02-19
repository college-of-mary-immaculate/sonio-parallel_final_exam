import { useState, useEffect, useMemo } from "react";
import Button from "../../../components/Button";
import { electionApi } from "../../../apis/electionApi";
import { positionApi } from "../../../apis/positionApi";
import { getAllCandidates } from "../../../apis/candidateApi";
import "../../../css/components/CandidateFormModal.css";

const DEFAULT_POSITION_CONFIG = {
  candidate_count: 2,
  winners_count: 1,
  votes_per_voter: 1,
};

export default function ElectionFormModal({ election, onSaved }) {
  const isEdit = !!election;
  const isDraft = !isEdit || election.status === "draft";

  const [form, setForm] = useState({
    title: election?.title ?? "",
    start_date: election?.start_date?.split("T")[0] ?? "",
    end_date: election?.end_date?.split("T")[0] ?? "",
    status: election?.status ?? "draft",
    created_by: election?.created_by ?? 1,
  });

  const [globalPositions, setGlobalPositions] = useState([]);
  const [globalCandidates, setGlobalCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPositions, setSelectedPositions] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Load global lists ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [positions, candidates] = await Promise.all([
          positionApi.getAll(),
          getAllCandidates(),
        ]);
        setGlobalPositions(positions);
        setGlobalCandidates(candidates);
      } catch (err) {
        console.error(err);
        alert("Failed to load positions or candidates");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Pre-populate when editing ─────────────────────────────────
  useEffect(() => {
    if (!isEdit || !election.positions) return;
    const map = {};
    for (const p of election.positions) {
      map[p.position_id] = {
        ...p,
        config: {
          candidate_count: p.candidate_count ?? DEFAULT_POSITION_CONFIG.candidate_count,
          winners_count:   p.winners_count   ?? DEFAULT_POSITION_CONFIG.winners_count,
          votes_per_voter: p.votes_per_voter ?? DEFAULT_POSITION_CONFIG.votes_per_voter,
        },
        candidates: p.candidates ?? [],
      };
    }
    setSelectedPositions(map);
  }, [election]);

  // ── Derive the set of ALL candidate IDs already assigned across
  //    every position — used to block duplicates in other positions.
  //    Memoized so it only recomputes when selectedPositions changes.
  const assignedCandidateIds = useMemo(() => {
    const ids = new Set();
    for (const pos of Object.values(selectedPositions)) {
      for (const c of pos.candidates) {
        ids.add(c.candidate_id);
      }
    }
    return ids;
  }, [selectedPositions]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePosition = (pos) => {
    if (!isDraft) return;
    setSelectedPositions((prev) => {
      if (prev[pos.position_id]) {
        const next = { ...prev };
        delete next[pos.position_id];
        return next;
      }
      return {
        ...prev,
        [pos.position_id]: {
          ...pos,
          config: { ...DEFAULT_POSITION_CONFIG },
          candidates: [],
        },
      };
    });
  };

  const handleConfigChange = (positionId, field, value) => {
    setSelectedPositions((prev) => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        config: {
          ...prev[positionId].config,
          [field]: parseInt(value) || 1,
        },
      },
    }));
  };

  const toggleCandidate = (positionId, candidate) => {
    if (!isDraft) return;

    setSelectedPositions((prev) => {
      const pos = prev[positionId];
      const alreadyInThisPosition = pos.candidates.some(
        (c) => c.candidate_id === candidate.candidate_id
      );

      // ── Deselect: always allowed
      if (alreadyInThisPosition) {
        return {
          ...prev,
          [positionId]: {
            ...pos,
            candidates: pos.candidates.filter(
              (c) => c.candidate_id !== candidate.candidate_id
            ),
          },
        };
      }

      // ── Prevent adding if already assigned to another position
      const assignedElsewhere = Object.entries(prev).some(
        ([pid, p]) =>
          pid !== String(positionId) &&
          p.candidates.some((c) => c.candidate_id === candidate.candidate_id)
      );
      if (assignedElsewhere) return prev; // silently blocked (UI already shows it)

      // ── Prevent adding if this position's slot count is already full
      if (pos.candidates.length >= pos.config.candidate_count) return prev;

      return {
        ...prev,
        [positionId]: {
          ...pos,
          candidates: [...pos.candidates, candidate],
        },
      };
    });
  };

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.start_date)   return "Start date is required";
    if (!form.end_date)     return "End date is required";
    if (new Date(form.end_date) <= new Date(form.start_date))
      return "End date must be after start date";

    const positions = Object.values(selectedPositions);
    if (positions.length === 0) return "Select at least one position";

    // Cross-position duplicate check (second line of defence)
    const seen = new Map(); // candidateId → positionName
    for (const pos of positions) {
      const { config, candidates } = pos;

      if (config.winners_count > config.candidate_count)
        return `"${pos.name}": winners cannot exceed candidate count`;
      if (config.votes_per_voter > config.winners_count)
        return `"${pos.name}": votes per voter cannot exceed winners count`;
      if (candidates.length < config.candidate_count)
        return `"${pos.name}": needs ${config.candidate_count} candidate(s), only ${candidates.length} selected`;

      for (const c of candidates) {
        if (seen.has(c.candidate_id)) {
          return `"${c.full_name}" is assigned to both "${seen.get(c.candidate_id)}" and "${pos.name}" — a candidate can only appear in one position`;
        }
        seen.set(c.candidate_id, pos.name);
      }
    }

    return null;
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    const error = validate();
    if (error) return alert(error);

    const positions = Object.values(selectedPositions).map((p) => ({
      position_id:     p.position_id,
      candidate_count: p.config.candidate_count,
      winners_count:   p.config.winners_count,
      votes_per_voter: p.config.votes_per_voter,
      candidates:      p.candidates.map((c) => ({ candidate_id: c.candidate_id })),
    }));

    const payload = { ...form, positions };

    try {
      setSaving(true);
      const saved = isEdit
        ? await electionApi.update(election.election_id, payload)
        : await electionApi.create(payload);
      onSaved(saved);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selectedPositions).length;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="modal-overlay">
      <div style={{
        background: "#fff",
        borderRadius: 12,
        width: "min(700px, 95vw)",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}>

        {/* ── Sticky header ── */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              {isEdit ? "Edit Election" : "Create Election"}
            </h3>
            <button
              onClick={() => onSaved(null)}
              style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
            {selectedCount === 0
              ? "Fill in election details, then select positions below"
              : `${selectedCount} position${selectedCount > 1 ? "s" : ""} selected`}
          </p>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* Basic Info */}
          <section style={{ marginBottom: 24 }}>
            <p style={sectionLabel}>Election Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <FieldLabel>Title</FieldLabel>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  disabled={!isDraft}
                  placeholder="e.g. Student Council Election 2025"
                  style={inputStyle(isDraft)}
                />
              </div>
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  disabled={!isDraft}
                  style={inputStyle(isDraft)}
                />
              </div>
              <div>
                <FieldLabel>End Date</FieldLabel>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  disabled={!isDraft}
                  style={inputStyle(isDraft)}
                />
              </div>
            </div>

            {isEdit && (
              <div style={{ marginTop: 14 }}>
                <FieldLabel>Status</FieldLabel>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{ ...inputStyle(true), cursor: "pointer" }}
                >
                  <option value="draft"   disabled={form.status !== "draft"}>Draft</option>
                  <option value="pending" disabled={!["draft","pending"].includes(form.status)}>Pending</option>
                  <option value="active"  disabled={!["pending","active"].includes(form.status)}>Active</option>
                  <option value="ended"   disabled={!["active","ended"].includes(form.status)}>Ended</option>
                </select>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
                  {form.status === "draft"   && "Draft → set to Pending when ballot is ready for voters to preview"}
                  {form.status === "pending" && "Pending → set to Active once the start date has passed"}
                  {form.status === "active"  && "Active → set to Ended once the end date has passed"}
                  {form.status === "ended"   && "This election has ended"}
                </p>
              </div>
            )}
          </section>

          <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "0 0 20px" }} />

          {/* Positions */}
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

            {loading ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading positions and candidates...</p>
            ) : globalPositions.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No positions found. Create positions first.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {globalPositions.map((pos) => {
                  const isSelected = !!selectedPositions[pos.position_id];
                  const selPos     = selectedPositions[pos.position_id];

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
                          onChange={() => togglePosition(pos)}
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
                                  onChange={(e) => handleConfigChange(pos.position_id, field, e.target.value)}
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
                                // Is this candidate already used in a DIFFERENT position?
                                const takenElsewhere =
                                  !pickedHere && assignedCandidateIds.has(c.candidate_id);
                                // Is this position's slot already full (and candidate not already here)?
                                const slotsFull =
                                  !pickedHere && selPos.candidates.length >= selPos.config.candidate_count;

                                const isDisabled = !isDraft || takenElsewhere || slotsFull;

                                // Tooltip hint shown on hover via title attr
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
                                        ? "1.5px solid #fca5a5"   // red tint — taken elsewhere
                                        : "1.5px solid #e5e7eb",
                                      background: pickedHere
                                        ? "#eff6ff"
                                        : takenElsewhere
                                        ? "#fff5f5"               // red bg — taken elsewhere
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
                                        ? "#ef4444"               // red text — taken elsewhere
                                        : "#374151",
                                      transition: "all 0.12s",
                                      userSelect: "none",
                                      position: "relative",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={pickedHere}
                                      onChange={() => toggleCandidate(pos.position_id, c)}
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
                                      onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                                    />
                                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {c.full_name}
                                    </span>
                                    {/* "Taken" badge */}
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
            )}
          </section>
        </div>

        {/* ── Sticky footer ── */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          flexShrink: 0,
          background: "#fff",
        }}>
          <Button variant="secondary" onClick={() => onSaved(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create Election"}
          </Button>
        </div>

      </div>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <p style={{
      margin: "0 0 4px",
      fontSize: "0.75rem",
      fontWeight: 600,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}>
      {children}
    </p>
  );
}

const inputStyle = (editable) => ({
  width: "100%",
  padding: "8px 10px",
  border: editable ? "1px solid #d1d5db" : "1px solid #f3f4f6",
  borderRadius: 6,
  fontSize: "0.9rem",
  background: editable ? "#fff" : "#f9fafb",
  color: editable ? "#111" : "#6b7280",
  boxSizing: "border-box",
  outline: "none",
});

const sectionLabel = {
  margin: "0 0 12px",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};