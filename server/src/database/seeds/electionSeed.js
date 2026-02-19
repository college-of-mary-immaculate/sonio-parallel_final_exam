module.exports = async (db) => {
    console.log("Seeding elections with positions and candidates manually...");

    const createdBy = 1; // admin user_id

    // ========================
    // Insert Elections
    // ========================
    const [e1] = await db.query(
        `INSERT INTO elections (title, status, start_date, end_date, created_by)
         VALUES (?, 'active', ?, ?, ?)`,
        ["Provincial Election Feb 11", "2026-02-11 08:00:00", "2026-02-15 17:00:00", createdBy]
    );
    const electionId1 = e1.insertId;

    const [e2] = await db.query(
        `INSERT INTO elections (title, status, start_date, end_date, created_by)
         VALUES (?, 'active', ?, ?, ?)`,
        ["Provincial Election Feb 12", "2026-02-12 08:00:00", "2026-02-16 17:00:00", createdBy]
    );
    const electionId2 = e2.insertId;

    const [e3] = await db.query(
        `INSERT INTO elections (title, status, start_date, end_date, created_by)
         VALUES (?, 'active', ?, ?, ?)`,
        ["Provincial Election Feb 13", "2026-02-13 08:00:00", "2026-02-17 17:00:00", createdBy]
    );
    const electionId3 = e3.insertId;

    // ========================
    // Election 1 Positions & Candidates
    // ========================
    // Governor
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 1, 3, 1, 1)`,
        [electionId1]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 1, 1),
        (?, 1, 2),
        (?, 1, 3)`,
        [electionId1, electionId1, electionId1]
    );

    // Vice Governor
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 2, 3, 1, 1)`,
        [electionId1]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 2, 4),
        (?, 2, 5),
        (?, 2, 6)`,
        [electionId1, electionId1, electionId1]
    );

    // Provincial Board
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 3, 5, 5, 5)`,
        [electionId1]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 3, 7),
        (?, 3, 8),
        (?, 3, 9),
        (?, 3, 10),
        (?, 3, 11)`,
        [electionId1, electionId1, electionId1, electionId1, electionId1]
    );

    // ========================
    // Election 2 Positions & Candidates
    // ========================
    // Governor
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 1, 3, 1, 1)`,
        [electionId2]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 1, 12),
        (?, 1, 13),
        (?, 1, 14)`,
        [electionId2, electionId2, electionId2]
    );

    // Vice Governor
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 2, 3, 1, 1)`,
        [electionId2]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 2, 15),
        (?, 2, 16),
        (?, 2, 17)`,
        [electionId2, electionId2, electionId2]
    );

    // Provincial Board
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 3, 5, 5, 5)`,
        [electionId2]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 3, 18),
        (?, 3, 19),
        (?, 3, 20),
        (?, 3, 1),
        (?, 3, 2)`,
        [electionId2, electionId2, electionId2, electionId2, electionId2]
    );

    // ========================
    // Election 3 Positions & Candidates
    // ========================
    // Governor
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 1, 3, 1, 1)`,
        [electionId3]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 1, 3),
        (?, 1, 4),
        (?, 1, 5)`,
        [electionId3, electionId3, electionId3]
    );

    // Vice Governor
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 2, 3, 1, 1)`,
        [electionId3]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 2, 6),
        (?, 2, 7),
        (?, 2, 8)`,
        [electionId3, electionId3, electionId3]
    );

    // Provincial Board
    await db.query(
        `INSERT INTO election_positions (election_id, position_id, candidate_count, winners_count, votes_per_voter)
         VALUES (?, 3, 5, 5, 5)`,
        [electionId3]
    );
    await db.query(
        `INSERT INTO election_candidates (election_id, position_id, candidate_id) VALUES
        (?, 3, 9),
        (?, 3, 10),
        (?, 3, 11),
        (?, 3, 12),
        (?, 3, 13)`,
        [electionId3, electionId3, electionId3, electionId3, electionId3]
    );

    console.log("Elections seeded manually with unique candidates per position for all 3 elections.");
};
