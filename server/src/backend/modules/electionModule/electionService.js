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
  async updateElection(electionId, data) {
    const election = await this.repo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");

    // Optional: prevent updating active/ended elections
    if (election.status !== "draft") {
      throw new Error("Only draft elections can be updated");
    }

    // Only allow specific fields to be updated
    const { title, start_date, end_date, status } = data;

    return this.repo.updateElection(electionId, { title, start_date, end_date, status });
  }

  async getById(electionId) {
    const election = await this.repo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");
    return election;
  }


  async deleteElection(electionId) {
    const election = await this.repo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");

    // Optional: prevent deleting active/ended elections
    if (election.status !== "draft") throw new Error("Only draft elections can be deleted");

    await this.repo.deleteElection(electionId);
    return true;
  }


}

module.exports = ElectionService;
