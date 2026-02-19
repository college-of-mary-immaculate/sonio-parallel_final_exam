const express = require("express");

module.exports = (service, middlewares) => {
  const router = express.Router();
  const { authMiddleware, roleMiddleware } = middlewares;
  const PositionController = require("./positionController");
  const controller = new PositionController(service);

  router.get("/", authMiddleware, roleMiddleware(["admin"]), controller.getAll.bind(controller));
  router.get("/:positionId", authMiddleware, roleMiddleware(["admin"]), controller.getById.bind(controller));
  router.post("/", authMiddleware, roleMiddleware(["admin"]), controller.create.bind(controller));
  router.put("/:positionId", authMiddleware, roleMiddleware(["admin"]), controller.update.bind(controller));
  router.delete("/:positionId", authMiddleware, roleMiddleware(["admin"]), controller.delete.bind(controller));
  

  return router;
};
