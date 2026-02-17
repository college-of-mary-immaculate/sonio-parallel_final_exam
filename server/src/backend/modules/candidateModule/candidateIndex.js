const CandidateRepository = require("./candidateRepository");
const CandidateService = require("./candidateService");
const CandidateController = require("./candidateController");
const candidateRoutes = require("./candidateRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares) => {

  const repository = new CandidateRepository({ masterDb, slaveDb });
  const service = new CandidateService(repository);

  return {
    repository,
    service,
    controller: new CandidateController(service),
    routes: candidateRoutes(service, middlewares)
  };
};
