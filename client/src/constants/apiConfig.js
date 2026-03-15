const normalizeBaseUrl = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\/+$/, "");
};

export const API_BASE_URL =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) ||
  normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL) ||
  "http://localhost:5000";
