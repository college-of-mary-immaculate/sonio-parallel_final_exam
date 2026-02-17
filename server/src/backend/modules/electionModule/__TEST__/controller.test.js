const ElectionController = require("../electionController");

describe("ElectionController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      addCandidate: jest.fn(),
      removeCandidate: jest.fn(),
      getElectionConfig: jest.fn()
    };

    controller = new ElectionController(mockService);

    req = {
      params: {},
      body: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  // =====================================
  // ADD CANDIDATE - SUCCESS
  // =====================================
  test("should add candidate and return result", async () => {
    req.params.electionId = 1;
    req.body = {
      positionId: 2,
      candidateData: { full_name: "John" }
    };

    const fakeResult = { candidate_id: 5 };

    mockService.addCandidate.mockResolvedValue(fakeResult);

    await controller.addCandidate(req, res);

    expect(mockService.addCandidate)
      .toHaveBeenCalledWith(1, 2, { full_name: "John" });

    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  // =====================================
  // ADD CANDIDATE - ERROR
  // =====================================
  test("should return 400 if addCandidate fails", async () => {
    req.params.electionId = 1;
    req.body = { positionId: 2, candidateData: {} };

    mockService.addCandidate.mockRejectedValue(
      new Error("Something failed")
    );

    await controller.addCandidate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Something failed"
    });
  });

  // =====================================
  // REMOVE CANDIDATE
  // =====================================
  test("should remove candidate and return success", async () => {
    req.params = {
      electionId: 1,
      positionId: 2,
      candidateId: 3
    };

    mockService.removeCandidate.mockResolvedValue();

    await controller.removeCandidate(req, res);

    expect(mockService.removeCandidate)
      .toHaveBeenCalledWith(1, 2, 3);

    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  // =====================================
  // GET CONFIG
  // =====================================
  test("should return election config", async () => {
    req.params.electionId = 1;

    const fakeConfig = {
      election: {},
      candidates: [],
      positions: []
    };

    mockService.getElectionConfig.mockResolvedValue(fakeConfig);

    await controller.getConfig(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeConfig);
  });
});
