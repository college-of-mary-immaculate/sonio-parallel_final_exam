const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    // =============================
    // LOGIN
    // =============================

    async login({ email, password }) {
        const user = await this.authRepository.getUserByEmail(email);

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

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

module.exports = AuthService;