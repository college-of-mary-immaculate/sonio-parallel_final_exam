import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../css/admin/AdminPage.css";
import Button from "../../../components/Button";

import { electionApi } from "../../../apis/electionApi";
import { electionPositionApi } from "../../../apis/electionPositionApi";

export default function AdminElectionConfigPage() {
  const { electionId } = useParams();

  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);

  const loadData = async () => {
    try {
      const electionData = await electionApi.getById(electionId);
      const electionPositions = await electionPositionApi.getByElection(electionId);

      // Ensure each position has a candidates array
      const positionsWithCandidates = electionPositions.map((pos) => ({
        ...pos,
        candidates: pos.candidates || [],
      }));

      setElection(electionData);
      setPositions(positionsWithCandidates);
    } catch (err) {
      console.error(err);
      alert("Failed loading election config");
    }
  };

  useEffect(() => {
    loadData();
  }, [electionId]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Placeholder handlers for add buttons
  const handleAddPosition = () => {
    alert("Add Position clicked — implement modal or form here");
  };

  const handleAddCandidate = (positionId) => {
    alert(`Add Candidate clicked for position ${positionId} — implement modal or form here`);
  };

  return (
    <div className="admin-page admin-election-config-page">
      <h2>Election Config: {election?.title}</h2>
      <p>Status: {election?.status}</p>
      <p>Start: {formatDate(election?.start_date)}</p>
      <p>End: {formatDate(election?.end_date)}</p>

      <Button onClick={handleAddPosition} style={{ marginBottom: "1rem" }}>
        Add Position
      </Button>

      <div className="positions-container">
        {positions.map((pos) => (
          <div key={pos.position_id} className="position-card">
            <h3>{pos.name}</h3>
            <p>Winners: {pos.winners_count}</p>
            <p>Votes per voter: {pos.votes_per_voter}</p>

            <div className="candidates-list">
              <h4>Candidates:</h4>
              {pos.candidates.length > 0 ? (
                <ul>
                  {pos.candidates.map((c) => (
                    <li key={c.candidate_id}>{c.full_name}</li>
                  ))}
                </ul>
              ) : (
                <p>No candidates yet</p>
              )}
            </div>

            <Button onClick={() => handleAddCandidate(pos.position_id)}>
              Add Candidate
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
