// modules/authModule/authController.js

class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    login = async (req, res) => {
        try {
            const result = await this.authService.login(req.body);
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    };
}

module.exports = AuthController;