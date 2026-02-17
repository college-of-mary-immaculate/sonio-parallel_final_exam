const CandidateController = require("../candidateController");

describe("CandidateController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      getAllCandidates: jest.fn(),
      getCandidateById: jest.fn(),
      createCandidate: jest.fn(),
      updateCandidate: jest.fn(),
      deleteCandidate: jest.fn()
    };

    controller = new CandidateController(mockService);

    req = {
      params: {},
      body: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  // ===============================
  // GET ALL
  // ===============================
  test("should return all candidates", async () => {
    const fakeData = [{ candidate_id: 1 }];

    mockService.getAllCandidates.mockResolvedValue(fakeData);

    await controller.getAllCandidates(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeData);
  });

  // ===============================
  // GET BY ID - ERROR
  // ===============================
  test("should return 404 if not found", async () => {
    req.params.candidateId = 1;
    mockService.getCandidateById.mockRejectedValue(
      new Error("Candidate not found")
    );

    await controller.getCandidateById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Candidate not found"
    });
  });
});
