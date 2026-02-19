import mainApi from "./mainApi";

const base = "/api/elections";

export const electionApi = {
  getAll: async () => {
    const { data } = await mainApi.get(base);
    return data;
  },

  getById: async (id) => {
    const { data } = await mainApi.get(`${base}/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await mainApi.post(base, payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await mainApi.put(`${base}/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await mainApi.delete(`${base}/${id}`);
    return data;
  },
};
