const AuthController = require("../authController");

describe("AuthController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      login: jest.fn()
    };

    controller = new AuthController(mockService);

    req = {
      body: {},
      user: { userId: 1, email: "test@example.com" }
    };

    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  // =====================================
  // SUCCESSFUL LOGIN
  // =====================================
  test("should set cookie and return user on login", async () => {
    req.body = { email: "test@example.com", password: "123" };

    const fakeResult = {
      token: "FAKE.TOKEN",
      user: { userId: 1, email: "test@example.com" }
    };

    mockService.login.mockResolvedValue(fakeResult);

    await controller.login(req, res);

    expect(mockService.login).toHaveBeenCalledWith(req.body);

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "FAKE.TOKEN",
      expect.objectContaining({
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
      })
    );

    expect(res.json).toHaveBeenCalledWith({
      user: fakeResult.user
    });
  });

  // =====================================
  // LOGIN FAILURE
  // =====================================
  test("should return 401 if login fails", async () => {
    req.body = { email: "test@example.com", password: "wrong" };

    mockService.login.mockRejectedValue(
      new Error("Invalid email or password.")
    );

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password."
    });
  });

  // =====================================
  // ME ENDPOINT
  // =====================================
  test("should return authenticated user", async () => {
    await controller.me(req, res);

    expect(res.json).toHaveBeenCalledWith({
      user: req.user
    });
  });

  // =====================================
  // LOGOUT
  // =====================================
  test("should clear cookie and return logout message", async () => {
    await controller.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        httpOnly: true
      })
    );

    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out"
    });
  });
});