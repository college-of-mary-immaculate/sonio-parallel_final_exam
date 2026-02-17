const AuthService = require("../authService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      getUserByEmail: jest.fn()
    };

    service = new AuthService(mockRepo);

    jest.clearAllMocks();
  });

  // =====================================
  // SUCCESSFUL LOGIN
  // =====================================
  test("should return token and user on successful login", async () => {
    const fakeUser = {
      user_id: 1,
      email: "test@example.com",
      full_name: "John Doe",
      password_hash: "hashed",
      role: "admin"
    };

    mockRepo.getUserByEmail.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("FAKE.JWT.TOKEN");

    const result = await service.login({
      email: "test@example.com",
      password: "password123"
    });

    expect(result).toEqual({
      token: "FAKE.JWT.TOKEN",
      user: {
        userId: 1,
        email: "test@example.com",
        fullName: "John Doe",
        role: "admin"
      }
    });

    expect(mockRepo.getUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed");
    expect(jwt.sign).toHaveBeenCalled();
  });

  // =====================================
  // INVALID EMAIL
  // =====================================
  test("should throw error if user not found", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: "unknown@test.com", password: "123" })
    ).rejects.toThrow("Invalid email or password.");
  });

  // =====================================
  // INVALID PASSWORD
  // =====================================
  test("should throw error if password does not match", async () => {
    const fakeUser = {
      user_id: 1,
      email: "test@example.com",
      full_name: "John Doe",
      password_hash: "hashed",
      role: "admin"
    };

    mockRepo.getUserByEmail.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      service.login({ email: "test@example.com", password: "wrongpass" })
    ).rejects.toThrow("Invalid email or password.");
  });
});
