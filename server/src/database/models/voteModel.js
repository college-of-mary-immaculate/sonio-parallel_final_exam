module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS votes (
            vote_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            candidate_id BIGINT NOT NULL,
            voter_id BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_vote_lookup (election_id, position_id),
            INDEX idx_voter_lookup (voter_id),

            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
            FOREIGN KEY (voter_id) REFERENCES users(user_id)
        )
    `);
};
