// modules/userModule/userController.js

class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    register = async (req, res) => {
        try {
            const result = await this.userService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    getProfile = async (req, res) => {
        try {
            const user = await this.userService.getProfile(req.user.userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    };

    getAllUsers = async (req, res) => {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    updateUser = async (req, res) => {
        try {
            const result = await this.userService.updateUser({
                requester: req.user,
                userId: req.params.id,
                ...req.body
            });
            res.json(result);
        } catch (error) {
            const status = error.message.startsWith("Forbidden") ? 403 : 400;
            res.status(status).json({ message: error.message });
        }
    };

    deleteUser = async (req, res) => {
        try {
            const result = await this.userService.deleteUser(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };
}

module.exports = UserController;