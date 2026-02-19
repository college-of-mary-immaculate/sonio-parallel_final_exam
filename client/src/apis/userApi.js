import mainApi from "./mainApi";

const USER_BASE = "/api/users";

const userApi = {
  register: async (data) => {
    const res = await mainApi.post(`${USER_BASE}/register`, data);
    return res.data;
  },
};

export default userApi;
