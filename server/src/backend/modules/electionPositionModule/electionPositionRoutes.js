const express = require("express");
const ElectionPositionController = require("./electionPositionController");

module.exports = (service, middlewares) => {
  const router = express.Router({ mergeParams: true }); // important for nested :electionId
  const { authMiddleware, roleMiddleware } = middlewares;
  const controller = new ElectionPositionController(service);

  // GET    /elections/:electionId/positions
  router.get("/", authMiddleware, roleMiddleware(["admin"]), controller.getByElection.bind(controller));

  // POST   /elections/:electionId/positions/:positionId
  router.post("/:positionId", authMiddleware, roleMiddleware(["admin"]), controller.add.bind(controller));

  // DELETE /elections/:electionId/positions/:positionId
  router.delete("/:positionId", authMiddleware, roleMiddleware(["admin"]), controller.remove.bind(controller));

  return router;
};