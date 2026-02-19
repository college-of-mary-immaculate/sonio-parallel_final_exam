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

      const electionPositions =
        await electionPositionApi.getByElection(electionId);

      setElection(electionData);
      setPositions(electionPositions);

    } catch(err) {

      console.error(err);
      alert("Failed loading election config");

    }
  };

  useEffect(() => {
    loadData();
  }, [electionId]);

  return (
    <div className="admin-page admin-election-config-page">

      <h2>Election Config: {election?.title}</h2>

      <p>Status: {election?.status}</p>
      <p>Start: {election?.start_date}</p>
      <p>End: {election?.end_date}</p>

      <div className="positions-container">

        {positions.map(pos => (

          <div key={pos.position_id} className="position-card">

            <h3>{pos.name}</h3>

            <p>
              Winners: {pos.winners_count}
            </p>

            <p>
              Votes per voter: {pos.votes_per_voter}
            </p>

            <Button>
              Add Candidate
            </Button>

          </div>

        ))}

      </div>

    </div>
  );
}
