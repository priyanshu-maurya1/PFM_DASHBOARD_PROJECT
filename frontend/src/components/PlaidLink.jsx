import { usePlaidLink } from 'react-plaid-link';
import { useState, useEffect, memo } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PlaidLink = ({ onSuccess }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const createLinkToken = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/create_link_token');
      setLinkToken(response.data.linkToken);
    } catch (error) {
      toast.error('Failed to create link token');
      console.error('Error creating link token:', error);
    } finally {
      setLoading(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        const response = await api.post('/api/exchange_public_token', {
          publicToken
        });
        
        toast.success('Bank account connected successfully!');
        onSuccess && onSuccess(response.data);
      } catch (error) {
        toast.error('Failed to connect bank account');
        console.error('Error exchanging public token:', error);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
      }
    },
  });

  useEffect(() => {
    if (linkToken && ready) {
      // Link is ready to use
    }
  }, [linkToken, ready]);

  const handleConnect = async () => {
    if (!linkToken) {
      await createLinkToken();
      return;
    }
    if (ready) {
      open();
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading || (linkToken && !ready)}
      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        'Connect Bank Account'
      )}
    </button>
  );
};

export default memo(PlaidLink);