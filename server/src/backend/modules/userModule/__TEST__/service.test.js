const bcrypt = require("bcrypt");
const UserService = require("../userService");

describe("UserService", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      getUserByEmail: jest.fn(),
      insertUser: jest.fn(),
      getUserById: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      userHasVotes: jest.fn()
    };

    service = new UserService(mockRepo);
  });

  // =============================
  // REGISTER
  // =============================
  test("should register a new user", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.insertUser.mockResolvedValue(1);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

    const result = await service.register({ email: "a@b.com", fullName: "Test", password: "123" });

    expect(result).toEqual({ message: "User registered successfully.", userId: 1 });
  });

  test("should throw if email exists", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ userId: 1 });

    await expect(
      service.register({ email: "a@b.com", fullName: "Test", password: "123" })
    ).rejects.toThrow("Email already registered.");
  });

  // =============================
  // GET PROFILE
  // =============================
  test("should get user profile", async () => {
    mockRepo.getUserById.mockResolvedValue({ userId: 1, email: "test@test.com" });

    const user = await service.getProfile(1);

    expect(user).toEqual({ userId: 1, email: "test@test.com" });
  });

  test("should throw if user not found", async () => {
    mockRepo.getUserById.mockResolvedValue(null);

    await expect(service.getProfile(1)).rejects.toThrow("User not found.");
  });

  // =============================
  // UPDATE USER
  // =============================
  test("should update user successfully for admin", async () => {
    mockRepo.getUserById.mockResolvedValue({ userId: 1, role: "voter" });
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

    const result = await service.updateUser({
      requester: { userId: 99, role: "admin" },
      userId: 1,
      password: "123",
      email: "new@mail.com"
    });

    expect(result).toEqual({ message: "User updated successfully." });
    expect(mockRepo.updateUser).toHaveBeenCalled();
  });

  test("should throw if non-admin updates other user", async () => {
    mockRepo.getUserById.mockResolvedValue({ userId: 2, role: "voter" });

    await expect(
      service.updateUser({ requester: { userId: 1, role: "voter" }, userId: 2 })
    ).rejects.toThrow("Forbidden: you can only update your own profile.");
  });

  // =============================
  // DELETE USER
  // =============================
  test("should delete user successfully", async () => {
    mockRepo.getUserById.mockResolvedValue({ userId: 1 });
    mockRepo.userHasVotes.mockResolvedValue(false);

    const result = await service.deleteUser(1);

    expect(result).toEqual({ message: "User deleted successfully." });
    expect(mockRepo.deleteUser).toHaveBeenCalledWith(1);
  });

  test("should throw if user has votes", async () => {
    mockRepo.getUserById.mockResolvedValue({ userId: 1 });
    mockRepo.userHasVotes.mockResolvedValue(true);

    await expect(service.deleteUser(1)).rejects.toThrow("Cannot delete user with vote history.");
  });
});
