import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { electionApi } from "../../../apis/electionApi";
import "../../../css/components/CandidateFormModal.css";

export default function ElectionFormModal({ election, onClose, onSaved }) {
  const isEdit = !!election;
  const [form, setForm] = useState({
    title: "",
    start_date: "",
    end_date: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (election) {
      setForm({
        title: election.title || "",
        start_date: election.start_date?.split("T")[0] || "",
        end_date: election.end_date?.split("T")[0] || "",
        status: election.status || "draft",
      });
    }
  }, [election]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let saved;

      if (isEdit) {
        saved = await electionApi.update(election.election_id, form);
      } else {
        // Add created_by = 1 for now (admin)
        saved = await electionApi.create({ ...form, created_by: 1 });
      }

      onSaved(saved);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{isEdit ? "Edit Election" : "Create Election"}</h3>

        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Start Date
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </label>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
