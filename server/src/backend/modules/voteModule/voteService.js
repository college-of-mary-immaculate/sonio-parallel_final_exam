class VoteService {
    // ── io is optional — gracefully degrades if not provided ────
    constructor(voteRepository, { io } = {}) {
        this.voteRepository = voteRepository;
        this.io = io ?? null;
    }

    async submitVote({ electionId, voterId, votes }) {

        return this.voteRepository.withTransaction(async (connection) => {

            // =============================
            // 1. Validate Election
            // =============================
            const election = await this.voteRepository.getElectionById(electionId);

            if (!election) throw new Error("Election not found.");
            if (election.status !== "active") throw new Error("Election is not active.");

            // =============================
            // 2. Check If Already Submitted
            // ⚠️ Read-after-write sensitive → MASTER
            // =============================
            const alreadySubmitted = await this.voteRepository.hasVoterSubmitted(
                electionId,
                voterId,
                { forceMaster: true }
            );
            if (alreadySubmitted) throw new Error("You have already submitted your vote.");

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

                const rule = await this.voteRepository.getElectionPositionRule(electionId, positionId);
                if (!rule) throw new Error("Invalid position selected.");
                if (positionVotes.length > rule.votes_per_voter) throw new Error("Vote limit exceeded.");

                for (const vote of positionVotes) {
                    const candidate = await this.voteRepository.getElectionCandidate(
                        electionId,
                        vote.positionId,
                        vote.candidateId
                    );
                    if (!candidate) throw new Error("Invalid candidate.");
                }
            }

            // =============================
            // 5. Insert Votes + Submission
            // =============================
            const voteRecords = votes.map(v => ({
                electionId,
                positionId:  v.positionId,
                candidateId: v.candidateId,
                voterId,
            }));

            await this.voteRepository.insertVotes(connection, voteRecords);
            await this.voteRepository.insertSubmission(connection, electionId, voterId);

            // =============================
            // 6. Emit real-time update 🔴
            //    Fires AFTER the transaction commits — inside withTransaction
            //    the commit hasn't happened yet, so we schedule the emit to
            //    run after this callback resolves (see voteRepository.withTransaction).
            //    We pass along the electionId so the client can re-fetch live data.
            // =============================
            if (this.io) {
                // Attach electionId to emit after commit
                this._pendingEmit = { electionId };
            }

            return { message: "Vote submitted successfully." };
        }).then((result) => {
            // ── Emit AFTER transaction commits ───────────────────
            if (this.io && this._pendingEmit) {
                const { electionId } = this._pendingEmit;
                this._pendingEmit = null;

                // Emit to all admins watching this election's room
                this.io.to(`election:${electionId}`).emit("vote:updated", {
                    electionId,
                    timestamp: new Date().toISOString(),
                });

                console.log(`[ws] vote:updated emitted for election:${electionId}`);
            }
            return result;
        });
    }
}

module.exports = VoteService;