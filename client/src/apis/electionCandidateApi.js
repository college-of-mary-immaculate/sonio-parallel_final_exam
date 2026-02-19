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

  // Previously sent ?positionId=X as a query param — but the backend route is:
  //   GET /api/voters/elections/:electionId/candidates/positions/:positionId
  // Fixed to use path param to match the existing backend route.
  getForVoter: async (electionId, positionId = null) => {
    const url = positionId
      ? `${voterBase(electionId)}/positions/${positionId}` // ← path param, matches backend
      : voterBase(electionId);
    const { data } = await mainApi.get(url);
    return data;
  },
};