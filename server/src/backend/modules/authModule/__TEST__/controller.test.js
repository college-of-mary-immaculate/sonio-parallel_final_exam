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

    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  // =====================================
  // SUCCESSFUL LOGIN
  // =====================================
  test("should return user data and token on login", async () => {
    req.body = { email: "test@example.com", password: "123" };
    const fakeResult = { token: "FAKE.TOKEN", user: { userId: 1 } };

    mockService.login.mockResolvedValue(fakeResult);

    await controller.login(req, res);

    expect(mockService.login).toHaveBeenCalledWith(req.body);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  // =====================================
  // LOGIN FAILURE
  // =====================================
  test("should return 401 if login fails", async () => {
    req.body = { email: "test@example.com", password: "wrong" };
    mockService.login.mockRejectedValue(new Error("Invalid email or password."));

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password."
    });
  });
});
