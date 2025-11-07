import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await register(formData);
    if (result.success) navigate("/dashboard");
    else setError(result.error);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute w-96 h-96 bg-sky-200 rounded-full blur-3xl opacity-40 top-10 left-20"></div>
      <div className="absolute w-96 h-96 bg-sky-300 rounded-full blur-3xl opacity-30 bottom-10 right-20"></div>

      {/* Left Section */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 rounded-r-[3rem]"
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
          alt="PFM Logo"
          className="w-40 h-40 mb-6 drop-shadow-md"
        />
        <h1 className="text-4xl font-extrabold text-sky-800 text-center leading-tight">
          Personal Finance <br /> Management
        </h1>
        <p className="text-sky-700 mt-3 text-center text-sm max-w-sm">
          Join our smart finance tracker and start managing your expenses today.
        </p>
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex-1 flex items-center justify-center px-6 py-10 relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl p-10 rounded-3xl w-full max-w-sm transition-all hover:shadow-blue-100">
          <div className="md:hidden flex justify-center mb-5">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
              alt="PFM Logo"
              width="90"
            />
          </div>

          <h6 className="text-center text-xl font-bold text-gray-800 mb-1">
            🏦 Create Account
          </h6>
          <p className="text-center text-sm font-medium text-gray-600 mb-6">
            Sign up to manage your personal finances
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-600 hover:shadow-lg text-white rounded-lg font-semibold text-sm transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-[10px] text-gray-400 mt-6">
            © 2025 Personal Finance Management. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
