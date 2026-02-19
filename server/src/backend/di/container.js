const getMasterPool = require("../../database/db.master");
const { getSlavePool } = require("../../database/db.slave");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const voteModule              = require("../modules/voteModule/voteIndex");
const authModule              = require("../modules/authModule/authIndex");
const userModule              = require("../modules/userModule/userIndex");
const electionModule          = require("../modules/electionModule/electionIndex");
const candidateModule         = require("../modules/candidateModule/candidateIndex");
const positionModule          = require("../modules/positionModule/positionIndex");
const electionPositionModule  = require("../modules/electionPositionModule/electionPositionIndex");
const electionCandidateModule = require("../modules/electionCandidateModule/electionCandidateIndex");
const electionTrackingModule  = require("../modules/electionTrackingModule/electionTrackingIndex");

let container;

async function buildContainer() {
  if (container) return container;

  const masterDb = getMasterPool();
  const slaveDb  = getSlavePool();

  const middlewares = { authMiddleware, roleMiddleware };

  const vote       = voteModule({ masterDb, slaveDb }, authMiddleware);
  const auth       = authModule({ slaveDb });
  const users      = userModule({ masterDb, slaveDb });
  const election   = electionModule({ masterDb, slaveDb }, middlewares);
  const candidates = candidateModule({ masterDb, slaveDb }, middlewares);
  const positions  = positionModule({ masterDb, slaveDb }, middlewares);

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

  const electionTracking = electionTrackingModule(
    { masterDb, slaveDb },
    middlewares,
    {
      electionRepository: election.repository, // only dep needed
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
      electionCandidates,
      electionTracking,
    },
  };

  return container;
}

module.exports = buildContainer;