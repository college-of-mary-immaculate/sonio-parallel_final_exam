// mainApi.js
import axios from "axios";

const mainApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Token setter (SSR-safe)
export const setAuthToken = (token) => {
  if (token) {
    mainApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete mainApi.defaults.headers.common.Authorization;
  }
};

export default mainApi;