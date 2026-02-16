module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS election_positions (
            election_position_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            candidate_count INT NOT NULL,
            winners_count INT NOT NULL,
            votes_per_voter INT NOT NULL,
            UNIQUE(election_id, position_id),
            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id)
        )
    `);
};
