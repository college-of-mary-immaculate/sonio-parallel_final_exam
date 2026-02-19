class CandidateService {
  constructor(repository) {
    this.repo = repository;
  }

  // =========================
  // READ OPERATIONS
  // =========================

  async getAllCandidates() {
    return this.repo.getAllCandidates();
  }

  async getCandidateById(candidateId) {
    const candidate = await this.repo.getCandidateById(candidateId);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    return candidate;
  }

  // =========================
  // CREATE
  // =========================

  async createCandidate(candidateData) {
    // assign a random avatar if image_url not provided
    if (!candidateData.image_url) {
      // generate a random number between 1 and 70 (Pravatar has 70 images)
      const randomId = Math.floor(Math.random() * 70) + 1;
      candidateData.image_url = `https://i.pravatar.cc/150?img=${randomId}`;
    }

    return this.repo.createCandidate(candidateData);
  }

  // =========================
  // UPDATE
  // =========================

  async updateCandidate(candidateId, candidateData) {
    const existing = await this.repo.getCandidateById(candidateId);

    if (!existing) {
      throw new Error("Candidate not found");
    }

    // assign a random avatar if image_url not provided
    if (!candidateData.image_url) {
      const randomId = Math.floor(Math.random() * 70) + 1;
      candidateData.image_url = `https://i.pravatar.cc/150?img=${randomId}`;
    }

    return this.repo.updateCandidate(candidateId, candidateData);
  }

  // =========================
  // DELETE (BUSINESS RULES HERE)
  // =========================

  async deleteCandidate(candidateId) {
    const candidate = await this.repo.getCandidateById(candidateId);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const usage = await this.repo.getCandidateElectionUsage(candidateId);

    const usedInEndedElection = usage.some(u => u.status === "ended");

    if (usedInEndedElection) {
      throw new Error(
        "Cannot delete candidate used in ended elections"
      );
    }

    await this.repo.deleteCandidate(candidateId);

    return { success: true };
  }
}

module.exports = CandidateService;
