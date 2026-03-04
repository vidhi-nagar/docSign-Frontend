import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://doc-sign-backend.vercel.app",
  withCredentials: true,
});
