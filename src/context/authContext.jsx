import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "./axios";

// 1. Context Create karna
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User ka data yahan save hoga
  const [loading, setLoading] = useState(true); // Page load hote waqt check karne ke liye

  // 2. Refresh hone par check karna ki user logged in hai ya nahi
  const checkUser = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const res = await axiosInstance.get(
          import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
          {
            withCredentials: true, // Cookies bhejni hain
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.data.success) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem("token"); // Agar token expire ho gaya ho
        }
        // setUser(res.data.user); // Agar token sahi hai, toh user save ho jayega
      } catch (error) {
        setUser(null); // Agar error hai (token nahi hai), toh user empty rahega
      } finally {
        setLoading(false); // Check khatam ho gaya
      }
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    // 3. Poori App ko ye data provide karna
    <AuthContext.Provider value={{ user, setUser, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook taaki asani se use kar sakein
export const useAuth = () => useContext(AuthContext);
