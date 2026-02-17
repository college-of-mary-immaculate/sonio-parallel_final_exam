const express = require("express");

module.exports = (service, middlewares) => {

  const router = express.Router();

  const { authMiddleware, roleMiddleware } = middlewares;

  const CandidateController = require("./candidateController");
  const controller = new CandidateController(service);

  // =========================
  // READ ROUTES
  // =========================

  router.get(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getAllCandidates.bind(controller)
  );

  router.get(
    "/:candidateId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.getCandidateById.bind(controller)
  );

  // =========================
  // WRITE ROUTES
  // =========================

  router.post(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.createCandidate.bind(controller)
  );

  router.put(
    "/:candidateId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.updateCandidate.bind(controller)
  );

  router.delete(
    "/:candidateId",
    authMiddleware,
    roleMiddleware(["admin"]),
    controller.deleteCandidate.bind(controller)
  );

  return router;
};
