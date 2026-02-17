// modules/authModule/authIndex.js
const AuthRepository = require("./authRepository");
const AuthService = require("./authService");
const AuthController = require("./authController");
const authRoutes = require("./authRoutes");

module.exports = ({ slaveDb }) => {
    const authRepository = new AuthRepository({ slaveDb });
    const authService = new AuthService(authRepository);
    const authController = new AuthController(authService);
    const routes = authRoutes(authController);

    return {
        routes,
        authService
    };
};