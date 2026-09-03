import client from "./client";

// Bootstrap
export const bootstrapAdmin = () => client.post("/admin/bootstrap");

// Stats & analytics
export const getSystemStats = () => client.get("/admin/stats");
export const getAdminCallsOverTime = (days = 30) => client.get(`/admin/analytics/calls-over-time?days=${days}`);
export const getNewUsersOverTime = (days = 30) => client.get(`/admin/analytics/new-users-over-time?days=${days}`);
export const getTopUsers = (limit = 10) => client.get(`/admin/analytics/top-users?limit=${limit}`);

// Users
export const listAdminUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return client.get(`/admin/users${q ? "?" + q : ""}`);
};
export const getAdminUser = (id) => client.get(`/admin/users/${id}`);
export const updateAdminUser = (id, data) => client.patch(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => client.delete(`/admin/users/${id}`);

// Datasets
export const listAdminDatasets = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return client.get(`/admin/datasets${q ? "?" + q : ""}`);
};
export const deleteAdminDataset = (id) => client.delete(`/admin/datasets/${id}`);

// API Keys
export const listAdminKeys = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return client.get(`/admin/api-keys${q ? "?" + q : ""}`);
};
export const revokeAdminKey = (id) => client.delete(`/admin/api-keys/${id}`);
