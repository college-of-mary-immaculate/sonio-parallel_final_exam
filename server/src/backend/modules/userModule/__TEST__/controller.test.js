const UserController = require("../userController");

describe("UserController", () => {
  let controller;
  let mockService;
  let req;
  let res;

  beforeEach(() => {
    mockService = {
      register: jest.fn(),
      getProfile: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    };

    controller = new UserController(mockService);

    req = {
      body: {},
      user: { userId: 1, role: "voter" },
      params: { id: "1" }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // =============================
  // REGISTER
  // =============================
  test("should register user successfully", async () => {
    mockService.register.mockResolvedValue({ message: "User registered", userId: 1 });
    req.body = { email: "test@test.com", fullName: "Test User", password: "123456" };

    await controller.register(req, res);

    expect(mockService.register).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "User registered", userId: 1 });
  });

  test("should return 400 if register fails", async () => {
    mockService.register.mockRejectedValue(new Error("Email exists"));

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email exists" });
  });

  // =============================
  // GET PROFILE
  // =============================
  test("should get user profile", async () => {
    mockService.getProfile.mockResolvedValue({ userId: 1, email: "test@test.com" });

    await controller.getProfile(req, res);

    expect(mockService.getProfile).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ userId: 1, email: "test@test.com" });
  });

  test("should return 404 if profile not found", async () => {
    mockService.getProfile.mockRejectedValue(new Error("User not found"));

    await controller.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // =============================
  // GET ALL USERS
  // =============================
  test("should get all users", async () => {
    mockService.getAllUsers.mockResolvedValue([{ userId: 1 }]);

    await controller.getAllUsers(req, res);

    expect(mockService.getAllUsers).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ userId: 1 }]);
  });

  test("should return 500 if getAllUsers fails", async () => {
    mockService.getAllUsers.mockRejectedValue(new Error("DB Error"));

    await controller.getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB Error" });
  });

  // =============================
  // UPDATE USER
  // =============================
  test("should update user successfully", async () => {
    mockService.updateUser.mockResolvedValue({ message: "User updated successfully" });

    await controller.updateUser(req, res);

    expect(mockService.updateUser).toHaveBeenCalledWith({
      requester: req.user,
      userId: req.params.id,
      ...req.body
    });
    expect(res.json).toHaveBeenCalledWith({ message: "User updated successfully" });
  });

  test("should return 403 if forbidden", async () => {
    mockService.updateUser.mockRejectedValue(new Error("Forbidden: you can only update your own profile"));

    await controller.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forbidden: you can only update your own profile"
    });
  });

  // =============================
  // DELETE USER
  // =============================
  test("should delete user successfully", async () => {
    mockService.deleteUser.mockResolvedValue({ message: "User deleted successfully" });

    await controller.deleteUser(req, res);

    expect(mockService.deleteUser).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
  });

  test("should return 400 if delete fails", async () => {
    mockService.deleteUser.mockRejectedValue(new Error("Cannot delete user"));

    await controller.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Cannot delete user" });
  });
});
