import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout API call failed', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        const originalUrl = err.config?.url;
        const status = err.response?.status;

        if (
          (status === 401 || status === 403) &&
          !originalUrl?.includes('/api/users/profile') &&
          isAuthenticated
        ) {
          handleLogout();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(responseInterceptor);
  }, [handleLogout, isAuthenticated]);

  useEffect(() => {
   
    let isCancelled = false;

    const checkAuth = async () => {
      try {
        const response = await api.get('/api/users/profile');
        if (isCancelled) return;

        const userData = {
          id: response.data.user?.id ?? response.data.user?._id,
          username: response.data.user?.username,
          email: response.data.user?.email,
          profilePicture: response.data.user?.profilePicture
        };
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        if (isCancelled) return;
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (!isCancelled) setInitialLoading(false);
      }
    };

    checkAuth();

    return () => {
      isCancelled = true;
    };
  }, []); 

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', credentials);
      const userData = {
        id: response.data.user?.id ?? response.data.user?._id,
        username: response.data.user?.username,
        email: response.data.user?.email,
        profilePicture: response.data.user?.profilePicture
      };
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', userData);
      const userDetails = {
        id: response.data.user?.id ?? response.data.user?._id,
        username: response.data.user?.username,
        email: response.data.user?.email,
        profilePicture: response.data.user?.profilePicture

      };
      setUser(userDetails);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    initialLoading,
    login,
    register,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};