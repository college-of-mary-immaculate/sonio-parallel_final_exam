const getMasterPool = require("../../database/db.master");
const { getSlavePool } = require("../../database/db.slave");

// middlewares
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// modules
const voteModule      = require("../modules/voteModule/voteIndex");
const authModule      = require("../modules/authModule/authIndex");
const userModule      = require("../modules/userModule/userIndex");
const electionModule  = require("../modules/electionModule/electionIndex");
const candidateModule = require("../modules/candidateModule/candidateIndex");
const positionModule  = require("../modules/positionModule/positionIndex");

let container;

async function buildContainer() {
    if (container) return container;

    const masterDb = getMasterPool();
    const slaveDb  = getSlavePool();

    const vote       = voteModule({ masterDb, slaveDb }, authMiddleware);
    const auth       = authModule({ slaveDb });
    const users      = userModule({ masterDb, slaveDb });
    const election   = electionModule({ masterDb, slaveDb }, { authMiddleware, roleMiddleware });
    const candidates = candidateModule({ masterDb, slaveDb }, { authMiddleware, roleMiddleware });
    const positions  = positionModule({ masterDb, slaveDb }, { authMiddleware, roleMiddleware });

    container = {
        db: { masterDb, slaveDb },
        modules: { vote, auth, users, election, candidates, positions }
    };

    return container;
}

module.exports = buildContainer;
