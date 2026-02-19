const cors    = require("cors");
const express = require("express");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

const buildContainer = require("./backend/di/container");

async function bootstrap(httpServer, app) { // ← receive app
  // ── NO MORE httpServer.on("request", app) ────────────────────
  // app is already bound to httpServer via http.createServer(app)

  app.use(cors());
  app.use(express.json());

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket"],
  });

  const REDIS_HOST = process.env.REDIS_HOST || "redis";
  const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

  const pubClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
  const subClient = pubClient.duplicate();

  pubClient.on("connect", () => console.log(`[redis] pub connected to ${REDIS_HOST}:${REDIS_PORT}`));
  subClient.on("connect", () => console.log(`[redis] sub connected to ${REDIS_HOST}:${REDIS_PORT}`));
  pubClient.on("error",   (err) => console.error("[redis] pub error:", err));
  subClient.on("error",   (err) => console.error("[redis] sub error:", err));

  io.adapter(createAdapter(pubClient, subClient));
  console.log(`[redis] adapter initialized`);

  io.on("connection", (socket) => {
    console.log(`[ws] client connected: ${socket.id}`);

    socket.on("join:election", (electionId) => {
      socket.join(`election:${electionId}`);
      console.log(`[ws] ${socket.id} joined election:${electionId}`);
    });

    socket.on("leave:election", (electionId) => {
      socket.leave(`election:${electionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[ws] client disconnected: ${socket.id}`);
    });
  });

  const container = await buildContainer({ io });

  app.use("/api/auth",       container.modules.auth.routes);
  app.use("/api/users",      container.modules.users.routes);
  app.use("/api/votes",      container.modules.vote.routes);
  app.use("/api/elections",  container.modules.election.routes);
  app.use("/api/candidates", container.modules.candidates.routes);
  app.use("/api/positions",  container.modules.positions.routes);
  app.use("/api/elections/:electionId/positions",  container.modules.electionPositions.routes);
  app.use("/api/elections/:electionId/candidates", container.modules.electionCandidates.routes);
  app.use("/api/elections/:electionId/tracking",   container.modules.electionTracking.routes);
  app.use("/api/voters/elections/:electionId/candidates", container.modules.electionCandidateVoter);

  app.get("/health", (req, res) => res.json({ status: "OK" }));
  app.get("/check",  (req, res) => res.json({ instance: process.env.HOSTNAME }));

  return app;
}

module.exports = bootstrap;