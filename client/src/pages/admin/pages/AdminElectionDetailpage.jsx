import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { electionApi } from "../../../apis/electionApi";
import { electionPositionApi } from "../../../apis/electionPositionApi";
import { electionCandidateApi } from "../../../apis/electionCandidateApi";
import { electionTrackingApi } from "../../../apis/electionTrackingApi";
import { positionApi } from "../../../apis/positionApi";
import { getAllCandidates } from "../../../apis/candidateApi";
import Button from "../../../components/Button";
import "../../../css/admin/AdminPage.css";

const POLL_INTERVAL = 5000;

/* ── palette ────────────────────────────────────────────────── */
const COLORS = {
  win:     ["#34d399", "#10b981", "#059669"],   // greens  — winners
  lose:    ["#64748b", "#475569", "#334155"],   // slates  — non-winners
  accent:  "#34d399",
  bg:      "#0f172a",
  surface: "#1e293b",
  border:  "#2d3f55",
  text:    "#e2e8f0",
  muted:   "#64748b",
};

/* ── helpers ────────────────────────────────────────────────── */
function pick(arr, i) { return arr[i % arr.length]; }

/* ── StatusBadge ────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    draft:   { label: "Draft",   color: "#f59e0b" },
    pending: { label: "Pending", color: "#8b5cf6" },
    active:  { label: "Active",  color: "#34d399" },
    ended:   { label: "Ended",   color: "#64748b" },
  };
  const { label, color } = map[status] ?? { label: status, color: "#64748b" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px", borderRadius: 999,
      background: color + "22", color, border: `1px solid ${color}55`,
      fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      {label}
    </span>
  );
}

/* ── EditableField ──────────────────────────────────────────── */
function EditableField({ label, name, value, type = "text", onChange, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
      <input
        type={type} name={name} value={value} onChange={onChange} disabled={disabled}
        style={{
          border: `1px solid ${disabled ? "transparent" : COLORS.border}`,
          borderRadius: 7, padding: "7px 11px", fontSize: "0.9rem",
          background: disabled ? "transparent" : COLORS.surface,
          color: disabled ? COLORS.muted : COLORS.text,
          cursor: disabled ? "default" : "text", outline: "none",
          transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BAR CHART — one position
══════════════════════════════════════════════════════════════ */
function PositionBarChart({ position }) {
  const total    = position.candidates.reduce((s, c) => s + c.vote_count, 0);
  const maxVotes = Math.max(...position.candidates.map(c => c.vote_count), 1);

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: "22px 26px 18px",
      marginBottom: 18,
    }}>
      {/* Position header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: COLORS.text }}>
            {position.position_name}
          </span>
          {position.description && (
            <span style={{ fontSize: "0.78rem", color: COLORS.muted, marginLeft: 8 }}>
              {position.description}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: COLORS.muted }}>
          <span>{total} vote{total !== 1 ? "s" : ""}</span>
          <span>top {position.winners_count} win</span>
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {position.candidates.map((c, idx) => {
          const pct       = maxVotes > 0 ? (c.vote_count / maxVotes) * 100 : 0;
          const sharePct  = total > 0 ? ((c.vote_count / total) * 100).toFixed(1) : "0.0";
          const isWinning = c.is_leading;
          const barColor  = isWinning ? pick(COLORS.win, idx) : pick(COLORS.lose, idx);
          const tiedWith  = position.candidates.filter(x => x.vote_count === c.vote_count && c.vote_count > 0);
          const isTied    = tiedWith.length > 1;

          return (
            <div key={c.candidate_id}>
              {/* Label row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>

                {/* Avatar */}
                <img
                  src={c.image_url} alt={c.full_name}
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    objectFit: "cover", flexShrink: 0,
                    border: `2px solid ${isWinning ? COLORS.accent : COLORS.border}`,
                    filter: isWinning ? "none" : "grayscale(40%)",
                  }}
                  onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                />

                {/* Rank circle */}
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 800,
                  background: isWinning ? COLORS.accent : COLORS.border,
                  color: isWinning ? "#0f172a" : COLORS.muted,
                }}>
                  {c.rank}
                </span>

                {/* Name */}
                <span style={{
                  flex: 1, fontSize: "0.85rem",
                  fontWeight: isWinning ? 700 : 400,
                  color: isWinning ? COLORS.text : COLORS.muted,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {c.full_name}
                </span>

                {/* Tags */}
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  {isWinning && (
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.06em",
                      color: "#0f172a", background: COLORS.accent,
                      padding: "2px 6px", borderRadius: 3,
                    }}>
                      LEADING
                    </span>
                  )}
                  {isTied && (
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.06em",
                      color: "#0f172a", background: "#f59e0b",
                      padding: "2px 6px", borderRadius: 3,
                    }}>
                      TIED
                    </span>
                  )}
                </div>

                {/* Vote count + share */}
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: isWinning ? COLORS.accent : COLORS.muted, flexShrink: 0, minWidth: 70, textAlign: "right" }}>
                  {c.vote_count} <span style={{ fontSize: "0.68rem", fontWeight: 400, color: COLORS.muted }}>({sharePct}%)</span>
                </span>
              </div>

              {/* Bar track */}
              <div style={{
                height: 10, background: "#0f172a", borderRadius: 999,
                overflow: "hidden", marginLeft: 40,
              }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                  borderRadius: 999,
                  transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: isWinning ? `0 0 10px ${barColor}88` : "none",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LIVE TRACKING SECTION
══════════════════════════════════════════════════════════════ */
function LiveTrackingSection({ electionId }) {
  const [data,        setData]        = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);
  const intervalRef = useRef(null);

  const fetchLive = async () => {
    try {
      const result = await electionTrackingApi.getLive(electionId);
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch live results");
    }
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [electionId]);

  return (
    <div style={{
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 14,
      padding: "24px 28px",
      marginTop: 28,
    }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: COLORS.text, letterSpacing: "-0.01em" }}>
            Live Vote Tracking
          </h4>

          {/* Pulse dot */}
          <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
            <style>{`
              @keyframes lv-ping {
                0%   { transform: scale(1); opacity: .75; }
                75%, 100% { transform: scale(2.4); opacity: 0; }
              }
            `}</style>
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: COLORS.accent, animation: "lv-ping 1.5s ease-in-out infinite",
            }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.accent, display: "inline-block" }} />
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {data && (
            <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>
              <span style={{ color: COLORS.accent, fontWeight: 700 }}>{data.total_submissions}</span> voter{data.total_submissions !== 1 ? "s" : ""} submitted
            </span>
          )}
          {lastUpdated && (
            <span style={{ fontSize: "0.7rem", color: COLORS.muted }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchLive}
            style={{
              background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 6,
              padding: "3px 10px", fontSize: "0.75rem", cursor: "pointer",
              color: COLORS.muted, transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { e.target.style.color = COLORS.text; e.target.style.borderColor = COLORS.muted; }}
            onMouseLeave={e => { e.target.style.color = COLORS.muted; e.target.style.borderColor = COLORS.border; }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <p style={{ margin: "0 0 20px", fontSize: "0.68rem", color: COLORS.muted }}>
        Auto-refreshing every 5s · WebSocket upgrade coming
      </p>

      {error  && <p style={{ color: "#f87171", fontSize: "0.875rem" }}>{error}</p>}
      {!data && !error && <p style={{ color: COLORS.muted, fontSize: "0.875rem" }}>Loading live results...</p>}
      {data?.positions?.length === 0 && <p style={{ color: COLORS.muted }}>No positions found.</p>}

      {/* Chart grid — 2 columns when ≥ 2 positions */}
      {data?.positions && (
        <div style={{
          display: "grid",
          gridTemplateColumns: data.positions.length >= 2 ? "1fr 1fr" : "1fr",
          gap: 18,
        }}>
          {data.positions.map(pos => (
            <PositionBarChart key={pos.position_id} position={pos} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
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
    try {
      await electionPositionApi.remove(electionId, positionId);
      await load();
    } catch (err) { alert(err.response?.data?.error || "Failed to remove position"); }
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
    try {
      await electionCandidateApi.remove(electionId, positionId, candidateId);
      await load();
    } catch (err) { alert(err.response?.data?.error || "Failed to remove candidate"); }
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
    /* ── wider max-width ── */
    <div className="admin-page" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>

      {/* Back */}
      <button
        onClick={() => navigate("/admin/elections")}
        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginBottom: 16, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 4 }}
      >
        ← Back to Elections
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem" }}>{election.title}</h2>
        <StatusBadge status={election.status} />
      </div>

      {/* ── two-column layout when active ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isActive ? "340px 1fr" : "1fr",
        gap: 24,
        alignItems: "start",
      }}>

        {/* LEFT COLUMN — info + ballot */}
        <div>
          {/* Info card */}
          <section style={cardStyle}>
            <h4 style={sectionTitle}>
              Election Info
              {!isDraft && <span style={lockedLabel}>read-only</span>}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <EditableField label="Title"      name="title"      value={formInfo.title}      onChange={handleInfoChange} disabled={!isDraft} />
              <EditableField label="Start Date" name="start_date" value={formInfo.start_date} onChange={handleInfoChange} type="date" disabled={!isDraft} />
              <EditableField label="End Date"   name="end_date"   value={formInfo.end_date}   onChange={handleInfoChange} type="date" disabled={!isDraft} />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</span>
                <select
                  name="status" value={formInfo.status} onChange={handleInfoChange}
                  style={{ border: "1px solid #d1d5db", borderRadius: 7, padding: "7px 11px", fontSize: "0.9rem", background: "#fff" }}
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

          {/* Ballot positions */}
          <section style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                Ballot Positions
                {!isDraft && <span style={{ ...lockedLabel, marginLeft: 8 }}>read-only</span>}
              </h4>
              {isDraft && availablePositions.length > 0 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={addingPositionId} onChange={e => setAddingPositionId(e.target.value)} style={selectStyle}>
                    <option value="">Add position…</option>
                    {availablePositions.map(p => <option key={p.position_id} value={p.position_id}>{p.name}</option>)}
                  </select>
                  <Button variant="primary" onClick={handleAddPosition} disabled={!addingPositionId}>+</Button>
                </div>
              )}
            </div>

            {positions.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No positions configured.</p>
            ) : positions.map(pos => {
              const posCandidates = candidatesForPosition(pos.position_id);
              const avail         = availableCandidates(pos.position_id);
              const isFull        = posCandidates.length >= pos.candidate_count;

              return (
                <div key={pos.position_id} style={{ ...cardStyle, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>{pos.name}</strong>
                      <div style={{ marginTop: 3, fontSize: "0.72rem", color: "#9ca3af" }}>
                        Slots: {pos.candidate_count} · Winners: {pos.winners_count} · Votes/Voter: {pos.votes_per_voter}
                      </div>
                    </div>
                    {isDraft && <Button variant="danger" onClick={() => handleRemovePosition(pos.position_id)}>Remove</Button>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {posCandidates.length === 0 ? (
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "#9ca3af" }}>No candidates yet.</p>
                    ) : posCandidates.map(c => (
                      <div key={c.candidate_id} style={candidateRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <img
                            src={c.image_url} alt={c.full_name}
                            style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb", flexShrink: 0 }}
                            onError={e => { e.target.src = `https://i.pravatar.cc/150?u=${c.candidate_id}`; }}
                          />
                          <div>
                            <span style={{ fontWeight: 500, fontSize: "0.85rem" }}>{c.full_name}</span>
                            {c.primary_advocacy && <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{c.primary_advocacy}</div>}
                          </div>
                        </div>
                        {isDraft && <Button variant="danger" onClick={() => handleRemoveCandidate(pos.position_id, c.candidate_id)}>✕</Button>}
                      </div>
                    ))}
                  </div>

                  {isDraft && !isFull && avail.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <select
                        value={addingCandidateMap[pos.position_id] ?? ""}
                        onChange={e => setAddingCandidateMap(prev => ({ ...prev, [pos.position_id]: e.target.value }))}
                        style={{ ...selectStyle, flex: 1 }}
                      >
                        <option value="">Add candidate…</option>
                        {avail.map(c => <option key={c.candidate_id} value={c.candidate_id}>{c.full_name}</option>)}
                      </select>
                      <Button variant="secondary" onClick={() => handleAddCandidate(pos.position_id)} disabled={!addingCandidateMap[pos.position_id]}>+</Button>
                    </div>
                  )}
                  {isDraft && isFull && (
                    <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "#22c55e" }}>✓ All slots filled</p>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        {/* RIGHT COLUMN — live tracking (only when active) */}
        {isActive && (
          <div style={{ position: "sticky", top: 24 }}>
            <LiveTrackingSection electionId={electionId} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── shared styles ─────────────────────────────────────────── */
const cardStyle    = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const sectionTitle = { margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 };
const lockedLabel  = { fontSize: "0.68rem", fontWeight: 500, color: "#9ca3af", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 4, padding: "1px 6px" };
const candidateRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 6, background: "#f9fafb", border: "1px solid #f3f4f6" };
const selectStyle  = { border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 9px", fontSize: "0.82rem", background: "#fff" };