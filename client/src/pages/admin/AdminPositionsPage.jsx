import { useEffect, useState } from "react";
import { positionApi } from "../../apis/positionApi";
import Button from "../../components/Button";
import PositionFormModal from "./components/PositionFormModal"; // modal
import "../../css/admin/AdminCandidatesPage.css";

export default function AdminPositionsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all positions on mount
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await positionApi.getAll();
      const sorted = data.slice().sort((a, b) => a.position_id - b.position_id);
      setPositions(sorted);
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
      // Optimistically remove from state
      setPositions(prev => prev.filter(p => p.position_id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    }
  };

  // Efficient "onSaved" handler
  const handleSaved = (savedPosition) => {
    setPositions(prev => {
      const exists = prev.find(p => p.position_id === savedPosition.position_id);
      let updated;
      if (exists) {
        // Update existing
        updated = prev.map(p =>
          p.position_id === savedPosition.position_id ? savedPosition : p
        );
      } else {
        // Add new
        updated = [...prev, savedPosition];
      }
      // Always sort by ID
      return updated.slice().sort((a, b) => a.position_id - b.position_id);
    });

    setModalOpen(false); // close modal instantly
  };

  return (
    <div className="admin-page">
      <h2>Position Management</h2>

      <Button
        variant="primary"
        onClick={() => {
          setEditingPosition(null);
          setModalOpen(true);
        }}
      >
        + Add Position
      </Button>

      {loading ? (
        <p>Loading positions...</p>
      ) : (
        <table className="admin-table">
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
                <td>{pos.position_id}</td>
                <td>{pos.name}</td>
                <td>{pos.description}</td>
                <td>
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(pos)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(pos.position_id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <PositionFormModal
          isOpen={modalOpen}
          position={editingPosition}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved} // pass our optimized handler
        />
      )}
    </div>
  );
}
