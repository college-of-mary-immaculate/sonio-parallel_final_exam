import { io } from "socket.io-client";

// ── SSR guard ─────────────────────────────────────────────────────
const isBrowser = typeof window !== "undefined";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ✅ Moved console.log out of module level — was running on server at import
if (isBrowser) {
  console.log("[socket] connecting to:", SOCKET_URL);
}

export function createSocket() {
  // ✅ Guard localStorage — it doesn't exist on the server
  const token = isBrowser ? localStorage.getItem("token") : null;

  return io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: { token },
  });
}

let _socket = null;

export function getSocket() {
  // ✅ Guard entire function — sockets are browser-only
  if (!isBrowser) return null;

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
  if (!s) return; // ✅ SSR guard — getSocket() returns null on server
  const emit = () => s.emit("join:election", String(electionId));
  if (s.connected) emit();
  else { s.once("connect", emit); if (!s.active) s.connect(); }
}

export function leaveElectionRoom(electionId) {
  const s = getSocket();
  if (!s) return; // ✅ SSR guard
  s.emit("leave:election", String(electionId));
}

export function onVoteUpdated(callback) {
  const s = getSocket();
  if (!s) return () => {}; // ✅ SSR guard — return noop cleanup
  s.on("vote:updated", callback);
  return () => s.off("vote:updated", callback);
}

export function resetSocket() {
  if (!isBrowser) return; // ✅ SSR guard
  if (_socket) { _socket.disconnect(); _socket = null; }
}