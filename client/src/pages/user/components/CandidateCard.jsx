import { CheckIcon } from "./BallotIcons";

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function CandidateCard({ candidate, selected, onSelect }) {
  return (
    <div
      className={`bp-card${selected ? " selected" : ""}`}
      onClick={onSelect}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onSelect()}
    >
      <div className="bp-card-stripe" />
      <div className="bp-check">
        <CheckIcon />
      </div>

      {candidate.image_url ? (
        <img
          className="bp-card-img"
          src={candidate.image_url}
          alt={candidate.full_name}
          loading="lazy"
        />
      ) : (
        <div className="bp-card-avatar">{initials(candidate.full_name)}</div>
      )}

      <div className="bp-card-body">
        <p className="bp-card-name">{candidate.full_name}</p>
        {candidate.description && (
          <p className="bp-card-desc">{candidate.description}</p>
        )}
      </div>
    </div>
  );
}