import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, CreditCard, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Message', icon: <CreditCard size={20} />, path: '/Messages' },
    { name: 'Email', icon: <CreditCard size={20} />, path: '/Email' },
    { name: 'Transactions', icon: <CreditCard size={20} />, path: '/transactions' },
    { name: 'Analytics', icon: <BarChart2 size={20} />, path: '/analytics' },
    { name: 'Budget', icon: <CreditCard size={20} />, path: '/budget' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-sky-50 via-blue-100 to-indigo-50 border-r border-white/40 shadow-sm flex flex-col
        dark:bg-gradient-to-b dark:from-[#181f2b] dark:via-[#101620] dark:to-[#10141a] dark:border-[#22283e]"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/40 dark:border-[#22283e] dark:bg-[#181f2b]">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy50kPDPjmSGirf9Xtrv9IxUahsnV6SGD-cO2a_RVDphi5jl4tYKo5YaSUb-jMGInivl0&usqp=CAU"
          alt="PFM Logo"
          className="w-9 h-9 object-contain rounded-md"
        />
        <h1 className="text-lg font-bold bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-white dark:to-gray-300">
          PFM
        </h1>
      </div>

      {/*  Menu Items */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md dark:from-[#2a57c3] dark:to-[#3d18ac]'
                  : 
                    'text-gray-700 hover:bg-white hover:text-sky-700 ' +
                    'dark:text-gray-200 dark:hover:bg-[#232b3a] dark:hover:text-white dark:border-transparent'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/*  Logout Section */}
      <div className="border-t border-white/40 px-3 py-4 dark:border-[#22283e] dark:bg-[#181f2b]">
        <Link
          to="/login"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:text-red-600 transition-all duration-200
            dark:text-gray-200 dark:hover:bg-[#232b3a] dark:hover:text-red-400"
        >
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
