const PositionRepository = require("./positionRepository");
const PositionService = require("./positionService");
const PositionController = require("./positionController");
const positionRoutes = require("./positionRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares) => {
  const repository = new PositionRepository({ masterDb, slaveDb });
  const service = new PositionService(repository);
  const controller = new PositionController(service);
  const routes = positionRoutes(service, middlewares);

  return { repository, service, controller, routes };
};
