const express = require("express");
const cors    = require("cors");

const buildContainer = require("./backend/di/container");

async function bootstrap() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const container = await buildContainer();

  app.use("/api/auth",       container.modules.auth.routes);
  app.use("/api/users",      container.modules.users.routes);
  app.use("/api/votes",      container.modules.vote.routes);
  app.use("/api/elections",  container.modules.election.routes);
  app.use("/api/candidates", container.modules.candidates.routes);
  app.use("/api/positions",  container.modules.positions.routes);

  // nested election sub-routes
  app.use("/api/elections/:electionId/positions",  container.modules.electionPositions.routes);
  app.use("/api/elections/:electionId/candidates", container.modules.electionCandidates.routes);
  app.use("/api/elections/:electionId/tracking",   container.modules.electionTracking.routes);

  app.get("/health", (req, res) => res.json({ status: "OK" }));
  app.get("/check",  (req, res) => res.json({ instance: process.env.HOSTNAME }));

  return app;
}

module.exports = bootstrap;