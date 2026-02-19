const ElectionTrackingService = require("../electionTrackingService");

describe("ElectionTrackingService", () => {
  let service;
  let mockRepo;
  let mockElectionRepo;

  beforeEach(() => {
    mockRepo = {
      getLiveResults: jest.fn(),
      getVoteCountsByPosition: jest.fn(),
      getTotalSubmissions: jest.fn()
    };

    mockElectionRepo = {
      getElectionById: jest.fn()
    };

    service = new ElectionTrackingService(mockRepo, { electionRepository: mockElectionRepo });
  });

  // =========================================
  // GET LIVE RESULTS - SUCCESS
  // =========================================
  test("should return live results for an election", async () => {
    const election = { election_id: 1, status: "active", title: "Test Election", start_date: new Date(), end_date: new Date() };
    mockElectionRepo.getElectionById.mockResolvedValue(election);
    mockRepo.getLiveResults.mockResolvedValue([{ position_id: 1 }]);
    mockRepo.getTotalSubmissions.mockResolvedValue(5);

    const result = await service.getLiveResults(1);

    expect(result).toEqual({
      election_id: 1,
      title: "Test Election",
      status: "active",
      start_date: election.start_date,
      end_date: election.end_date,
      total_submissions: 5,
      positions: [{ position_id: 1 }]
    });
  });

  // =========================================
  // GET LIVE RESULTS - DRAFT ERROR
  // =========================================
  test("should throw if election is draft", async () => {
    const election = { election_id: 1, status: "draft" };
    mockElectionRepo.getElectionById.mockResolvedValue(election);

    await expect(service.getLiveResults(1)).rejects.toThrow("Results are not available for draft elections");
  });

  // =========================================
  // GET VOTE SUMMARY - SUCCESS
  // =========================================
  test("should return vote summary", async () => {
    const election = { election_id: 1, status: "active", title: "Election", start_date: new Date(), end_date: new Date() };
    mockElectionRepo.getElectionById.mockResolvedValue(election);
    mockRepo.getVoteCountsByPosition.mockResolvedValue([{ position_id: 1, total_votes: 10 }]);
    mockRepo.getTotalSubmissions.mockResolvedValue(5);

    const result = await service.getVoteSummary(1);

    expect(result).toEqual({
      election_id: 1,
      title: "Election",
      status: "active",
      total_submissions: 5,
      votes_by_position: [{ position_id: 1, total_votes: 10 }]
    });
  });

  // =========================================
  // GET VOTE SUMMARY - DRAFT ERROR
  // =========================================
  test("should throw if election is draft when getting summary", async () => {
    const election = { election_id: 1, status: "draft" };
    mockElectionRepo.getElectionById.mockResolvedValue(election);

    await expect(service.getVoteSummary(1)).rejects.toThrow("Summary not available for draft elections");
  });
});
