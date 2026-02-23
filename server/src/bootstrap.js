// bootstrap.js
const cors = require("cors");
const express = require("express");
const buildContainer = require("./backend/di/container");
const initSocket = require("./socket");

async function bootstrap(httpServer) {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Socket.IO
  const io = initSocket(httpServer);

  // Dependency Injection container
  const container = await buildContainer({ io });
  const routes = container.modules;

  // Register API routes
  app.use("/api/auth", routes.auth.routes);
  app.use("/api/users", routes.users.routes);
  app.use("/api/votes", routes.vote.routes);
  app.use("/api/elections", routes.election.routes);
  app.use("/api/candidates", routes.candidates.routes);
  app.use("/api/positions", routes.positions.routes);
  app.use("/api/elections/:electionId/positions", routes.electionPositions.routes);
  app.use("/api/elections/:electionId/candidates", routes.electionCandidates.routes);
  app.use("/api/elections/:electionId/tracking", routes.electionTracking.routes);
  app.use("/api/voters/elections/:electionId/candidates", routes.electionCandidateVoter);

  // Health checks
  app.get("/health", (req, res) => res.json({ status: "OK" }));
  app.get("/check", (req, res) => res.json({ instance: process.env.HOSTNAME }));

  return app;
}

module.exports = bootstrap;