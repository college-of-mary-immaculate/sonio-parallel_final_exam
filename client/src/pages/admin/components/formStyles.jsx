/* ─── formStyles.js ──────────────────────────────────────────────
   Shared style helpers for ElectionFormModal and PositionPicker.
─────────────────────────────────────────────────────────────── */

export function FieldLabel({ children }) {
  return (
    <p style={{
      margin: "0 0 4px",
      fontSize: "0.75rem",
      fontWeight: 600,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}>
      {children}
    </p>
  );
}

export const inputStyle = (editable) => ({
  width: "100%",
  padding: "8px 10px",
  border: editable ? "1px solid #d1d5db" : "1px solid #f3f4f6",
  borderRadius: 6,
  fontSize: "0.9rem",
  background: editable ? "#fff" : "#f9fafb",
  color: editable ? "#111" : "#6b7280",
  boxSizing: "border-box",
  outline: "none",
});

export const sectionLabel = {
  margin: "0 0 12px",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};