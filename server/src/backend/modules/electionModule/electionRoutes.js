const express = require("express");

module.exports = (controller, middlewares) => {
  const router = express.Router();
  const { authMiddleware, roleMiddleware } = middlewares;

  router.get(
    "/:electionId/config",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getConfig.bind(controller)
  );

  router.post(
    "/:electionId/candidates",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.addCandidate.bind(controller)
  );

  router.delete(
    "/:electionId/positions/:positionId/candidates/:candidateId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.removeCandidate.bind(controller)
  );

  return router;
};
