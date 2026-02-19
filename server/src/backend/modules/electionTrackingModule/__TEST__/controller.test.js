const ElectionTrackingController = require("../electionTrackingController");

describe("ElectionTrackingController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      getLiveResults: jest.fn(),
      getVoteSummary: jest.fn()
    };

    controller = new ElectionTrackingController(mockService);

    req = {
      params: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  // =====================================
  // GET LIVE RESULTS - SUCCESS
  // =====================================
  test("should return live results", async () => {
    req.params.electionId = 1;
    const fakeResults = { positions: [] };
    mockService.getLiveResults.mockResolvedValue(fakeResults);

    await controller.getLiveResults(req, res);

    expect(mockService.getLiveResults).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(fakeResults);
  });

  // =====================================
  // GET LIVE RESULTS - ERROR
  // =====================================
  test("should return 400 if getLiveResults fails", async () => {
    req.params.electionId = 1;
    mockService.getLiveResults.mockRejectedValue(new Error("Failed"));

    await controller.getLiveResults(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });

  // =====================================
  // GET VOTE SUMMARY - SUCCESS
  // =====================================
  test("should return vote summary", async () => {
    req.params.electionId = 2;
    const fakeSummary = { votes_by_position: [], total_submissions: 10 };
    mockService.getVoteSummary.mockResolvedValue(fakeSummary);

    await controller.getVoteSummary(req, res);

    expect(mockService.getVoteSummary).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith(fakeSummary);
  });

  // =====================================
  // GET VOTE SUMMARY - ERROR
  // =====================================
  test("should return 400 if getVoteSummary fails", async () => {
    req.params.electionId = 2;
    mockService.getVoteSummary.mockRejectedValue(new Error("Failed summary"));

    await controller.getVoteSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed summary" });
  });
});
