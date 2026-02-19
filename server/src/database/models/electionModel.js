module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS elections (
            election_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            status ENUM('draft','pending','active','ended') DEFAULT 'draft',
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            created_by BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(user_id)
        )
    `);
};