const CandidateService = require("../candidateService");

describe("CandidateService", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      getAllCandidates: jest.fn(),
      getCandidateById: jest.fn(),
      createCandidate: jest.fn(),
      updateCandidate: jest.fn(),
      deleteCandidate: jest.fn(),
      getCandidateElectionUsage: jest.fn()
    };

    service = new CandidateService(mockRepo);
  });

  // ===============================
  // GET ALL
  // ===============================
  test("should return all candidates", async () => {
    const fakeData = [{ candidate_id: 1, full_name: "John Doe" }];

    mockRepo.getAllCandidates.mockResolvedValue(fakeData);

    const result = await service.getAllCandidates();

    expect(result).toEqual(fakeData);
    expect(mockRepo.getAllCandidates).toHaveBeenCalled();
  });

  // ===============================
  // GET BY ID (NOT FOUND)
  // ===============================
  test("should throw error if candidate not found", async () => {
    mockRepo.getCandidateById.mockResolvedValue(null);

    await expect(service.getCandidateById(1))
      .rejects
      .toThrow("Candidate not found");
  });

  // ===============================
  // DELETE - BLOCK IF USED IN ENDED
  // ===============================
  test("should not delete if used in ended election", async () => {
    mockRepo.getCandidateById.mockResolvedValue({ candidate_id: 1 });
    mockRepo.getCandidateElectionUsage.mockResolvedValue([
      { status: "ended", count: 1 }
    ]);

    await expect(service.deleteCandidate(1))
      .rejects
      .toThrow("Cannot delete candidate used in ended elections");
  });

  // ===============================
  // DELETE - SUCCESS
  // ===============================
  test("should delete candidate if no ended elections", async () => {
    mockRepo.getCandidateById.mockResolvedValue({ candidate_id: 1 });
    mockRepo.getCandidateElectionUsage.mockResolvedValue([
      { status: "draft", count: 2 }
    ]);
    mockRepo.deleteCandidate.mockResolvedValue();

    const result = await service.deleteCandidate(1);

    expect(result).toEqual({ success: true });
    expect(mockRepo.deleteCandidate).toHaveBeenCalledWith(1);
  });
});
