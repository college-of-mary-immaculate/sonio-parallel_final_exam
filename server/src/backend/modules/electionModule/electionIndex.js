const ElectionRepository = require("./electionRepository");
const ElectionService = require("./electionService");
const ElectionController = require("./electionController");
const electionRoutes = require("./electionRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares) => {
  const repository = new ElectionRepository({ masterDb, slaveDb });
  const service = new ElectionService(repository);

  return {
    repository,
    service,
    controller: new ElectionController(service),
    routes: electionRoutes(service, middlewares) // <-- pass middlewares here
  };
};
