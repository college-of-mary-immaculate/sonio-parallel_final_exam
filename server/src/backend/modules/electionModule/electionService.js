class ElectionService {
  constructor(repository) {
    this.repo = repository;
  }

  async addCandidate(electionId, positionId, candidateData) {
    let candidateId;

    if (candidateData.candidate_id) {
      candidateId = candidateData.candidate_id;
    } else {
      const newCandidate = await this.repo.createGlobalCandidate(candidateData);
      candidateId = newCandidate.candidate_id;
    }

    await this.repo.addCandidateToElection(electionId, candidateId, positionId);
    return { candidate_id: candidateId, ...candidateData };
  }

  async removeCandidate(electionId, positionId, candidateId) {
    return this.repo.removeCandidateFromElection(electionId, candidateId, positionId);
  }

  async getElectionConfig(electionId) {
    const election = await this.repo.getElectionById(electionId);
    const candidates = await this.repo.getElectionCandidates(electionId);
    const positions = await this.repo.getPositionsForElection(electionId);

    return {
      election: election || {},
      candidates: Array.isArray(candidates) ? candidates : [],
      positions: Array.isArray(positions) ? positions : [],
    };
  }

  async listElections() {
    const elections = await this.repo.getAllElections();
    return Array.isArray(elections) ? elections : [];
  }

  async createElection(data) {
    const { title, start_date, end_date, created_by, status = "draft" } = data;
    if (!title || !start_date || !end_date || !created_by) {
      throw new Error("Missing required election data");
    }
    return this.repo.insertElection({ title, start_date, end_date, created_by, status });
  }
}

module.exports = ElectionService;
