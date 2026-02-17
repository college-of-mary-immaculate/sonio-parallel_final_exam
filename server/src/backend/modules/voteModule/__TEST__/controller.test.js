const VoteController = require("../voteController");

describe("VoteController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      submitVote: jest.fn()
    };

    controller = new VoteController(mockService);

    req = {
      user: { userId: 100 },
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // =====================================
  // SUCCESS
  // =====================================
  test("should submit vote successfully", async () => {
    req.body = {
      electionId: 1,
      votes: [{ positionId: 1, candidateId: 5 }]
    };

    mockService.submitVote.mockResolvedValue({
      message: "Vote submitted successfully."
    });

    await controller.submitVote(req, res);

    expect(mockService.submitVote).toHaveBeenCalledWith({
      electionId: 1,
      voterId: 100,
      votes: [{ positionId: 1, candidateId: 5 }]
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // =====================================
  // INVALID REQUEST
  // =====================================
  test("should return 400 for invalid request", async () => {
    req.body = { electionId: 1 }; // missing votes

    await controller.submitVote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid request data."
    });
  });

  // =====================================
  // SERVICE ERROR
  // =====================================
  test("should return 400 if service throws error", async () => {
    req.body = {
      electionId: 1,
      votes: []
    };

    mockService.submitVote.mockRejectedValue(
      new Error("Election not active")
    );

    await controller.submitVote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Election not active"
    });
  });
});
