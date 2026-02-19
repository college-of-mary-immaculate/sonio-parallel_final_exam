import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      auth: () => ({ token: localStorage.getItem("token") }),
    });

    socket.on("connect",       () => console.log("[ws] connected:", socket.id));
    socket.on("disconnect",    (r) => console.log("[ws] disconnected:", r));
    socket.on("connect_error", (e) => console.warn("[ws] connection error:", e.message));
  }
  return socket;
}

export function joinElectionRoom(electionId) {
  const s = getSocket();

  if (s.connected) {
    // Already connected — join immediately
    s.emit("join:election", electionId);
  } else {
    // Wait for connection, then join
    s.once("connect", () => {
      s.emit("join:election", electionId);
    });
    s.connect();
  }
}

export function leaveElectionRoom(electionId) {
  getSocket().emit("leave:election", electionId);
}

export function onVoteUpdated(callback) {
  const s = getSocket();
  s.on("vote:updated", callback);
  return () => s.off("vote:updated", callback);
}

// ✅ New — lets components subscribe to connection state changes
export function onConnectionChange(onConnect, onDisconnect) {
  const s = getSocket();
  s.on("connect",    onConnect);
  s.on("disconnect", onDisconnect);
  return () => {
    s.off("connect",    onConnect);
    s.off("disconnect", onDisconnect);
  };
}