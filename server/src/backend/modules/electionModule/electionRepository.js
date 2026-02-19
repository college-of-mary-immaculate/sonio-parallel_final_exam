class ElectionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }

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

      // 2️⃣ Insert election positions
      for (const pos of positions) {
        await conn.query(
          `INSERT INTO election_positions
          (election_id, position_id, candidate_count, winners_count, votes_per_voter)
          VALUES (?, ?, ?, ?, ?)`,
          [
            electionId,
            pos.position_id,
            pos.candidate_count,
            pos.winners_count,
            pos.votes_per_voter
          ]
        );

        // 3️⃣ Insert candidates under that position
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
      return { election_id: electionId };

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }


  async getElectionById(electionId) {
    const [rows] = await this.slaveDb.query(`SELECT * FROM elections WHERE election_id = ?`, [electionId]);
    return rows[0];
  }

  async getElectionCandidates(electionId) {
    const [rows] = await this.slaveDb.query(
      `SELECT ec.*, c.full_name, c.background
       FROM election_candidates ec
       JOIN candidates c ON ec.candidate_id = c.candidate_id
       WHERE ec.election_id = ?`,
      [electionId]
    );
    return rows;
  }

  async getPositionsForElection(electionId) {
    const [rows] = await this.slaveDb.query(
      `SELECT ep.*, p.name, p.description
       FROM election_positions ep
       JOIN positions p ON ep.position_id = p.position_id
       WHERE ep.election_id = ?`,
      [electionId]
    );
    return rows;
  }

  async addCandidateToElection(electionId, candidateId, positionId) {

    const election = await this.getElectionById(electionId);

    if (!election)
      throw new Error("Election not found");

    if (election.status !== "draft")
      throw new Error("Cannot modify ballot once election has started or ended");

    return this.masterDb.query(
      `INSERT INTO election_candidates (election_id, candidate_id, position_id)
      VALUES (?, ?, ?)`,
      [electionId, candidateId, positionId]
    );
  }


  async removeCandidateFromElection(electionId, candidateId, positionId) {
    const election = await this.getElectionById(electionId);
    if (election.status !== "draft") throw new Error("Cannot modify started election");

    return this.masterDb.query(
      `DELETE FROM election_candidates WHERE election_id=? AND candidate_id=? AND position_id=?`,
      [electionId, candidateId, positionId]
    );
  }

  async createGlobalCandidate(candidateData) {
    const { full_name, background, education, years_experience, primary_advocacy, secondary_advocacy } = candidateData;
    const [result] = await this.masterDb.query(
      `INSERT INTO candidates
       (full_name, background, education, years_experience, primary_advocacy, secondary_advocacy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, background, education, years_experience, primary_advocacy, secondary_advocacy]
    );
    return { candidate_id: result.insertId, ...candidateData };
  }

  async getAllElections() {
    const [rows] = await this.slaveDb.query(`SELECT * FROM elections ORDER BY election_id ASC`);
    return rows || [];
  }

  async insertElection({ title, start_date, end_date, created_by, status }) {
    const [result] = await this.masterDb.query(
      `INSERT INTO elections (title, start_date, end_date, created_by, status) VALUES (?, ?, ?, ?, ?)`,
      [title, start_date, end_date, created_by, status]
    );

    // Read from master to avoid replication lag
    const [rows] = await this.masterDb.query(
      `SELECT * FROM elections WHERE election_id = ?`,
      [result.insertId]
    );

    return rows[0]; // should now always have election_id
  }
  async updateElection(electionId, data) {
    const fields = [];
    const values = [];

    for (const key of ['title', 'start_date', 'end_date', 'status']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return this.getElectionById(electionId); // nothing to update

    const sql = `UPDATE elections SET ${fields.join(', ')} WHERE election_id = ?`;
    values.push(electionId);

    await this.masterDb.query(sql, values);

    const [rows] = await this.masterDb.query(
      `SELECT * FROM elections WHERE election_id = ?`,
      [electionId]
    );

    return rows[0];
  }

}

module.exports = ElectionRepository;
