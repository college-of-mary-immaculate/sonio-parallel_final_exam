// ===== voteIndex.js =====
const VoteRepository = require("./voteRepository");
const VoteService = require("./voteService");
const VoteController = require("./voteController");
const voteRoutes = require("./voteRoutes");

module.exports = ({ masterDb, slaveDb }, authMiddleware) => {

    const voteRepository = new VoteRepository({
        masterDb,
        slaveDb
    });

    const voteService = new VoteService(voteRepository);

    const voteController = new VoteController(voteService);

    const routes = voteRoutes(voteController, authMiddleware);

    return {
        routes,
        voteService,
        voteRepository
    };
};
