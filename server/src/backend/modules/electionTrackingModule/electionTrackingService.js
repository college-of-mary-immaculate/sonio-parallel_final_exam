class ElectionTrackingService {
  constructor(repo, { electionRepository }) {
    this.repo         = repo;
    this.electionRepo = electionRepository;
  }

  async getLiveResults(electionId) {
    const election = await this.electionRepo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");

    // Available for pending, active, and ended elections
    if (election.status === "draft") {
      throw new Error("Results are not available for draft elections");
    }

    const [positions, totalSubmissions] = await Promise.all([
      this.repo.getLiveResults(electionId),
      this.repo.getTotalSubmissions(electionId),
    ]);

    return {
      election_id:       election.election_id,
      title:             election.title,
      status:            election.status,
      start_date:        election.start_date,
      end_date:          election.end_date,
      total_submissions: totalSubmissions,
      positions,
    };
  }

  async getVoteSummary(electionId) {
    const election = await this.electionRepo.getElectionById(electionId);
    if (!election) throw new Error("Election not found");

    if (election.status === "draft") {
      throw new Error("Summary not available for draft elections");
    }

    const [votesByPosition, totalSubmissions] = await Promise.all([
      this.repo.getVoteCountsByPosition(electionId),
      this.repo.getTotalSubmissions(electionId),
    ]);

    return {
      election_id:       election.election_id,
      title:             election.title,
      status:            election.status,
      total_submissions: totalSubmissions,
      votes_by_position: votesByPosition,
    };
  }
}

module.exports = ElectionTrackingService;