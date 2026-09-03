import client from "./client";

export const listKeys = () => client.get("/api-keys/");
export const createKey = (data) => client.post("/api-keys/", data);
export const revokeKey = (id) => client.delete(`/api-keys/${id}`);
export const autoCreateKey = (datasetId) => client.post(`/api-keys/auto-create/${datasetId}`);
