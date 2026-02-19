const PositionController = require("../positionController");

describe("PositionController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      getAllPositions: jest.fn(),
      getPositionById: jest.fn(),
      createPosition: jest.fn(),
      updatePosition: jest.fn(),
      deletePosition: jest.fn(),
    };

    controller = new PositionController(mockService);

    req = {
      body: {},
      params: { positionId: "1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // =============================
  // GET ALL
  // =============================
  test("should get all positions successfully", async () => {
    mockService.getAllPositions.mockResolvedValue([{ position_id: 1 }]);

    await controller.getAll(req, res);

    expect(mockService.getAllPositions).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ position_id: 1 }]);
  });

  test("should return 400 if getAll fails", async () => {
    mockService.getAllPositions.mockRejectedValue(new Error("DB Error"));

    await controller.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "DB Error" });
  });

  // =============================
  // GET BY ID
  // =============================
  test("should get position by ID", async () => {
    mockService.getPositionById.mockResolvedValue({ position_id: 1 });

    await controller.getById(req, res);

    expect(mockService.getPositionById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ position_id: 1 });
  });

  test("should return 404 if position not found", async () => {
    mockService.getPositionById.mockRejectedValue(new Error("Position not found"));

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Position not found" });
  });

  // =============================
  // CREATE
  // =============================
  test("should create a position", async () => {
    const newPosition = { name: "Governor" };
    req.body = newPosition;
    mockService.createPosition.mockResolvedValue({ position_id: 1, ...newPosition });

    await controller.create(req, res);

    expect(mockService.createPosition).toHaveBeenCalledWith(newPosition);
    expect(res.json).toHaveBeenCalledWith({ position_id: 1, ...newPosition });
  });

  test("should return 400 if create fails", async () => {
    mockService.createPosition.mockRejectedValue(new Error("Invalid data"));

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid data" });
  });

  // =============================
  // UPDATE
  // =============================
  test("should update a position", async () => {
    const updateData = { name: "Vice Governor" };
    req.body = updateData;

    mockService.updatePosition.mockResolvedValue({ position_id: 1, ...updateData });

    await controller.update(req, res);

    expect(mockService.updatePosition).toHaveBeenCalledWith("1", updateData);
    expect(res.json).toHaveBeenCalledWith({ position_id: 1, ...updateData });
  });

  test("should return 400 if update fails", async () => {
    mockService.updatePosition.mockRejectedValue(new Error("Update error"));

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Update error" });
  });

  // =============================
  // DELETE
  // =============================
  test("should delete a position", async () => {
    mockService.deletePosition.mockResolvedValue({ success: true });

    await controller.delete(req, res);

    expect(mockService.deletePosition).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test("should return 400 if delete fails", async () => {
    mockService.deletePosition.mockRejectedValue(new Error("Delete error"));

    await controller.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Delete error" });
  });
});
