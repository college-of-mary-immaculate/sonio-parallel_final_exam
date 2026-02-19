const express = require("express");

module.exports = (service, middlewares) => {

  const router = express.Router();

  const { authMiddleware, roleMiddleware } = middlewares;

  const ElectionPositionController = require("./electionPositionController");

  const controller = new ElectionPositionController(service);

  router.get(
    "/elections/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getByElection.bind(controller)
  );

  router.post(
    "/:positionId/elections/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.add.bind(controller)
  );

  router.delete(
    "/:positionId/elections/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.remove.bind(controller)
  );

  return router;
};
