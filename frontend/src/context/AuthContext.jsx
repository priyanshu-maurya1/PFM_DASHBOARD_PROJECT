import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [postLoginSkip, setPostLoginSkip] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      // Cleanup everything
      localStorage.clear();
      window.updateApiToken?.(null);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Global logout bridge for api.js
      window.logoutUser = handleLogout;
      
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const checkAuth = useCallback(async (retryCount = 0) => {
    console.log(`🔍 checkAuth attempt ${retryCount + 1}`);
    
    // 1. Try localStorage first (fast)
    const savedToken = localStorage.getItem('gj_token');
    const savedUser = localStorage.getItem('gj_user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Session restored from localStorage');
        
        // 2. Quick /profile validation
        try {
          await api.get('/api/auth/profile');
          console.log('✅ Profile API validated session');
        } catch (profileErr) {
          console.warn('⚠️ Profile validation failed - using localStorage');
        }
        
        setInitialLoading(false);
        return true;
      } catch (parseErr) {
        console.error('❌ localStorage corrupted, clearing...');
        localStorage.removeItem('gj_token');
        localStorage.removeItem('gj_user');
      }
    }

    // 3. Fresh profile check (no localStorage)
    if (retryCount < 2) {
      try {
        const response = await api.get('/api/auth/profile');
        const userData = {
          id: response.data.user.id || response.data.user._id,
          _id: response.data.user._id,
          username: response.data.user.username,
          email: response.data.user.email,
          profilePicture: response.data.user.profilePicture || '',
          role: response.data.user.role || 'user'
        };
        
        // Store for future persistence
        localStorage.setItem('gj_token', response.data.token || savedToken);
        localStorage.setItem('gj_user', JSON.stringify(userData));
        
        setToken(response.data.token || savedToken);
        setUser(userData);
        setIsAuthenticated(true);
        setInitialLoading(false);
        console.log('✅ Fresh session from /profile');
        return true;
      } catch (err) {
        console.error('❌ /profile failed:', err.response?.status);
      }
    }
    
    // Final cleanup
    localStorage.removeItem('gj_token');
    localStorage.removeItem('gj_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setInitialLoading(false);
    return false;
  }, []);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401 && isAuthenticated) {
          console.log('🔐 Global 401 - logging out');
          await handleLogout();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(responseInterceptor);
  }, [handleLogout, isAuthenticated]);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      console.log('🔐 Login attempt → /api/auth/login');
      const response = await api.post('/api/auth/login', credentials);
      
      const { user, token, success } = response.data;
      
      if (!success || !token) {
        throw new Error('Login failed - missing token');
      }
      
      const userData = {
        id: user.id || user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '',
        role: user.role || 'user'
      };
      
      // 🔑 Store for persistence + API interceptor
      localStorage.setItem('gj_token', token);
      localStorage.setItem('gj_user', JSON.stringify(userData));
      
      // Update global token bridge for api.js
      window.updateApiToken?.(token);
      
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      console.log('✅ Login SUCCESS - token set, user:', user.username);
      
      return { success: true, token, user: userData };
    } catch (error) {
      console.error('❌ Login FAILED:', error.response?.status, error.message);
      
      if (error.response?.status === 401) {
        toast.error('Invalid credentials');
      } else {
        toast.error('Login failed - server error');
      }
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    return await checkAuth();
  }, [checkAuth]);

  // 🌉 Bridge: Expose token for api.js interceptor
  useEffect(() => {
    if (token) {
      window.useAuthToken = () => token;
      window.updateApiToken(token);
    } else {
      window.useAuthToken = () => null;
      window.updateApiToken(null);
    }
  }, [token]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    initialLoading,
    login,
    logout: handleLogout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
