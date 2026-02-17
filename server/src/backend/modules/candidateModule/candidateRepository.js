class CandidateRepository {
  /**
   * @param {{masterDb: any, slaveDb: any}} dbPools
   */
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }

  // =========================
  // READ OPERATIONS
  // =========================

  async getAllCandidates() {
    const [rows] = await this.slaveDb.query(`
      SELECT *
      FROM candidates
      ORDER BY full_name ASC
    `);

    return rows;
  }

  async getCandidateById(candidateId) {
    const [rows] = await this.slaveDb.query(
      `SELECT * FROM candidates WHERE candidate_id = ?`,
      [candidateId]
    );

    return rows[0];
  }

  /**
   * Returns election usage summary for business rules
   */
  async getCandidateElectionUsage(candidateId) {
    const [rows] = await this.slaveDb.query(
      `
      SELECT e.status, COUNT(*) as count
      FROM election_candidates ec
      JOIN elections e ON e.election_id = ec.election_id
      WHERE ec.candidate_id = ?
      GROUP BY e.status
      `,
      [candidateId]
    );

    return rows;
  }

  // =========================
  // WRITE OPERATIONS
  // =========================

  async createCandidate(candidateData) {
    const {
      full_name,
      background,
      education,
      years_experience,
      primary_advocacy,
      secondary_advocacy
    } = candidateData;

    const [result] = await this.masterDb.query(
      `
      INSERT INTO candidates
      (full_name, background, education, years_experience, primary_advocacy, secondary_advocacy)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        full_name,
        background,
        education,
        years_experience,
        primary_advocacy,
        secondary_advocacy
      ]
    );

    return {
      candidate_id: result.insertId,
      ...candidateData
    };
  }

  async updateCandidate(candidateId, candidateData) {
    const {
      full_name,
      background,
      education,
      years_experience,
      primary_advocacy,
      secondary_advocacy
    } = candidateData;

    await this.masterDb.query(
      `
      UPDATE candidates
      SET full_name = ?,
          background = ?,
          education = ?,
          years_experience = ?,
          primary_advocacy = ?,
          secondary_advocacy = ?
      WHERE candidate_id = ?
      `,
      [
        full_name,
        background,
        education,
        years_experience,
        primary_advocacy,
        secondary_advocacy,
        candidateId
      ]
    );

    return { candidate_id: candidateId, ...candidateData };
  }

  async deleteCandidate(candidateId) {
    return this.masterDb.query(
      `DELETE FROM candidates WHERE candidate_id = ?`,
      [candidateId]
    );
  }
}

module.exports = CandidateRepository;
