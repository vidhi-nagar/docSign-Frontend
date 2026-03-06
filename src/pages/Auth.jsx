import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, loginSchema } from "../utils/validationSchema.js";
import { axiosInstance } from "../context/axios";
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
    setError,
    formState: { errors, isSubmitting },
    // formState: { errors, isSubmitting },
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
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        data,
        {
          withCredentials: true, // Cookies ke liye zaroori
        },
      );

      if (isLogin && (!res.data.token || res.data.token === "undefined")) {
        // Yahan manual error set karein taaki UI update ho
        setError("password", {
          type: "manual",
          message: "Invalid  password",
        });
        setError("email", {
          type: "manual",
          message: "Check your credentials",
        });
        console.log("Token:", res.data.token);
        toast.error("Login failed. Please check your details.");
        return;
      }

      if (res.data.success) {
        if (isLogin) {
          const token = res.data.token;

          // Token check
          if (!token || token === "undefined") {
            toast.error("Invalid login session. Please try again.");
            return;
          }
          console.log("Token:", res.data.token);
          // 1. Token ko localStorage mein save karein
          localStorage.setItem("token", token);

          // 2. AuthContext mein user data set karein
          setUser(res.data.user);

          toast.success("Login Successful!");

          // 3. User ko redirect karein
          navigate("/upload");
        } else {
          // Agar user register kar raha hai
          toast.success("Account Created! Please login.");
          setIsLogin(true); // Signup ke baad Login form par switch karein
          reset();
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed!";
      const lowerMsg = errorMsg.toLowerCase();

      // 1. Agar Backend kahe ki email nahi mili ya user exist nahi karta
      if (
        lowerMsg.includes("email") ||
        lowerMsg.includes("user") ||
        lowerMsg.includes("exist")
      ) {
        setError("email", {
          type: "manual",
          message: "Ye email registered nahi hai!",
        });
      }

      // 2. Agar Backend kahe ki password galat hai
      else if (
        lowerMsg.includes("password") ||
        lowerMsg.includes("credential")
      ) {
        setError("password", {
          type: "manual",
          message: "Password sahi nahi hai!",
        });
      }

      // 3. Agar koi general error hai toh dono ko highlight kar sakte hain
      else {
        setError("email", { type: "manual", message: "Invalid credentials" });
        setError("password", {
          type: "manual",
          message: "Invalid credentials",
        });
      }

      // const errorMsg = error.response?.data?.message || "Login failed!";
      // const lowerMsg = errorMsg.toLowerCase();

      // if (isLogin) {
      //   // Agar message mein 'email' ya 'user' word hai, toh email field par error dikhao
      //   if (
      //     lowerMsg.includes("email") ||
      //     lowerMsg.includes("user") ||
      //     lowerMsg.includes("exist")
      //   ) {
      //     setError("email", {
      //       type: "manual",
      //       message: errorMsg,
      //     });
      //   }
      //   // Agar 'password' ya 'credential' ya 'session' word hai, toh password par dikhao
      //   else if (
      //     lowerMsg.includes("password") ||
      //     lowerMsg.includes("credential") ||
      //     lowerMsg.includes("session")
      //   ) {
      //     setError("password", {
      //       type: "manual",
      //       message: errorMsg,
      //     });
      //   }
      //   // Default: Agar kuch samajh na aaye toh password par dikha do
      //   else {
      //     setError("password", { type: "manual", message: errorMsg });
      //   }
      // }

      // toast.error(errorMsg);
      console.error("Auth Error:", error);
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
              ? "Login to your account"
              : "Create a new account and start signing in"}
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
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
                      placeholder="name"
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
                  className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.password
                      ? "border-red-500 ring-2 ring-red-200 bg-red-50" // Error hone par red border
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
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
                ? "Don't have an Account? Register here"
                : "Already have an Account? Login here"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
