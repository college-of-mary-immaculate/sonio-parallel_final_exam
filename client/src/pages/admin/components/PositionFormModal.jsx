import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { positionApi } from "../../../apis/positionApi";
import "../../../css/components/CandidateFormModal.css"; // reuse styles

export default function PositionFormModal({ isOpen, onClose, position, onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (position) {
      setName(position.name);
      setDescription(position.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [position]);

  const handleSave = async () => {
    try {
      setSaving(true);

      let savedPosition;
      if (position) {
        // update returns the updated object
        savedPosition = await positionApi.update(position.position_id, { name, description });
      } else {
        // create returns the new object with position_id
        savedPosition = await positionApi.create({ name, description });
      }

      // Pass the saved object back to parent for instant update
      onSaved(savedPosition);
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{position ? "Edit Position" : "Add Position"}</h3>

        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
