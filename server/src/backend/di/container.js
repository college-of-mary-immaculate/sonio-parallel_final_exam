const getPool = require("../../database/db");

// middlewares
const authMiddleware = require("../middlewares/authMiddleware");

// modules
const voteModule = require("../modules/voteModule/voteIndex");

let container;

async function buildContainer() {
    if (container) return container;

    const db = getPool();

    // initialize modules
    const vote = voteModule(db, authMiddleware);

    container = {
        db,
        modules: {
            vote
        }
    };

    return container;
}

module.exports = buildContainer;
