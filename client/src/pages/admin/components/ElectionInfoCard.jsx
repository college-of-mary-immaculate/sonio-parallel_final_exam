import Button from "../../../components/Button";

// Shared inline styles
const fieldStyle = {
  wrapper: { display: "flex", flexDirection: "column", gap: 4 },
  label:   { fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" },
  input:   {
    border: "1px solid #d1d5db", borderRadius: 6,
    padding: "7px 10px", fontSize: "0.875rem", background: "#fff",
  },
};

function EditableField({ label, name, value, type = "text", onChange, disabled }) {
  return (
    <div style={fieldStyle.wrapper}>
      <label style={fieldStyle.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ ...fieldStyle.input, background: disabled ? "#f9fafb" : "#fff", color: disabled ? "#9ca3af" : "#111" }}
      />
    </div>
  );
}

const STATUS_OPTIONS = ["draft", "pending", "active", "ended"];

export default function ElectionInfoCard({ formInfo, isDraft, infoSaving, onChange, onSave }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={sectionTitle}>Election Info</h3>
        {!isDraft && <span style={lockedLabel}>read-only</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <EditableField label="Title"      name="title"      value={formInfo.title}      onChange={onChange} disabled={false} />
        <EditableField label="Start Date" name="start_date" value={formInfo.start_date} onChange={onChange} disabled={!isDraft} type="date" />
        <EditableField label="End Date"   name="end_date"   value={formInfo.end_date}   onChange={onChange} disabled={!isDraft} type="date" />

        <div style={fieldStyle.wrapper}>
          <label style={fieldStyle.label}>Status</label>
          <select
            name="status"
            value={formInfo.status}
            onChange={onChange}
            style={{ ...fieldStyle.input }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={onSave} disabled={infoSaving}>
        {infoSaving ? "Saving..." : isDraft ? "Save Changes" : "Update Status"}
      </Button>
    </div>
  );
}

const cardStyle = {
  background: "#fff", border: "1px solid #e5e7eb",
  borderRadius: 10, padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 20,
};
const sectionTitle = { margin: 0, fontSize: "0.95rem", fontWeight: 700 };
const lockedLabel  = {
  fontSize: "0.72rem", fontWeight: 500, color: "#9ca3af",
  background: "#f3f4f6", border: "1px solid #e5e7eb",
  borderRadius: 4, padding: "1px 6px",
};