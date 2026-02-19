class ElectionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
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
    return this.masterDb.query(
      `INSERT INTO election_candidates (election_id, candidate_id, position_id) VALUES (?, ?, ?)`,
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

    const [rows] = await this.slaveDb.query(`SELECT * FROM elections WHERE election_id = ?`, [result.insertId]);
    return rows[0];
  }
}

module.exports = ElectionRepository;
