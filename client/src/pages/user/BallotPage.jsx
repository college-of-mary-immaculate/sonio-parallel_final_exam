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

/* ─── Success Modal ──────────────────────────────────────────── */
const successModalStyles = `
  .bpsm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
    animation: bpsm-fade-in 0.2s ease;
  }
  @keyframes bpsm-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .bpsm-card {
    background: var(--color-surface, #ffffff);
    border-radius: var(--radius-card, 14px);
    padding: 2.5rem 2rem 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
    animation: bpsm-slide-up 0.25s ease;
  }
  @keyframes bpsm-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .bpsm-icon-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--color-primary-subtle, #dcfce7);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
  .bpsm-icon-wrap svg {
    width: 36px;
    height: 36px;
    color: var(--color-primary-dark, #15803d);
    stroke: currentColor;
  }

  .bpsm-card h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--color-text-heading, #111827);
    margin: 0 0 0.5rem;
  }
  .bpsm-card p {
    font-size: 0.9rem;
    color: var(--color-text-muted, #6b7280);
    margin: 0 0 2rem;
    line-height: 1.6;
  }

  .bpsm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    width: 100%;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-btn, 8px);
    background: var(--color-primary, #22c55e);
    color: var(--color-primary-contrast, #ffffff);
    font-size: 0.95rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
  }
  .bpsm-btn:hover  { background: var(--color-primary-dark, #16a34a); }
  .bpsm-btn:active { transform: scale(0.98); }
  .bpsm-btn svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }
`;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function SuccessModal({ onGoBack }) {
  return (
    <>
      <style>{successModalStyles}</style>
      <div className="bpsm-overlay">
        <div className="bpsm-card" role="dialog" aria-modal="true" aria-labelledby="bpsm-title">
          <div className="bpsm-icon-wrap">
            <CheckIcon />
          </div>
          <h2 id="bpsm-title">Vote Submitted!</h2>
          <p>
            Your ballot has been recorded successfully.<br />
            Thank you for participating.
          </p>
          <button className="bpsm-btn" onClick={onGoBack}>
            <ArrowLeftIcon />
            Back to Elections
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── BallotPage ─────────────────────────────────────────────── */
export default function BallotPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [submitted, setSubmitted] = useState(false); // ← new

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

      setSubmitted(true); // ← show modal instead of navigating immediately
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

        {/* ── success modal ── */}
        {submitted && (
          <SuccessModal onGoBack={() => navigate("/elections")} />
        )}

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