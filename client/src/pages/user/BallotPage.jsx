import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { electionPositionApi } from "../../apis/electionPositionApi";
import { electionCandidateApi } from "../../apis/electionCandidateApi"; // make sure this exports voter API
import mainApi from "../../apis/mainApi";
//import "../../css/ballot/BallotPage.css";

export default function BallotPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [votes, setVotes] = useState({}); // { [positionId]: [candidateIds] }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1️⃣ Get positions for voter
        const pos = await electionPositionApi.getForVoter(electionId);

        // 2️⃣ Get candidates for voter for each position
        for (const p of pos) {
          const candidates = await electionCandidateApi.getForVoter(
            electionId,
            p.position_id
          );
          p.candidates = candidates;
        }

        setPositions(pos);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load ballot.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [electionId]);

  const handleSelect = (positionId, candidateId) => {
    setVotes((prev) => {
      const current = prev[positionId] || [];
      const positionRule = positions.find((p) => p.position_id === positionId);
      const maxVotes = positionRule?.votes_per_voter || 1;

      let updated;
      if (current.includes(candidateId)) {
        updated = current.filter((id) => id !== candidateId);
      } else {
        if (current.length >= maxVotes) {
          alert(`You can only vote for ${maxVotes} candidate(s) in this position.`);
          return prev;
        }
        updated = [...current, candidateId];
      }

      return { ...prev, [positionId]: updated };
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      const voteArray = [];
      for (const [positionId, candidateIds] of Object.entries(votes)) {
        for (const candidateId of candidateIds) {
          voteArray.push({ positionId, candidateId });
        }
      }

      if (voteArray.length === 0) {
        alert("Please select at least one candidate before submitting.");
        return;
      }

      await mainApi.post("/api/votes/submit", {
        electionId,
        votes: voteArray,
      });

      alert("Your vote has been submitted successfully!");
      navigate("/"); // redirect after voting
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Vote failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading ballot...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="ballot-page">
      <h2>Election Ballot</h2>
      {positions.map((position) => (
        <div key={position.position_id} className="position-block">
          <h3>
            {position.name}{" "}
            <small>(Select up to {position.votes_per_voter})</small>
          </h3>
          <div className="candidates-list">
            {position.candidates.map((c) => (
              <div
                key={c.candidate_id}
                className={`candidate-card ${
                  votes[position.position_id]?.includes(c.candidate_id)
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleSelect(position.position_id, c.candidate_id)
                }
              >
                {c.image_url && <img src={c.image_url} alt={c.full_name} />}
                <div className="candidate-info">
                  <p className="name">{c.full_name}</p>
                  <p className="desc">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Vote"}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
