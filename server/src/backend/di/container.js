// ===== di/container.js =====
const getMasterPool = require("../../database/db.master");
const { getSlavePool } = require("../../database/db.slave");

// middlewares
const authMiddleware = require("../middlewares/authMiddleware");

// modules
const voteModule = require("../modules/voteModule/voteIndex");

let container;

async function buildContainer() {
    if (container) return container;

    const masterDb = getMasterPool();
    const slaveDb = getSlavePool();

    const vote = voteModule(
        { masterDb, slaveDb },
        authMiddleware
    );

    container = {
        db: {
            masterDb,
            slaveDb
        },
        modules: {
            vote
        }
    };

    return container;
}

module.exports = buildContainer;
