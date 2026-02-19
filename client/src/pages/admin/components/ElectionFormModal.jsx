import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { electionApi } from "../../../apis/electionApi";
import { electionPositionApi } from "../../../apis/electionPositionApi";
import "../../../css/components/CandidateFormModal.css";

export default function ElectionFormModal({ election, onSaved }) {
  const isEdit = !!election;

  const [form, setForm] = useState({
    title: "",
    start_date: "",
    end_date: "",
    status: "draft",
    created_by: 1,
    positions: [], // array of positions with candidates
  });

  const [allPositions, setAllPositions] = useState([]); // global positions
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===============================
  // Load election data if editing
  // ===============================
  useEffect(() => {
    if (election) {
      setForm({
        title: election.title ?? "",
        start_date: election.start_date?.split("T")[0] ?? "",
        end_date: election.end_date?.split("T")[0] ?? "",
        status: election.status ?? "draft",
        created_by: election.created_by ?? 1,
        positions: election.positions ?? [],
      });
    }
  }, [election]);

  // ===============================
  // Fetch all global positions
  // ===============================
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoadingPositions(true);
        const data = await electionPositionApi.getAllGlobal(); // implement this API
        setAllPositions(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load positions");
      } finally {
        setLoadingPositions(false);
      }
    };
    fetchPositions();
  }, []);

  // ===============================
  // Form change handler
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===============================
  // Positions handlers
  // ===============================
  const handleTogglePosition = (position) => {
    setForm((prev) => {
      const exists = prev.positions.find(p => p.position_id === position.position_id);
      if (exists) {
        // remove
        return { ...prev, positions: prev.positions.filter(p => p.position_id !== position.position_id) };
      } else {
        // add with empty candidates
        return { ...prev, positions: [...prev.positions, { ...position, candidates: [] }] };
      }
    });
  };

  const handleAddCandidate = (positionId, candidate) => {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.map(p =>
        p.position_id === positionId
          ? { ...p, candidates: [...p.candidates, candidate] }
          : p
      ),
    }));
  };

  const handleRemoveCandidate = (positionId, candidateId) => {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.map(p =>
        p.position_id === positionId
          ? { ...p, candidates: p.candidates.filter(c => c.candidate_id !== candidateId) }
          : p
      ),
    }));
  };

  // ===============================
  // Save election
  // ===============================
  const handleSave = async () => {
    // Validation: must have at least one position with candidates
    if (!form.positions || form.positions.length === 0) {
      return alert("Select at least one position");
    }
    for (const pos of form.positions) {
      if (!pos.candidates || pos.candidates.length < pos.candidate_count) {
        return alert(`Position "${pos.name}" does not have enough candidates`);
      }
    }

    try {
      setSaving(true);
      const savedElection = isEdit
        ? await electionApi.update(election.election_id, form)
        : await electionApi.create(form);

      onSaved(savedElection);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <h3>{isEdit ? "Edit Election" : "Create Election"}</h3>

        {/* Basic info */}
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Start Date
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
        </label>

        <label>
          End Date
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </label>

        {/* Positions selector */}
        <div className="positions-section">
          <h4>Positions</h4>
          {loadingPositions ? (
            <p>Loading positions...</p>
          ) : (
            <ul>
              {allPositions.map(pos => {
                const selected = form.positions.some(p => p.position_id === pos.position_id);
                return (
                  <li key={pos.position_id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleTogglePosition(pos)}
                      />
                      {pos.name} ({pos.description})
                    </label>

                    {/* Candidate list for this position */}
                    {selected && (
                      <div className="candidates-section">
                        <h5>Candidates</h5>
                        <ul>
                          {form.positions.find(p => p.position_id === pos.position_id)?.candidates.map(c => (
                            <li key={c.candidate_id}>
                              {c.full_name}
                              <Button variant="danger" size="small" onClick={() => handleRemoveCandidate(pos.position_id, c.candidate_id)}>Remove</Button>
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={async () => {
                            const candidateName = prompt("Enter candidate full name");
                            if (!candidateName) return;

                            const candidateData = { full_name: candidateName };
                            const newCandidate = await electionApi.createCandidate(candidateData);
                            handleAddCandidate(pos.position_id, newCandidate);
                          }}
                        >
                          + Add Candidate
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Modal actions */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => onSaved(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
