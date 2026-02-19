class PositionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }

  async getAllPositions() {
    const [rows] = await this.slaveDb.query(
      `SELECT * FROM positions ORDER BY name ASC`
    );
    return rows;
  }

  async getPositionById(positionId) {
    const [rows] = await this.slaveDb.query(
      `SELECT * FROM positions WHERE position_id = ?`,
      [positionId]
    );
    return rows[0];
  }

  async createPosition(positionData) {
    const { name, description } = positionData;
    const [result] = await this.masterDb.query(
      `INSERT INTO positions (name, description) VALUES (?, ?)`,
      [name, description]
    );
    return { position_id: result.insertId, ...positionData };
  }

  async updatePosition(positionId, positionData) {
    const { name, description } = positionData;
    await this.masterDb.query(
      `UPDATE positions SET name = ?, description = ? WHERE position_id = ?`,
      [name, description, positionId]
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
}

module.exports = PositionRepository;
