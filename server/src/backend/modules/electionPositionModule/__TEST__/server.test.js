const ElectionPositionService = require("../electionPositionService");

describe("ElectionPositionService", () => {
  let service;
  let mockRepo;
  let mockPositionRepo;

  beforeEach(() => {
    mockRepo = {
      addPositionToElection: jest.fn(),
      removePositionFromElection: jest.fn(),
      getPositionsForElection: jest.fn()
    };

    mockPositionRepo = {
      getPositionById: jest.fn()
    };

    service = new ElectionPositionService(mockRepo, mockPositionRepo);
  });

  // =====================================
  // ADD POSITION - SUCCESS
  // =====================================
  test("should add position if exists", async () => {
    mockPositionRepo.getPositionById.mockResolvedValue({ position_id: 2 });
    const fakeResult = { success: true };
    mockRepo.addPositionToElection.mockResolvedValue(fakeResult);

    const result = await service.addPositionToElection(1, 2);

    expect(mockPositionRepo.getPositionById).toHaveBeenCalledWith(2);
    expect(mockRepo.addPositionToElection).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual(fakeResult);
  });

  // =====================================
  // ADD POSITION - POSITION NOT FOUND
  // =====================================
  test("should throw if position not found", async () => {
    mockPositionRepo.getPositionById.mockResolvedValue(null);

    await expect(service.addPositionToElection(1, 2))
      .rejects.toThrow("Position not found");
  });

  // =====================================
  // REMOVE POSITION - SUCCESS
  // =====================================
  test("should remove position if exists", async () => {
    mockPositionRepo.getPositionById.mockResolvedValue({ position_id: 2 });
    const fakeResult = { success: true };
    mockRepo.removePositionFromElection.mockResolvedValue(fakeResult);

    const result = await service.removePositionFromElection(1, 2);

    expect(mockPositionRepo.getPositionById).toHaveBeenCalledWith(2);
    expect(mockRepo.removePositionFromElection).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual(fakeResult);
  });

  // =====================================
  // REMOVE POSITION - POSITION NOT FOUND
  // =====================================
  test("should throw if position not found when removing", async () => {
    mockPositionRepo.getPositionById.mockResolvedValue(null);

    await expect(service.removePositionFromElection(1, 2))
      .rejects.toThrow("Position not found");
  });

  // =====================================
  // GET POSITIONS FOR ELECTION
  // =====================================
  test("should return positions for election", async () => {
    const fakePositions = [{ position_id: 1 }];
    mockRepo.getPositionsForElection.mockResolvedValue(fakePositions);

    const result = await service.getPositionsForElection(1);

    expect(mockRepo.getPositionsForElection).toHaveBeenCalledWith(1);
    expect(result).toEqual(fakePositions);
  });
});
