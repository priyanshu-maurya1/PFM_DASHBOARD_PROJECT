import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Budget from "./pages/Budget";
import Settings from "./pages/Settings";
import Messages from "./pages/messages";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";
import AssessmentTest from "./components/AssessmentTest";
import ResetPassword from "./pages/ResetPassword";
import CertificateVerification from "./components/CertificateVerificationPortal";
import LMSPlatform from "./components/LMSPlatform";
import Leaderboard from "./components/Leaderboard";
import InternshipApply from "./pages/InternshipApply";
import UploadFile from "./components/uploadfile";

import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Redirect logged-in users away from login/register


// ✅ Redirect logged-in users away from login/register
// REMOVED PublicRoute - was using useAuth outside AuthProvider (CRASH)
// Now using simple redirect + ProtectedRoute inside providers

// 📝 Internship Apply Wrapper - reads location state to get internship data
function InternshipApplyWrapper() {
  const location = useLocation();
  const internship = location.state?.internship;
  return <InternshipApply internship={internship} />;
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Toaster position="top-center" />

                <Routes>

                  {/* 🟢 Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/reset-password" element={<ResetPassword />} /> 

                  {/* 🔒 Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <div style={{ display: 'flex' }}>
                          <Sidebar />
                          <div style={{ marginLeft: '256px', minHeight: '100vh', flex: 1 }}>
                            <Dashboard />
                          </div>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Sidebar />
                        <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
                          <Transactions />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <Sidebar />
                        <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
                          <Messages />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/budget"
                    element={
                      <ProtectedRoute>
                        <Budget />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Sidebar />
                        <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
                          <Profile />
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* 🔁 Default redirect: login if unauth, dashboard if auth */}
  <Route path="/" element={<Navigate to="/login" replace />} />
  
                  
                  {/* 📝 Assessment Test Route */}
                  <Route
                    path="/assessment-test"
                    element={
                      <AssessmentTest />
                    }
                  />
                  
                  {/* 📜 Certificate Verification Route */}
                  <Route
                    path="/certificate-verify"
                    element={
                      <ProtectedRoute>
                        <Sidebar />
                        <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
                          <CertificateVerification />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 📚 LMS Platform Route */}
                  <Route
                    path="/LMSPlatform"
                    element={
                      <ProtectedRoute>
                        <Sidebar />
                        <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
                          <LMSPlatform />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 📝 Internship Apply Route - Wrapper to read location state */}
                  <Route
                    path="/internship-apply"
                    element={
                      <ProtectedRoute>
                        <InternshipApplyWrapper />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 🏆 Leaderboard Route */}
                  <Route
                    path="/Leaderboard"
                    element={
                      <ProtectedRoute>
                        <Leaderboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 📤 Upload File Route */}
                  <Route
                    path="/uploadfile"
                    element={
                      <ProtectedRoute>
                        <Sidebar />
                        <div style={{ marginLeft: '256px', minHeight: '100vh' }}>
                          <UploadFile />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

