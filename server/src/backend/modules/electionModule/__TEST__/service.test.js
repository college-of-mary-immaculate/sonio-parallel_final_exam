const ElectionService = require("../electionService");

describe("ElectionService", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      createGlobalCandidate: jest.fn(),
      addCandidateToElection: jest.fn(),
      removeCandidateFromElection: jest.fn(),
      getElectionById: jest.fn(),
      getElectionCandidates: jest.fn(),
      getPositionsForElection: jest.fn()
    };

    service = new ElectionService(mockRepo);
  });

  // =========================================
  // ADD CANDIDATE - USING EXISTING candidate_id
  // =========================================
test("should add existing candidate to election", async () => {
  const candidateData = { candidate_id: 10 };

  // Mock resolves to whatever your repo returns (e.g., election state)
  const fakeElectionState = { election_id: 1 };
  mockRepo.addCandidateToElection.mockResolvedValue(fakeElectionState);

  const result = await service.addCandidate(1, 2, candidateData);

  expect(mockRepo.addCandidateToElection)
    .toHaveBeenCalledWith(1, 10, 2);

  // ✅ Adjust test to expect election state instead of candidate object
  expect(result).toEqual(fakeElectionState);
});

  // =========================================
  // ADD CANDIDATE - CREATE GLOBAL FIRST
  // =========================================
test("should create new global candidate then add to election", async () => {
  const candidateData = {
    full_name: "John Doe",
    background: "Lawyer"
  };

  mockRepo.createGlobalCandidate.mockResolvedValue({ candidate_id: 5 });
  const fakeElectionState = { election_id: 1 };
  mockRepo.addCandidateToElection.mockResolvedValue(fakeElectionState);

  const result = await service.addCandidate(1, 2, candidateData);

  expect(mockRepo.createGlobalCandidate)
    .toHaveBeenCalledWith(candidateData);
  expect(mockRepo.addCandidateToElection)
    .toHaveBeenCalledWith(1, 5, 2);

  // ✅ Expect election state
  expect(result).toEqual(fakeElectionState);
});


  // =========================================
  // REMOVE CANDIDATE
  // =========================================
  test("should remove candidate from election", async () => {
    mockRepo.removeCandidateFromElection.mockResolvedValue();

    await service.removeCandidate(1, 2, 3);

    expect(mockRepo.removeCandidateFromElection)
      .toHaveBeenCalledWith(1, 3, 2);
  });

  // =========================================
  // GET CONFIG
  // =========================================
  test("should return full election config", async () => {
    mockRepo.getElectionById.mockResolvedValue({ election_id: 1 });
    mockRepo.getElectionCandidates.mockResolvedValue([{ id: 1 }]);
    mockRepo.getPositionsForElection.mockResolvedValue([{ id: 2 }]);

    const result = await service.getElectionConfig(1);

    expect(result).toEqual({
      election: { election_id: 1 },
      candidates: [{ id: 1 }],
      positions: [{ id: 2 }]
    });
  });
});
