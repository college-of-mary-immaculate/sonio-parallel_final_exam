// modules/userModule/userRoutes.js
const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");

module.exports = (userController) => {
    const router = express.Router();

    // Public
    router.post("/register", userController.register);

    // Authenticated — own profile
    router.get(
        "/profile",
        authMiddleware,
        userController.getProfile
    );

    // Admin — list all users
    router.get(
        "/",
        authMiddleware,
        roleMiddleware(["admin"]),
        userController.getAllUsers
    );

    // Authenticated — update own profile; admin can update anyone
    router.put(
        "/:id",
        authMiddleware,
        userController.updateUser
    );

    // Admin — delete user (blocked if user has vote history)
    router.delete(
        "/:id",
        authMiddleware,
        roleMiddleware(["admin"]),
        userController.deleteUser
    );

    return router;
};