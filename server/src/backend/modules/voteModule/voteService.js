class VoteService {
    constructor(db, voteRepository) {
        this.db = db;
        this.voteRepository = voteRepository;
    }

    async submitVote({ electionId, voterId, votes }) {
        const connection = await this.db.getConnection();

        try {
            await connection.beginTransaction();

            // =============================
            // 1. Validate Election
            // =============================
            const election = await this.voteRepository.getElectionById(electionId);

            if (!election) {
                throw new Error("Election not found.");
            }

            if (election.status !== "active") {
                throw new Error("Election is not active.");
            }

            // =============================
            // 2. Check If Already Submitted
            // =============================
            const alreadySubmitted =
                await this.voteRepository.hasVoterSubmitted(electionId, voterId);

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
                    throw new Error(
                        `Invalid position selected for this election.`
                    );
                }

                // Enforce max votes (allow fewer)
                if (positionVotes.length > rule.votes_per_voter) {
                    throw new Error(
                        `You exceeded the vote limit for this position.`
                    );
                }

                // Validate each candidate
                for (const vote of positionVotes) {
                    const candidate =
                        await this.voteRepository.getElectionCandidate(
                            electionId,
                            vote.positionId,
                            vote.candidateId
                        );

                    if (!candidate) {
                        throw new Error(
                            `Invalid candidate selected for position.`
                        );
                    }
                }
            }

            // =============================
            // 5. Prepare Insert Data
            // =============================
            const voteRecords = votes.map(v => ({
                electionId,
                positionId: v.positionId,
                candidateId: v.candidateId,
                voterId
            }));

            // =============================
            // 6. Insert Votes + Submission
            // =============================
            await this.voteRepository.insertVotes(connection, voteRecords);

            await this.voteRepository.insertSubmission(
                connection,
                electionId,
                voterId
            );

            await connection.commit();
            connection.release();

            return { message: "Vote submitted successfully." };

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }
}

module.exports = VoteService;
