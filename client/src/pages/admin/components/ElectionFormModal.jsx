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
    created_by: 1, // default admin
  });
  const [saving, setSaving] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (election) {
      setForm({
        title: election.title ?? "",
        start_date: election.start_date?.split("T")[0] ?? "",
        end_date: election.end_date?.split("T")[0] ?? "",
        status: election.status ?? "draft",
        created_by: election.created_by ?? 1,
      });
    }
  }, [election]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

    const handleSave = async () => {
    try {
        setSaving(true);

        let savedElection;

        if (isEdit) {
        // Call update endpoint instead of alert
        savedElection = await electionApi.update(election.election_id, form);
        } else {
        savedElection = await electionApi.create(form);
        }

        onSaved(savedElection);
        onClose();
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || err.message || "Save failed");
    } finally {
        setSaving(false);
    }
    };


  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{isEdit ? "Edit Election (disabled)" : "Create Election"}</h3>

        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter election title"
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
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
