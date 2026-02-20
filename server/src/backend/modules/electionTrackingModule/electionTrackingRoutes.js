const express = require("express");
const ElectionTrackingController = require("./electionTrackingController");

module.exports = (service, middlewares) => {
  const router     = express.Router({ mergeParams: true }); // gets :electionId from parent
  const { authMiddleware, roleMiddleware } = middlewares;
  const controller = new ElectionTrackingController(service);

  // Both admin and voter can poll live results (voters see live during active)
  // Admin can see from pending onward
  router.get(
    "/live",
    authMiddleware,
    controller.getLiveResults.bind(controller)
  );

  // Summary is admin-only (lightweight stats)
  router.get(
    "/summary",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getVoteSummary.bind(controller)
  );

  router.get(
    "/final",
    authMiddleware,
    controller.getFinalResults.bind(controller)
  );

    return router;
};