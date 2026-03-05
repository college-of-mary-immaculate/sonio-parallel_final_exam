import mainApi from "./mainApi";

export const loginApi = (data) => {
    return mainApi.post("/api/auth/login", data);
};

export const registerApi = (data) => {
    return mainApi.post("/api/users/register", data);
};

// New: called on app mount to restore session from cookie
export const getMeApi = () => {
    return mainApi.get("/api/auth/me");
};

// New: called on logout to clear the cookie server-side
export const logoutApi = () => {
    return mainApi.post("/api/auth/logout");
};