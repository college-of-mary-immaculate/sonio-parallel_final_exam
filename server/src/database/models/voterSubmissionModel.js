module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS voter_submissions (
            submission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            voter_id BIGINT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(election_id, voter_id),
            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (voter_id) REFERENCES users(user_id)
        )
    `);
};
