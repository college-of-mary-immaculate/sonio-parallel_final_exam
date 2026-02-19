// ===== File: positionService.js =====
class PositionService {
  constructor(repository) {
    this.repo = repository;
  }

  // =========================
  // POSITIONS
  // =========================

  async getAllPositions() {
    return this.repo.getAllPositions();
  }

  async getPositionById(positionId) {
    const position = await this.repo.getPositionById(positionId);
    if (!position) throw new Error("Position not found");
    return position;
  }

  async createPosition(data) {
    const result = await this.repo.createPosition(data);
    // Read immediately from master to get the freshest data
    const fresh = await this.repo.getPositionById(result.position_id, { forceMaster: true });
    return fresh;
  }

  async updatePosition(positionId, data) {
    const existing = await this.repo.getPositionById(positionId, { forceMaster: true });
    if (!existing) throw new Error("Position not found");

    await this.repo.updatePosition(positionId, data);

    // Read the updated record from master explicitly
    const fresh = await this.repo.getPositionById(positionId, { forceMaster: true });
    return fresh;
  }

  async deletePosition(positionId) {
    const existing = await this.repo.getPositionById(positionId, { forceMaster: true });
    if (!existing) throw new Error("Position not found");
    return this.repo.deletePosition(positionId);
  }

  // =========================
  // ELECTION POSITIONS
  // =========================

  async addPositionToElection(electionId, positionId, config) {
    const position = await this.repo.getPositionById(positionId, { forceMaster: true });
    if (!position) throw new Error("Position not found");

    return this.repo.addPositionToElection(
      electionId,
      positionId,
      config
    );
  }

  async removePositionFromElection(electionId, positionId) {
    const position = await this.repo.getPositionById(positionId, { forceMaster: true });
    if (!position) throw new Error("Position not found");

    return this.repo.removePositionFromElection(
      electionId,
      positionId
    );
  }

  async getPositionsForElection(electionId) {
    return this.repo.getPositionsForElection(electionId);
  }
}

module.exports = PositionService;
