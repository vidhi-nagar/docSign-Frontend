import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, loginSchema } from "../utils/validationSchema";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle State
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
  });

  // Switch mode function
  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset(); // Form clear kar dega switch ke waqt
  };

  const onSubmit = async (data) => {
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    console.log(data);
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, data, {
        withCredentials: true, // Cookies ke liye zaroori
      });
      toast.success(isLogin ? "Login Successful!" : "Account Created!");

      if (isLogin) {
        setUser(res.data.user);
        // Yahan hum redirect karenge Dashboard par (Day 5 mein)
        console.log("Token:", res.data.token);
        navigate("/upload");
      } else {
        setIsLogin(true); // Signup ke baad login par bhej do
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Kuch galat hua!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            {isLogin
              ? "Apne account mein login karein"
              : "Naya account banayein aur sign karna shuru karein"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...register("name")}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Gaurav Kumar"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  {...register("password")}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex justify-center items-center"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Register"
              )}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 font-medium hover:underline transition-all"
            >
              {isLogin
                ? "Account nahi hai? Register karein"
                : "Pehle se account hai? Login karein"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
