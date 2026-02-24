import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { electionPositionApi } from "../../apis/electionPositionApi";
import { electionCandidateApi } from "../../apis/electionCandidateApi";
import mainApi from "../../apis/mainApi";
import ballotStyles from "./components/ballotStyles";
import PositionSection from "./components/PositionSection";
import BallotSubmitBar from "./components/BallotSubmitBar";
import { AlertIcon, BallotHeaderIcon, BanIcon } from "./components/BallotIcons";
import SuccessModal from "./components/SuccessModal";

/* ─── helpers ────────────────────────────────────────────────── */
function totalVotesCast(votes) {
  return Object.values(votes).reduce((acc, arr) => acc + arr.length, 0);
}

function positionsVoted(votes) {
  return Object.values(votes).filter((a) => a.length > 0).length;
}

/* ─── SSR guard ──────────────────────────────────────────────── */
const isBrowser = typeof window !== "undefined";

/* ─── BallotPage ─────────────────────────────────────────────── */
export default function BallotPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [votes, setVotes] = useState({});
  // KEY CHANGE: start as true only in browser, false on server
  const [loading, setLoading] = useState(isBrowser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* ── fetch ballot data — client only ── */
  useEffect(() => {
    // useEffect never runs on server, so this is already safe.
    // The isBrowser check on useState(isBrowser) above means
    // the server renders the loading skeleton as the SSR shell.
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

      setSubmitted(true); // show modal instead of navigating immediately
    } catch (err) {
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

  /* ── loading state — this is what the SERVER renders as the shell ── */
  if (loading) {
    return (
      <>
        <style>{ballotStyles}</style>
        <div className="bp-loading-wrap">
          <div className="bp-loading-spinner" />
          <p className="bp-loading-title">Loading Ballot</p>
          <p className="bp-loading-sub">Fetching your ballot, please wait…</p>
        </div>
      </>
    );
  }

  /* ── error state (failed to load) ── */
  if (error && positions.length === 0) {
    return (
      <>
        <style>{ballotStyles}</style>
        <div className="bp-error-wrap">
          <BanIcon />
          <p className="bp-error-title">Unable to Load Ballot</p>
          <p className="bp-error-sub">{error}</p>
        </div>
      </>
    );
  }

  /* ── main ballot ── */
  return (
    <>
      <style>{ballotStyles}</style>

      {/* ── success modal ── */}
      {submitted && (
        <SuccessModal onGoBack={() => navigate("/elections")} />
      )}

      {/* sticky header */}
      <div className="bp-header">
        <BallotHeaderIcon />
        <span className="bp-header-title">Official Ballot</span>
        <span className="bp-header-badge">
          {positions.length} position{positions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* main content */}
      <div className="bp-content">
        <p className="bp-intro">
          Cast Your Vote
        </p>
        <p className="bp-intro-sub">
          Review each position below and click on a candidate to select them. You may select up to
          the limit shown per position. Leaving a position blank is allowed — participation is your
          choice.
        </p>

        {/* submit error */}
        {error && (
          <div className="bp-submit-error">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* positions */}
        {positions.map((position, index) => (
          <PositionSection
            key={position.position_id}
            position={position}
            selectedIds={votes[position.position_id] || []}  // ✅ correct prop name
            onSelect={handleSelect}
            index={index}
          />
        ))}
      </div>

      {/* sticky submit bar */}
      <BallotSubmitBar
        totalVotes={totalVotesCast(votes)}
        positionsVoted={positionsVoted(votes)}
        totalPositions={positions.length}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {/* limit toast */}
      {toast && (
        <div className="bp-toast">
          <AlertIcon />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}