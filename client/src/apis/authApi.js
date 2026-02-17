import mainApi from "./mainApi";

export const loginApi = (data) => {
    return mainApi.post("/api/auth/login", data);
};

export const registerApi = (data) => {
    return mainApi.post("/api/users/register", data);
};
