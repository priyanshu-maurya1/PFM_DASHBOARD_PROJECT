import axios from 'axios';
import { useContext } from 'react';

// Get API base URL from environment variable or use default
// This allows the frontend to work with different backend environments
const api = axios.create({
  baseURL: '', // Proxy-relative: /api/* → localhost:5000 via vite.config.js
  withCredentials: true, // This sends cookies with requests
});

// 🛡️ AuthContext-aware interceptor (useAuth() works in components)
// For standalone api calls, falls back to localStorage
let currentToken = localStorage.getItem('gj_token');

api.interceptors.request.use(
  (config) => {
  // ✅ Cookie-first (backend default), Bearer as backup
  // Backend middleware checks cookies first automatically via withCredentials: true
  console.log('🔐 Request with cookies:', config.url);
  
  // Only add Bearer if we have localStorage token (future-proofing)
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
    console.log('🔐 Bearer backup added:', config.url);
  }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 Listen for token changes (AuthContext updates)
const updateApiToken = (newToken) => {
  currentToken = newToken;
  localStorage.setItem('gj_token', newToken || '');
};
window.updateApiToken = updateApiToken;

    // ✅ FIXED 401 Handler - Whitelist ALL auth + dashboard endpoints
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalUrl = error.config?.url;
        const status = error.response?.status;

        if (status === 401) {
    // ✅ FIXED: Whitelist ALL dashboard/profile calls - prevent logout loops  
    const safeUrls = [
      '/api/auth/',
      '/api/dashboard/',
      '/api/lms/',
      '/api/budget/',
      '/api/transactions/',
      '/api/profile',
      '/api/users/'
    ];
    
    const isSafeUrl = safeUrls.some(pattern => 
      originalUrl.startsWith(pattern.replace(/\/$/, ''))
    );

    if (isSafeUrl || status !== 401) {
      console.log(`🔒 SAFE ${status}: ${originalUrl}`);
      return Promise.reject(error);
    }
    
    console.log(`🚪 CRITICAL 401: ${originalUrl} → Trigger logout`);
    // Let AuthContext handle logout properly
    if (window.logoutUser) {
      window.logoutUser();
    }
        }
        
        return Promise.reject(error);
      }
    );

export default api;
