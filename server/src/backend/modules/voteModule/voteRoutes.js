const express = require("express");

module.exports = (voteController, authMiddleware) => {
    const router = express.Router();

    // voter must be authenticated
    router.post(
        "/submit",
        authMiddleware,
        voteController.submitVote
    );

    return router;
};
