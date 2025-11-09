// src/pages/Analytics.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SpendingChart from "../components/SpendingChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseSummary from "../components/IncomeExpenseSummary";
import TopCategories from "../components/TopCategories";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.12,
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Analytics = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50 via-sky-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />

        <main className="p-8 pt-24 max-w-7xl mx-auto space-y-8">
          {/* ===== Header Section ===== */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="rounded-2xl p-6 
                       bg-white/80 dark:bg-gray-800/60 
                       backdrop-blur-md border border-sky-100 dark:border-gray-700 
                       shadow-[0_0_20px_rgba(56,189,248,0.25)] 
                       flex items-center justify-between 
                       transition-all duration-500"
          >
            <div>
              <h1 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Visualize your income and expenses with smart charts and insights.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerRefresh}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 
                         text-white font-medium rounded-xl shadow-md 
                         hover:shadow-lg hover:from-sky-600 hover:to-cyan-500 
                         transition-all duration-300"
            >
              Refresh
            </motion.button>
          </motion.div>

          {/* ===== Animated Content ===== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Summary Section */}
            <motion.div variants={itemVariants}>
              <IncomeExpenseSummary refresh={refreshKey} />
            </motion.div>

            {/* Charts Section */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl 
                           border border-sky-100 dark:border-gray-700 
                           shadow-md hover:shadow-lg 
                           transition-all duration-300 p-6"
              >
                <h2 className="text-lg font-semibold text-sky-800 dark:text-sky-300 mb-3">
                  Spending by Category
                </h2>
                <SpendingChart refresh={refreshKey} />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl 
                           border border-sky-100 dark:border-gray-700 
                           shadow-md hover:shadow-lg 
                           transition-all duration-300 p-6"
              >
                <h2 className="text-lg font-semibold text-sky-800 dark:text-sky-300 mb-3">
                  Monthly Income vs Expenses
                </h2>
                <MonthlyChart refresh={refreshKey} />
              </motion.div>
            </motion.div>

            {/* Top Categories Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl 
                         border border-sky-100 dark:border-gray-700 
                         shadow-md hover:shadow-lg 
                         transition-all duration-300 p-6"
            >
              <h2 className="text-lg font-semibold text-sky-800 dark:text-sky-300 mb-3">
                Top Categories
              </h2>
              <TopCategories refresh={refreshKey} />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
