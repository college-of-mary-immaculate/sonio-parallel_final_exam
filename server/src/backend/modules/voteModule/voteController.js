class VoteController {
    constructor(voteService) {
        this.voteService = voteService;

        // bind context for routes
        this.submitVote = this.submitVote.bind(this);
    }

    async submitVote(req, res) {
        try {
            const voterId = req.user.userId;
            const { electionId, votes } = req.body;

            if (!electionId || !Array.isArray(votes)) {
                return res.status(400).json({
                    message: "Invalid request data."
                });
            }

            const result = await this.voteService.submitVote({
                electionId,
                voterId,
                votes
            });

            return res.status(200).json(result);

        } catch (error) {
            return res.status(400).json({
                message: error.message || "Vote submission failed."
            });
        }
    }
}

module.exports = VoteController;
