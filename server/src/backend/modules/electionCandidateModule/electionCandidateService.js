class ElectionCandidateService {
  constructor(repo, { electionRepository, candidateRepository, positionRepository }) {
    this.repo          = repo;
    this.electionRepo  = electionRepository;
    this.candidateRepo = candidateRepository;
    this.positionRepo  = positionRepository;
  }

  async _assertDraftElection(electionId) {
    const election = await this.electionRepo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");
    if (election.status !== "draft") throw new Error("Cannot modify a non-draft election");
    return election;
  }

  async addCandidate(electionId, positionId, candidateId) {
    await this._assertDraftElection(electionId);

    // position must exist in this election's ballot
    const electionPositions = await this.positionRepo.getPositionsForElection(electionId);
    const positionInElection = electionPositions.find(
      p => String(p.position_id) === String(positionId)
    );
    if (!positionInElection) throw new Error("Position is not part of this election");

    // candidate must exist globally
    const candidate = await this.candidateRepo.getCandidateById(candidateId);
    if (!candidate) throw new Error("Candidate not found");

    // no duplicates
    const already = await this.repo.candidateExistsInPosition(electionId, positionId, candidateId);
    if (already) throw new Error("Candidate already assigned to this position");

    // enforce candidate_count cap
    const current = await this.repo.countCandidatesForPosition(electionId, positionId);
    if (current >= positionInElection.candidate_count) {
      throw new Error(
        `Position already has the maximum ${positionInElection.candidate_count} candidate(s)`
      );
    }

    return this.repo.addCandidateToElection(electionId, positionId, candidateId);
  }

  async removeCandidate(electionId, positionId, candidateId) {
    await this._assertDraftElection(electionId);

    const exists = await this.repo.candidateExistsInPosition(electionId, positionId, candidateId);
    if (!exists) throw new Error("Candidate is not assigned to this position in this election");

    return this.repo.removeCandidateFromElection(electionId, positionId, candidateId);
  }

  async getCandidatesForElection(electionId) {
    const election = await this.electionRepo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");
    return this.repo.getCandidatesForElection(electionId);
  }

  async getCandidatesForPosition(electionId, positionId) {
    const election = await this.electionRepo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");
    return this.repo.getCandidatesForPosition(electionId, positionId);
  }
}

module.exports = ElectionCandidateService;