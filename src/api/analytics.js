import client from "./client";

export const getSummary = () => client.get("/analytics/summary");
export const getCallsOverTime = (days = 30) => client.get(`/analytics/calls-over-time?days=${days}`);
export const getByDataset = () => client.get("/analytics/by-dataset");
export const getRecentCalls = (limit = 20) => client.get(`/analytics/recent-calls?limit=${limit}`);
