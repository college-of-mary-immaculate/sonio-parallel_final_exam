import CandidateCard from "./CandidateCard";

export default function PositionSection({ position, index, selectedIds, onSelect }) {
  const max = position.votes_per_voter ?? 1;
  const isFull = selectedIds.length >= max;

  return (
    <section className="bp-position">
      <div className="bp-position-header">
        <div className="bp-position-number">{index + 1}</div>
        <h2 className="bp-position-name">{position.name}</h2>
        <span className="bp-position-limit">Select up to {max}</span>
        <span className={`bp-position-tally${isFull ? " full" : ""}`}>
          {selectedIds.length} / {max}
        </span>
      </div>
      <div className="bp-position-divider" />

      {position.candidates?.length > 0 ? (
        <div className="bp-candidates">
          {position.candidates.map((c) => (
            <CandidateCard
              key={`${position.position_id}-${c.candidate_id}`}
              candidate={c}
              selected={selectedIds.includes(c.candidate_id)}
              onSelect={() => onSelect(position.position_id, c.candidate_id)}
            />
          ))}
        </div>
      ) : (
        <div className="bp-no-candidates">
          No candidates have been assigned to this position yet.
        </div>
      )}
    </section>
  );
}