import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000" || import.meta.env.VITE_API_URL,
  withCredentials: true,
});
