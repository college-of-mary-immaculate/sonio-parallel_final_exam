import mainApi from "./mainApi";

// GET all candidates
export const getAllCandidates = async () => {
  const { data } = await mainApi.get("/api/candidates");
  return data;
};

// GET one
export const getCandidateById = async (id) => {
  const { data } = await mainApi.get(`/api/candidates/${id}`);
  return data;
};

// CREATE
export const createCandidate = async (payload) => {
  const { data } = await mainApi.post("/api/candidates", payload);
  return data;
};

// UPDATE
export const updateCandidate = async (id, payload) => {
  const { data } = await mainApi.put(`/api/candidates/${id}`, payload);
  return data;
};

// DELETE
export const deleteCandidate = async (id) => {
  const { data } = await mainApi.delete(`/api/candidates/${id}`);
  return data;
};
