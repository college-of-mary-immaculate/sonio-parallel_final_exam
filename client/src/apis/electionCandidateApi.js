import mainApi from "./mainApi";

const base = (electionId) => `/api/elections/${electionId}/candidates`;
const voterBase = (electionId) => `/api/voters/elections/${electionId}/candidates`;

export const electionCandidateApi = {
  // ======================
  // ADMIN ROUTES
  // ======================

  // GET /api/elections/:electionId/candidates
  getByElection: async (electionId) => {
    const { data } = await mainApi.get(base(electionId));
    return data;
  },

  // GET /api/elections/:electionId/candidates/positions/:positionId
  getByPosition: async (electionId, positionId) => {
    const { data } = await mainApi.get(`${base(electionId)}/positions/${positionId}`);
    return data;
  },

  // POST /api/elections/:electionId/candidates
  add: async (electionId, positionId, candidateId) => {
    const { data } = await mainApi.post(base(electionId), { positionId, candidateId });
    return data;
  },

  // DELETE /api/elections/:electionId/candidates/:candidateId/positions/:positionId
  remove: async (electionId, positionId, candidateId) => {
    const { data } = await mainApi.delete(
      `${base(electionId)}/${candidateId}/positions/${positionId}`
    );
    return data;
  },

  // ======================
  // VOTER ROUTES
  // ======================

  // GET /api/voters/elections/:electionId/candidates
  // optionally can filter by positionId if provided
  getForVoter: async (electionId, positionId = null) => {
    let url = voterBase(electionId);
    if (positionId) url += `?positionId=${positionId}`;
    const { data } = await mainApi.get(url);
    return data;
  },
};
