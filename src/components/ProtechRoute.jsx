import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Ya jahan bhi aapne token save kiya ho

  if (!token || token === "undefined") {
    // Agar token nahi hai, toh login page par bhej do
    return <Navigate neighborhood to="/login" replace />;
  }

  return children;
};
