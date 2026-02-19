import { useEffect, useState } from "react";
import "../../css/admin/AdminPage.css";           // shared admin base
import "../../css/admin/AdminPositionsPage.css";  // page-specific overrides
import Button from "../../components/Button";
import PositionFormModal from "./components/PositionFormModal";
import { positionApi } from "../../apis/positionApi";

export default function AdminPositionsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const data = await positionApi.getAll();
      setPositions(data.slice().sort((a, b) => a.position_id - b.position_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleEdit = (position) => {
    setEditingPosition(position);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    try {
      await positionApi.delete(id);
      setPositions(prev => prev.filter(p => p.position_id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleSaved = () => {
    // Backend returns the latest, so simply refetch
    fetchPositions();
    setModalOpen(false);
  };

  return (
    <div className="admin-page admin-positions-page">

      {/* Header */}
      <div className="page-header">
        <h2>Position Management</h2>
        <Button onClick={() => { setEditingPosition(null); setModalOpen(true); }}>
          + Add Position
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="page-empty">Loading positions...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Position Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => (
              <tr key={pos.position_id}>
                <td data-label="ID">{pos.position_id}</td>
                <td data-label="Position Name">{pos.name}</td>
                <td data-label="Description">{pos.description}</td>
                <td data-label="Actions">
                  <Button variant="secondary" onClick={() => handleEdit(pos)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(pos.position_id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {modalOpen && (
        <PositionFormModal
          isOpen={modalOpen}
          position={editingPosition}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
