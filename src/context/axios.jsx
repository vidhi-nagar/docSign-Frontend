import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://pdf-sign-app-backend.vercel.app",
  withCredentials: true,
});
