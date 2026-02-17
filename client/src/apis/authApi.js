import mainApi from "./mainApi";

export const loginApi = (data) => {
    return mainApi.post("/api/users/login", data);
};

export const registerApi = (data) => {
    return mainApi.post("/api/users/register", data);
};
