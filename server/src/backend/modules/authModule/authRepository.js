class AuthRepository {
    constructor({ slaveDb }) {
        this.slaveDb = slaveDb; // auth only ever reads to verify credentials
    }

    async getUserByEmail(email) {
        const [rows] = await this.slaveDb.query(
            `
            SELECT user_id, email, full_name, password_hash, role, status
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        return rows[0] || null;
    }
}

module.exports = AuthRepository;