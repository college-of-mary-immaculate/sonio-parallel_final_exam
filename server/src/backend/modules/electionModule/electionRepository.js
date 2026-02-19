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

    // Read from master to avoid replication lag
    const [rows] = await this.masterDb.query(
      `SELECT * FROM elections WHERE election_id = ?`,
      [result.insertId]
    );

    return rows[0]; // should now always have election_id
  }
  async updateElection(electionId, { title, start_date, end_date, status }) {
    await this.masterDb.query(
      `UPDATE elections SET title = ?, start_date = ?, end_date = ?, status = ? WHERE election_id = ?`,
      [title, start_date, end_date, status, electionId]
    );

    // Read from master to guarantee latest data
    const [rows] = await this.masterDb.query(
      `SELECT * FROM elections WHERE election_id = ?`,
      [electionId]
    );

    return rows[0]; // always return full updated object
  }




}

module.exports = ElectionRepository;
