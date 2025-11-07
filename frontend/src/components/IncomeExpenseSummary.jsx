import { useState, useEffect } from 'react';
import api from '../utils/api';

const IncomeExpenseSummary = ({ refresh }) => {
  const [data, setData] = useState({ income: 0, expense: 0, net: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/dashboard/income-vs-expense');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching income/expense data:', error);
      setData({ income: 0, expense: 0, net: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">This Month's Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.income)}</p>
          <p className="text-sm text-gray-600 font-medium">Income</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.expense)}</p>
          <p className="text-sm text-gray-600 font-medium">Expenses</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
            data.net >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <svg className={`w-6 h-6 ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className={`text-2xl font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.net)}
          </p>
          <p className="text-sm text-gray-600 font-medium">Net</p>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseSummary;