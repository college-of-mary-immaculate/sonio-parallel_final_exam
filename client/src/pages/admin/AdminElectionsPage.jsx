import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin/AdminPage.css";
import Button from "../../components/Button";
import ElectionFormModal from "./components/ElectionFormModal";
import { electionApi } from "../../apis/electionApi";

// ── SSR guard ─────────────────────────────────────────────────────
const isBrowser = typeof window !== "undefined";

export default function AdminElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingElection, setEditingElection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await electionApi.getAll();
      const electionsArray = Array.isArray(response)
        ? response
        : response.elections || [];
      const sorted = electionsArray
        .slice()
        .sort((a, b) => (a.election_id ?? 0) - (b.election_id ?? 0));
      setElections(sorted);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleView = (election) => {
    if (!election?.election_id) return;
    navigate(`/admin/elections/${election.election_id}`);
  };

  const handleEdit = (election) => {
    setEditingElection(election);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    // ✅ FIX: bare confirm() is a browser global — will ReferenceError on server
    if (!isBrowser || !window.confirm("Are you sure you want to delete this election?")) return;

    try {
      await electionApi.delete(id);
      setElections(prev => prev.filter(e => e.election_id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  // ===============================
  // Render
  // ===============================
  return (
    <div className="admin-page admin-elections-page">

      {/* Header */}
      <div className="page-header">
        <h2>Election Management</h2>

        <Button
          onClick={() => {
            setEditingElection(null);
            setModalOpen(true);
          }}
        >
          + Add Election
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="page-empty">Loading elections...</p>
      ) : elections.length === 0 ? (
        <p className="page-empty">No elections found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {elections.map((e, index) => (
              <tr key={e.election_id ?? index}>
                <td data-label="ID">{e.election_id ?? "-"}</td>
                <td data-label="Title">{e.title ?? "-"}</td>
                <td data-label="Start">{e.start_date?.split("T")[0] ?? "-"}</td>
                <td data-label="End">{e.end_date?.split("T")[0] ?? "-"}</td>
                <td data-label="Status">{e.status ?? "-"}</td>

                <td data-label="Actions">

                  {/* NEW VIEW BUTTON */}
                  <Button
                    variant="info"
                    onClick={() => handleView(e)}
                  >
                    View
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(e)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => handleDelete(e.election_id)}
                    disabled={!e.election_id}
                  >
                    Delete
                  </Button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {modalOpen && (
        <ElectionFormModal
          election={editingElection}
          onSaved={(savedElection) => {
            if (!savedElection) {
              setModalOpen(false);
              return;
            }

            setElections(prev => {
              const exists = prev.some(
                e => e.election_id === savedElection.election_id
              );

              const updated = exists
                ? prev.map(e =>
                    e.election_id === savedElection.election_id
                      ? savedElection
                      : e
                  )
                : [...prev, savedElection];

              return updated.sort(
                (a, b) => (a.election_id ?? 0) - (b.election_id ?? 0)
              );
            });

            setModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
