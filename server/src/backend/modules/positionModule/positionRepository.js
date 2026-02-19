class PositionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }

  getReadDb({ forceMaster = false } = {}) {
    return forceMaster ? this.masterDb : this.slaveDb;
  }

  // =========================
  // POSITIONS
  // =========================

async addToElection(req, res) {
  try {
    const { electionId, positionId } = req.params;

    const config = {
      candidate_count: req.body.candidate_count,
      winners_count: req.body.winners_count,
      votes_per_voter: req.body.votes_per_voter
    };

    const result = await this.service.addPositionToElection(
      electionId,
      positionId,
      config
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


  async getAllPositions({ forceMaster = false } = {}) {
    const db = this.getReadDb({ forceMaster });
    const [rows] = await db.query(
      `SELECT * FROM positions ORDER BY name ASC`
    );
    return rows;
  }

  async getPositionById(positionId, { forceMaster = false } = {}) {
    const db = this.getReadDb({ forceMaster });
    const [rows] = await db.query(
      `SELECT * FROM positions WHERE position_id = ?`,
      [positionId]
    );
    return rows[0];
  }

  async createPosition(positionData) {
    const { name, description } = positionData;

    const [result] = await this.masterDb.query(
      `INSERT INTO positions (name, description) VALUES (?, ?)`,
      [name, description || null]
    );

    return { position_id: result.insertId, ...positionData };
  }

  async updatePosition(positionId, positionData) {
    const { name, description } = positionData;

    await this.masterDb.query(
      `UPDATE positions SET name = ?, description = ? WHERE position_id = ?`,
      [name, description || null, positionId]
    );

    return { position_id: positionId, ...positionData };
  }

  async deletePosition(positionId) {
    await this.masterDb.query(
      `DELETE FROM positions WHERE position_id = ?`,
      [positionId]
    );

    return { success: true };
  }

  // =========================
  // ELECTION POSITIONS
  // =========================

  async addPositionToElection(electionId, positionId, config) {
    const {
      candidate_count,
      winners_count,
      votes_per_voter
    } = config;

    await this.masterDb.query(
      `
      INSERT INTO election_positions 
      (election_id, position_id, candidate_count, winners_count, votes_per_voter)
      VALUES (?, ?, ?, ?, ?)
      `,
      [electionId, positionId, candidate_count, winners_count, votes_per_voter]
    );

    return { success: true };
  }

  async removePositionFromElection(electionId, positionId) {
    await this.masterDb.query(
      `
      DELETE FROM election_positions
      WHERE election_id = ? AND position_id = ?
      `,
      [electionId, positionId]
    );

    return { success: true };
  }

  async getPositionsForElection(electionId) {
    const [rows] = await this.slaveDb.query(
      `
      SELECT ep.*, p.name, p.description
      FROM election_positions ep
      JOIN positions p ON p.position_id = ep.position_id
      WHERE ep.election_id = ?
      `,
      [electionId]
    );

    return rows;
  }
}

module.exports = PositionRepository;
