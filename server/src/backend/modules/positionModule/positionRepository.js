class PositionRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb = slaveDb;
  }
  getReadDb({ forceMaster = false } = {}) {
    return forceMaster ? this.masterDb : this.slaveDb;
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
