// modules/userModule/userRoutes.js
const express = require("express");

module.exports = (userController) => {
    const router = express.Router();

    router.post("/register", userController.register);
    router.post("/login", userController.login);

    return router;
};
