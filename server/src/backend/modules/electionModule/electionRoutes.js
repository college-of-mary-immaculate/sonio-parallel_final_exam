const express = require("express");

module.exports = (service, middlewares) => {

  const router = express.Router();

  const { authMiddleware, roleMiddleware } = middlewares;

  const ElectionController = require("./electionController");
  const controller = new ElectionController(service);

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
