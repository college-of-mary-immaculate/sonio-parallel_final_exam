import mainApi from "./mainApi";

const ELECTION_POSITION_BASE = "/api/election-positions";

export const electionPositionApi = {
  // Get all positions configured for a specific election
  getByElection: async (electionId) => {
    const res = await mainApi.get(`${ELECTION_POSITION_BASE}/elections/${electionId}`);
    return res.data;
  },

  // Add a position to an election
  add: async (data) => {
    const res = await mainApi.post(ELECTION_POSITION_BASE, data);
    return res.data;
  },

  // Remove a position from an election
  remove: async (electionId, positionId) => {
    const res = await mainApi.delete(`${ELECTION_POSITION_BASE}/${electionId}/${positionId}`);
    return res.data;
  }
};
