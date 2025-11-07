import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TransactionsList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data.transactions.slice(0, 10)); // Show latest 10
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch transactions');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.transaction_id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {transaction.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()} • {transaction.account_id.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.amount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.amount > 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {transaction.category?.[0] || 'Other'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;