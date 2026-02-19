class VoteRepository {
    constructor({ masterDb, slaveDb }) {
        this.masterDb = masterDb;
        this.slaveDb = slaveDb;
    }

    getReadDb({ forceMaster = false } = {}) {
        return forceMaster ? this.masterDb : this.slaveDb;
    }

    async getElectionById(electionId, { forceMaster = false } = {}) {
        const db = this.getReadDb({ forceMaster });

        const [rows] = await db.query(
            `SELECT * FROM elections WHERE election_id = ?`,
            [electionId]
        );
        return rows[0];
    }

    async hasVoterSubmitted(electionId, voterId, { forceMaster = false } = {}) {
        const db = this.getReadDb({ forceMaster });

        const [rows] = await db.query(
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

    async withTransaction(callback) {
        const connection = await this.masterDb.getConnection();
        try {
            await connection.beginTransaction();
            await callback(connection);
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async getElectionPositionRule(electionId, positionId) {

        const [rows] = await this.slaveDb.query(`
            SELECT *
            FROM election_positions
            WHERE election_id = ?
            AND position_id = ?
        `, [electionId, positionId]);

        return rows[0];
    }

    async getElectionCandidate(electionId, positionId, candidateId) {

        const [rows] = await this.slaveDb.query(`
            SELECT *
            FROM election_candidates
            WHERE election_id = ?
            AND position_id = ?
            AND candidate_id = ?
        `, [electionId, positionId, candidateId]);

        return rows[0];
    }


}

module.exports = VoteRepository;
