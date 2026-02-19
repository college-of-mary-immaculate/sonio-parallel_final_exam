const ElectionPositionRepository = require("./electionPositionRepository");
const ElectionPositionService = require("./electionPositionService");
const electionPositionRoutes = require("./electionPositionRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares, dependencies) => {
  const repository = new ElectionPositionRepository({ masterDb, slaveDb });

  const service = new ElectionPositionService(repository, {
    electionRepository: dependencies.electionRepository,
    positionRepository: dependencies.positionRepository,
  });

  const routes = electionPositionRoutes(service, middlewares);

  return { repository, service, routes };
};