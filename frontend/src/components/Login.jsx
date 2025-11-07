import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Login = () => {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // 🌍 Translations
  const translations = {
    en: {
      welcome: "🏦 Welcome Back",
      signInText: "Sign in to your PFM account",
      emailOrUsername: "Email or Username",
      password: "Password",
      signIn: "Sign in",
      signingIn: "Signing in...",
      noAccount: "Don’t have an account?",
      signUp: "Sign up",
      footer: "© 2025 Personal Finance Management. All rights reserved.",
      title1: "Personal Finance",
      title2: "Management",
      subtitle:
        "Smart, simple, and secure way to track your spending and reach your goals.",
    },
    hi: {
      welcome: "🏦 वापसी पर स्वागत है",
      signInText: "अपने PFM खाते में साइन इन करें",
      emailOrUsername: "ईमेल या उपयोगकर्ता नाम",
      password: "पासवर्ड",
      signIn: "साइन इन करें",
      signingIn: "साइन इन हो रहा है...",
      noAccount: "खाता नहीं है?",
      signUp: "रजिस्टर करें",
      footer: "© 2025 पर्सनल फाइनेंस मैनेजमेंट. सर्वाधिकार सुरक्षित।",
      title1: "पर्सनल फाइनेंस",
      title2: "मैनेजमेंट",
      subtitle:
        "अपने खर्चों को ट्रैक करने और लक्ष्यों को प्राप्त करने का स्मार्ट, सरल और सुरक्षित तरीका।",
    },
    fr: {
      welcome: "🏦 Bon retour",
      signInText: "Connectez-vous à votre compte PFM",
      emailOrUsername: "E-mail ou nom d'utilisateur",
      password: "Mot de passe",
      signIn: "Se connecter",
      signingIn: "Connexion...",
      noAccount: "Pas de compte ?",
      signUp: "S'inscrire",
      footer: "© 2025 Gestion Financière Personnelle. Tous droits réservés.",
      title1: "Gestion Financière",
      title2: "Personnelle",
      subtitle:
        "Une façon intelligente, simple et sécurisée de suivre vos dépenses et d’atteindre vos objectifs.",
    },
    es: {
      welcome: "🏦 Bienvenido de nuevo",
      signInText: "Inicia sesión en tu cuenta PFM",
      emailOrUsername: "Correo electrónico o nombre de usuario",
      password: "Contraseña",
      signIn: "Iniciar sesión",
      signingIn: "Iniciando...",
      noAccount: "¿No tienes una cuenta?",
      signUp: "Regístrate",
      footer:
        "© 2025 Gestión Financiera Personal. Todos los derechos reservados.",
      title1: "Gestión Financiera",
      title2: "Personal",
      subtitle:
        "Una forma inteligente, simple y segura de controlar tus gastos y alcanzar tus metas.",
    },
    de: {
      welcome: "🏦 Willkommen zurück",
      signInText: "Melden Sie sich bei Ihrem PFM-Konto an",
      emailOrUsername: "E-Mail oder Benutzername",
      password: "Passwort",
      signIn: "Anmelden",
      signingIn: "Wird angemeldet...",
      noAccount: "Noch kein Konto?",
      signUp: "Registrieren",
      footer:
        "© 2025 Persönliches Finanzmanagement. Alle Rechte vorbehalten.",
      title1: "Persönliches",
      title2: "Finanzmanagement",
      subtitle:
        "Eine intelligente, einfache und sichere Möglichkeit, Ihre Ausgaben zu verfolgen und Ihre Ziele zu erreichen.",
    },
    ja: {
      welcome: "🏦 おかえりなさい",
      signInText: "PFMアカウントにサインインしてください",
      emailOrUsername: "メールまたはユーザー名",
      password: "パスワード",
      signIn: "サインイン",
      signingIn: "サインイン中...",
      noAccount: "アカウントをお持ちではありませんか？",
      signUp: "登録する",
      footer: "© 2025 パーソナルファイナンス管理. 全著作権所有。",
      title1: "パーソナルファイナンス",
      title2: "マネジメント",
      subtitle:
        "支出を追跡し、目標を達成するためのスマートでシンプルで安全な方法。",
    },
  };

  const t = translations[language];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(formData);
    if (result.success) navigate("/dashboard");
    else setError(result.error);
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row items-center justify-center relative overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 text-gray-800"
      }`}
    >
      {/* Animated blobs */}
      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl opacity-40 top-10 left-20 ${
          darkMode ? "bg-blue-800/40" : "bg-sky-200"
        }`}
      ></div>
      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl opacity-30 bottom-10 right-20 ${
          darkMode ? "bg-indigo-700/40" : "bg-sky-300"
        }`}
      ></div>

      {/* Top Controls */}
      <div className="absolute top-4 right-6 flex items-center gap-3 z-20">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`px-2 py-1 rounded-md text-sm font-medium ${
            darkMode
              ? "bg-gray-700 text-white border border-gray-600"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          <option value="en">🇬🇧 English</option>
          <option value="hi">🇮🇳 हिन्दी</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="es">🇪🇸 Español</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="ja">🇯🇵 日本語</option>
        </select>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-1 rounded-md text-sm font-semibold shadow transition-all ${
            darkMode
              ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Left Section */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="hidden md:flex flex-col justify-center items-center w-1/2 p-10"
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
          alt="PFM Logo"
          className="w-40 h-40 mb-6 drop-shadow-md"
        />
        <h1
          className={`text-4xl font-extrabold text-center leading-tight ${
            darkMode ? "text-white" : "text-sky-800"
          }`}
        >
          {t.title1} <br /> {t.title2}
        </h1>
        <p
          className={`mt-3 text-center text-sm max-w-sm ${
            darkMode ? "text-gray-300" : "text-sky-700"
          }`}
        >
          {t.subtitle}
        </p>
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex-1 flex items-center justify-center px-6 py-10 relative z-10"
      >
        <div
          className={`p-10 rounded-3xl w-full max-w-sm shadow-2xl backdrop-blur-xl border transition-all ${
            darkMode
              ? "bg-gray-800/70 border-gray-700 hover:shadow-gray-700/40"
              : "bg-white/70 border-white/40 hover:shadow-blue-100"
          }`}
        >
          <div className="md:hidden flex justify-center mb-5">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
              alt="PFM Logo"
              width="90"
            />
          </div>

          <h6
            className={`text-center text-xl font-bold mb-1 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {t.welcome}
          </h6>
          <p
            className={`text-center text-sm font-medium mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t.signInText}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t.emailOrUsername}
              </label>
              <input
                type="text"
                name="username_or_email"
                value={formData.username_or_email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-yellow-400"
                    : "bg-white border-gray-300 focus:ring-sky-400"
                }`}
                required
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t.password}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-yellow-400"
                    : "bg-white border-gray-300 focus:ring-sky-400"
                }`}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                darkMode
                  ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-blue-500 hover:to-sky-600"
              }`}
              disabled={loading}
            >
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>

          <p
            className={`mt-5 text-center text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t.noAccount}{" "}
            <Link
              to="/Register"
              className={`font-medium ${
                darkMode
                  ? "text-yellow-400 hover:text-yellow-300"
                  : "text-sky-600 hover:text-blue-700"
              }`}
            >
              {t.signUp}
            </Link>
          </p>

          <p
            className={`text-center text-[10px] mt-6 ${
              darkMode ? "text-gray-400" : "text-gray-400"
            }`}
          >
            {t.footer}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
