const getMasterPool = require("../../database/db.master");
const { getSlavePool } = require("../../database/db.slave");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// modules
const voteModule              = require("../modules/voteModule/voteIndex");
const authModule              = require("../modules/authModule/authIndex");
const userModule              = require("../modules/userModule/userIndex");
const electionModule          = require("../modules/electionModule/electionIndex");
const candidateModule         = require("../modules/candidateModule/candidateIndex");
const positionModule          = require("../modules/positionModule/positionIndex");
const electionPositionModule  = require("../modules/electionPositionModule/electionPositionIndex");
const electionCandidateModule = require("../modules/electionCandidateModule/electionCandidateIndex");
const electionCandidateVoterModule = require("../modules/electionCandidateModule/electionCandidateVoterRoutes");
const electionTrackingModule  = require("../modules/electionTrackingModule/electionTrackingIndex");

let container;

async function buildContainer() {
  if (container) return container;

  const masterDb = getMasterPool();
  const slaveDb  = getSlavePool();

  const middlewares = { authMiddleware, roleMiddleware };

  // base modules
  const vote       = voteModule({ masterDb, slaveDb }, authMiddleware);
  const auth       = authModule({ slaveDb });
  const users      = userModule({ masterDb, slaveDb }, middlewares);
  const election   = electionModule({ masterDb, slaveDb }, middlewares);
  const candidates = candidateModule({ masterDb, slaveDb }, middlewares);
  const positions  = positionModule({ masterDb, slaveDb }, middlewares);

  // nested modules
  const electionPositions = electionPositionModule(
    { masterDb, slaveDb },
    middlewares,
    {
      electionRepository: election.repository,
      positionRepository: positions.repository,
    }
  );

  const electionCandidates = electionCandidateModule(
    { masterDb, slaveDb },
    middlewares,
    {
      electionRepository:  election.repository,
      candidateRepository: candidates.repository,
      positionRepository:  positions.repository,
    }
  );

  const electionCandidateVoter = electionCandidateVoterModule(
    electionCandidates.service, // reuse same service instance
    middlewares                 // only authMiddleware will be used
  );

  const electionTracking = electionTrackingModule(
    { masterDb, slaveDb },
    middlewares,
    {
      electionRepository: election.repository,
    }
  );

  container = {
    db: { masterDb, slaveDb },
    modules: {
      vote,
      auth,
      users,
      election,
      candidates,
      positions,
      electionPositions,
      electionCandidates,       // admin routes
      electionCandidateVoter,   // voter routes
      electionTracking,
    },
  };

  return container;
}

module.exports = buildContainer;
