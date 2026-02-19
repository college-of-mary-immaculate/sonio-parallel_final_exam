const ElectionCandidateController = require("../electionCandidateController");

describe("ElectionCandidateController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      getCandidatesForElection: jest.fn(),
      getCandidatesForPosition: jest.fn(),
      addCandidate: jest.fn(),
      removeCandidate: jest.fn(),
    };

    controller = new ElectionCandidateController(mockService);

    req = { params: {}, body: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  });

  // =====================================
  // GET BY ELECTION
  // =====================================
  test("should get candidates for an election", async () => {
    req.params.electionId = 1;
    const fakeResult = [{ candidate_id: 1 }];
    mockService.getCandidatesForElection.mockResolvedValue(fakeResult);

    await controller.getByElection(req, res);

    expect(mockService.getCandidatesForElection).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("should return 400 if getByElection fails", async () => {
    req.params.electionId = 1;
    mockService.getCandidatesForElection.mockRejectedValue(new Error("Failed"));

    await controller.getByElection(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });

  // =====================================
  // GET BY POSITION
  // =====================================
  test("should get candidates for a position", async () => {
    req.params = { electionId: 1, positionId: 2 };
    const fakeResult = [{ candidate_id: 1 }];
    mockService.getCandidatesForPosition.mockResolvedValue(fakeResult);

    await controller.getByPosition(req, res);

    expect(mockService.getCandidatesForPosition).toHaveBeenCalledWith(1, 2);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("should return 400 if getByPosition fails", async () => {
    req.params = { electionId: 1, positionId: 2 };
    mockService.getCandidatesForPosition.mockRejectedValue(new Error("Failed"));

    await controller.getByPosition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });

  // =====================================
  // ADD CANDIDATE
  // =====================================
  test("should add candidate successfully", async () => {
    req.params.electionId = 1;
    req.body = { positionId: 2, candidateId: 3 };
    const fakeResult = { success: true };
    mockService.addCandidate.mockResolvedValue(fakeResult);

    await controller.add(req, res);

    expect(mockService.addCandidate).toHaveBeenCalledWith(1, 2, 3);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("should return 400 if missing positionId or candidateId", async () => {
    req.params.electionId = 1;
    req.body = { positionId: 2 };

    await controller.add(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "positionId and candidateId are required" });
  });

  test("should return 400 if addCandidate throws", async () => {
    req.params.electionId = 1;
    req.body = { positionId: 2, candidateId: 3 };
    mockService.addCandidate.mockRejectedValue(new Error("Failed"));

    await controller.add(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });

  // =====================================
  // REMOVE CANDIDATE
  // =====================================
  test("should remove candidate successfully", async () => {
    req.params = { electionId: 1, positionId: 2, candidateId: 3 };
    const fakeResult = { success: true };
    mockService.removeCandidate.mockResolvedValue(fakeResult);

    await controller.remove(req, res);

    expect(mockService.removeCandidate).toHaveBeenCalledWith(1, 2, 3);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("should return 400 if removeCandidate throws", async () => {
    req.params = { electionId: 1, positionId: 2, candidateId: 3 };
    mockService.removeCandidate.mockRejectedValue(new Error("Failed"));

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });
});
