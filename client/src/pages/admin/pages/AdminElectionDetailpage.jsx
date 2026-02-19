import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { electionApi } from "../../../apis/electionApi";
import { electionPositionApi } from "../../../apis/electionPositionApi";
import { electionCandidateApi } from "../../../apis/electionCandidateApi";
import { electionTrackingApi } from "../../../apis/electionTrackingApi";
import { positionApi } from "../../../apis/positionApi";
import { getAllCandidates } from "../../../apis/candidateApi";
import Button from "../../../components/Button";
import {
  createSocket,
  getSocket,
  joinElectionRoom,
  leaveElectionRoom,
  onVoteUpdated,
} from "../../../sockets/socket";
import "../../../css/admin/AdminPage.css";

const CHART_HEIGHT = 220;

const BAR_COLORS = [
  "#f59e0b",
  "#94a3b8",
  "#b45309",
  "#38bdf8",
  "#818cf8",
  "#34d399",
  "#f472b6",
];

const BG      = "#0f172a";
const SURFACE = "#1e293b";
const BORDER  = "#2d3f55";
const TEXT    = "#e2e8f0";
const MUTED   = "#64748b";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    draft:   { label: "Draft",   color: "#f59e0b" },
    pending: { label: "Pending", color: "#8b5cf6" },
    active:  { label: "Active",  color: "#22c55e" },
    ended:   { label: "Ended",   color: "#6b7280" },
  };
  const { label, color } = map[status] ?? { label: status, color: "#6b7280" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "999px",
      background: color + "22", color, border: `1px solid ${color}`,
      fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {label}
    </span>
  );
}

