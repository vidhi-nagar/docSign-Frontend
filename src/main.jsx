import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import axios from "axios";

axios.defaults.baseURL = "https://doc-sign-backend.vercel.app";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
