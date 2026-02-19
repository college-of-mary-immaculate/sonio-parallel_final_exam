// ===== File: service.test.js =====
const PositionService = require("../positionService");

describe("PositionService", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      getAllPositions: jest.fn(),
      getPositionById: jest.fn(),
      createPosition: jest.fn(),
      updatePosition: jest.fn(),
      deletePosition: jest.fn(),
    };

    service = new PositionService(mockRepo);
  });

  // =============================
  // GET ALL
  // =============================
  test("should return all positions", async () => {
    mockRepo.getAllPositions.mockResolvedValue([{ position_id: 1 }]);

    const result = await service.getAllPositions();

    expect(result).toEqual([{ position_id: 1 }]);
    expect(mockRepo.getAllPositions).toHaveBeenCalled();
  });

  // =============================
  // GET BY ID
  // =============================
  test("should return position by ID", async () => {
    mockRepo.getPositionById.mockResolvedValue({ position_id: 1 });

    const result = await service.getPositionById(1);

    expect(result).toEqual({ position_id: 1 });
    // FIX: match actual call signature
    expect(mockRepo.getPositionById).toHaveBeenCalledWith(1);
  });

  test("should throw if position not found", async () => {
    mockRepo.getPositionById.mockResolvedValue(null);

    await expect(service.getPositionById(1)).rejects.toThrow("Position not found");
  });

  // =============================
  // CREATE
  // =============================
  test("should create a position", async () => {
    const data = { name: "Governor" };

    // mock createPosition to return inserted id
    mockRepo.createPosition.mockResolvedValue({ position_id: 1, ...data });
    // mock getPositionById to return the fresh record
    mockRepo.getPositionById.mockResolvedValue({ position_id: 1, ...data });

    const result = await service.createPosition(data);

    expect(result).toEqual({ position_id: 1, ...data });
    expect(mockRepo.createPosition).toHaveBeenCalledWith(data);
    expect(mockRepo.getPositionById).toHaveBeenCalledWith(1, { forceMaster: true });
  });

  // =============================
  // UPDATE
  // =============================
  test("should update a position if exists", async () => {
    const data = { name: "Vice Governor" };

    // first call: check exists
    // second call: return updated record
    mockRepo.getPositionById
      .mockResolvedValueOnce({ position_id: 1, name: "Old Name" })
      .mockResolvedValueOnce({ position_id: 1, ...data });

    mockRepo.updatePosition.mockResolvedValue({ position_id: 1, ...data });

    const result = await service.updatePosition(1, data);

    expect(result).toEqual({ position_id: 1, ...data });
    // first check
    expect(mockRepo.getPositionById).toHaveBeenCalledWith(1, { forceMaster: true });
    // update call
    expect(mockRepo.updatePosition).toHaveBeenCalledWith(1, data);
  });

  test("should throw if updating non-existent position", async () => {
    mockRepo.getPositionById.mockResolvedValue(null);

    await expect(service.updatePosition(1, {})).rejects.toThrow("Position not found");
  });

  // =============================
  // DELETE
  // =============================
  test("should delete a position if exists", async () => {
    mockRepo.getPositionById.mockResolvedValue({ position_id: 1 });
    mockRepo.deletePosition.mockResolvedValue({ success: true });

    const result = await service.deletePosition(1);

    expect(result).toEqual({ success: true });
    expect(mockRepo.getPositionById).toHaveBeenCalledWith(1, { forceMaster: true });
    expect(mockRepo.deletePosition).toHaveBeenCalledWith(1);
  });

  test("should throw if deleting non-existent position", async () => {
    mockRepo.getPositionById.mockResolvedValue(null);

    await expect(service.deletePosition(1)).rejects.toThrow("Position not found");
  });
});
