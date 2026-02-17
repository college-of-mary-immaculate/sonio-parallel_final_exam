class ElectionService {
  constructor(repository) {
    this.repo = repository;
  }

  async addCandidate(electionId, positionId, candidateData) {
    let candidateId;

    if (candidateData.candidate_id) {
      candidateId = candidateData.candidate_id;
    } else {
      // Shortcut: create global candidate
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
    return { election, candidates, positions };
  }
}

module.exports = ElectionService;
