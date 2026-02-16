module.exports = async (db) => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS election_candidates (
            election_candidate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            election_id BIGINT NOT NULL,
            candidate_id BIGINT NOT NULL,
            position_id BIGINT NOT NULL,
            UNIQUE(election_id, candidate_id, position_id),
            FOREIGN KEY (election_id) REFERENCES elections(election_id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
            FOREIGN KEY (position_id) REFERENCES positions(position_id)
        )
    `);
};
