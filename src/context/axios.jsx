import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL || "https://doc-sign-backend.vercel.app",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
