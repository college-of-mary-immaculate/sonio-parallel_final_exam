class ElectionPositionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }

  async addPositionToElection(electionId, positionId) {
    await this.masterDb.query(
      `
      INSERT INTO election_positions (election_id, position_id)
      VALUES (?, ?)
      `,
      [electionId, positionId]
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

module.exports = ElectionPositionRepository;
