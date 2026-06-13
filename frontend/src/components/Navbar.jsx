import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useLanguage, availableLanguages } from '../context/LanguageContext';

// Translations for Navbar
const translations = {
  en: { appName: "GJ Global Services", toggleTheme: "Toggle theme" },
  hi: { appName: "GJ ग्लोबल सर्विसेज", toggleTheme: "थीम बदलें" },
  fr: { appName: "GJ Services Globaux", toggleTheme: "Changer le thème" },
  es: { appName: "GJ Servicios Globales", toggleTheme: "Cambiar tema" },
  de: { appName: "GJ Globale Dienste", toggleTheme: "Thema wechseln" },
  ja: { appName: "GJグローバルサービス", toggleTheme: "テーマ切替" },
  zh: { appName: "GJ全球服务", toggleTheme: "切换主题" },
  ko: { appName: "GJ 글로벌 서비스", toggleTheme: "테마 전환" },
  pt: { appName: "GJ Serviços Globais", toggleTheme: "Alternar tema" },
  ru: { appName: "GJ Глобальные Услуги", toggleTheme: "Сменить тему" },
  it: { appName: "GJ Servizi Globali", toggleTheme: "Cambia tema" },
  ar: { appName: "GJ الخدمات العالمية", toggleTheme: "تبديل السمة" },
  tr: { appName: "GJ Küresel Hizmetler", toggleTheme: "Temayı değiştir" },
  pl: { appName: "GJ Usługi Globalne", toggleTheme: "Zmień motyw" },
  nl: { appName: "GJ Globale Diensten", toggleTheme: "Thema wisselen" },
  sv: { appName: "GJ Globala Tjänster", toggleTheme: "Byt tema" },
};

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  
  // 🌙 Load theme preference from localStorage on first load
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pfm_dark');
    return saved ? JSON.parse(saved) : false;
  });

  // 🌗 Sync theme changes to HTML and localStorage
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('pfm_dark', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('pfm_dark', 'false');
    }
  }, [darkMode]);

  // 🌈 Animation variants for smooth fade-in
  const navbarVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.nav
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-64 right-0 z-10
                 bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg 
                 border-b border-white/40 dark:border-gray-700 shadow-md
                 transition-all duration-500"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 🌟 Logo + App Name */}
          <div className="flex items-center gap-2">
            <img
              src="/main-logo.png"
              alt="GJ Global Services Logo"
              className="w-9 h-9 object-contain rounded-md shadow-sm"
            />
            <Link
              to="/dashboard"
              className="text-xl font-bold bg-gradient-to-r 
                         from-sky-700 to-indigo-600 bg-clip-text text-transparent 
                         dark:from-sky-300 dark:to-indigo-400 
                         hover:opacity-80 transition"
            >
              {t.appName}
            </Link>
          </div>

          {/* 🌗 Theme Toggle + Language Selector + Notifications + Profile Dropdown */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 rounded text-sm bg-transparent dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-gray-800">
                  {lang.flag} {lang.code.toUpperCase()}
                </option>
              ))}
            </select>
            {/* Toggle Dark Mode */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label={t.toggleTheme}
              title={t.toggleTheme}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400 drop-shadow-glow" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>

            {/* Notifications Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
