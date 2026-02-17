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
    // future validation can go here
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

    /**
     * usage example:
     * [
     *   { status: 'draft', count: 2 },
     *   { status: 'ended', count: 1 }
     * ]
     */

    const usedInEndedElection = usage.some(
      u => u.status === "ended"
    );

    if (usedInEndedElection) {
      throw new Error(
        "Cannot delete candidate used in ended elections"
      );
    }

    // allowed if unused or only draft/active
    await this.repo.deleteCandidate(candidateId);

    return { success: true };
  }
}

module.exports = CandidateService;
