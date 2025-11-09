import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  // 🌙 Load theme preference from localStorage on first load
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pfm-dark');
    return saved ? JSON.parse(saved) : false;
  });

  // 🌗 Sync theme changes to HTML and localStorage
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('pfm-dark', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('pfm-dark', 'false');
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
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
              alt="PFM Logo"
              className="w-9 h-9 object-contain rounded-md shadow-sm"
            />
            <Link
              to="/dashboard"
              className="text-xl font-bold bg-gradient-to-r 
                         from-sky-700 to-indigo-600 bg-clip-text text-transparent 
                         dark:from-sky-300 dark:to-indigo-400 
                         hover:opacity-80 transition"
            >
              Personal Finance Manager
            </Link>
          </div>

          {/* 🌗 Theme Toggle + Profile Dropdown */}
          <div className="flex items-center gap-4">
            {/* Toggle Dark Mode */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400 drop-shadow-glow" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
