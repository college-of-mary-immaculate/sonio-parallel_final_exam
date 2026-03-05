const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const buildContainer = require("./backend/di/container");
const initSocket = require("./socket");
const createSSRMiddleware = require("./ssr");

async function bootstrap(httpServer) {
  const app = express();

  // =====================
  // Middlewares
  // =====================
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",  // exact origin — no wildcard
    credentials: true,                                           // allows cookies cross-origin
  }));
  app.use(express.json());
  app.use(cookieParser());   // ← parses req.cookies so authMiddleware and ssr.js can read them

  // =====================
  // Socket.IO
  // =====================
  const io = initSocket(httpServer);

  // =====================
  // Dependency Injection container
  // =====================
  const container = await buildContainer({ io });
  const routes = container.modules;

  // =====================
  // API Routes
  // =====================
  app.use("/api/auth", routes.auth.routes);
  app.use("/api/users", routes.users.routes);
  app.use("/api/votes", routes.vote.routes);
  app.use("/api/elections", routes.election.routes);
  app.use("/api/candidates", routes.candidates.routes);
  app.use("/api/positions", routes.positions.routes);
  app.use("/api/elections/:electionId/positions", routes.electionPositions.routes);
  app.use("/api/elections/:electionId/candidates", routes.electionCandidates.routes);
  app.use("/api/elections/:electionId/tracking", routes.electionTracking.routes);
  app.use(
    "/api/voters/elections/:electionId/candidates",
    routes.electionCandidateVoter
  );

  // =====================
  // Health checks
  // =====================
  app.get("/health", (req, res) => res.json({ status: "OK" }));
  app.get("/check", (req, res) =>
    res.json({ instance: process.env.HOSTNAME })
  );

  // =====================
  // SSR — MUST COME LAST
  // =====================
  const ssrHandler = await createSSRMiddleware(app);
  app.use(ssrHandler);

  return app;
}

module.exports = bootstrap;