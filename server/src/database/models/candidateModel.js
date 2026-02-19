module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS candidates (
            candidate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(150) NOT NULL,
            description TEXT,
            background TEXT,
            education TEXT,
            years_experience INT,
            primary_advocacy TEXT,
            secondary_advocacy TEXT,
            image_url VARCHAR(255)
        )
    `);
};
