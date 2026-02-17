const VoteRepository = require("./voteRepository");
const VoteService = require("./voteService");
const VoteController = require("./voteController");
const voteRoutes = require("./voteRoutes");

module.exports = (db, authMiddleware) => {
    // repository
    const voteRepository = new VoteRepository(db);

    // service
    const voteService = new VoteService(db, voteRepository);

    // controller
    const voteController = new VoteController(voteService);

    // routes
    const routes = voteRoutes(voteController, authMiddleware);

    return {
        routes,
        voteService,
        voteRepository
    };
};
