import { useEffect, useState } from "react";
import { electionApi } from "../../apis/electionApi";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

// ─── Page-level styles ────────────────────────────────────────────────────────
// Hooks into your existing CSS variables — override these in your globals if
// the names differ. The component itself stays theme-agnostic.
const styles = `
  .uel-page {
    padding: var(--page-padding, 2rem);
    max-width: var(--content-max-width, 860px);
    margin: 0 auto;
  }

  /* ── Header ── */
  .uel-header {
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--color-primary, #22c55e);
    padding-bottom: 1rem;
  }
  .uel-header h2 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-text-heading, #111827);
    margin: 0 0 0.25rem;
  }
  .uel-header p {
    font-size: 0.875rem;
    color: var(--color-text-muted, #6b7280);
    margin: 0;
  }

  /* ── Loading skeleton ── */
  .uel-loading {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .uel-skeleton {
    height: 110px;
    border-radius: var(--radius-card, 10px);
    background: linear-gradient(
      90deg,
      var(--color-skeleton-base, #e5e7eb) 25%,
      var(--color-skeleton-shine, #f3f4f6) 50%,
      var(--color-skeleton-base, #e5e7eb) 75%
    );
    background-size: 200% 100%;
    animation: uel-shimmer 1.4s infinite;
  }
  @keyframes uel-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Grid ── */
  .uel-grid {
    display: grid;
    gap: 1rem;
  }

  /* ── Card ── */
  .uel-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-left: 4px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-card, 10px);
    box-shadow: var(--shadow-card, 0 1px 3px rgba(0,0,0,0.06));
    transition: box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .uel-card:hover {
    box-shadow: var(--shadow-card-hover, 0 4px 12px rgba(0,0,0,0.10));
  }
  .uel-card--active {
    border-left-color: var(--color-primary, #22c55e);
  }
  .uel-card--upcoming {
    border-left-color: var(--color-warning, #f59e0b);
  }
  .uel-card--closed {
    border-left-color: var(--color-border, #d1d5db);
    opacity: 0.82;
  }

  /* Card body */
  .uel-card__body {
    flex: 1;
    min-width: 0;
  }
  .uel-card__top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 0.4rem;
  }
  .uel-card__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-heading, #111827);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Status badge */
  .uel-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.18rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .uel-badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .uel-badge--active {
    background: var(--color-primary-subtle, #dcfce7);
    color: var(--color-primary-dark, #15803d);
  }
  .uel-badge--active::before {
    animation: uel-pulse 1.4s infinite;
  }
  @keyframes uel-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .uel-badge--upcoming {
    background: var(--color-warning-subtle, #fef3c7);
    color: var(--color-warning-dark, #b45309);
  }
  .uel-badge--closed {
    background: var(--color-neutral-subtle, #f3f4f6);
    color: var(--color-text-muted, #6b7280);
  }

  /* Date row */
  .uel-card__dates {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--color-text-muted, #6b7280);
  }
  .uel-card__dates svg {
    flex-shrink: 0;
    opacity: 0.6;
  }
  .uel-date-sep {
    opacity: 0.4;
  }

  /* Card action */
  .uel-card__action {
    flex-shrink: 0;
  }

  /* ── Empty state ── */
  .uel-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    border: 2px dashed var(--color-border, #d1d5db);
    border-radius: var(--radius-card, 10px);
    background: var(--color-surface, #ffffff);
  }
  .uel-empty__icon {
    width: 56px;
    height: 56px;
    margin-bottom: 1rem;
    color: var(--color-primary, #22c55e);
    opacity: 0.4;
  }
  .uel-empty h3 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-text-heading, #111827);
    margin: 0 0 0.4rem;
  }
  .uel-empty p {
    font-size: 0.875rem;
    color: var(--color-text-muted, #6b7280);
    margin: 0;
    max-width: 280px;
  }

  /* ── Error ── */
  .uel-error {
    padding: 1rem 1.25rem;
    border-radius: var(--radius-card, 10px);
    background: var(--color-danger-subtle, #fee2e2);
    color: var(--color-danger, #dc2626);
    font-size: 0.875rem;
    border: 1px solid var(--color-danger-border, #fca5a5);
  }

  /* ── Responsive ── */
  @media (max-width: 560px) {
    .uel-page { padding: var(--page-padding-mobile, 1rem); }
    .uel-card {
      flex-direction: column;
      align-items: flex-start;
    }
    .uel-card__action { width: 100%; }
    .uel-card__action button { width: 100%; justify-content: center; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const map = {
    active:   { label: "Active",   cls: "uel-badge--active" },
    upcoming: { label: "Upcoming", cls: "uel-badge--upcoming" },
    closed:   { label: "Closed",   cls: "uel-badge--closed" },
    ended:    { label: "Ended",    cls: "uel-badge--closed" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "uel-badge--closed" };
  return <span className={`uel-badge ${cls}`}>{label}</span>;
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="12" rx="2" />
      <path d="M5 1v4M11 1v4M1 7h14" />
    </svg>
  );
}

function BallotEmptyIcon() {
  return (
    <svg className="uel-empty__icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="10" y="8" width="44" height="52" rx="4" />
      <path d="M20 24h24M20 32h24M20 40h14" strokeLinecap="round" />
      <circle cx="48" cy="48" r="10" fill="var(--color-surface,#fff)" />
      <path d="M44 48h8M48 44v8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setError(null);
      const data = await electionApi.getPublic();
      setElections(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load elections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Scoped styles — no extra CSS file needed */}
      <style>{styles}</style>

      <div className="uel-page">

        {/* ── Header ── */}
        <header className="uel-header">
          <h2>Available Elections</h2>
          <p>Cast your vote or review results for ongoing and past elections.</p>
        </header>

        {/* ── Loading ── */}
        {loading && (
          <div className="uel-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="uel-skeleton" />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="uel-error">{error}</div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && elections.length === 0 && (
          <div className="uel-empty">
            <BallotEmptyIcon />
            <h3>No elections available</h3>
            <p>There are no elections scheduled right now. Check back later.</p>
          </div>
        )}

        {/* ── Election cards ── */}
        {!loading && !error && elections.length > 0 && (
          <div className="uel-grid">
            {elections.map(election => (
              <div
                key={election.election_id}
                className={`uel-card uel-card--${election.status}`}
              >
                <div className="uel-card__body">
                  <div className="uel-card__top">
                    <h3 className="uel-card__title">{election.title}</h3>
                    <StatusBadge status={election.status} />
                  </div>
                  <div className="uel-card__dates">
                    <CalendarIcon />
                    <span>{formatDate(election.start_date)}</span>
                    <span className="uel-date-sep">→</span>
                    <span>{formatDate(election.end_date)}</span>
                  </div>
                </div>

                <div className="uel-card__action">
                  {election.status === "active" ? (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/vote/${election.election_id}`)}
                    >
                      Vote Now
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/elections/${election.election_id}`)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}