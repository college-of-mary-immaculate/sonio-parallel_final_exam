class UserRepository {
    constructor({ masterDb, slaveDb }) {
        this.masterDb = masterDb; // writes
        this.slaveDb = slaveDb;   // reads
    }

    // =============================
    // READS → SLAVE
    // =============================

    async getUserById(userId) {
        const [rows] = await this.slaveDb.query(
            `
            SELECT user_id, email, full_name, role, created_at
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        );

        return rows[0] || null;
    }

    async getUserByEmail(email) {
        const [rows] = await this.slaveDb.query(
            `
            SELECT user_id, email, full_name, role, created_at
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        return rows[0] || null;
    }

    async getAllUsers() {
        const [rows] = await this.slaveDb.query(
            `
            SELECT user_id, email, full_name, role, status, created_at
            FROM users
            ORDER BY created_at DESC
            `
        );

        return rows;
    }

    async userHasVotes(userId) {
        const [rows] = await this.slaveDb.query(
            `
            SELECT COUNT(*) AS count
            FROM votes
            WHERE voter_id = ?
            `,
            [userId]
        );

        return rows[0].count > 0;
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

    async updateUser({ userId, email, fullName, passwordHash, role }) {
        const fields = [];
        const values = [];

        if (email !== undefined) {
            fields.push("email = ?");
            values.push(email);
        }

        if (fullName !== undefined) {
            fields.push("full_name = ?");
            values.push(fullName);
        }

        if (passwordHash !== undefined) {
            fields.push("password_hash = ?");
            values.push(passwordHash);
        }

        if (role !== undefined) {
            fields.push("role = ?");
            values.push(role);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(userId);

        await this.masterDb.query(
            `
            UPDATE users
            SET ${fields.join(", ")}
            WHERE user_id = ?
            `,
            values
        );
    }

    async deleteUser(userId) {
        await this.masterDb.query(
            `
            DELETE FROM users
            WHERE user_id = ?
            `,
            [userId]
        );
    }
}

module.exports = UserRepository;