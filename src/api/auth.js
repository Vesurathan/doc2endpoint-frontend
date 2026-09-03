import client from "./client";

export const register = (data) => client.post("/auth/register", data);
export const login = (data) =>
  client.post("/auth/login", new URLSearchParams(data), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
export const getMe = () => client.get("/auth/me");
export const googleAuth = (access_token) => client.post("/auth/google", { access_token });
export const verifyEmail = (data) => client.post("/auth/verify-email", data);
export const resendVerification = (data) => client.post("/auth/resend-verification", data);
