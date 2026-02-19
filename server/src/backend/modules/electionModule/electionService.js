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

    // ✅ Add candidate and return latest election state
    return this.repo.addCandidateToElection(electionId, candidateId, positionId);
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
    const { positions } = data;

    if (!positions || positions.length === 0)
      throw new Error("Election must have positions");

    for (const pos of positions) {
      if (!pos.candidates || pos.candidates.length === 0)
        throw new Error(`Position ${pos.position_id} has no candidates`);
      if (pos.candidates.length < pos.candidate_count)
        throw new Error(`Not enough candidates for position ${pos.position_id}`);
    }

    // ✅ Creates election and reads latest from master
    return this.repo.createElectionWithBallot(data);
  }


  async updateElection(electionId, data) {
    const election = await this.repo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");

    const now   = new Date();
    const start = new Date(election.start_date);
    const end   = new Date(election.end_date);

    if (data.status && data.status !== election.status) {
      const from = election.status;
      const to   = data.status;

      // draft → pending: finalize ballot, make visible to voters, no date restriction
      if (from === "draft" && to === "pending") {
        // allowed anytime — just publishes the upcoming election
      }

      // pending → active: voting opens, must be on or after start date
      else if (from === "pending" && to === "active") {
        if (now < start)
          throw new Error(`Cannot activate before start date (${start.toLocaleDateString()})`);
      }

      // active → ended: voting closes, must be on or after end date
      else if (from === "active" && to === "ended") {
        if (now < end)
          throw new Error(`Cannot end before end date (${end.toLocaleDateString()})`);
      }

      // draft → active shortcut still blocked — must go through pending
      else {
        throw new Error(`Invalid status transition: ${from} → ${to}`);
      }
    }

    // lock title/dates once out of draft
    if (election.status !== "draft") {
      delete data.title;
      delete data.start_date;
      delete data.end_date;
    }

    return this.repo.updateElection(electionId, data);
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
