class ElectionTrackingRepository {
  constructor({ masterDb, slaveDb }) {
    this.masterDb = masterDb;
    this.slaveDb  = slaveDb;
  }

  /**
   * Live vote counts + rank for every candidate in every position
   * of a given election. Uses slave for reads (real-time is fine with
   * slight lag; use forceMaster only if needed).
   *
   * Returns:
   * [
   *   {
   *     position_id, position_name, candidate_count, winners_count,
   *     candidates: [
   *       { candidate_id, full_name, image_url, vote_count, rank, is_leading }
   *     ]
   *   }
   * ]
   */
  async getLiveResults(electionId, { forceMaster = false } = {}) {
    const db = forceMaster ? this.masterDb : this.slaveDb;

    // 1️⃣ Get all positions for this election
    const [positions] = await db.query(
      `SELECT ep.position_id, ep.candidate_count, ep.winners_count, ep.votes_per_voter,
              p.name AS position_name, p.description
       FROM election_positions ep
       JOIN positions p ON p.position_id = ep.position_id
       WHERE ep.election_id = ?
       ORDER BY p.name ASC`,
      [electionId]
    );

    if (positions.length === 0) return [];

    // 2️⃣ Get vote counts for all candidates in this election at once
    const [voteCounts] = await db.query(
      `SELECT v.position_id, v.candidate_id,
              c.full_name, c.image_url,
              COUNT(*) AS vote_count
       FROM votes v
       JOIN candidates c ON c.candidate_id = v.candidate_id
       WHERE v.election_id = ?
       GROUP BY v.position_id, v.candidate_id`,
      [electionId]
    );

    // 3️⃣ Get all candidates assigned to this election (even 0-vote ones)
    const [assignedCandidates] = await db.query(
      `SELECT ec.position_id, ec.candidate_id,
              c.full_name, c.image_url
       FROM election_candidates ec
       JOIN candidates c ON c.candidate_id = ec.candidate_id
       WHERE ec.election_id = ?`,
      [electionId]
    );

    // 4️⃣ Build a vote count lookup map
    const voteMap = {};
    for (const row of voteCounts) {
      voteMap[`${row.position_id}_${row.candidate_id}`] = row.vote_count;
    }

    // 5️⃣ Group candidates by position and compute rankings
    const candidatesByPosition = {};
    for (const ac of assignedCandidates) {
      if (!candidatesByPosition[ac.position_id]) {
        candidatesByPosition[ac.position_id] = [];
      }
      candidatesByPosition[ac.position_id].push({
        candidate_id: ac.candidate_id,
        full_name:    ac.full_name,
        image_url:    ac.image_url,
        vote_count:   voteMap[`${ac.position_id}_${ac.candidate_id}`] ?? 0,
      });
    }

    // 6️⃣ Sort each position's candidates by vote_count DESC and assign rank
    const result = positions.map(pos => {
      const positionCandidates = (candidatesByPosition[pos.position_id] ?? [])
        .sort((a, b) => b.vote_count - a.vote_count)
        .map((c, index) => ({
          ...c,
          rank:       index + 1,
          is_leading: index < pos.winners_count, // top N are in winning seats
        }));

      return {
        position_id:     pos.position_id,
        position_name:   pos.position_name,
        description:     pos.description,
        candidate_count: pos.candidate_count,
        winners_count:   pos.winners_count,
        votes_per_voter: pos.votes_per_voter,
        candidates:      positionCandidates,
      };
    });

    return result;
  }

  /**
   * Total voters who have submitted in this election
   */
  async getTotalSubmissions(electionId, { forceMaster = false } = {}) {
    const db = forceMaster ? this.masterDb : this.slaveDb;
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM voter_submissions WHERE election_id = ?`,
      [electionId]
    );
    return rows[0].total;
  }

  /**
   * Summary: total votes cast per position
   */
  async getVoteCountsByPosition(electionId, { forceMaster = false } = {}) {
    const db = forceMaster ? this.masterDb : this.slaveDb;
    const [rows] = await db.query(
      `SELECT v.position_id, p.name AS position_name, COUNT(*) AS total_votes
       FROM votes v
       JOIN positions p ON p.position_id = v.position_id
       WHERE v.election_id = ?
       GROUP BY v.position_id`,
      [electionId]
    );
    return rows;
  }
}

module.exports = ElectionTrackingRepository;