class ElectionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }

  // --- Create election with positions and candidates ---
  async createElectionWithBallot(data) {
    const conn = await this.masterDb.getConnection();
    try {
      await conn.beginTransaction();

      const { title, start_date, end_date, created_by, positions } = data;

      // 1️⃣ Create election
      const [electionResult] = await conn.query(
        `INSERT INTO elections (title, start_date, end_date, created_by, status)
         VALUES (?, ?, ?, ?, 'draft')`,
        [title, start_date, end_date, created_by]
      );

      const electionId = electionResult.insertId;

      // 2️⃣ Insert positions and candidates
      for (const pos of positions) {
        await conn.query(
          `INSERT INTO election_positions
           (election_id, position_id, candidate_count, winners_count, votes_per_voter)
           VALUES (?, ?, ?, ?, ?)`,
          [electionId, pos.position_id, pos.candidate_count, pos.winners_count, pos.votes_per_voter]
        );

        for (const cand of pos.candidates) {
          await conn.query(
            `INSERT INTO election_candidates
             (election_id, candidate_id, position_id)
             VALUES (?, ?, ?)`,
            [electionId, cand.candidate_id, pos.position_id]
          );
        }
      }

      await conn.commit();

      // ✅ Immediately read from master to avoid slave lag
      const [rows] = await conn.query(`SELECT * FROM elections WHERE election_id = ?`, [electionId]);
      return rows[0];

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // --- Get election by ID ---
  async getElectionById(electionId, { forceMaster = false } = {}) {
    const db = forceMaster ? this.masterDb : this.slaveDb;
    const [rows] = await db.query(`SELECT * FROM elections WHERE election_id = ?`, [electionId]);
    return rows[0];
  }

  // --- Get all elections ---
  async getAllElections({ forceMaster = false } = {}) {
    const db = forceMaster ? this.masterDb : this.slaveDb;
    const [rows] = await db.query(`SELECT * FROM elections ORDER BY election_id ASC`);
    return rows || [];
  }

  // --- Insert candidate ---
  async addCandidateToElection(electionId, candidateId, positionId) {
    const election = await this.getElectionById(electionId, { forceMaster: true });

    if (!election) throw new Error("Election not found");
    if (election.status !== "draft") throw new Error("Cannot modify ballot once election has started or ended");

    await this.masterDb.query(
      `INSERT INTO election_candidates (election_id, candidate_id, position_id)
       VALUES (?, ?, ?)`,
      [electionId, candidateId, positionId]
    );

    // Return latest state from master
    return this.getElectionById(electionId, { forceMaster: true });
  }

  async updateElection(electionId, data) {
    const fields = [];
    const values = [];

    for (const key of ["title", "start_date", "end_date", "status"]) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.getElectionById(electionId);

    const sql = `UPDATE elections SET ${fields.join(", ")} WHERE election_id = ?`;
    values.push(electionId);

    await this.masterDb.query(sql, values);

    // ✅ Force read from master after update
    return this.getElectionById(electionId, { forceMaster: true });
  }

  async removeCandidateFromElection(electionId, candidateId, positionId) {
    const election = await this.getElectionById(electionId, { forceMaster: true });
    if (election.status !== "draft") throw new Error("Cannot modify started election");

    await this.masterDb.query(
      `DELETE FROM election_candidates WHERE election_id=? AND candidate_id=? AND position_id=?`,
      [electionId, candidateId, positionId]
    );

    // ✅ Return latest election state
    return this.getElectionById(electionId, { forceMaster: true });
  }
}

module.exports = ElectionRepository;
