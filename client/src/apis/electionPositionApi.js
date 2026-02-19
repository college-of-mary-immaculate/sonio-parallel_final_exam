import mainApi from "./mainApi";

const BASE = "/api/election-positions";

export const electionPositionApi = {

  getByElection: async (electionId) => {
    const res = await mainApi.get(`${BASE}/elections/${electionId}`);
    return res.data;
  },

  add: async (electionId, positionId) => {
    const res = await mainApi.post(
      `${BASE}/${positionId}/elections/${electionId}`
    );
    return res.data;
  },

  remove: async (electionId, positionId) => {
    const res = await mainApi.delete(
      `${BASE}/${positionId}/elections/${electionId}`
    );
    return res.data;
  }
};
