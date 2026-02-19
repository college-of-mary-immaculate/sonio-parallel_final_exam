import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ── Singleton socket instance ─────────────────────────────────────────────────
// Created once, reused across the app. Auth token is attached so the server
// can optionally verify the connection (add authMiddleware to io if needed later).

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,       // connect manually when needed
      withCredentials: true,
      auth: () => ({
        token: localStorage.getItem("token"),
      }),
    });

    socket.on("connect", () => {
      console.log("[ws] connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[ws] disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("[ws] connection error:", err.message);
    });
  }

  return socket;
}

// ── Helpers used by components ────────────────────────────────────────────────

export function joinElectionRoom(electionId) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("join:election", electionId);
}

export function leaveElectionRoom(electionId) {
  const s = getSocket();
  s.emit("leave:election", electionId);
}

export function onVoteUpdated(callback) {
  const s = getSocket();
  s.on("vote:updated", callback);
  // Return cleanup function
  return () => s.off("vote:updated", callback);
}