import mainApi from "./mainApi";

const base = (electionId) => `/api/elections/${electionId}/candidates`;

export const electionCandidateApi = {

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
  // body: { positionId, candidateId }
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
};