const ElectionTrackingRepository = require("./electionTrackingRepository");
const ElectionTrackingService    = require("./electionTrackingService");
const electionTrackingRoutes     = require("./electionTrackingRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares, dependencies) => {
  const repository = new ElectionTrackingRepository({ masterDb, slaveDb });

  const service = new ElectionTrackingService(repository, {
    electionRepository: dependencies.electionRepository,
  });

  const routes = electionTrackingRoutes(service, middlewares);

  return { repository, service, routes };
};