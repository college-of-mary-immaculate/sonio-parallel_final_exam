// ===== voteService.js =====
class VoteService {
    constructor(voteRepository) {
        this.voteRepository = voteRepository;
    }

    async submitVote({ electionId, voterId, votes }) {

        return this.voteRepository.withTransaction(async (connection) => {

            // =============================
            // 1. Validate Election (READ → SLAVE)
            // =============================
            const election =
                await this.voteRepository.getElectionById(electionId);

            if (!election) {
                throw new Error("Election not found.");
            }

            if (election.status !== "active") {
                throw new Error("Election is not active.");
            }

            // =============================
            // 2. Check If Already Submitted
            // ⚠️ Read-after-write sensitive → MASTER
            // =============================
            const alreadySubmitted =
                await this.voteRepository.hasVoterSubmitted(
                    electionId,
                    voterId,
                    { useMaster: true }
                );

            if (alreadySubmitted) {
                throw new Error("You have already submitted your vote.");
            }

            // =============================
            // 3. Group Votes By Position
            // =============================
            const votesByPosition = {};

            for (const vote of votes) {
                if (!votesByPosition[vote.positionId]) {
                    votesByPosition[vote.positionId] = [];
                }
                votesByPosition[vote.positionId].push(vote);
            }

            // =============================
            // 4. Validate Each Position
            // =============================
            for (const positionId of Object.keys(votesByPosition)) {
                const positionVotes = votesByPosition[positionId];

                const rule =
                    await this.voteRepository.getElectionPositionRule(
                        electionId,
                        positionId
                    );

                if (!rule) {
                    throw new Error("Invalid position selected.");
                }

                if (positionVotes.length > rule.votes_per_voter) {
                    throw new Error("Vote limit exceeded.");
                }

                for (const vote of positionVotes) {
                    const candidate =
                        await this.voteRepository.getElectionCandidate(
                            electionId,
                            vote.positionId,
                            vote.candidateId
                        );

                    if (!candidate) {
                        throw new Error("Invalid candidate.");
                    }
                }
            }

            // =============================
            // 5. Insert Votes + Submission
            // =============================
            const voteRecords = votes.map(v => ({
                electionId,
                positionId: v.positionId,
                candidateId: v.candidateId,
                voterId
            }));

            await this.voteRepository.insertVotes(connection, voteRecords);
            await this.voteRepository.insertSubmission(
                connection,
                electionId,
                voterId
            );

            return { message: "Vote submitted successfully." };
        });
    }
}

module.exports = VoteService;
