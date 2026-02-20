
const bcrypt = require("bcrypt");

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // =============================
    // REGISTER
    // =============================

    async register({ email, fullName, password }) {
        const existing = await this.userRepository.getUserByEmail(email);

        if (existing) {
            throw new Error("Email already registered.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const userId = await this.userRepository.insertUser({
            email,
            fullName,
            passwordHash,
            role: "voter"
        });

        return {
            message: "User registered successfully.",
            userId
        };
    }

    // =============================
    // GET PROFILE
    // =============================

    async getProfile(userId) {
        const user = await this.userRepository.getUserById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;
    }

    // =============================
    // GET ALL USERS (ADMIN)
    // =============================

    async getAllUsers() {
        return await this.userRepository.getAllUsers();
    }

    // =============================
    // UPDATE USER
    // =============================

    async updateUser({ requester, userId, email, fullName, password, role }) {
        const existing = await this.userRepository.getUserById(userId);

        if (!existing) {
            throw new Error("User not found.");
        }

        // Non-admins can only update their own profile
        if (requester.role !== "admin" && requester.userId !== parseInt(userId)) {
            throw new Error("Forbidden: you can only update your own profile.");
        }

        // Only admins can change roles
        if (role && requester.role !== "admin") {
            throw new Error("Only admins can change roles.");
        }

        let passwordHash;

        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        await this.userRepository.updateUser({
            userId,
            email,
            fullName,
            passwordHash,
            role
        });

        return { message: "User updated successfully." };
    }

    // =============================
    // DELETE USER
    // =============================

    async deleteUser(userId) {
        const existing = await this.userRepository.getUserById(userId);

        if (!existing) {
            throw new Error("User not found.");
        }

        const hasVotes = await this.userRepository.userHasVotes(userId);

        if (hasVotes) {
            throw new Error("Cannot delete user with vote history.");
        }

        await this.userRepository.deleteUser(userId);

        return { message: "User deleted successfully." };
    }
}

module.exports = UserService;