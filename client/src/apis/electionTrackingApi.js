import mainApi from "./mainApi";

const base = (electionId) => `/api/elections/${electionId}/tracking`;

export const electionTrackingApi = {

  // GET /api/elections/:electionId/tracking/live
  getLive: async (electionId) => {
    const { data } = await mainApi.get(`${base(electionId)}/live`);
    return data;
  },

  // GET /api/elections/:electionId/tracking/summary
  getSummary: async (electionId) => {
    const { data } = await mainApi.get(`${base(electionId)}/summary`);
    return data;
  },
};