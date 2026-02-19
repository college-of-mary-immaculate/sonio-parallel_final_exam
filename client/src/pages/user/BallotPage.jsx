import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { electionPositionApi } from "../../apis/electionPositionApi";
import { electionCandidateApi } from "../../apis/electionCandidateApi";
import mainApi from "../../apis/mainApi";

import ballotStyles from "./components/ballotStyles";
import PositionSection from "./components/PositionSection";
import BallotSubmitBar from "./components/BallotSubmitBar";
import { AlertIcon, BallotHeaderIcon, BanIcon } from "./components/BallotIcons";

/* ─── helpers ────────────────────────────────────────────────── */
function totalVotesCast(votes) {
  return Object.values(votes).reduce((acc, arr) => acc + arr.length, 0);
}
function positionsVoted(votes) {
  return Object.values(votes).filter((a) => a.length > 0).length;
}

/* ─── BallotPage ─────────────────────────────────────────────── */
export default function BallotPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [votes, setVotes] = useState({});      // { [positionId]: candidateId[] }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  /* ── fetch ballot data ── */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const pos = await electionPositionApi.getForVoter(electionId);
        for (const p of pos) {
          p.candidates = await electionCandidateApi.getForVoter(electionId, p.position_id);
        }
        setPositions(pos);
      } catch (err) {
        setError(err.message || "Failed to load ballot.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [electionId]);

  /* ── toast ── */
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  /* ── selection logic ── */
  function handleSelect(positionId, candidateId) {
    setVotes((prev) => {
      const current = prev[positionId] || [];
      const pos = positions.find((p) => p.position_id === positionId);
      const max = pos?.votes_per_voter ?? 1;

      if (current.includes(candidateId)) {
        return { ...prev, [positionId]: current.filter((id) => id !== candidateId) };
      }
      if (current.length >= max) {
        showToast(
          max === 1
            ? "Only 1 candidate allowed for this position."
            : `Limit reached — up to ${max} candidates for this position.`
        );
        return prev;
      }
      return { ...prev, [positionId]: [...current, candidateId] };
    });
  }

  /* ── submit ── */
  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError("");

      // Cast IDs to numbers — Object.keys() returns strings, and the
      // backend candidate/position lookups expect integer types.
      const voteArray = Object.entries(votes).flatMap(([positionId, candidateIds]) =>
        candidateIds.map((candidateId) => ({
          positionId: Number(positionId),
          candidateId: Number(candidateId),
        }))
      );

      await mainApi.post("/api/votes/submit", {
        electionId: Number(electionId),
        votes: voteArray,
      });

      navigate("/", { state: { voted: true } });
    } catch (err) {
      // Surface the exact backend message so it's easy to diagnose
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Vote submission failed.";
      setError(msg);
      console.error("[BallotPage] submit error:", err.response?.data ?? err);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── loading state ── */
  if (loading) {
    return (
      <>
        <style>{ballotStyles}</style>
        <div className="bp-root">
          <div className="bp-state">
            <div className="bp-state-icon loading">
              <div className="bp-spinner" />
            </div>
            <h2>Loading Ballot</h2>
            <p>Fetching your ballot, please wait…</p>
          </div>
        </div>
      </>
    );
  }

  /* ── error state (failed to load) ── */
  if (error && positions.length === 0) {
    return (
      <>
        <style>{ballotStyles}</style>
        <div className="bp-root">
          <div className="bp-state">
            <div className="bp-state-icon error">
              <AlertIcon size={24} />
            </div>
            <h2>Unable to Load Ballot</h2>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  /* ── main ballot ── */
  return (
    <>
      <style>{ballotStyles}</style>
      <div className="bp-root">

        {/* sticky header */}
        <header className="bp-header">
          <div className="bp-header-left">
            <div className="bp-header-icon">
              <BallotHeaderIcon />
            </div>
            <span className="bp-header-title">Official Ballot</span>
          </div>
          <span className="bp-header-meta">
            {positions.length} position{positions.length !== 1 ? "s" : ""}
          </span>
        </header>

        {/* main content */}
        <main className="bp-body">
          <div className="bp-intro">
            <h1>Cast Your Vote</h1>
            <p>
              Review each position below and click on a candidate to select them.
              You may select up to the limit shown per position. Leaving a position
              blank is allowed — participation is your choice.
            </p>
          </div>

          {/* submit error */}
          {error && (
            <div className="bp-error-banner">
              <AlertIcon />
              {error}
            </div>
          )}

          {/* positions */}
          {positions.map((position, index) => (
            <PositionSection
              key={position.position_id}
              position={position}
              index={index}
              selectedIds={votes[position.position_id] || []}
              onSelect={handleSelect}
            />
          ))}
        </main>

        {/* sticky submit bar */}
        <BallotSubmitBar
          castCount={totalVotesCast(votes)}
          posCount={positionsVoted(votes)}
          submitting={submitting}
          onSubmit={handleSubmit}
        />

        {/* limit toast */}
        {toast && (
          <div className="bp-toast">
            <BanIcon />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}