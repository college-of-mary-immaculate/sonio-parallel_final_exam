const express = require("express");

module.exports = (controller, middlewares) => {
  const router = express.Router();
  const { authMiddleware, roleMiddleware } = middlewares;

  // Existing routes
  router.get("/:electionId/config", authMiddleware, roleMiddleware(["admin"]), controller.getConfig.bind(controller));
  router.post("/:electionId/candidates", authMiddleware, roleMiddleware(["admin"]), controller.addCandidate.bind(controller));
  router.delete("/:electionId/positions/:positionId/candidates/:candidateId", authMiddleware, roleMiddleware(["admin"]), controller.removeCandidate.bind(controller));
  router.get("/", authMiddleware, roleMiddleware(["admin"]), controller.listElections.bind(controller));
  router.post("/", authMiddleware, roleMiddleware(["admin"]), controller.createElection.bind(controller));
  router.put("/:electionId", authMiddleware, roleMiddleware(["admin"]), controller.updateElection.bind(controller));
  router.delete(
    "/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.deleteElection.bind(controller) // you will implement this in your controller
  );

  router.get(
    "/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getById.bind(controller)
  );


  return router;
};
