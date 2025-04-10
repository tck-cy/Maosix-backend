// src/services/api.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth endpoints
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),

  // Procedure endpoints
  getProcedures: () => api.get("/procedures"),
  getDepartmentProcedures: (department) => api.get(`/procedures/${department}`),
  createProcedure: (data) => api.post("/procedures", data),
  updateProcedure: (id, data) => api.put(`/procedures/${id}`, data),
  approveProcedureVersion: (versionId) =>
    api.post(`/procedures/versions/${versionId}/approve`),

  // Purchase endpoints
  getPurchases: () => api.get("/purchases"),
  getPurchase: (id) => api.get(`/purchases/${id}`),
  createPurchase: (data) => api.post("/purchases", data),
  approvePurchase: (id, data) => api.put(`/purchases/${id}/approve`, data),
  completePurchase: (id, data) => api.put(`/purchases/${id}/complete`, data),

  // User endpoints (if needed)
  getUsers: () => api.get("/users"),
};
