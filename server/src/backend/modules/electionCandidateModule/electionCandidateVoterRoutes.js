// electionCandidateVoterRoutes.js
const express = require("express");
const ElectionCandidateController = require("./electionCandidateController");

module.exports = (service, middlewares) => {
  const router = express.Router({ mergeParams: true });
  const { authMiddleware } = middlewares; // no roleMiddleware

  const controller = new ElectionCandidateController(service);

  // GET candidates for a position — voter-accessible
  router.get("/positions/:positionId", authMiddleware, controller.getByPosition.bind(controller));

  // GET all candidates in election
  router.get("/", authMiddleware, controller.getByElection.bind(controller));

  return router;
};
