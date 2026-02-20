import { useState, useEffect } from "react";
import { electionTrackingApi } from "../../../apis/electionTrackingApi";
import PositionBarChart from "../components/PositionBarChart";
import { THEME } from "../components/chartColors";

const { SURFACE, BORDER, TEXT, MUTED } = THEME;

export default function FinalResultsSection({ electionId }) {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);

    useEffect(() => {
    let mounted = true;

    const fetchResults = async () => {
        try {
        const res = await electionTrackingApi.getFinal(electionId);
        if (mounted) { setData(res); setError(null); }
        } catch (err) {
        if (mounted) setError("Failed to load final results");
        console.error(err);
        }
    };

    fetchResults();
    return () => { mounted = false; };
    }, [electionId]);

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <h3 style={{ margin: 0, color: TEXT, fontSize: "0.95rem", fontWeight: 700 }}>🏁 Final Results</h3>
      </div>
      <p style={{ margin: "0 0 16px", color: MUTED, fontSize: "0.78rem" }}>
        Election has ended · results are final
      </p>

      {error   && <div style={{ color: "#f87171" }}>{error}</div>}
      {!data && !error && <div style={{ color: MUTED }}>Loading final results…</div>}
      {data?.positions?.length === 0 && <div style={{ color: MUTED }}>No results available.</div>}

      {data?.positions && (
        <div>
          {data.positions.map((pos) => (
            <PositionBarChart key={pos.position_id} position={pos} />
          ))}
        </div>
      )}
    </div>
  );
}