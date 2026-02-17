class VoteRepository {
    constructor(db) {
        this.db = db;
    }

    // =============================
    // ELECTION
    // =============================

    async getElectionById(electionId) {
        const [rows] = await this.db.query(
            `SELECT * FROM elections WHERE election_id = ?`,
            [electionId]
        );
        return rows[0];
    }

    async getElectionPositionRule(electionId, positionId) {
        const [rows] = await this.db.query(
            `
            SELECT *
            FROM election_positions
            WHERE election_id = ?
            AND position_id = ?
            `,
            [electionId, positionId]
        );

        return rows[0];
    }

    async getElectionCandidate(electionId, positionId, candidateId) {
        const [rows] = await this.db.query(
            `
            SELECT *
            FROM election_candidates
            WHERE election_id = ?
            AND position_id = ?
            AND candidate_id = ?
            `,
            [electionId, positionId, candidateId]
        );

        return rows[0];
    }

    // =============================
    // SUBMISSION CHECK
    // =============================

    async hasVoterSubmitted(electionId, voterId) {
        const [rows] = await this.db.query(
            `
            SELECT submission_id
            FROM voter_submissions
            WHERE election_id = ?
            AND voter_id = ?
            `,
            [electionId, voterId]
        );

        return rows.length > 0;
    }

    // =============================
    // INSERTS (TRANSACTION SAFE)
    // =============================

    async insertVotes(connection, votes) {
        const values = votes.map(v => [
            v.electionId,
            v.positionId,
            v.candidateId,
            v.voterId
        ]);

        await connection.query(
            `
            INSERT INTO votes
            (election_id, position_id, candidate_id, voter_id)
            VALUES ?
            `,
            [values]
        );
    }

    async insertSubmission(connection, electionId, voterId) {
        await connection.query(
            `
            INSERT INTO voter_submissions
            (election_id, voter_id)
            VALUES (?, ?)
            `,
            [electionId, voterId]
        );
    }
}

module.exports = VoteRepository;
