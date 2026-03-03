import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    "https://pdf-sign-app-backend.vercel.app" || import.meta.env.VITE_API_URL,
  withCredentials: true,
});
