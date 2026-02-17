// modules/userModule/userController.js
class UserController {
    constructor(userService) {
        this.userService = userService;

        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    async register(req, res) {
        try {
            const { email, fullName, password } = req.body;

            if (!email || !fullName || !password) {
                return res.status(400).json({
                    message: "Missing required fields."
                });
            }

            const result =
                await this.userService.register({
                    email,
                    fullName,
                    password
                });

            return res.status(201).json(result);

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password required."
                });
            }

            const result =
                await this.userService.login({
                    email,
                    password
                });

            return res.status(200).json(result);

        } catch (error) {
            return res.status(401).json({
                message: error.message
            });
        }
    }
}

module.exports = UserController;
