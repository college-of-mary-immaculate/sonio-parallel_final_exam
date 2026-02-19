import mainApi from "./mainApi";

const POSITION_BASE = "/api/positions";

export const positionApi = {
  getAll: async () => {
    const res = await mainApi.get(POSITION_BASE);
    return res.data;
  },

  getById: async (id) => {
    const res = await mainApi.get(`${POSITION_BASE}/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await mainApi.post(POSITION_BASE, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await mainApi.put(`${POSITION_BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await mainApi.delete(`${POSITION_BASE}/${id}`);
    return res.data;
  },
};
