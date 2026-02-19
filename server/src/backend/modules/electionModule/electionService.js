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
    const { title, start_date, end_date, created_by, positions } = data;

    if (!positions || positions.length === 0)
      throw new Error("Election must have positions");

    for (const pos of positions) {
      if (!pos.candidates || pos.candidates.length === 0)
        throw new Error(`Position ${pos.position_id} has no candidates`);

      if (pos.candidates.length < pos.candidate_count)
        throw new Error(`Not enough candidates for position ${pos.position_id}`);
    }

    return this.repo.createElectionWithBallot(data);
  }

  async updateElection(electionId, data) {

    const election = await this.repo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");

    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);

    // status change requested?
    if (data.status && data.status !== election.status) {

      if (election.status === "draft" && data.status === "active") {
        if (now < start)
          throw new Error("Cannot activate before start date");
      }

      else if (election.status === "active" && data.status === "ended") {
        if (now < end)
          throw new Error("Cannot end before end date");
      }

      else {
        throw new Error("Invalid status transition");
      }
    }

    // prevent editing config if not draft
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
