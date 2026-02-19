import mainApi from "./mainApi"; // use the configured axios instance

const base = "/api/elections"; // no /api, mainApi already includes baseURL

export const electionApi = {
  getAll: async () => {
    const { data } = await mainApi.get(base);
    return data;
  },
  create: async (payload) => {
    const { data } = await mainApi.post(base, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await mainApi.delete(`${base}/${id}`);
    return data;
  },
  update: async (id, payload) => {
    // Only implement if backend supports PUT
    throw new Error("Update endpoint not yet implemented on backend");
  },
};
