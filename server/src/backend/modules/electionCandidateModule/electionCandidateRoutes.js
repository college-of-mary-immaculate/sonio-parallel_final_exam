const express = require("express");
const ElectionCandidateController = require("./electionCandidateController");

module.exports = (service, middlewares) => {
  const router = express.Router({ mergeParams: true }); // pulls :electionId from parent
  const { authMiddleware, roleMiddleware } = middlewares;
  const controller = new ElectionCandidateController(service);
  const admin = [authMiddleware, roleMiddleware(["admin"])];

  router.get(  "/",                                    ...admin, controller.getByElection.bind(controller));
  router.get(  "/positions/:positionId",               ...admin, controller.getByPosition.bind(controller));
  router.post( "/",                                    ...admin, controller.add.bind(controller));
  router.delete("/:candidateId/positions/:positionId", ...admin, controller.remove.bind(controller));

  return router;
};