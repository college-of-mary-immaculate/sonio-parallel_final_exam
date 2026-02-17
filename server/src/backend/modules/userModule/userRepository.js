// modules/userModule/userRepository.js
class UserRepository {
    constructor({ masterDb, slaveDb }) {
        this.masterDb = masterDb; // writes
        this.slaveDb = slaveDb;   // reads
    }

    // =============================
    // READS → SLAVE
    // =============================

    async getUserByEmail(email) {
        const [rows] = await this.slaveDb.query(
            `
            SELECT user_id, email, full_name, password_hash, role
            FROM users
            WHERE email = ?
            `,
            [email]
        );
        return rows[0];
    }

    async getUserById(userId) {
        const [rows] = await this.slaveDb.query(
            `
            SELECT user_id, email, full_name, role
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        );
        return rows[0];
    }

    // =============================
    // WRITES → MASTER
    // =============================

    async insertUser({ email, fullName, passwordHash, role }) {
        const [result] = await this.masterDb.query(
            `
            INSERT INTO users (email, full_name, password_hash, role)
            VALUES (?, ?, ?, ?)
            `,
            [email, fullName, passwordHash, role]
        );

        return result.insertId;
    }
}

module.exports = UserRepository;
