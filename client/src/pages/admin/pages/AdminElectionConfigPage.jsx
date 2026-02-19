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
      let electionPositions = await electionPositionApi.getByElection(electionId);

      // If no positions yet, show placeholders
      if (!electionPositions.length) {
        electionPositions = [
          {
            position_id: 1,
            name: "President",
            winners_count: 1,
            votes_per_voter: 1,
            candidates: [
              { candidate_id: 1, full_name: "John Doe" },
              { candidate_id: 2, full_name: "Jane Smith" },
            ],
          },
          {
            position_id: 2,
            name: "Vice President",
            winners_count: 1,
            votes_per_voter: 1,
            candidates: [],
          },
        ];
      }

      setElection(electionData);
      setPositions(electionPositions);
    } catch (err) {
      console.error(err);
      alert("Failed loading election config");
    }
  };

  useEffect(() => {
    loadData();
  }, [electionId]);

  // Format ISO date to readable string
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="admin-page admin-election-config-page">
      <h2>Election Config: {election?.title}</h2>

      <p>Status: {election?.status}</p>
      <p>Start: {formatDate(election?.start_date)}</p>
      <p>End: {formatDate(election?.end_date)}</p>

      <div className="positions-container">
        {positions.map((pos) => (
          <div key={pos.position_id} className="position-card">
            <h3>{pos.name}</h3>
            <p>Winners: {pos.winners_count}</p>
            <p>Votes per voter: {pos.votes_per_voter}</p>

            <div className="candidates-list">
              <h4>Candidates:</h4>
              {pos.candidates && pos.candidates.length > 0 ? (
                <ul>
                  {pos.candidates.map((c) => (
                    <li key={c.candidate_id}>{c.full_name}</li>
                  ))}
                </ul>
              ) : (
                <p>No candidates yet</p>
              )}
            </div>

            <Button>Add Candidate</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
