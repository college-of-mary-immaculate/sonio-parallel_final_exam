class PositionService {
  constructor(repository) {
    this.repo = repository;
  }

  async getAllPositions() {
    return this.repo.getAllPositions();
  }

  async getPositionById(positionId) {
    const position = await this.repo.getPositionById(positionId);
    if (!position) throw new Error("Position not found");
    return position;
  }

  async createPosition(data) {
    return this.repo.createPosition(data);
  }

  async updatePosition(positionId, data) {
    const existing = await this.repo.getPositionById(positionId);
    if (!existing) throw new Error("Position not found");
    return this.repo.updatePosition(positionId, data);
  }

  async deletePosition(positionId) {
    const existing = await this.repo.getPositionById(positionId);
    if (!existing) throw new Error("Position not found");
    return this.repo.deletePosition(positionId);
  }
}

module.exports = PositionService;
