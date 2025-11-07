import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SpendingChart from "../components/SpendingChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseSummary from "../components/IncomeExpenseSummary";
import TopCategories from "../components/TopCategories";
import { useState } from "react";

const Analytics = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-8 mt-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-800">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Visualize your income and expenses with smart charts and insights.
              </p>
            </div>
            <div>
              <button
                onClick={triggerRefresh}
                className="px-3 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-3">
              <IncomeExpenseSummary refresh={refreshKey} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <SpendingChart refresh={refreshKey} />
            </div>
            <div>
              <MonthlyChart refresh={refreshKey} />
            </div>
          </div>

          <div className="mt-6">
            <TopCategories refresh={refreshKey} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
