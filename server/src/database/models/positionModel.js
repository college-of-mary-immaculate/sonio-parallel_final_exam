module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS positions (
            position_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT
        )
    `);
};
