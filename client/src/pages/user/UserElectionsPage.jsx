import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { electionApi } from "../../apis/electionApi";
import { useSSRData } from "../../context/SSRContext";
import Button from "../../components/Button";
import s from "../../css/pages/UserElectionsPage.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="12" rx="2" />
      <path d="M5 1v4M11 1v4M1 7h14" />
    </svg>
  );
}

function BallotIcon() {
  return (
    <svg className={s.emptyIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="10" y="8" width="44" height="52" rx="4" />
      <path d="M20 24h24M20 32h24M20 40h14" strokeLinecap="round" />
      <circle cx="48" cy="48" r="10" fill="white" />
      <path d="M44 48h8M48 44v8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const BADGE_CLASS = {
  active:   s.badgeActive,
  upcoming: s.badgeUpcoming,
  closed:   s.badgeClosed,
  ended:    s.badgeClosed,
};

const BADGE_LABEL = {
  active: "Active", upcoming: "Upcoming", closed: "Closed", ended: "Ended",
};

const CARD_STATUS_CLASS = {
  active:   s.cardActive,
  upcoming: s.cardUpcoming,
  closed:   s.cardClosed,
  ended:    s.cardClosed,
};

function StatusBadge({ status }) {
  return (
    <span className={`${s.badge} ${BADGE_CLASS[status] ?? s.badgeClosed}`}>
      {BADGE_LABEL[status] ?? status}
    </span>
  );
}

function ElectionCard({ election }) {
  const navigate = useNavigate();
  const isActive = election.status === "active";

  return (
    <div className={`${s.card} ${CARD_STATUS_CLASS[election.status] ?? ""}`}>
      <div className={s.cardBody}>
        <div className={s.cardTop}>
          <h3 className={s.cardTitle}>{election.title}</h3>
          <StatusBadge status={election.status} />
        </div>
        <div className={s.cardDates}>
          <CalendarIcon />
          <span>{formatDate(election.start_date)}</span>
          <span className={s.dateSep}>→</span>
          <span>{formatDate(election.end_date)}</span>
        </div>
      </div>

      <div className={s.cardAction}>
        {isActive ? (
          <Button variant="primary" onClick={() => navigate(`/vote/${election.election_id}`)}>
            Vote Now
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => navigate(`/elections/${election.election_id}`)}>
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className={s.skeletonList}>
      {[1, 2, 3].map(i => <div key={i} className={s.skeleton} />)}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={s.empty}>
      <BallotIcon />
      <h3>No elections available</h3>
      <p>There are no elections scheduled right now. Check back later.</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return <div className={s.error}>{message}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserElectionsPage() {
  const ssrData = useSSRData();

  // ✅ Pre-populate from SSR data if available — no loading flash
  const [elections, setElections] = useState(ssrData.elections || []);
  const [loading, setLoading]     = useState(!ssrData.elections);
  const [error, setError]         = useState(null);

  useEffect(() => {
    // ✅ Skip client fetch if SSR already provided the data
    if (ssrData.elections) return;
    load();
  }, []);

  async function load() {
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
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h2>Available Elections</h2>
        <p>Cast your vote or review results for ongoing and past elections.</p>
      </header>

      {loading && <LoadingSkeleton />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && elections.length === 0 && <EmptyState />}
      {!loading && !error && elections.length > 0 && (
        <div className={s.grid}>
          {elections.map(election => (
            <ElectionCard key={election.election_id} election={election} />
          ))}
        </div>
      )}
    </div>
  );
}