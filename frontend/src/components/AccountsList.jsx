import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AccountsList = ({ refresh }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/accounts');
      setAccounts(response.data.accounts);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch accounts');
      }
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
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
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No bank accounts connected yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Connected Accounts</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <div key={account.account_id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {account.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {account.subtype} • {account.mask ? `****${account.mask}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(account.balances.current)}
                </p>
                <p className="text-xs text-gray-500">Current Balance</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountsList;