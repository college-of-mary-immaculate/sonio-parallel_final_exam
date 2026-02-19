import { useEffect, useState } from "react";
import { electionApi } from "../../apis/electionApi";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function UserElectionsPage() {

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {

      // ✅ use voter-safe endpoint
      const data = await electionApi.getPublic();

      setElections(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading elections...</div>;

  return (
    <div>

      <h2>Available Elections</h2>

      {elections.map(election => (
        <div key={election.election_id}>

          <h3>{election.title}</h3>

          <p>Status: {election.status}</p>

          <p>
            {new Date(election.start_date).toLocaleString()}
            {" - "}
            {new Date(election.end_date).toLocaleString()}
          </p>

          {election.status === "active" ? (
            <Button onClick={() =>
              navigate(`/vote/${election.election_id}`)
            }>
              Vote Now
            </Button>
          ) : (
            <Button onClick={() =>
              navigate(`/elections/${election.election_id}`)
            }>
              View Details
            </Button>
          )}

        </div>
      ))}

    </div>
  );
}
