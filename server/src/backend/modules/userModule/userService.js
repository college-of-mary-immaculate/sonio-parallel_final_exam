// modules/userModule/userService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // =============================
    // REGISTER
    // =============================
    async register({ email, fullName, password }) {

        const existing =
            await this.userRepository.getUserByEmail(email);

        if (existing) {
            throw new Error("Email already registered.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const userId = await this.userRepository.insertUser({
            email,
            fullName,
            passwordHash,
            role: "voter" // default role
        });

        return {
            message: "User registered successfully.",
            userId
        };
    }

    // =============================
    // LOGIN
    // =============================
    async login({ email, password }) {

        const user =
            await this.userRepository.getUserByEmail(email);

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            throw new Error("Invalid email or password.");
        }

        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return {
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        };
    }
}

module.exports = UserService;
