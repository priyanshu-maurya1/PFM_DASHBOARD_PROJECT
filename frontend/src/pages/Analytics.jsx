import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600">Track your spending patterns and financial insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Analytics Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spending</h3>
          <p className="text-3xl font-bold text-blue-600">$0.00</p>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Income</h3>
          <p className="text-3xl font-bold text-green-600">$0.00</p>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Savings</h3>
          <p className="text-3xl font-bold text-purple-600">$0.00</p>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Spending Overview</h3>
        <p className="text-gray-500">Connect your bank account to see detailed analytics</p>
      </div>
    </div>
  );
}

