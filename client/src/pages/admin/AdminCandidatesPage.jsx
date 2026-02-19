import { useEffect, useState } from "react";
import "../../css/admin/AdminPage.css";           // ← shared admin base
import "../../css/admin/AdminCandidatesPage.css"; // ← page-specific overrides
import Button from "../../components/Button";
import { getAllCandidates, deleteCandidate } from "../../apis/candidateApi";
import CandidateFormModal from "./components/CandidateFormModal";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await getAllCandidates();
      setCandidates(data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCandidates(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await deleteCandidate(id);
      loadCandidates();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const openCreate = () => { setSelectedCandidate(null); setShowModal(true); };
  const openEdit   = (candidate) => { setSelectedCandidate(candidate); setShowModal(true); };

  return (
    <div className="admin-page admin-candidates-page">

      {/* ── Header ── */}
      <div className="page-header">
        <h2>Candidate Management</h2>
        <Button onClick={openCreate}>+ Add Candidate</Button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <p className="page-empty">Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Education</th>
              <th>Experience</th>
              <th>Primary Advocacy</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.candidate_id}>
                <td data-label="Name">{c.full_name}</td>
                <td data-label="Education">{c.education}</td>
                <td data-label="Experience">{c.years_experience} yrs</td>
                <td data-label="Primary Advocacy">{c.primary_advocacy}</td>
                <td data-label="Actions">
                  <Button variant="secondary" onClick={() => openEdit(c)}>Edit</Button>
                  <Button variant="danger"    onClick={() => handleDelete(c.candidate_id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <CandidateFormModal
          candidate={selectedCandidate}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadCandidates(); }}
        />
      )}
    </div>
  );
}