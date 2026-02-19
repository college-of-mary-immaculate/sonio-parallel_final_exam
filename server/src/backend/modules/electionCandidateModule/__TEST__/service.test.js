const ElectionCandidateService = require("../electionCandidateService");

describe("ElectionCandidateService", () => {
  let service;
  let mockRepo;
  let mockElectionRepo;
  let mockCandidateRepo;
  let mockPositionRepo;

  beforeEach(() => {
    mockRepo = {
      addCandidateToElection: jest.fn(),
      removeCandidateFromElection: jest.fn(),
      candidateExistsInPosition: jest.fn(),
      countCandidatesForPosition: jest.fn(),
      getCandidatesForElection: jest.fn(),
      getCandidatesForPosition: jest.fn(),
    };

    mockElectionRepo = { getElectionById: jest.fn() };
    mockCandidateRepo = { getCandidateById: jest.fn() };
    mockPositionRepo = { getPositionsForElection: jest.fn() };

    service = new ElectionCandidateService(mockRepo, {
      electionRepository: mockElectionRepo,
      candidateRepository: mockCandidateRepo,
      positionRepository: mockPositionRepo
    });
  });

  // =====================================
  // ADD CANDIDATE
  // =====================================
  test("should add candidate if all conditions pass", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockPositionRepo.getPositionsForElection.mockResolvedValue([{ position_id: 2, candidate_count: 2 }]);
    mockCandidateRepo.getCandidateById.mockResolvedValue({ candidate_id: 3 });
    mockRepo.candidateExistsInPosition.mockResolvedValue(false);
    mockRepo.countCandidatesForPosition.mockResolvedValue(0);
    mockRepo.addCandidateToElection.mockResolvedValue({ success: true });

    const result = await service.addCandidate(1, 2, 3);

    expect(result).toEqual({ success: true });
    expect(mockRepo.addCandidateToElection).toHaveBeenCalledWith(1, 2, 3);
  });

  test("should throw if election is not draft", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "active" });

    await expect(service.addCandidate(1, 2, 3)).rejects.toThrow("Cannot modify a non-draft election");
  });

  test("should throw if position not in election", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockPositionRepo.getPositionsForElection.mockResolvedValue([{ position_id: 99 }]);

    await expect(service.addCandidate(1, 2, 3)).rejects.toThrow("Position is not part of this election");
  });

  test("should throw if candidate not found", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockPositionRepo.getPositionsForElection.mockResolvedValue([{ position_id: 2, candidate_count: 2 }]);
    mockCandidateRepo.getCandidateById.mockResolvedValue(null);

    await expect(service.addCandidate(1, 2, 3)).rejects.toThrow("Candidate not found");
  });

  test("should throw if candidate already exists in position", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockPositionRepo.getPositionsForElection.mockResolvedValue([{ position_id: 2, candidate_count: 2 }]);
    mockCandidateRepo.getCandidateById.mockResolvedValue({ candidate_id: 3 });
    mockRepo.candidateExistsInPosition.mockResolvedValue(true);

    await expect(service.addCandidate(1, 2, 3)).rejects.toThrow("Candidate already assigned to this position");
  });

  test("should throw if candidate_count exceeded", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockPositionRepo.getPositionsForElection.mockResolvedValue([{ position_id: 2, candidate_count: 1 }]);
    mockCandidateRepo.getCandidateById.mockResolvedValue({ candidate_id: 3 });
    mockRepo.candidateExistsInPosition.mockResolvedValue(false);
    mockRepo.countCandidatesForPosition.mockResolvedValue(1);

    await expect(service.addCandidate(1, 2, 3))
      .rejects.toThrow("Position already has the maximum 1 candidate(s)");
  });

  // =====================================
  // REMOVE CANDIDATE
  // =====================================
  test("should remove candidate if exists", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockRepo.candidateExistsInPosition.mockResolvedValue(true);
    mockRepo.removeCandidateFromElection.mockResolvedValue({ success: true });

    const result = await service.removeCandidate(1, 2, 3);
    expect(result).toEqual({ success: true });
  });

  test("should throw if candidate not assigned", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1, status: "draft" });
    mockRepo.candidateExistsInPosition.mockResolvedValue(false);

    await expect(service.removeCandidate(1, 2, 3)).rejects.toThrow(
      "Candidate is not assigned to this position in this election"
    );
  });

  // =====================================
  // GET CANDIDATES FOR ELECTION
  // =====================================
  test("should return candidates for election", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1 });
    mockRepo.getCandidatesForElection.mockResolvedValue([{ candidate_id: 1 }]);

    const result = await service.getCandidatesForElection(1);
    expect(result).toEqual([{ candidate_id: 1 }]);
  });

  test("should throw if election not found", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue(null);

    await expect(service.getCandidatesForElection(1)).rejects.toThrow("Election not found");
  });

  // =====================================
  // GET CANDIDATES FOR POSITION
  // =====================================
  test("should return candidates for position", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue({ election_id: 1 });
    mockRepo.getCandidatesForPosition.mockResolvedValue([{ candidate_id: 1 }]);

    const result = await service.getCandidatesForPosition(1, 2);
    expect(result).toEqual([{ candidate_id: 1 }]);
  });

  test("should throw if election not found for position", async () => {
    mockElectionRepo.getElectionById.mockResolvedValue(null);

    await expect(service.getCandidatesForPosition(1, 2)).rejects.toThrow("Election not found");
  });
});
