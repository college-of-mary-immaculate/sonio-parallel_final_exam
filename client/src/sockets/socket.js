import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
console.log("[socket] connecting to:", SOCKET_URL);

// ── Use globalThis instead of module-level variable ──────────
// This survives Vite HMR without getting stale
function getSocket() {
  if (!globalThis.__appSocket) {
    globalThis.__appSocket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
      auth: () => ({ token: localStorage.getItem("token") }),
    });

    globalThis.__appSocket.on("connect",       () => console.log("[ws] connected:", globalThis.__appSocket.id));
    globalThis.__appSocket.on("disconnect",    (r) => console.log("[ws] disconnected:", r));
    globalThis.__appSocket.on("connect_error", (e) => console.warn("[ws] connect error:", e.message));
  }
  return globalThis.__appSocket;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (globalThis.__appSocket) {
      globalThis.__appSocket.disconnect();
      globalThis.__appSocket = null;
    }
  });
}

export { getSocket };

export function joinElectionRoom(electionId) {
  const s = getSocket();
  if (s.connected) {
    s.emit("join:election", String(electionId));
  } else {
    s.once("connect", () => s.emit("join:election", String(electionId)));
    s.connect();
  }
}

export function leaveElectionRoom(electionId) {
  getSocket().emit("leave:election", String(electionId));
}

export function onVoteUpdated(callback) {
  const s = getSocket();
  s.on("vote:updated", callback);
  return () => s.off("vote:updated", callback);
}

export function onConnectionChange(onConnect, onDisconnect) {
  const s = getSocket();
  s.on("connect",    onConnect);
  s.on("disconnect", onDisconnect);
  return () => {
    s.off("connect",    onConnect);
    s.off("disconnect", onDisconnect);
  };
}

export function resetSocket() {
  if (globalThis.__appSocket) {
    globalThis.__appSocket.disconnect();
    globalThis.__appSocket = null;
  }
}