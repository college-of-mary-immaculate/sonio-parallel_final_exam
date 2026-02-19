class ElectionPositionService {
  constructor(repo, positionRepo) {
    this.repo = repo;
    this.positionRepo = positionRepo;
  }

  async addPositionToElection(electionId, positionId) {

    const position = await this.positionRepo.getPositionById(positionId);

    if (!position) {
      throw new Error("Position not found");
    }

    return this.repo.addPositionToElection(electionId, positionId);
  }

  async removePositionFromElection(electionId, positionId) {

    const position = await this.positionRepo.getPositionById(positionId);

    if (!position) {
      throw new Error("Position not found");
    }

    return this.repo.removePositionFromElection(electionId, positionId);
  }

  async getPositionsForElection(electionId) {
    return this.repo.getPositionsForElection(electionId);
  }
}

module.exports = ElectionPositionService;
