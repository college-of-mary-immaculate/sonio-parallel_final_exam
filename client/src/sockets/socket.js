import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
console.log("[socket] connecting to:", SOCKET_URL);

export function createSocket() {
  return io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: { token: localStorage.getItem("token") },
  });
}

// Keep these for BallotPage or other places that use the singleton
let _socket = null;

export function getSocket() {
  if (!_socket || _socket.disconnected) {
    if (_socket) _socket.disconnect();
    _socket = createSocket();
    _socket.on("connect",       () => console.log("[ws] connected:", _socket.id));
    _socket.on("disconnect",    (r) => console.log("[ws] disconnected:", r));
    _socket.on("connect_error", (e) => console.warn("[ws] error:", e.message));
  }
  return _socket;
}

export function joinElectionRoom(electionId) {
  const s = getSocket();
  const emit = () => s.emit("join:election", String(electionId));
  if (s.connected) emit();
  else { s.once("connect", emit); if (!s.active) s.connect(); }
}

export function leaveElectionRoom(electionId) {
  getSocket().emit("leave:election", String(electionId));
}

export function onVoteUpdated(callback) {
  const s = getSocket();
  s.on("vote:updated", callback);
  return () => s.off("vote:updated", callback);
}

export function resetSocket() {
  if (_socket) { _socket.disconnect(); _socket = null; }
}