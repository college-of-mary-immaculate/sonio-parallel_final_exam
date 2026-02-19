const ElectionRepository = require("./electionRepository");
const ElectionService = require("./electionService");
const ElectionController = require("./electionController");
const electionRoutes = require("./electionRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares) => {
  const repository = new ElectionRepository({ masterDb, slaveDb });
  const service = new ElectionService(repository);
  const controller = new ElectionController(service);
  const routes = electionRoutes(controller, middlewares);

  return {
    repository,
    service,
    controller,
    routes,
  };
};
