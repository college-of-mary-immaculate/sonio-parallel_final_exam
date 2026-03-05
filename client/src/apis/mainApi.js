// mainApi.js
import axios from "axios";

const mainApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,   // ← sends cookies automatically with every request
});

// Still keep setAuthToken as a no-op fallback so nothing else breaks
// With cookies, this is no longer needed — but safe to leave in
export const setAuthToken = (token) => {
  if (token) {
    mainApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete mainApi.defaults.headers.common.Authorization;
  }
};

export default mainApi;