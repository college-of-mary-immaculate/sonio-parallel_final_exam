import mainApi from "./mainApi";

const base = (electionId) => `/api/elections/${electionId}/positions`;

export const electionPositionApi = {
  // ======================
  // ADMIN ROUTES
  // ======================

  // GET /api/elections/:electionId/positions (admin)
  getByElection: async (electionId) => {
    const { data } = await mainApi.get(base(electionId));
    return data;
  },

  // POST /api/elections/:electionId/positions/:positionId
  add: async (electionId, positionId, config) => {
    const { data } = await mainApi.post(
      `${base(electionId)}/${positionId}`,
      config // { candidate_count, winners_count, votes_per_voter }
    );
    return data;
  },

  // DELETE /api/elections/:electionId/positions/:positionId
  remove: async (electionId, positionId) => {
    const { data } = await mainApi.delete(`${base(electionId)}/${positionId}`);
    return data;
  },

  // ======================
  // VOTER ROUTES
  // ======================

  // GET /api/elections/:electionId/positions/voter
  getForVoter: async (electionId) => {
    const { data } = await mainApi.get(`${base(electionId)}/voter`);
    return data;
  },
};
