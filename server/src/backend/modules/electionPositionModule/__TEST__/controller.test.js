const ElectionPositionController = require("../electionPositionController");

describe("ElectionPositionController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      addPositionToElection: jest.fn(),
      removePositionFromElection: jest.fn(),
      getPositionsForElection: jest.fn()
    };

    controller = new ElectionPositionController(mockService);

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
  // ADD POSITION - SUCCESS
  // =====================================
  test("should add position to election", async () => {
    req.params = { electionId: 1, positionId: 2 };
    req.body = { candidate_count: 3, winners_count: 1, votes_per_voter: 1 };
    const fakeResult = { success: true };
    mockService.addPositionToElection.mockResolvedValue(fakeResult);

    await controller.add(req, res);

    expect(mockService.addPositionToElection)
      .toHaveBeenCalledWith(1, 2, {
        candidate_count: 3,
        winners_count: 1,
        votes_per_voter: 1
      });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  // =====================================
  // ADD POSITION - ERROR
  // =====================================
  test("should return 400 if add fails", async () => {
    req.params = { electionId: 1, positionId: 2 };
    req.body = { candidate_count: 3, winners_count: 1, votes_per_voter: 1 };
    mockService.addPositionToElection.mockRejectedValue(new Error("Failed"));

    await controller.add(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });

  // =====================================
  // REMOVE POSITION - SUCCESS
  // =====================================
  test("should remove position from election", async () => {
    req.params = { electionId: 1, positionId: 2 };
    const fakeResult = { success: true };
    mockService.removePositionFromElection.mockResolvedValue(fakeResult);

    await controller.remove(req, res);

    expect(mockService.removePositionFromElection)
      .toHaveBeenCalledWith(1, 2);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  // =====================================
  // REMOVE POSITION - ERROR
  // =====================================
  test("should return 400 if remove fails", async () => {
    req.params = { electionId: 1, positionId: 2 };
    mockService.removePositionFromElection.mockRejectedValue(new Error("Failed"));

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });

  // =====================================
  // GET POSITIONS BY ELECTION - SUCCESS
  // =====================================
  test("should get positions for an election", async () => {
    req.params = { electionId: 1 };
    const fakePositions = [{ position_id: 1 }];
    mockService.getPositionsForElection.mockResolvedValue(fakePositions);

    await controller.getByElection(req, res);

    expect(mockService.getPositionsForElection).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(fakePositions);
  });

  // =====================================
  // GET POSITIONS BY ELECTION - ERROR
  // =====================================
  test("should return 400 if get positions fails", async () => {
    req.params = { electionId: 1 };
    mockService.getPositionsForElection.mockRejectedValue(new Error("Failed"));

    await controller.getByElection(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed" });
  });
});
