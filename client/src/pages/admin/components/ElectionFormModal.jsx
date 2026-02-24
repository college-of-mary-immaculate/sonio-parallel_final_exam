import { useState, useEffect, useMemo } from "react";
import Button from "../../../components/Button";
import { electionApi } from "../../../apis/electionApi";
import { positionApi } from "../../../apis/positionApi";
import { getAllCandidates } from "../../../apis/candidateApi";
import "../../../css/components/CandidateFormModal.css";
import PositionPicker from "./PositionPicker";
import { FieldLabel, inputStyle, sectionLabel } from "./formStyles";

const DEFAULT_POSITION_CONFIG = {
  candidate_count: 2,
  winners_count: 1,
  votes_per_voter: 1,
};

export default function ElectionFormModal({ election, onSaved }) {
  const isEdit = !!election;
  const isDraft = !isEdit || election.status === "draft";

  const [form, setForm] = useState({
    title:      election?.title ?? "",
    start_date: election?.start_date?.split("T")[0] ?? "",
    end_date:   election?.end_date?.split("T")[0] ?? "",
    status:     election?.status ?? "draft",
    created_by: election?.created_by ?? 1,
  });

  const [globalPositions, setGlobalPositions]     = useState([]);
  const [globalCandidates, setGlobalCandidates]   = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [selectedPositions, setSelectedPositions] = useState({});
  const [saving, setSaving]                       = useState(false);

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

  // ── All candidate IDs already assigned across every position ──
  const assignedCandidateIds = useMemo(() => {
    const ids = new Set();
    for (const pos of Object.values(selectedPositions)) {
      for (const c of pos.candidates) ids.add(c.candidate_id);
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

      const assignedElsewhere = Object.entries(prev).some(
        ([pid, p]) =>
          pid !== String(positionId) &&
          p.candidates.some((c) => c.candidate_id === candidate.candidate_id)
      );
      if (assignedElsewhere) return prev;

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

    const seen = new Map();
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

          {/* Positions — delegated to PositionPicker */}
          <PositionPicker
            globalPositions={globalPositions}
            globalCandidates={globalCandidates}
            selectedPositions={selectedPositions}
            assignedCandidateIds={assignedCandidateIds}
            isDraft={isDraft}
            loading={loading}
            onTogglePosition={togglePosition}
            onConfigChange={handleConfigChange}
            onToggleCandidate={toggleCandidate}
          />
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