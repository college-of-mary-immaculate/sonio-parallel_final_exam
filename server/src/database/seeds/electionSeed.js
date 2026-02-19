// ===== File: ../../seeds/electionSeed.js =====
module.exports = async (db) => {
    console.log("Seeding elections with positions and candidates...");

    const elections = [
        { title: "Provincial Election Feb 11", start: "2026-02-11 08:00:00", end: "2026-02-15 17:00:00" },
        { title: "Provincial Election Feb 12", start: "2026-02-12 08:00:00", end: "2026-02-16 17:00:00" },
        { title: "Provincial Election Feb 13", start: "2026-02-13 08:00:00", end: "2026-02-17 17:00:00" }
    ];

    const createdBy = 1; // admin user_id

    const positionIds = {
        Governor: 1,
        "Vice Governor": 2,
        "Provincial Board": 3
    };

    // Fetch all candidate IDs
    const [candidates] = await db.query(`SELECT candidate_id FROM candidates`);
    const candidateIds = candidates.map(c => c.candidate_id);

    for (const e of elections) {
        const [result] = await db.query(
            `INSERT INTO elections (title, status, start_date, end_date, created_by)
             VALUES (?, 'active', ?, ?, ?)`,
            [e.title, e.start, e.end, createdBy]
        );
        const electionId = result.insertId;

        // Keep track of candidates already assigned in this election
        const usedCandidateIds = new Set();

        for (const [posName, posId] of Object.entries(positionIds)) {
            const candidateCount = 3;
            const winnersCount = posName === "Provincial Board" ? 5 : 1;
            const votesPerVoter = winnersCount;

            await db.query(
                `INSERT INTO election_positions 
                    (election_id, position_id, candidate_count, winners_count, votes_per_voter)
                 VALUES (?, ?, ?, ?, ?)`,
                [electionId, posId, candidateCount, winnersCount, votesPerVoter]
            );

            // Assign candidates without repeating
            let assigned = 0;
            let idx = 0;
            while (assigned < candidateCount && idx < candidateIds.length) {
                const candidateId = candidateIds[idx];
                idx++;
                if (!usedCandidateIds.has(candidateId)) {
                    await db.query(
                        `INSERT INTO election_candidates 
                            (election_id, position_id, candidate_id)
                         VALUES (?, ?, ?)`,
                        [electionId, posId, candidateId]
                    );
                    usedCandidateIds.add(candidateId);
                    assigned++;
                }
            }

            if (assigned < candidateCount) {
                console.warn(`Not enough unique candidates to fill position: ${posName} for election ${e.title}`);
            }
        }
    }

    console.log("Elections seeded with positions and candidates (unique per election).");
};
