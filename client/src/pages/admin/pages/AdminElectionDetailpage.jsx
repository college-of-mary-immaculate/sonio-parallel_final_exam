import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { electionApi } from "../../../apis/electionApi";
import { electionPositionApi } from "../../../apis/electionPositionApi";
import { electionCandidateApi } from "../../../apis/electionCandidateApi";
import { positionApi } from "../../../apis/positionApi";
import { getAllCandidates } from "../../../apis/candidateApi";
import Button from "../../../components/Button";
import "../../../css/admin/AdminPage.css";

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    draft:   { label: "Draft",   color: "#f59e0b" },
    pending: { label: "Pending", color: "#8b5cf6" }, // ✅ new
    active:  { label: "Active",  color: "#22c55e" },
    ended:   { label: "Ended",   color: "#6b7280" },
  };
  const { label, color } = map[status] ?? { label: status, color: "#6b7280" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      background: color + "22",
      color,
      border: `1px solid ${color}`,
      fontWeight: 600,
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      {label}
    </span>
  );
}

// ─── Inline editable field ───────────────────────────────────────────────────
function EditableField({ label, name, value, type = "text", onChange, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          border: disabled ? "1px solid transparent" : "1px solid #d1d5db",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: "0.95rem",
          background: disabled ? "transparent" : "#fff",
          color: "#111",
          cursor: disabled ? "default" : "text",
          outline: "none",
          transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminElectionDetailPage() {
  const { electionId } = useParams();
  const navigate       = useNavigate();

  // ── Election base info ────────────────────────────────────────
  const [election, setElection]   = useState(null);
  const [formInfo, setFormInfo]   = useState({ title: "", start_date: "", end_date: "", status: "draft" });
  const [infoSaving, setInfoSaving] = useState(false);

  // ── Ballot state ──────────────────────────────────────────────
  // positions: [{ position_id, name, description, candidate_count, winners_count, votes_per_voter }]
  // candidates: [{ candidate_id, full_name, position_id, ... }]
  const [positions, setPositions]   = useState([]);
  const [candidates, setCandidates] = useState([]);

  // ── Global lists (for add dropdowns) ─────────────────────────
  const [globalPositions,  setGlobalPositions]  = useState([]);
  const [globalCandidates, setGlobalCandidates] = useState([]);

  // ── UI ────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [addingPositionId, setAddingPositionId] = useState(""); // positionId staged to add
  const [addingCandidateMap, setAddingCandidateMap] = useState({}); // { [positionId]: candidateId }

  // ─────────────────────────────────────────────────────────────
  // Load everything
  // ─────────────────────────────────────────────────────────────
  const load = async () => {
    try {
      setLoading(true);
      const [elec, pos, cand, gPos, gCand] = await Promise.all([
        electionApi.getById(electionId),
        electionPositionApi.getByElection(electionId),
        electionCandidateApi.getByElection(electionId),
        positionApi.getAll(),
        getAllCandidates(),
      ]);

      setElection(elec);
      setFormInfo({
        title:      elec.title,
        start_date: elec.start_date?.split("T")[0] ?? "",
        end_date:   elec.end_date?.split("T")[0]   ?? "",
        status:     elec.status,
      });

      setPositions(pos);
      setCandidates(cand);
      setGlobalPositions(gPos);
      setGlobalCandidates(gCand);
    } catch (err) {
      console.error(err);
      alert("Failed to load election");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [electionId]);

  const isDraft = election?.status === "draft";

  // ─────────────────────────────────────────────────────────────
  // Save basic info (title / dates / status)
  // ─────────────────────────────────────────────────────────────
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFormInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = async () => {
    try {
      setInfoSaving(true);
      const updated = await electionApi.update(electionId, formInfo);
      setElection(updated);
      setFormInfo({
        title:      updated.title,
        start_date: updated.start_date?.split("T")[0] ?? "",
        end_date:   updated.end_date?.split("T")[0]   ?? "",
        status:     updated.status,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    } finally {
      setInfoSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Add position to election
  // ─────────────────────────────────────────────────────────────
  const handleAddPosition = async () => {
    if (!addingPositionId) return;
    try {
      await electionPositionApi.add(electionId, addingPositionId, {
        candidate_count: 2,
        winners_count:   1,
        votes_per_voter: 1,
      });
      setAddingPositionId("");
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add position");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Remove position from election
  // ─────────────────────────────────────────────────────────────
  const handleRemovePosition = async (positionId) => {
    if (!confirm("Remove this position and all its candidates from the election?")) return;
    try {
      await electionPositionApi.remove(electionId, positionId);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove position");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Add candidate to a position
  // ─────────────────────────────────────────────────────────────
  const handleAddCandidate = async (positionId) => {
    const candidateId = addingCandidateMap[positionId];
    if (!candidateId) return;
    try {
      await electionCandidateApi.add(electionId, positionId, candidateId);
      setAddingCandidateMap(prev => ({ ...prev, [positionId]: "" }));
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add candidate");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Remove candidate from a position
  // ─────────────────────────────────────────────────────────────
  const handleRemoveCandidate = async (positionId, candidateId) => {
    if (!confirm("Remove this candidate from the position?")) return;
    try {
      await electionCandidateApi.remove(electionId, positionId, candidateId);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove candidate");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Derived helpers
  // ─────────────────────────────────────────────────────────────
  const candidatesForPosition = (positionId) =>
    candidates.filter(c => String(c.position_id) === String(positionId));

  // positions not yet in the election
  const availablePositions = globalPositions.filter(
    gp => !positions.some(p => String(p.position_id) === String(gp.position_id))
  );

  // candidates not yet in a specific position
  const availableCandidates = (positionId) =>
    globalCandidates.filter(
      gc => !candidates.some(
        c => String(c.candidate_id) === String(gc.candidate_id) &&
             String(c.position_id)  === String(positionId)
      )
    );

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  if (loading) return <div className="admin-page"><p className="page-empty">Loading...</p></div>;
  if (!election) return <div className="admin-page"><p className="page-empty">Election not found.</p></div>;

  return (
    <div className="admin-page" style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Back ──────────────────────────────────── */}
      <button
        onClick={() => navigate("/admin/elections")}
        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginBottom: 16, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 4 }}
      >
        ← Back to Elections
      </button>

      {/* ── Header ────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <h2 style={{ margin: 0 }}>{election.title}</h2>
        <StatusBadge status={election.status} />
      </div>

      {/* ── Info Card ─────────────────────────────── */}
      <section style={cardStyle}>
        <h4 style={sectionTitle}>Election Info {!isDraft && <span style={lockedLabel}>read-only</span>}</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <EditableField label="Title"      name="title"      value={formInfo.title}      onChange={handleInfoChange} disabled={!isDraft} />
          <EditableField label="Start Date" name="start_date" value={formInfo.start_date} onChange={handleInfoChange} type="date" disabled={!isDraft} />
          <EditableField label="End Date"   name="end_date"   value={formInfo.end_date}   onChange={handleInfoChange} type="date" disabled={!isDraft} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
          <select
            name="status"
            value={formInfo.status}
            onChange={handleInfoChange}
            style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 10px", fontSize: "0.95rem", background: "#fff" }}
          >
            <option value="draft"   disabled={formInfo.status !== "draft"}>Draft</option>
            <option value="pending" disabled={!["draft","pending"].includes(formInfo.status)}>Pending</option>
            <option value="active"  disabled={!["pending","active"].includes(formInfo.status)}>Active</option>
            <option value="ended"   disabled={!["active","ended"].includes(formInfo.status)}>Ended</option>
          </select>
          </div>
        </div>

        {isDraft && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={handleSaveInfo} disabled={infoSaving}>
              {infoSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}

        {/* status-only save for non-draft */}
        {!isDraft && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={handleSaveInfo} disabled={infoSaving}>
              {infoSaving ? "Updating..." : "Update Status"}
            </Button>
          </div>
        )}
      </section>

      {/* ── Ballot: Positions + Candidates ────────── */}
      <section style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
            Ballot Positions
          </h4>

          {/* Add position — draft only */}
          {isDraft && availablePositions.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={addingPositionId}
                onChange={e => setAddingPositionId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select position to add…</option>
                {availablePositions.map(p => (
                  <option key={p.position_id} value={p.position_id}>{p.name}</option>
                ))}
              </select>
              <Button variant="primary" onClick={handleAddPosition} disabled={!addingPositionId}>
                + Add
              </Button>
            </div>
          )}
        </div>

        {positions.length === 0 ? (
          <p className="page-empty">No positions configured for this election.</p>
        ) : (
          positions.map(pos => {
            const posCandidates = candidatesForPosition(pos.position_id);
            const avail         = availableCandidates(pos.position_id);
            const isFull        = posCandidates.length >= pos.candidate_count;

            return (
              <div key={pos.position_id} style={{ ...cardStyle, marginBottom: 16 }}>

                {/* Position header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: "1rem" }}>{pos.name}</strong>
                    {pos.description && (
                      <span style={{ fontSize: "0.82rem", color: "#6b7280", marginLeft: 8 }}>{pos.description}</span>
                    )}
                    <div style={{ marginTop: 4, fontSize: "0.78rem", color: "#9ca3af" }}>
                      Slots: {pos.candidate_count} &nbsp;·&nbsp;
                      Winners: {pos.winners_count} &nbsp;·&nbsp;
                      Votes/Voter: {pos.votes_per_voter}
                    </div>
                  </div>
                  {isDraft && (
                    <Button variant="danger" onClick={() => handleRemovePosition(pos.position_id)}>
                      Remove Position
                    </Button>
                  )}
                </div>

                {/* Candidates list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {posCandidates.length === 0 ? (
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#9ca3af" }}>No candidates assigned yet.</p>
                  ) : (
                posCandidates.map(c => (
                  <div key={c.candidate_id} style={candidateRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={c.image_url}
                        alt={c.full_name}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #e5e7eb",
                          flexShrink: 0,
                        }}
                        onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                      />
                      <div>
                        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{c.full_name}</span>
                        {c.primary_advocacy && (
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {c.primary_advocacy}
                          </div>
                        )}
                      </div>
                    </div>
                    {isDraft && (
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveCandidate(pos.position_id, c.candidate_id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))
                  )}
                </div>

                {/* Add candidate row — draft + not full */}
                {isDraft && !isFull && avail.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <select
                      value={addingCandidateMap[pos.position_id] ?? ""}
                      onChange={e =>
                        setAddingCandidateMap(prev => ({ ...prev, [pos.position_id]: e.target.value }))
                      }
                      style={selectStyle}
                    >
                      <option value="">Select candidate to add…</option>
                      {avail.map(c => (
                        <option key={c.candidate_id} value={c.candidate_id}>{c.full_name}</option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      onClick={() => handleAddCandidate(pos.position_id)}
                      disabled={!addingCandidateMap[pos.position_id]}
                    >
                      + Add Candidate
                    </Button>
                  </div>
                )}

                {isDraft && isFull && (
                  <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "#22c55e" }}>
                    ✓ All {pos.candidate_count} candidate slot(s) filled
                  </p>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const sectionTitle = {
  margin: "0 0 16px",
  fontSize: "0.95rem",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const lockedLabel = {
  fontSize: "0.72rem",
  fontWeight: 500,
  color: "#9ca3af",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  padding: "1px 6px",
};

const candidateRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 6,
  background: "#f9fafb",
  border: "1px solid #f3f4f6",
};

const selectStyle = {
  border: "1px solid #d1d5db",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: "0.875rem",
  background: "#fff",
  minWidth: 220,
};