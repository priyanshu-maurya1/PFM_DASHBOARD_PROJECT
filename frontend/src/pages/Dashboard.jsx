import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PlaidLink from '../components/PlaidLink';
import AccountsList from '../components/AccountsList';
import TransactionsList from '../components/TransactionsList';
import SpendingChart from '../components/SpendingChart';
import MonthlyChart from '../components/MonthlyChart';
import BudgetManager from '../components/BudgetManager';
import IncomeExpenseSummary from '../components/IncomeExpenseSummary';
import TransactionManager from '../components/TransactionManager';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePlaidSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-50 via-blue-100 to-indigo-50">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Content Area */}
      <div className="flex-1 ml-64">
        <Navbar />

        {/* ✅ Main Section */}
        <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8 mt-16">
          <div className="px-4 py-6 sm:px-0">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-sky-900">
                    Personal Finance Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm">
                    Track your finances, monitor expenses, and manage budgets efficiently.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <PlaidLink onSuccess={handlePlaidSuccess} />
                </div>
              </div>
            </motion.div>

            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <IncomeExpenseSummary refresh={refreshKey} />
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-sky-900 mb-4">📊 Analytics Overview</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SpendingChart refresh={refreshKey} />
                <MonthlyChart refresh={refreshKey} />
              </div>
            </motion.div>

            {/* Accounts and Transactions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-sky-900 mb-4">🏦 Accounts & Transactions</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AccountsList refresh={refreshKey} />
                <TransactionsList refresh={refreshKey} />
              </div>
            </motion.div>

            {/* Management Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold text-sky-900 mb-4">🛠️ Manage Your Finances</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <BudgetManager refresh={refreshKey} />
                <TransactionManager refresh={refreshKey} onUpdate={handlePlaidSuccess} />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
