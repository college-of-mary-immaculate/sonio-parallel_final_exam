import { useState, useEffect } from "react";
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

  // ── Basic fields ──────────────────────────────────────────────
  const [form, setForm] = useState({
    title: election?.title ?? "",
    start_date: election?.start_date?.split("T")[0] ?? "",
    end_date: election?.end_date?.split("T")[0] ?? "",
    status: election?.status ?? "draft",
    created_by: election?.created_by ?? 1,
  });

  // ── Global lists ──────────────────────────────────────────────
  const [globalPositions, setGlobalPositions] = useState([]);
  const [globalCandidates, setGlobalCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Selected positions map ─────────────────────────────────────
  // { [position_id]: { ...positionData, config: {...}, candidates: [...] } }
  const [selectedPositions, setSelectedPositions] = useState({});

  // ── UI state ──────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Load global positions + candidates
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // If editing, pre-populate selectedPositions from election config
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !election.positions) return;

    // election.positions expected shape from getConfig:
    // [{ position_id, name, candidate_count, winners_count, votes_per_voter, candidates: [...] }]
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

  // ─────────────────────────────────────────────────────────────
  // Handlers — basic form
  // ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─────────────────────────────────────────────────────────────
  // Handlers — position toggle
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // Handlers — position config
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // Handlers — candidates per position
  // ─────────────────────────────────────────────────────────────
  const toggleCandidate = (positionId, candidate) => {
    if (!isDraft) return;
    setSelectedPositions((prev) => {
      const pos = prev[positionId];
      const alreadyIn = pos.candidates.some(
        (c) => c.candidate_id === candidate.candidate_id
      );

      return {
        ...prev,
        [positionId]: {
          ...pos,
          candidates: alreadyIn
            ? pos.candidates.filter((c) => c.candidate_id !== candidate.candidate_id)
            : [...pos.candidates, candidate],
        },
      };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.start_date)   return "Start date is required";
    if (!form.end_date)     return "End date is required";
    if (new Date(form.end_date) <= new Date(form.start_date))
      return "End date must be after start date";

    const positions = Object.values(selectedPositions);
    if (positions.length === 0) return "Select at least one position";

    for (const pos of positions) {
      const { config, candidates } = pos;
      if (config.winners_count > config.candidate_count)
        return `"${pos.name}": winners cannot exceed candidate count`;
      if (config.votes_per_voter > config.winners_count)
        return `"${pos.name}": votes per voter cannot exceed winners count`;
      if (candidates.length < config.candidate_count)
        return `"${pos.name}": needs ${config.candidate_count} candidate(s), only ${candidates.length} selected`;
    }

    return null;
  };

  // ─────────────────────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const error = validate();
    if (error) return alert(error);

    const positions = Object.values(selectedPositions).map((p) => ({
      position_id:    p.position_id,
      candidate_count: p.config.candidate_count,
      winners_count:   p.config.winners_count,
      votes_per_voter: p.config.votes_per_voter,
      candidates: p.candidates.map((c) => ({ candidate_id: c.candidate_id })),
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

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <h3>{isEdit ? "Edit Election" : "Create Election"}</h3>

        {/* ── Basic Info ─────────────────────────── */}
        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            disabled={!isDraft}
          />
        </label>

        <label>
          Start Date
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            disabled={!isDraft}
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            disabled={!isDraft}
          />
        </label>

        {isEdit && (
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </label>
        )}

        {/* ── Positions ──────────────────────────── */}
        <div className="positions-section">
          <h4>Positions {!isDraft && <span style={{ fontSize: "0.75rem", color: "#888" }}>(locked — not a draft)</span>}</h4>

          {loading ? (
            <p>Loading...</p>
          ) : (
            globalPositions.map((pos) => {
              const isSelected = !!selectedPositions[pos.position_id];
              const selPos     = selectedPositions[pos.position_id];

              return (
                <div key={pos.position_id} className="position-item">

                  {/* Position toggle */}
                  <label className="position-toggle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePosition(pos)}
                      disabled={!isDraft}
                    />
                    <strong>{pos.name}</strong>
                    {pos.description && (
                      <span className="position-desc"> — {pos.description}</span>
                    )}
                  </label>

                  {/* Expanded config + candidates */}
                  {isSelected && selPos && (
                    <div className="position-config">

                      {/* Config row */}
                      <div className="config-row">
                        <label>
                          Slots
                          <input
                            type="number"
                            min={1}
                            value={selPos.config.candidate_count}
                            onChange={(e) => handleConfigChange(pos.position_id, "candidate_count", e.target.value)}
                            disabled={!isDraft}
                          />
                        </label>
                        <label>
                          Winners
                          <input
                            type="number"
                            min={1}
                            value={selPos.config.winners_count}
                            onChange={(e) => handleConfigChange(pos.position_id, "winners_count", e.target.value)}
                            disabled={!isDraft}
                          />
                        </label>
                        <label>
                          Votes/Voter
                          <input
                            type="number"
                            min={1}
                            value={selPos.config.votes_per_voter}
                            onChange={(e) => handleConfigChange(pos.position_id, "votes_per_voter", e.target.value)}
                            disabled={!isDraft}
                          />
                        </label>
                      </div>

                      {/* Candidates selector */}
                      <div className="candidates-picker">
                        <p className="picker-label">
                          Select candidates ({selPos.candidates.length} / {selPos.config.candidate_count} required):
                        </p>

                        <div className="candidates-grid">
                          {globalCandidates.map((c) => {
                            const picked = selPos.candidates.some(
                              (sc) => sc.candidate_id === c.candidate_id
                            );
                            return (
                              <label
                                key={c.candidate_id}
                                className={`candidate-chip ${picked ? "picked" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={picked}
                                  onChange={() => toggleCandidate(pos.position_id, c)}
                                  disabled={
                                    !isDraft ||
                                    (!picked && selPos.candidates.length >= selPos.config.candidate_count)
                                  }
                                />
                                {c.full_name}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Actions ────────────────────────────── */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => onSaved(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}