// ─── Editable field ───────────────────────────────────────────────────────────
function EditableField({ label, name, value, type = "text", onChange, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <input
        type={type} name={name} value={value} onChange={onChange} disabled={disabled}
        style={{
          border: disabled ? "1px solid transparent" : "1px solid #d1d5db",
          borderRadius: 6, padding: "6px 10px", fontSize: "0.95rem",
          background: disabled ? "transparent" : "#fff", color: "#111",
          cursor: disabled ? "default" : "text", outline: "none", transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

// ─── Vertical bar chart ───────────────────────────────────────────────────────
function PositionBarChart({ position }) {
  const maxVotes = Math.max(...position.candidates.map(c => c.vote_count), 1);
  const total    = position.candidates.reduce((s, c) => s + c.vote_count, 0);
  const sorted   = [...position.candidates].sort((a, b) => a.rank - b.rank);
  const colW     = sorted.length <= 4 ? 72 : sorted.length <= 6 ? 58 : 46;
  const gap      = sorted.length <= 4 ? 24 : sorted.length <= 6 ? 16 : 10;

  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: "18px 20px 0", flex: "1 1 300px", minWidth: 260,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: TEXT }}>{position.position_name}</span>
        <span style={{ fontSize: "0.7rem", color: MUTED }}>{total} vote{total !== 1 ? "s" : ""} · top {position.winners_count} win</span>
      </div>

      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        gap, height: CHART_HEIGHT,
        borderBottom: `2px solid ${BORDER}`, position: "relative",
      }}>
        {[25, 50, 75].map(pct => (
          <div key={pct} style={{
            position: "absolute", left: 0, right: 0, bottom: `${pct}%`,
            borderTop: `1px dashed ${BORDER}`, pointerEvents: "none",
          }} />
        ))}

        {sorted.map((c, idx) => {
          const heightPct = maxVotes > 0 ? (c.vote_count / maxVotes) * 100 : 0;
          const barH      = Math.max((heightPct / 100) * CHART_HEIGHT, c.vote_count > 0 ? 8 : 2);
          const isWinning = c.is_leading;
          const color     = BAR_COLORS[idx] ?? BAR_COLORS[BAR_COLORS.length - 1];

          return (
            <div key={c.candidate_id} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-end", width: colW, height: "100%", position: "relative",
            }}>
              {isWinning && (
                <div style={{
                  position: "absolute", bottom: barH + 8,
                  fontSize: c.rank === 1 ? "1.5rem" : "1.1rem",
                  filter: `drop-shadow(0 0 5px ${color}cc)`,
                  transition: "bottom 0.7s cubic-bezier(0.4,0,0.2,1)", lineHeight: 1,
                }}>
                  ⭐
                </div>
              )}
              {c.vote_count > 0 && (
                <div style={{
                  position: "absolute",
                  bottom: barH + (isWinning ? 36 : 6),
                  fontSize: "0.68rem", fontWeight: 800, color,
                  transition: "bottom 0.7s cubic-bezier(0.4,0,0.2,1)",
                  whiteSpace: "nowrap",
                }}>
                  {c.vote_count}
                </div>
              )}
              <div style={{
                width: "100%", height: barH,
                background: `linear-gradient(to top, ${color}bb, ${color})`,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.7s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: isWinning ? `0 0 14px ${color}55` : "none",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "40%",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)",
                  borderRadius: "6px 6px 0 0",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap, paddingTop: 10, paddingBottom: 14 }}>
        {sorted.map((c, idx) => {
          const isWinning = c.is_leading;
          const color     = BAR_COLORS[idx] ?? BAR_COLORS[BAR_COLORS.length - 1];
          const isTied    = sorted.filter(x => x.vote_count === c.vote_count && c.vote_count > 0).length > 1;

          return (
            <div key={c.candidate_id} style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.58rem", fontWeight: 800,
                color: isWinning ? "#0f172a" : color,
                background: isWinning ? color : "transparent",
              }}>
                {String(c.rank).padStart(2, "0")}
              </div>
              <img
                src={c.image_url} alt={c.full_name}
                style={{
                  width: 28, height: 28, borderRadius: "50%", objectFit: "cover",
                  border: `2px solid ${isWinning ? color : BORDER}`,
                  filter: isWinning ? "none" : "grayscale(50%)",
                }}
                onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
              />
              <span style={{
                fontSize: "0.6rem", fontWeight: isWinning ? 700 : 400,
                color: isWinning ? TEXT : MUTED,
                textAlign: "center", lineHeight: 1.2, wordBreak: "break-word", maxWidth: colW,
              }}>
                {c.full_name.split(" ")[0]}
              </span>
              {isTied && (
                <span style={{ fontSize: "0.52rem", fontWeight: 800, color: "#0f172a", background: "#f59e0b", padding: "1px 4px", borderRadius: 3 }}>
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

function LiveTrackingSection({ electionId }) {
  const [data,        setData]        = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);
  const [connected,   setConnected]   = useState(false);

  // ← use a ref so the socket callback always has the latest version
  const fetchLiveRef = useRef(null);

  const fetchLive = async () => {
    try {
      const result = await electionTrackingApi.getLive(electionId);
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch live results");
      console.error(err);
    }
  };

  fetchLiveRef.current = fetchLive; // ← always up to date

  useEffect(() => {
    fetchLiveRef.current();

    const s = createSocket();

    const onConnect = () => {
      console.log("[LiveTracking] connected:", s.id);
      setConnected(true);
      s.emit("join:election", String(electionId));
    };

    const onDisconnect = (reason) => {
      console.log("[LiveTracking] disconnected:", reason);
      setConnected(false);
    };

    const onError = (err) => {
      console.warn("[LiveTracking] error:", err.message);
    };

    const onVoteUpdate = (payload) => {
      console.log("[LiveTracking] vote:updated:", payload);
      if (String(payload.electionId) === String(electionId)) {
        fetchLiveRef.current(); // ← always calls the latest fetchLive
      }
    };

    s.on("connect",       onConnect);
    s.on("disconnect",    onDisconnect);
    s.on("connect_error", onError);
    s.on("vote:updated",  onVoteUpdate);

    s.connect();

    return () => {
      s.off("connect",       onConnect);
      s.off("disconnect",    onDisconnect);
      s.off("connect_error", onError);
      s.off("vote:updated",  onVoteUpdate);
      s.emit("leave:election", String(electionId));
      s.disconnect();
    };
  }, [electionId]);

  return (
    <section style={{
      background: BG, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: "20px 24px", marginTop: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: TEXT }}>Live Vote Tracking</h4>
          {/* Live dot — green when socket connected, grey when not */}
          <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
            <style>{`@keyframes lv-ping{0%{transform:scale(1);opacity:.75}75%,100%{transform:scale(2.4);opacity:0}}`}</style>
            {connected && (
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", animation: "lv-ping 1.5s ease-in-out infinite" }} />
            )}
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: connected ? "#22c55e" : MUTED, display: "inline-block" }} />
          </span>
          <span style={{ fontSize: "0.68rem", color: connected ? "#22c55e" : MUTED, fontWeight: 500 }}>
            {connected ? "Live" : "Disconnected"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {data && (
            <span style={{ fontSize: "0.75rem", color: MUTED }}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>{data.total_submissions}</span> voter{data.total_submissions !== 1 ? "s" : ""} submitted
            </span>
          )}
          {lastUpdated && (
            <span style={{ fontSize: "0.68rem", color: MUTED }}>
              updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchLive} style={{
            background: "none", border: `1px solid ${BORDER}`, borderRadius: 6,
            padding: "3px 10px", fontSize: "0.72rem", cursor: "pointer", color: MUTED,
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <p style={{ margin: "0 0 18px", fontSize: "0.68rem", color: MUTED }}>
        Updates instantly when a voter submits · manual refresh available
      </p>

      {error    && <p style={{ color: "#f87171" }}>{error}</p>}
      {!data && !error && <p style={{ color: MUTED, fontSize: "0.875rem" }}>Loading...</p>}
      {data?.positions?.length === 0 && <p style={{ color: MUTED }}>No positions found.</p>}

      {data?.positions && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {data.positions.map(pos => (
            <PositionBarChart key={pos.position_id} position={pos} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminElectionDetailPage() {
  const { electionId } = useParams();
  const navigate       = useNavigate();

  const [election,           setElection]           = useState(null);
  const [formInfo,           setFormInfo]           = useState({ title: "", start_date: "", end_date: "", status: "draft" });
  const [infoSaving,         setInfoSaving]         = useState(false);
  const [positions,          setPositions]          = useState([]);
  const [candidates,         setCandidates]         = useState([]);
  const [globalPositions,    setGlobalPositions]    = useState([]);
  const [globalCandidates,   setGlobalCandidates]   = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [addingPositionId,   setAddingPositionId]   = useState("");
  const [addingCandidateMap, setAddingCandidateMap] = useState({});

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

  const isDraft  = election?.status === "draft";
  const isActive = election?.status === "active";

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

  const handleAddPosition = async () => {
    if (!addingPositionId) return;
    try {
      await electionPositionApi.add(electionId, addingPositionId, { candidate_count: 2, winners_count: 1, votes_per_voter: 1 });
      setAddingPositionId("");
      await load();
    } catch (err) { alert(err.response?.data?.error || "Failed to add position"); }
  };

  const handleRemovePosition = async (positionId) => {
    if (!confirm("Remove this position and all its candidates from the election?")) return;
    try { await electionPositionApi.remove(electionId, positionId); await load(); }
    catch (err) { alert(err.response?.data?.error || "Failed to remove position"); }
  };

  const handleAddCandidate = async (positionId) => {
    const candidateId = addingCandidateMap[positionId];
    if (!candidateId) return;
    try {
      await electionCandidateApi.add(electionId, positionId, candidateId);
      setAddingCandidateMap(prev => ({ ...prev, [positionId]: "" }));
      await load();
    } catch (err) { alert(err.response?.data?.error || "Failed to add candidate"); }
  };

  const handleRemoveCandidate = async (positionId, candidateId) => {
    if (!confirm("Remove this candidate?")) return;
    try { await electionCandidateApi.remove(electionId, positionId, candidateId); await load(); }
    catch (err) { alert(err.response?.data?.error || "Failed to remove candidate"); }
  };

  const candidatesForPosition = (positionId) =>
    candidates.filter(c => String(c.position_id) === String(positionId));

  const availablePositions = globalPositions.filter(
    gp => !positions.some(p => String(p.position_id) === String(gp.position_id))
  );

  const availableCandidates = (positionId) =>
    globalCandidates.filter(gc =>
      !candidates.some(c =>
        String(c.candidate_id) === String(gc.candidate_id) &&
        String(c.position_id)  === String(positionId)
      )
    );

  if (loading)   return <div className="admin-page"><p className="page-empty">Loading...</p></div>;
  if (!election) return <div className="admin-page"><p className="page-empty">Election not found.</p></div>;

  return (
    <div className="admin-page" style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>

      <button
        onClick={() => navigate("/admin/elections")}
        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginBottom: 16, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 4 }}
      >
        ← Back to Elections
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <h2 style={{ margin: 0 }}>{election.title}</h2>
        <StatusBadge status={election.status} />
      </div>

      {/* ── Info card ── */}
      <section style={cardStyle}>
        <h4 style={sectionTitle}>
          Election Info
          {!isDraft && <span style={lockedLabel}>read-only</span>}
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <EditableField label="Title"      name="title"      value={formInfo.title}      onChange={handleInfoChange} disabled={!isDraft} />
          <EditableField label="Start Date" name="start_date" value={formInfo.start_date} onChange={handleInfoChange} type="date" disabled={!isDraft} />
          <EditableField label="End Date"   name="end_date"   value={formInfo.end_date}   onChange={handleInfoChange} type="date" disabled={!isDraft} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
            <select
              name="status" value={formInfo.status} onChange={handleInfoChange}
              style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 10px", fontSize: "0.95rem", background: "#fff" }}
            >
              <option value="draft"   disabled={formInfo.status !== "draft"}>Draft</option>
              <option value="pending" disabled={!["draft","pending"].includes(formInfo.status)}>Pending</option>
              <option value="active"  disabled={!["pending","active"].includes(formInfo.status)}>Active</option>
              <option value="ended"   disabled={!["active","ended"].includes(formInfo.status)}>Ended</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button variant={isDraft ? "primary" : "secondary"} onClick={handleSaveInfo} disabled={infoSaving}>
            {infoSaving ? "Saving..." : isDraft ? "Save Changes" : "Update Status"}
          </Button>
        </div>
      </section>

      {/* ── Live tracking — active elections only ── */}
      {isActive && <LiveTrackingSection electionId={electionId} />}

      {/* ── Ballot positions ── */}
      <section style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
            Ballot Positions
            {!isDraft && <span style={{ ...lockedLabel, marginLeft: 8 }}>read-only</span>}
          </h4>
          {isDraft && availablePositions.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              <select value={addingPositionId} onChange={e => setAddingPositionId(e.target.value)} style={selectStyle}>
                <option value="">Select position to add…</option>
                {availablePositions.map(p => <option key={p.position_id} value={p.position_id}>{p.name}</option>)}
              </select>
              <Button variant="primary" onClick={handleAddPosition} disabled={!addingPositionId}>+ Add</Button>
            </div>
          )}
        </div>

        {positions.length === 0 ? (
          <p className="page-empty">No positions configured.</p>
        ) : positions.map(pos => {
          const posCandidates = candidatesForPosition(pos.position_id);
          const avail         = availableCandidates(pos.position_id);
          const isFull        = posCandidates.length >= pos.candidate_count;

          return (
            <div key={pos.position_id} style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <strong style={{ fontSize: "1rem" }}>{pos.name}</strong>
                  {pos.description && <span style={{ fontSize: "0.82rem", color: "#6b7280", marginLeft: 8 }}>{pos.description}</span>}
                  <div style={{ marginTop: 4, fontSize: "0.78rem", color: "#9ca3af" }}>
                    Slots: {pos.candidate_count} · Winners: {pos.winners_count} · Votes/Voter: {pos.votes_per_voter}
                  </div>
                </div>
                {isDraft && <Button variant="danger" onClick={() => handleRemovePosition(pos.position_id)}>Remove Position</Button>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {posCandidates.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#9ca3af" }}>No candidates assigned yet.</p>
                ) : posCandidates.map(c => (
                  <div key={c.candidate_id} style={candidateRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={c.image_url} alt={c.full_name}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb", flexShrink: 0 }}
                        onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                      />
                      <div>
                        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{c.full_name}</span>
                        {c.primary_advocacy && <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.primary_advocacy}</div>}
                      </div>
                    </div>
                    {isDraft && <Button variant="danger" onClick={() => handleRemoveCandidate(pos.position_id, c.candidate_id)}>Remove</Button>}
                  </div>
                ))}
              </div>

              {isDraft && !isFull && avail.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <select
                    value={addingCandidateMap[pos.position_id] ?? ""}
                    onChange={e => setAddingCandidateMap(prev => ({ ...prev, [pos.position_id]: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">Select candidate to add…</option>
                    {avail.map(c => <option key={c.candidate_id} value={c.candidate_id}>{c.full_name}</option>)}
                  </select>
                  <Button variant="secondary" onClick={() => handleAddCandidate(pos.position_id)} disabled={!addingCandidateMap[pos.position_id]}>
                    + Add Candidate
                  </Button>
                </div>
              )}
              {isDraft && isFull && (
                <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "#22c55e" }}>
                  ✓ All {pos.candidate_count} slot(s) filled
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

const cardStyle    = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const sectionTitle = { margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 };
const lockedLabel  = { fontSize: "0.72rem", fontWeight: 500, color: "#9ca3af", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 4, padding: "1px 6px" };
const candidateRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 6, background: "#f9fafb", border: "1px solid #f3f4f6" };
const selectStyle  = { border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 10px", fontSize: "0.875rem", background: "#fff", minWidth: 220 };