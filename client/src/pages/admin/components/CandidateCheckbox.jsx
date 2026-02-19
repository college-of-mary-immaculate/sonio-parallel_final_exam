// CandidateCheckbox.jsx
// A single candidate row inside a position's candidate picker.

export default function CandidateCheckbox({
  candidate,
  pickedHere,
  takenElsewhere,
  slotsFull,
  isDraft,
  onToggle,
}) {
  const isDisabled = !isDraft || takenElsewhere || slotsFull;

  const hint = takenElsewhere
    ? "Already assigned to another position"
    : slotsFull
    ? "Slot limit reached for this position"
    : undefined;

  return (
    <label
      title={hint}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 10px",
        borderRadius: 6,
        border: pickedHere
          ? "1.5px solid #3b82f6"
          : takenElsewhere
          ? "1.5px solid #fca5a5"
          : "1.5px solid #e5e7eb",
        background: pickedHere
          ? "#eff6ff"
          : takenElsewhere
          ? "#fff5f5"
          : slotsFull
          ? "#f9fafb"
          : "#fff",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: slotsFull && !pickedHere ? 0.45 : 1,
        fontSize: "0.82rem",
        fontWeight: pickedHere ? 600 : 400,
        color: pickedHere ? "#1d4ed8" : takenElsewhere ? "#ef4444" : "#374151",
        transition: "all 0.12s",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={pickedHere}
        onChange={onToggle}
        disabled={isDisabled}
        style={{ width: 13, height: 13, accentColor: "#3b82f6", flexShrink: 0 }}
      />
      <img
        src={candidate.image_url}
        alt={candidate.full_name}
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          objectFit: "cover",
          border: takenElsewhere ? "1.5px solid #fca5a5" : "1.5px solid #e5e7eb",
          flexShrink: 0,
          filter: takenElsewhere ? "grayscale(60%)" : "none",
        }}
        onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${candidate.candidate_id}`; }}
      />
      <span style={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {candidate.full_name}
      </span>
      {takenElsewhere && (
        <span style={{
          fontSize: "0.65rem",
          fontWeight: 600,
          color: "#ef4444",
          background: "#fee2e2",
          borderRadius: 4,
          padding: "1px 5px",
          flexShrink: 0,
          letterSpacing: "0.02em",
        }}>
          taken
        </span>
      )}
    </label>
  );
}