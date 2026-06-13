import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  if (!token || !email) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-sky-50 text-gray-800"
      }`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
          <p className="mb-4">The reset link is invalid or expired.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset successful! Redirecting to login...");
        toast.success("Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Failed to reset password");
        toast.error(data.error || "Failed to reset password");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please check your connection.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
      darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" : "bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 text-gray-800"
    }`}>
      
      {/* Background Orbs */}
      <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-40 top-10 left-20 ${darkMode ? "bg-blue-800/40" : "bg-sky-200"}`}></div>
      <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-30 bottom-10 right-20 ${darkMode ? "bg-indigo-700/40" : "bg-sky-300"}`}></div>

      {/* Settings Bar */}
      <div className="absolute top-4 right-6 flex items-center gap-3 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm transition-all hover:scale-110"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center px-6 py-10 relative z-10"
      >
        <div className={`p-8 md:p-10 rounded-[2rem] w-full max-w-md shadow-2xl backdrop-blur-xl border transition-all ${
          darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white/50"
        }`}>
          
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Reset Password
          </h2>
          <p className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  darkMode ? "bg-gray-900/50 border-gray-700 text-white focus:ring-yellow-400" : "bg-gray-50 border-gray-200 focus:ring-sky-500"
                }`}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  darkMode ? "bg-gray-900/50 border-gray-700 text-white focus:ring-yellow-400" : "bg-gray-50 border-gray-200 focus:ring-sky-500"
                }`}
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs font-medium text-center bg-red-400/10 py-2 rounded-lg">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-400 text-xs font-medium text-center bg-green-400/10 py-2 rounded-lg">
                {success}
              </p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 ${
                darkMode ? "bg-yellow-400 text-gray-900 hover:shadow-yellow-400/20 disabled:bg-gray-700" : "bg-sky-600 text-white hover:shadow-sky-600/30 disabled:bg-gray-300"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className={`mt-8 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className={`font-bold transition-colors ${darkMode ? "text-yellow-400 hover:text-yellow-300" : "text-sky-600 hover:text-sky-800"}`}
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

