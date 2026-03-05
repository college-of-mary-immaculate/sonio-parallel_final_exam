const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");

module.exports = (authController) => {
    const router = express.Router();

    router.post("/login",   authController.login);
    router.get("/me",       authMiddleware, authController.me);     // restores session from cookie
    router.post("/logout",  authController.logout);                 // clears the cookie

    return router;
};