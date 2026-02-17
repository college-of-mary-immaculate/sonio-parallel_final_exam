class VoteRepository {
    constructor({ masterDb, slaveDb }) {
        this.masterDb = masterDb; // writes
        this.slaveDb = slaveDb;   // reads
    }

    // =============================
    // READS → SLAVE
    // =============================

    async getElectionById(electionId) {
        const [rows] = await this.slaveDb.query(
            `SELECT * FROM elections WHERE election_id = ?`,
            [electionId]
        );
        return rows[0];
    }

    async hasVoterSubmitted(electionId, voterId) {
        const [rows] = await this.slaveDb.query(
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
    // WRITES → MASTER
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

    // =============================
    // TRANSACTION (MASTER ONLY)
    // =============================

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

    async hasVoterSubmitted(electionId, voterId, options = {}) {
        const db = options.useMaster ? this.masterDb : this.slaveDb;

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

}

module.exports = VoteRepository;
