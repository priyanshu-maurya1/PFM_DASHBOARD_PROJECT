import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { translations } from "../utils/translations";

// ─── i18n ─────────────────────────────────────────────────
const getT = (lang) => translations[lang] || translations.en;

// ─── Password Strength ────────────────────────────────────
const scorePassword = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

// ─── Shared styles ────────────────────────────────────────
const getInputCls = (isDark) => `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-blue-500 focus:border-blue-500`;

// ─── FormField wrapper ────────────────────────────────────
const FormField = ({ label, error, children, isDark }) => (
  <div className="space-y-1.5">
    <label className={`block text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }} className="text-xs text-red-500 font-medium">
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Component ───────────────────────────────────────
const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const language = "en";
  const { isDark } = useTheme();
  const t = getT(language);

  const [fields, setFields] = useState({ username: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = useCallback((email) => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
    return "";
  }, []);

  const validateForm = useCallback(() => {
    const e = {};
    const emailErr = validateEmail(fields.email);
    if (emailErr) e.email = emailErr;
    if (!fields.username.trim()) e.username = "Username is required.";
    else if (fields.username.length < 3) e.username = "Minimum 3 characters.";
    if (!fields.password) e.password = "Password is required.";
    else if (fields.password.length < 8) e.password = "Minimum 8 characters required.";
    return e;
  }, [fields, validateEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(p => ({ ...p, [name]: value }));
    setFieldErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      const result = await register({
        email: fields.email,
        username: fields.username,
        password: fields.password
      });
      
      if (result.success) {
        toast.success("Welcome to GJ Global Services!");
        navigate("/LMSPlatform");
      } else {
        toast.error(result?.error || "Registration failed.");
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  const pw = scorePassword(fields.password);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* ── Left Branding ── */}
      <motion.aside initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
        className="hidden md:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white px-12 py-14">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
              alt="GJ Global Services logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
            <span className="font-bold text-lg tracking-tight">{t.brand}</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-snug mb-4">Features section for IT company</h1>
          <p className="text-blue-200 text-base leading-relaxed">{t.tagline}</p>
        </div>
        <ul className="space-y-4 text-sm text-blue-100">
          {[["📊","Modern Web & App Development"],["🔒","AI Powered Applications"],["🌍","Secure Cloud Infrastructure"],["📱","Works on any device"]].map(([icon, text]) => (
            <li key={text} className="flex items-center gap-3"><span className="text-xl">{icon}</span><span>{text}</span></li>
          ))}
        </ul>
        <p className="text-blue-300 text-xs mt-10">{t.footer}</p>
      </motion.aside>

      {/* ── Right Panel ── */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className={`flex items-center justify-between px-6 pt-5 pb-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 md:hidden">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
              alt="logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.brand}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
          </div>
        </header>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} className={`w-full max-w-md p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.createAccount}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.signUpText}</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email Field */}
              <FormField label={t.email} error={fieldErrors.email} isDark={isDark}>
                <input 
                  type="email" 
                  name="email" 
                  value={fields.email} 
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder} 
                  autoComplete="email"
                  className={getInputCls(isDark)} 
                  required 
                />
              </FormField>

              {/* Username Field */}
              <FormField label={t.username} error={fieldErrors.username} isDark={isDark}>
                <input 
                  type="text" 
                  name="username" 
                  value={fields.username} 
                  onChange={handleChange}
                  placeholder={t.usernamePlaceholder} 
                  autoComplete="username"
                  className={getInputCls(isDark)} 
                  required 
                />
              </FormField>

              {/* Password Field */}
              <FormField label={t.password} error={fieldErrors.password} isDark={isDark}>
                <input 
                  type="password" 
                  name="password" 
                  value={fields.password} 
                  onChange={handleChange}
                  placeholder={t.passwordPlaceholder} 
                  autoComplete="new-password"
                  className={getInputCls(isDark)} 
                  required 
                />
                {fields.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pw ? strengthColor[pw] : (isDark ? "bg-gray-600" : "bg-gray-200")}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.pwStrength[pw] || "Weak"}</p>
                  </div>
                )}
              </FormField>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {loading ? "Creating Account..." : t.createAccount}
              </button>
            </form>

            <p className={`mt-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.alreadyAccount}{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">{t.signIn}</Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Register;

