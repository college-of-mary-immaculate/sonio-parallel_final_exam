class ElectionCandidateRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb  = slaveDb;
  }

  async addCandidateToElection(electionId, positionId, candidateId) {
    await this.masterDb.query(
      `INSERT INTO election_candidates (election_id, candidate_id, position_id)
       VALUES (?, ?, ?)`,
      [electionId, candidateId, positionId]
    );
    return { success: true };
  }

  async removeCandidateFromElection(electionId, positionId, candidateId) {
    await this.masterDb.query(
      `DELETE FROM election_candidates
       WHERE election_id = ? AND position_id = ? AND candidate_id = ?`,
      [electionId, positionId, candidateId]
    );
    return { success: true };
  }

// getCandidatesForElection — add image_url
async getCandidatesForElection(electionId) {
  const [rows] = await this.slaveDb.query(
    `SELECT ec.election_candidate_id, ec.election_id, ec.position_id, ec.candidate_id,
            c.full_name, c.description, c.background, c.education,
            c.years_experience, c.primary_advocacy, c.secondary_advocacy,
            c.image_url,                          -- ✅ added
            p.name AS position_name
     FROM election_candidates ec
     JOIN candidates c ON c.candidate_id = ec.candidate_id
     JOIN positions  p ON p.position_id  = ec.position_id
     WHERE ec.election_id = ?
     ORDER BY p.name ASC, c.full_name ASC`,
    [electionId]
  );
  return rows;
}

// getCandidatesForPosition — add image_url
async getCandidatesForPosition(electionId, positionId) {
  const [rows] = await this.slaveDb.query(
    `SELECT ec.election_candidate_id, ec.candidate_id,
            c.full_name, c.description, c.background, c.education,
            c.years_experience, c.primary_advocacy, c.secondary_advocacy,
            c.image_url                           -- ✅ added
     FROM election_candidates ec
     JOIN candidates c ON c.candidate_id = ec.candidate_id
     WHERE ec.election_id = ? AND ec.position_id = ?
     ORDER BY c.full_name ASC`,
    [electionId, positionId]
  );
  return rows;
}

  async candidateExistsInPosition(electionId, positionId, candidateId) {
    const [rows] = await this.masterDb.query(
      `SELECT 1 FROM election_candidates
       WHERE election_id = ? AND position_id = ? AND candidate_id = ?`,
      [electionId, positionId, candidateId]
    );
    return rows.length > 0;
  }

  async countCandidatesForPosition(electionId, positionId) {
    const [rows] = await this.masterDb.query(
      `SELECT COUNT(*) AS total FROM election_candidates
       WHERE election_id = ? AND position_id = ?`,
      [electionId, positionId]
    );
    return rows[0].total;
  }
}

module.exports = ElectionCandidateRepository;