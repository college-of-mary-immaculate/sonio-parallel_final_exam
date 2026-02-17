// modules/userModule/userIndex.js
const UserRepository = require("./userRepository");
const UserService = require("./userService");
const UserController = require("./userController");
const userRoutes = require("./userRoutes");

module.exports = ({ masterDb, slaveDb }) => {

    const userRepository = new UserRepository({
        masterDb,
        slaveDb
    });

    const userService = new UserService(userRepository);

    const userController = new UserController(userService);

    const routes = userRoutes(userController);

    return {
        routes,
        userService,
        userRepository
    };
};
