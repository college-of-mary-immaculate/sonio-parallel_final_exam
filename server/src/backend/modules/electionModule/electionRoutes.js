const express = require("express");

module.exports = (controller, middlewares) => {

  const router = express.Router();
  const { authMiddleware, roleMiddleware } = middlewares;

  // =====================================================
  // VOTER / USER ROUTES
  // IMPORTANT: Place BEFORE dynamic routes (/:electionId)
  // =====================================================

  // list elections visible to voters
  router.get(
    "/public",
    authMiddleware,
    controller.listPublic.bind(controller)
  );

  // view single public election
  router.get(
    "/public/:electionId",
    authMiddleware,
    controller.getPublicById.bind(controller)
  );


  // =====================================================
  // ADMIN ROUTES
  // =====================================================

  router.get(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.listElections.bind(controller)
  );

  router.post(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.createElection.bind(controller)
  );

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

  router.put(
    "/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.updateElection.bind(controller)
  );

  router.delete(
    "/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.deleteElection.bind(controller)
  );

  router.get(
    "/:electionId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getById.bind(controller)
  );

  return router;
};
