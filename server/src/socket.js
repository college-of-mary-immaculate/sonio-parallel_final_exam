// socket.js
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

function initSocket(httpServer) {
  // create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket"],
  });

  // Redis adapter
  const REDIS_HOST = process.env.REDIS_HOST || "redis";
  const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

  const pubClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
  const subClient = pubClient.duplicate();

  pubClient.on("connect", () => console.log(`[redis] pub connected to ${REDIS_HOST}:${REDIS_PORT}`));
  subClient.on("connect", () => console.log(`[redis] sub connected to ${REDIS_HOST}:${REDIS_PORT}`));
  pubClient.on("error", (err) => console.error("[redis] pub error:", err));
  subClient.on("error", (err) => console.error("[redis] sub error:", err));

  io.adapter(createAdapter(pubClient, subClient));
  console.log(`[redis] adapter initialized`);

  // Socket events
  io.on("connection", (socket) => {
    console.log(`[ws] client connected: ${socket.id}`);

    socket.on("join:election", (electionId) => {
      socket.join(`election:${electionId}`);
      console.log(`[ws] ${socket.id} joined election:${electionId}`);
    });

    socket.on("leave:election", (electionId) => socket.leave(`election:${electionId}`));

    socket.on("disconnect", () => console.log(`[ws] client disconnected: ${socket.id}`));
  });

  return io;
}

module.exports = initSocket;