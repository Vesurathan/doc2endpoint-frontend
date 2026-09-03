import client from "./client";

export const uploadDataset = (formData) =>
  client.post("/datasets/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const listDatasets = () => client.get("/datasets/");
export const getDataset = (id) => client.get(`/datasets/${id}`);
export const getMessages = (id) => client.get(`/datasets/${id}/messages`);
export const sendMessage = (id, message) => client.post(`/datasets/${id}/chat`, { message });
export const confirmSchema = (id, columns = null) =>
  client.post(`/datasets/${id}/confirm`, columns ? { columns } : {});

export const previewDataset = (id, params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined))
  ).toString();
  return client.get(`/datasets/${id}/preview${q ? "?" + q : ""}`);
};

export const getOpenApiSpec = (id) => client.get(`/datasets/${id}/openapi`);
export const getPublicOpenApiUrl = (id) => `${client.defaults.baseURL}/datasets/${id}/openapi/public`;
export const getDatasetLogs = (id, params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined))
  ).toString();
  return client.get(`/datasets/${id}/logs${q ? "?" + q : ""}`);
};

// Gallery
export const getPublicGallery = (params = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== ""))).toString();
  return client.get(`/datasets/gallery${q ? "?" + q : ""}`);
};

// Visibility
export const setVisibility = (id, data) => client.patch(`/datasets/${id}/visibility`, data);

// Webhooks
export const setWebhook = (id, data) => client.patch(`/datasets/${id}/webhook`, data);
export const testWebhook = (id) => client.post(`/datasets/${id}/webhook/test`);

// Sync
export const setSyncConfig = (id, data) => client.patch(`/datasets/${id}/sync-config`, data);
export const triggerSync = (id) => client.post(`/datasets/${id}/sync`);

// Custom endpoint slug
export const setCustomEndpoint = (id, slug) =>
  client.patch(`/datasets/${id}/endpoint`, { custom_endpoint: slug || null });

// New version
export const uploadVersion = (id, formData) =>
  client.post(`/datasets/${id}/upload-version`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
