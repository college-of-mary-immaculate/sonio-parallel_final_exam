const ElectionCandidateRepository = require("./electionCandidateRepository");
const ElectionCandidateService    = require("./electionCandidateService");
const electionCandidateRoutes     = require("./electionCandidateRoutes");

module.exports = ({ masterDb, slaveDb }, middlewares, dependencies) => {
  const repository = new ElectionCandidateRepository({ masterDb, slaveDb });

  const service = new ElectionCandidateService(repository, {
    electionRepository:  dependencies.electionRepository,
    candidateRepository: dependencies.candidateRepository,
    positionRepository:  dependencies.positionRepository,
  });

  const routes = electionCandidateRoutes(service, middlewares);

  return { repository, service, routes };
};