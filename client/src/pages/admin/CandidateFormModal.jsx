import { useState, useEffect } from "react";
import Button from "../../components/Button";
import {
  createCandidate,
  updateCandidate,
} from "../../apis/candidateApi";

export default function CandidateFormModal({
  candidate,
  onClose,
  onSuccess,
}) {
  const isEdit = !!candidate;

  const [form, setForm] = useState({
    full_name: "",
    background: "",
    education: "",
    years_experience: "",
    primary_advocacy: "",
    secondary_advocacy: "",
  });

  useEffect(() => {
    if (candidate) {
      setForm(candidate);
    }
  }, [candidate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateCandidate(candidate.candidate_id, form);
      } else {
        await createCandidate(form);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{isEdit ? "Edit Candidate" : "Create Candidate"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <textarea
            name="background"
            placeholder="Background"
            value={form.background}
            onChange={handleChange}
          />

          <input
            name="education"
            placeholder="Education"
            value={form.education}
            onChange={handleChange}
          />

          <input
            name="years_experience"
            type="number"
            placeholder="Years Experience"
            value={form.years_experience}
            onChange={handleChange}
          />

          <input
            name="primary_advocacy"
            placeholder="Primary Advocacy"
            value={form.primary_advocacy}
            onChange={handleChange}
          />

          <input
            name="secondary_advocacy"
            placeholder="Secondary Advocacy"
            value={form.secondary_advocacy}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <Button type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
