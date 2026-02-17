const VoteService = require("../voteService");

describe("VoteService", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      withTransaction: jest.fn(),
      getElectionById: jest.fn(),
      hasVoterSubmitted: jest.fn(),
      getElectionPositionRule: jest.fn(),
      getElectionCandidate: jest.fn(),
      insertVotes: jest.fn(),
      insertSubmission: jest.fn()
    };

    service = new VoteService(mockRepo);
  });

  // =========================================
  // SUCCESSFUL VOTE
  // =========================================
  test("should submit vote successfully", async () => {

    // fake transaction wrapper
    mockRepo.withTransaction.mockImplementation(async (callback) => {
      return callback("fakeConnection");
    });

    mockRepo.getElectionById.mockResolvedValue({
      election_id: 1,
      status: "active"
    });

    mockRepo.hasVoterSubmitted.mockResolvedValue(false);

    mockRepo.getElectionPositionRule.mockResolvedValue({
      votes_per_voter: 1
    });

    mockRepo.getElectionCandidate.mockResolvedValue({
      candidate_id: 5
    });

    mockRepo.insertVotes.mockResolvedValue();
    mockRepo.insertSubmission.mockResolvedValue();

    const result = await service.submitVote({
      electionId: 1,
      voterId: 100,
      votes: [
        { positionId: 1, candidateId: 5 }
      ]
    });

    expect(result).toEqual({
      message: "Vote submitted successfully."
    });

    expect(mockRepo.insertVotes).toHaveBeenCalled();
    expect(mockRepo.insertSubmission).toHaveBeenCalled();
  });

  // =========================================
  // ELECTION NOT FOUND
  // =========================================
  test("should throw if election not found", async () => {

    mockRepo.withTransaction.mockImplementation(async (cb) => cb());

    mockRepo.getElectionById.mockResolvedValue(null);

    await expect(
      service.submitVote({
        electionId: 1,
        voterId: 100,
        votes: []
      })
    ).rejects.toThrow("Election not found.");
  });

  // =========================================
  // ELECTION NOT ACTIVE
  // =========================================
  test("should throw if election is not active", async () => {

    mockRepo.withTransaction.mockImplementation(async (cb) => cb());

    mockRepo.getElectionById.mockResolvedValue({
      election_id: 1,
      status: "draft"
    });

    await expect(
      service.submitVote({
        electionId: 1,
        voterId: 100,
        votes: []
      })
    ).rejects.toThrow("Election is not active.");
  });

  // =========================================
  // ALREADY SUBMITTED
  // =========================================
  test("should throw if voter already submitted", async () => {

    mockRepo.withTransaction.mockImplementation(async (cb) => cb());

    mockRepo.getElectionById.mockResolvedValue({
      election_id: 1,
      status: "active"
    });

    mockRepo.hasVoterSubmitted.mockResolvedValue(true);

    await expect(
      service.submitVote({
        electionId: 1,
        voterId: 100,
        votes: []
      })
    ).rejects.toThrow("You have already submitted your vote.");
  });

  // =========================================
  // VOTE LIMIT EXCEEDED
  // =========================================
  test("should throw if vote limit exceeded", async () => {

    mockRepo.withTransaction.mockImplementation(async (cb) => cb());

    mockRepo.getElectionById.mockResolvedValue({
      election_id: 1,
      status: "active"
    });

    mockRepo.hasVoterSubmitted.mockResolvedValue(false);

    mockRepo.getElectionPositionRule.mockResolvedValue({
      votes_per_voter: 1
    });

    await expect(
      service.submitVote({
        electionId: 1,
        voterId: 100,
        votes: [
          { positionId: 1, candidateId: 5 },
          { positionId: 1, candidateId: 6 } // exceeds limit
        ]
      })
    ).rejects.toThrow("Vote limit exceeded.");
  });
});
