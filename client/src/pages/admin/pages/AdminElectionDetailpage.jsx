import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { electionApi } from "../../../apis/electionApi";
import { electionPositionApi } from "../../../apis/electionPositionApi";
import { electionCandidateApi } from "../../../apis/electionCandidateApi";
import { positionApi } from "../../../apis/positionApi";
import { getAllCandidates } from "../../../apis/candidateApi";

import ElectionInfoCard    from "../components/ElectionInfoCard";
import BallotPositionsCard from "../components/BallotPositionsCard";
import LiveTrackingSection from "./LiveTrackingSection";
import FinalResultsSection from "./FinalResultsSection";

import "../../../css/admin/AdminPage.css";

// ── Status badge ──────────────────────────────────────────────────────────────
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
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      background: `${color}22`, color, fontWeight: 600, fontSize: "0.78rem",
    }}>
      {label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminElectionDetailPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election,         setElection]         = useState(null);
  const [formInfo,         setFormInfo]         = useState({ title: "", start_date: "", end_date: "", status: "draft" });
  const [infoSaving,       setInfoSaving]       = useState(false);
  const [positions,        setPositions]        = useState([]);
  const [candidates,       setCandidates]       = useState([]);
  const [globalPositions,  setGlobalPositions]  = useState([]);
  const [globalCandidates, setGlobalCandidates] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [addingPositionId, setAddingPositionId] = useState("");
  const [addingCandidateMap, setAddingCandidateMap] = useState({});
  const [replicaSyncing, setReplicaSyncing] = useState(false);

  const isBrowser = typeof window !== "undefined";
  // ── Load ──────────────────────────────────────────────────────────────────
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

  // ── Derived state ─────────────────────────────────────────────────────────
  const isDraft  = election?.status === "draft";
  const isActive = election?.status === "active";
  const isEnded  = election?.status === "ended" || (election?.end_date && new Date() >= new Date(election.end_date));

  const availablePositions = globalPositions.filter(
    (gp) => !positions.some((p) => String(p.position_id) === String(gp.position_id))
  );

  const availableCandidates = (positionId) =>
    globalCandidates.filter(
      (gc) => !candidates.some(
        (c) => String(c.candidate_id) === String(gc.candidate_id) &&
               String(c.position_id)  === String(positionId)
      )
    );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFormInfo((prev) => ({ ...prev, [name]: value }));
  };

// AdminElectionDetailPage.jsx

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

  if (updated.status === "ended") {
    setReplicaSyncing(true);

    // wait for slave DB replication
    setTimeout(() => {
      setReplicaSyncing(false);
    }, 2000);
  }

    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    } finally {
      setInfoSaving(false);
    }
  };

  const handleAddPosition = async () => {
    if (!addingPositionId) return;
    try {
      await electionPositionApi.add(electionId, addingPositionId, {
        candidate_count: 2, winners_count: 1, votes_per_voter: 1,
      });
      setAddingPositionId("");
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add position");
    }
  };

  const handleRemovePosition = async (positionId) => {
    // ✅ FIX: bare confirm()
    if (!isBrowser || !window.confirm("Remove this position and all its candidates from the election?")) return;
    try {
      await electionPositionApi.remove(electionId, positionId);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove position");
    }
  };

  const handleAddCandidate = async (positionId) => {
    const candidateId = addingCandidateMap[positionId];
    if (!candidateId) return;
    try {
      await electionCandidateApi.add(electionId, positionId, candidateId);
      setAddingCandidateMap((prev) => ({ ...prev, [positionId]: "" }));
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add candidate");
    }
  };

  const handleRemoveCandidate = async (positionId, candidateId) => {
    // ✅ FIX: bare confirm()
    if (!isBrowser || !window.confirm("Remove this candidate?")) return;
    try {
      await electionCandidateApi.remove(electionId, positionId, candidateId);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove candidate");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading)   return <div style={{ padding: 40, color: "#6b7280" }}>Loading...</div>;
  if (!election) return <div style={{ padding: 40, color: "#6b7280" }}>Election not found.</div>;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/admin/elections")}
        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", marginBottom: 16, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 4 }}
      >
        ← Back to Elections
      </button>

      {/* Page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{election.title}</h1>
        <StatusBadge status={election.status} />
      </div>

      {/* Info card */}
      <ElectionInfoCard
        formInfo={formInfo}
        isDraft={isDraft}
        infoSaving={infoSaving}
        onChange={handleInfoChange}
        onSave={handleSaveInfo}
      />

      {/* Live / final tracking */}
    {isActive && <LiveTrackingSection electionId={electionId} />}

    {isEnded && replicaSyncing && (
      <div style={{ padding: 20, color: "#6b7280" }}>
        Finalizing results…
      </div>
    )}

    {isEnded && !replicaSyncing && (
      <FinalResultsSection electionId={electionId} />
    )}

      {/* Ballot positions */}
      <BallotPositionsCard
        isDraft={isDraft}
        positions={positions}
        candidates={candidates}
        availablePositions={availablePositions}
        availableCandidates={availableCandidates}
        addingPositionId={addingPositionId}
        addingCandidateMap={addingCandidateMap}
        onPositionIdChange={setAddingPositionId}
        onAddPosition={handleAddPosition}
        onRemovePosition={handleRemovePosition}
        onCandidateIdChange={(posId, val) =>
          setAddingCandidateMap((prev) => ({ ...prev, [posId]: val }))
        }
        onAddCandidate={handleAddCandidate}
        onRemoveCandidate={handleRemoveCandidate}
      />
    </div>
  );
}