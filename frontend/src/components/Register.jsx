import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const translations = {
  en: {
    createAccount: "🏦 Create Account",
    signUpText: "Sign up to manage your personal finances",
    username: "Username",
    email: "Email",
    password: "Password",
    signUp: "Sign up",
    signingUp: "Creating account...",
    alreadyAccount: "Already have an account?",
    signIn: "Sign in",
    footer: "© 2025 Personal Finance Management. All rights reserved.",
    title1: "Personal Finance",
    title2: "Management",
    subtitle:
      "Join our smart finance tracker and start managing your expenses today.",
  },
  hi: {
    createAccount: "🏦 खाता बनाएं",
    signUpText: "अपनी व्यक्तिगत वित्त प्रबंधित करने के लिए साइन अप करें",
    username: "उपयोगकर्ता नाम",
    email: "ईमेल",
    password: "पासवर्ड",
    signUp: "रजिस्टर करें",
    signingUp: "खाता बनाया जा रहा है...",
    alreadyAccount: "पहले से खाता है?",
    signIn: "साइन इन करें",
    footer: "© 2025 पर्सनल फाइनेंस मैनेजमेंट. सर्वाधिकार सुरक्षित।",
    title1: "पर्सनल फाइनेंस",
    title2: "मैनेजमेंट",
    subtitle:
      "हमारे स्मार्ट फाइनेंस ट्रैकर से जुड़ें और आज ही खर्च प्रबंधित करें।",
  },
  fr: {
    createAccount: "🏦 Créer un compte",
    signUpText: "Inscrivez-vous pour gérer vos finances personnelles",
    username: "Nom d'utilisateur",
    email: "E-mail",
    password: "Mot de passe",
    signUp: "S'inscrire",
    signingUp: "Création du compte...",
    alreadyAccount: "Déjà un compte?",
    signIn: "Se connecter",
    footer: "© 2025 Gestion Financière Personnelle. Tous droits réservés.",
    title1: "Gestion Financière",
    title2: "Personnelle",
    subtitle:
      "Rejoignez notre suivi financier intelligent et commencez à gérer vos dépenses aujourd'hui.",
  },
  es: {
    createAccount: "🏦 Crear cuenta",
    signUpText: "Regístrate para gestionar tus finanzas personales",
    username: "Nombre de usuario",
    email: "Correo electrónico",
    password: "Contraseña",
    signUp: "Regístrate",
    signingUp: "Creando cuenta...",
    alreadyAccount: "¿Ya tienes una cuenta?",
    signIn: "Iniciar sesión",
    footer: "© 2025 Gestión Financiera Personal. Todos los derechos reservados.",
    title1: "Gestión Financiera",
    title2: "Personal",
    subtitle:
      "Únete a nuestro rastreador inteligente de finanzas y comienza a gestionar tus gastos hoy.",
  },
  de: {
    createAccount: "🏦 Konto erstellen",
    signUpText: "Registrieren Sie sich, um Ihre Finanzen zu verwalten",
    username: "Benutzername",
    email: "E-Mail",
    password: "Passwort",
    signUp: "Registrieren",
    signingUp: "Konto wird erstellt...",
    alreadyAccount: "Bereits ein Konto?",
    signIn: "Anmelden",
    footer: "© 2025 Persönliches Finanzmanagement. Alle Rechte vorbehalten.",
    title1: "Persönliches",
    title2: "Finanzmanagement",
    subtitle:
      "Treten Sie unserem intelligenten Finanztracker bei und beginnen Sie noch heute mit der Verwaltung Ihrer Ausgaben.",
  },
  ja: {
    createAccount: "🏦 アカウントを作成",
    signUpText: "個人の財務を管理するためにサインアップしてください",
    username: "ユーザー名",
    email: "メール",
    password: "パスワード",
    signUp: "登録する",
    signingUp: "アカウント作成中...",
    alreadyAccount: "すでにアカウントをお持ちですか？",
    signIn: "サインイン",
    footer: "© 2025 パーソナルファイナンス管理. 全著作権所有。",
    title1: "パーソナルファイナンス",
    title2: "マネジメント",
    subtitle:
      "スマートファイナンストラッカーに参加して、今すぐ支出管理を始めよう。",
  },
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await register(formData);
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

      {/* Top controls: language + dark mode toggle */}
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
          title="Toggle dark mode"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Left Section: App title and subtitle */}
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

      {/* Right Section: Signup form */}
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
            {t.createAccount}
          </h6>
          <p
            className={`text-center text-sm font-medium mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t.signUpText}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t.username}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
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
                {t.email}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
              <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
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
              {loading ? t.signingUp : t.signUp}
            </button>
          </form>
          <p
            className={`mt-5 text-center text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t.alreadyAccount}{" "}
            <Link
              to="/login"
              className={`font-medium ${
                darkMode
                  ? "text-yellow-400 hover:text-yellow-300"
                  : "text-sky-600 hover:text-blue-700"
              }`}
            >
              {t.signIn}
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

export default Register;
