import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialLoading, token, refreshUser } = useAuth();

  // 🔄 Auto-refresh token on mount if expired/missing
  useEffect(() => {
    if (!initialLoading && !token && isAuthenticated) {
      console.log('🔄 ProtectedRoute: Token missing, refreshing...');
      refreshUser();
    }
  }, [initialLoading, token, isAuthenticated, refreshUser]);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Validating session...</p>
        </div>
      </div>
    );
  }

  // ✅ Fixed: Allow cookie-only auth (backend default)
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

