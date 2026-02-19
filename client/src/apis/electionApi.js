import axios from "axios";

const base = "/api/elections";

export const electionApi = {
  getAll: async () => {
    const { data } = await axios.get(base);
    return data;
  },
  create: async (payload) => {
    const { data } = await axios.post(base, payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await axios.put(`${base}/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await axios.delete(`${base}/${id}`);
    return data;
  },
};
