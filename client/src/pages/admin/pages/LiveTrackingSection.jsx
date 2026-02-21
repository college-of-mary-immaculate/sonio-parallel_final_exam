import { useState, useEffect, useRef } from "react";
import { electionTrackingApi } from "../../../apis/electionTrackingApi";
import { createSocket } from "../../../sockets/socket";
import PositionBarChart from "../components/PositionBarChart";
import { THEME } from "../components/chartColors";

const { SURFACE, BORDER, TEXT, MUTED } = THEME;

export default function LiveTrackingSection({ electionId }) {
  const [data, setData]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError]           = useState(null);
  const [connected, setConnected]   = useState(false);
  const fetchRef = useRef(null);

  const fetchLive = async () => {
    try {
      const result = await electionTrackingApi.getLive(electionId);
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch live results");
      console.error(err);
    }
  };

  // Keep ref current so socket callback never closes over stale version
  fetchRef.current = fetchLive;

  useEffect(() => {
    fetchRef.current();

    const s = createSocket();

    const onConnect    = () => { setConnected(true);  s.emit("join:election", String(electionId)); };
    const onDisconnect = () => { setConnected(false); };
    const onError      = (err) => console.warn("[LiveTracking] error:", err.message);
    const onVoteUpdate = (payload) => {
      if (String(payload.electionId) === String(electionId)) fetchRef.current();
    };

    s.on("connect",       onConnect);
    s.on("disconnect",    onDisconnect);
    s.on("connect_error", onError);
    s.on("vote:updated",  onVoteUpdate);
    s.connect();

    return () => {
      s.off("connect",       onConnect);
      s.off("disconnect",    onDisconnect);
      s.off("connect_error", onError);
      s.off("vote:updated",  onVoteUpdate);
      s.emit("leave:election", String(electionId));
      s.disconnect();
    };
  }, [electionId, setConnected]);

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <h3 style={{ margin: 0, color: TEXT, fontSize: "0.95rem", fontWeight: 700 }}>Live Vote Tracking</h3>

        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: connected ? "#22c55e" : MUTED }}>
          {connected && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          )}
          {connected ? "Live" : "Disconnected"}
        </span>

        {data && (
          <span style={{ fontSize: "0.78rem", color: MUTED }}>
            {data.total_submissions} voter{data.total_submissions !== 1 ? "s" : ""} submitted
          </span>
        )}

        <button
          onClick={() => fetchRef.current()}
          style={{ marginLeft: "auto", background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "1rem" }}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <p style={{ margin: "0 0 16px", color: MUTED, fontSize: "0.78rem" }}>
        Updates instantly when a voter submits · manual refresh available
        {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString()}`}
      </p>

      {error   && <div style={{ color: "#f87171" }}>{error}</div>}
      {!data && !error && <div style={{ color: MUTED }}>Loading...</div>}
      {data?.positions?.length === 0 && <div style={{ color: MUTED }}>No positions found.</div>}

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