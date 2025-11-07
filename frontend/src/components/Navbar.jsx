import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-64 right-0 z-10 
                 bg-white/60 dark:bg-gray-900/70 backdrop-blur-lg 
                 border-b border-white/40 dark:border-gray-700 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / App Name */}
          <div className="flex items-center gap-2">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
              alt="PFM Logo"
              className="w-9 h-9 object-contain rounded-md shadow-sm"
            />
            <Link
              to="/dashboard"
              className="text-xl font-bold bg-gradient-to-r from-sky-700 to-indigo-600 bg-clip-text text-transparent 
                         dark:from-sky-300 dark:to-indigo-400 hover:opacity-80 transition"
            >
              Personal Finance Manager
            </Link>
          </div>

          {/* Profile + Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
