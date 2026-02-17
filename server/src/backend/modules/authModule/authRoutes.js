// modules/authModule/authRoutes.js
const express = require("express");

module.exports = (authController) => {
    const router = express.Router();

    router.post("/login", authController.login);

    return router;
};