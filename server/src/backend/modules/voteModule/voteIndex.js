const VoteRepository = require("./voteRepository");
const VoteService    = require("./voteService");
const VoteController = require("./voteController");
const voteRoutes     = require("./voteRoutes");

// ── io is optional — only present when Socket.IO is set up ───────
module.exports = ({ masterDb, slaveDb }, authMiddleware, { io } = {}) => {

    const voteRepository = new VoteRepository({ masterDb, slaveDb });

    // Pass io into service so it can emit after a successful submission
    const voteService = new VoteService(voteRepository, { io });

    const voteController = new VoteController(voteService);

    const routes = voteRoutes(voteController, authMiddleware);

    return { routes, voteService, voteRepository };
};