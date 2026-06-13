// src/pages/Settings.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage, availableLanguages } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  UploadCloud,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  HelpCircle,
  FileText,
  BookMarked,
  Mail,
  Phone,
  ExternalLink,
  MessageCircle,
  Zap,
  FileQuestion,
  Scale,
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  Briefcase,
  Video,
  Search,
  Wallet,
  Lock,
  Home,
  CreditCard,
  BarChart2,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

/* Animation variants */
const containerVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, ease: "easeOut" } },
};
const itemVariant = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Settings = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggle } = useTheme();
  const [profile, setProfile] = useState({ username: "", email: "", profilePicture: "" });
  const [originalProfile, setOriginalProfile] = useState({ username: "", email: "", profilePicture: "" });
  const [prefs, setPrefs] = useState({
    marketingEmails: false,
    shareAnonymizedData: false,
    notifications: { transactions: true, budgets: true, reminders: true },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("progress");
  const [showPassword, setShowPassword] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  
  // Profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture || typeof profilePicture !== 'string') return '';
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) return profilePicture;
    // Handle uploads path - prepend server URL
    if (profilePicture.startsWith('/uploads/') || profilePicture.startsWith('uploads/')) {
      return `http://localhost:5000${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
    }
    // If it's just a filename, assume it's in uploads
    return `http://localhost:5000/uploads/${profilePicture}`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle view profile
  const handleViewProfile = () => {
    setProfileDropdownOpen(false);
    navigate('/profile');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    (async () => {
      try {
        // gracefully catch privacy if endpoint missing
        const [profileRes, privacyRes] = await Promise.all([
          api.get("/api/users/profile").catch(() => ({})),
          api.get("/api/users/privacy").catch(() => ({})),
        ]);
        if (!mounted) return;
        if (profileRes?.data?.user) {
          const u = profileRes.data.user;
          const udata = { username: u.username || "", email: u.email || "", profilePicture: u.profilePicture || "" };
          setProfile(udata);
          setOriginalProfile(udata);
        }
        if (privacyRes?.data) {
          setPrefs(prev => ({ ...prev, ...(privacyRes.data.preferences || {}) }));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    })();
    return () => (mounted = false);
  }, [isAuthenticated]);

  // Fetch progress data when progress tab is active
  useEffect(() => {
    if (activeTab !== "progress" || !isAuthenticated) return;
    
    let mounted = true;
    const fetchProgressData = async () => {
      setLoadingProgress(true);
      try {
        const [statsRes, profileRes, transactionsRes, budgetRes] = await Promise.all([
          api.get("/api/lms/stats").catch(() => ({ data: {} })),
          api.get("/api/lms/profile").catch(() => ({ data: {} })),
          api.get("/api/user-transactions").catch(() => ({ data: { transactions: [] } })),
          api.get("/api/budgets").catch(() => ({ data: { budgets: [] } })),
        ]);
        
        if (!mounted) return;
        
        // Safely set data with fallbacks
        const stats = statsRes?.data?.stats || null;
        const enrollmentsList = profileRes?.data?.enrollments || [];
        const transactions = transactionsRes?.data?.transactions || [];
        const budgets = budgetRes?.data?.budgets || [];
        
        // Calculate additional progress metrics
        const totalTransactions = transactions.length;
        const totalIncome = transactions.filter(t => t.type === 'income' || t.amount > 0).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense' || t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        
        const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
        const spentBudget = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
        
        // Merge all progress data
        const extendedStats = {
          ...stats,
          totalTransactions,
          totalIncome,
          totalExpenses,
          totalBudget,
          spentBudget,
          budgetUtilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0,
          // Calculate average score from enrollments if not provided by API
          averageScore: stats?.averageScore || (enrollmentsList.length > 0 
            ? Math.round(enrollmentsList.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollmentsList.length)
            : 0),
        };
        
        setProgressData(extendedStats);
        setEnrollments(enrollmentsList);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        // Ensure progress data is set to null on error
        setProgressData(null);
        setEnrollments([]);
      } finally {
        // Always set loading to false, regardless of success or error
        if (mounted) setLoadingProgress(false);
      }
    };
    
    fetchProgressData();
    return () => (mounted = false);
  }, [activeTab, isAuthenticated]);

  const flash = txt => {
    setMessage(txt);
    setTimeout(() => setMessage(""), 3000);
  };

  /* Save profile */
  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/api/users/profile", { username: profile.username, email: profile.email });
      flash(res?.data?.message || "Profile saved");
      setOriginalProfile(profile);
    } catch (err) {
      console.error("Error saving profile:", err);
      flash(err?.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(originalProfile);
    flash("Profile reset");
  };

  /* Save preferences */
  const handlePrivacySave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/api/users/privacy", { preferences: prefs, twoFactorEnabled: false });
      flash(res?.data?.message || "Preferences saved");
    } catch (err) {
      console.error("Error saving preferences:", err);
      flash(err?.response?.data?.error || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  /* Change password */
  const handleChangePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await api.post("/api/users/change-password", { currentPassword, newPassword });
      flash(res?.data?.message || "Password changed");
    } catch (err) {
      console.error("Password change error:", err);
      flash(err?.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  /* Export / delete */
  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pfm-export-${profile.username || "user"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flash("Export started");
    } catch (err) {
      console.error("Export error:", err);
      flash(err?.response?.data?.error || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setLoading(true);
    try {
      await api.delete("/api/users");
      window.location.href = "/";
    } catch (err) {
      console.error("Delete error:", err);
      flash(err?.response?.data?.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Custom Header Section with Company Logo and User Profile */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm flex items-center justify-between">
          {/* Company Logo Section - Left */}
          <div className="flex items-center gap-3">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s" 
              alt="GJ Global Services Logo" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-sky-700 to-indigo-600 bg-clip-text text-transparent">
                GJ Global Services
              </h1>
              <p className="text-xs text-slate-500">Settings</p>
            </div>
          </div>

          {/* User Profile Section - Right */}
          {user && (
            <div className="relative" ref={profileDropdownRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {user.profilePicture && user.profilePicture !== '' ? (
                  <img 
                    src={getProfilePictureUrl(user.profilePicture)}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800">{user.username || 'User'}</p>
                  <p className="text-xs text-slate-500">{user.email || ''}</p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50">
                    <p className="text-sm font-semibold text-slate-800">{user.username || 'User'}</p>
                    <p className="text-xs text-slate-500">{user.email || 'No email'}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={handleViewProfile}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <User size={16} />
                      View Full Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <main className="p-6 pt-20 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="rounded-2xl p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <SettingsIcon className="text-white" size={20} />
                </div>
                <div>
<h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('settings')}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('helpSupport')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={containerVariant} initial="hidden" animate="show" className="mt-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex gap-3 items-center flex-wrap">
<TabButton id="progress" icon={<TrendingUp size={16} />} active={activeTab === "progress"} onClick={() => setActiveTab("progress")}>{t('myLearningProgress')}</TabButton>
              <TabButton id="profile" icon={<User size={16} />} active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>{t('profile')}</TabButton>
              <TabButton id="language" icon={<Globe size={16} />} active={activeTab === "language"} onClick={() => setActiveTab("language")}>{t('languageSettings')}</TabButton>
              <TabButton id="notifications" icon={<Bell size={16} />} active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")}>{t('notifications')}</TabButton>
              <TabButton id="security" icon={<Shield size={16} />} active={activeTab === "security"} onClick={() => setActiveTab("security")}>{t('security')}</TabButton>
<TabButton id="data" icon={<Database size={16} />} active={activeTab === "data"} onClick={() => setActiveTab("data")}>{t('dataManagement')}</TabButton>
<TabButton id="help" icon={<HelpCircle size={16} />} active={activeTab === "help"} onClick={() => setActiveTab("help")}>{t('helpSupport')}</TabButton>
              <TabButton id="darkmode" icon={isDark ? <Moon size={16} /> : <Sun size={16} />} active={activeTab === "darkmode"} onClick={() => setActiveTab("darkmode")}>Dark Mode</TabButton>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div variants={containerVariant} initial="hidden" animate="show" className="mt-6 space-y-6">
            {/* Profile */}
            {activeTab === "profile" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
<h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><User /> {t('profile')} Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm text-gray-600 dark:text-gray-300">{t('username')}</label>
                    <input value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 dark:bg-gray-700 dark:text-white" />

                    <label className="block text-sm text-gray-600 dark:text-gray-300">{t('email')}</label>
                    <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 dark:bg-gray-700 dark:text-white" />

                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                        {profile.profilePicture ? <img src={profile.profilePicture} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-gray-400">avatar</div>}
                      </div>
                      <ProfileUploader onUpload={url => setProfile({ ...profile, profilePicture: url })} />
                    </div>

                    <div className="flex gap-3 mt-6">
                      {/* Save is now a simple button (like Reset) */}
                      <button type="button" onClick={handleProfileSave} disabled={loading} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl hover:shadow-lg flex items-center gap-2 shadow-blue-500/20">
                        <Check className="inline" /> {t('save')} {t('profile')}
                      </button>

                      <button type="button" onClick={handleReset} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-5 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">{t('cancel')}</button>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Account</p>
                      <p className="text-sm text-gray-700 dark:text-gray-200">Member since:</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
                      <div className="mt-4">
                        <button onClick={() => setActiveTab("security")} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-xl hover:shadow-lg">{t('changePassword')}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Language */}
            {activeTab === "language" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><Globe /> {t('languageSettings')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('selectLanguage')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        language === lang.code
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{lang.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lang.code.toUpperCase()}</p>
                      </div>
                      {language === lang.code && (
                        <Check className="w-5 h-5 text-blue-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

{/* Progress */}
            {activeTab === "progress" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><TrendingUp /> {t('myLearningProgress')}</h3>
                
                {loadingProgress ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : progressData ? (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{progressData.totalCourses || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalCourses')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{progressData.completedCourses || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('completed')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{progressData.inProgressCourses || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('inProgress')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{progressData.totalCertificates || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('certificates')}</p>
                      </div>
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹{(progressData.totalIncome || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalIncome')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">₹{(progressData.totalExpenses || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalExpenses')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{progressData.totalTransactions || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('transactions')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">₹{(progressData.totalBudget || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('monthlyBudget')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 text-center">
                        <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{progressData.budgetUtilization || 0}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('spent')}</p>
                      </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Pie Chart - Progress Distribution */}
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Progress Distribution</h4>
                        {(enrollments.length > 0 && (progressData.completedCourses > 0 || progressData.inProgressCourses > 0)) ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Completed', value: progressData.completedCourses || 0 },
                                  { name: 'In Progress', value: progressData.inProgressCourses || 0 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell key="cell-0" fill="#22c55e" />
                                <Cell key="cell-1" fill="#f59e0b" />
                              </Pie>
                              <Tooltip formatter={(value) => [value, 'Courses']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No course progress data available
                          </div>
                        )}
                      </div>

                      {/* Bar Chart - Course Frequency */}
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Course Status Frequency</h4>
                        {(enrollments.length > 0) ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                              data={[
                                { name: 'Completed', count: progressData.completedCourses || 0 },
                                { name: 'In Progress', count: progressData.inProgressCourses || 0 },
                                { name: 'Total', count: progressData.totalCourses || 0 },
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis allowDecimals={false} />
                              <Tooltip formatter={(value) => [value, 'Courses']} />
                              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No course status data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Average Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Average Progress</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progressData.averageScore || 0}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressData.averageScore || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Enrolled Courses List */}
                    {enrollments.length > 0 ? (
                      <div>
                        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Enrolled Courses</h4>
                        <div className="space-y-3">
                          {enrollments.map((enrollment) => (
                            <div key={enrollment._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium text-gray-800 dark:text-white">{enrollment.course?.title || "Unknown Course"}</h5>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{enrollment.course?.instructor || ""}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  enrollment.status === 'completed' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : enrollment.status === 'active'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                  {enrollment.status || 'active'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      enrollment.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                    }`}
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-10 text-right">
                                  {enrollment.progress || 0}%
                                </span>
                              </div>
                              {enrollment.testScore !== undefined && enrollment.testScore !== null && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Test Score: <span className="font-medium text-blue-600 dark:text-blue-400">{enrollment.testScore}%</span>
                                  {enrollment.certificateIssued && (
                                    <span className="ml-2 text-green-600 dark:text-green-400">✓ Certificate Earned</span>
                                  )}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No courses enrolled yet.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Browse our course catalog to start learning!</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No progress data available.</p>
                  </div>
                )}
              </motion.section>
            )}

{/* Notifications */}
            {activeTab === "notifications" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><Bell /> {t('privacy')}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{t('marketingEmails')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('receivePromotionalEmails')}</p>
                      </div>
                      <Toggle checked={prefs.marketingEmails} onChange={v => setPrefs({ ...prefs, marketingEmails: v })} />
                    </label>

                    <label className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{t('shareAnonymizedData')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('helpImproveFeatures')}</p>
                      </div>
                      <Toggle checked={prefs.shareAnonymizedData} onChange={v => setPrefs({ ...prefs, shareAnonymizedData: v })} />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="font-medium text-gray-800 dark:text-white mb-3">{t('notifications')}</p>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between"><span className="text-gray-600 dark:text-gray-300">{t('transactionAlerts')}</span><Toggle checked={prefs.notifications?.transactions} onChange={v => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), transactions: v } })} /></label>
                        <label className="flex items-center justify-between"><span className="text-gray-600 dark:text-gray-300">{t('budgetReminders')}</span><Toggle checked={prefs.notifications?.budgets} onChange={v => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), budgets: v } })} /></label>
                        <label className="flex items-center justify-between"><span className="text-gray-600 dark:text-gray-300">{t('otherReminders')}</span><Toggle checked={prefs.notifications?.reminders} onChange={v => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), reminders: v } })} /></label>
                      </div>
                    </div>

                    <div className="text-right">
                      <button type="button" onClick={handlePrivacySave} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition">{t('savePreferences')}</button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><Shield /> {t('security')}</h3>
                <ChangePassword onSubmit={handleChangePassword} />
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Enable two-factor authentication for extra protection (coming soon).</div>
              </motion.section>
            )}

            {/* Data */}
            {activeTab === "data" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><Database /> {t('dataManagement')}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Export your account data (JSON) including transactions, budgets & messages.</p>
                    <div className="mt-4 flex gap-3">
                      <button type="button" onClick={handleExport} disabled={loading} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"><UploadCloud /> {t('exportData')}</button>
                      <button type="button" onClick={handleDeleteAccount} disabled={loading} className="bg-white dark:bg-gray-600 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 /> {t('deleteAccount')}</button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Backups</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">We recommend exporting your data periodically. You can import on a new device later.</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Help & Support - Google Help Center Style */}
            {activeTab === "help" && (
              <motion.div variants={itemVariant} className="space-y-6">
                {/* Search Section */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">How can we help you?</h2>
                  <div className="relative max-w-2xl">
                    <input 
                      type="text" 
                      placeholder="Search for help topics..." 
                      className="w-full px-5 py-4 pl-12 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-blue-100">Popular:</span>
                    {["Transactions", "Budget", "LMS", "Certificates", "Profile"].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm cursor-pointer hover:bg-white/30 transition">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Quick Help Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <Home size={24} />, title: "Getting Started", desc: "Begin your journey", color: "from-green-400 to-emerald-500" },
                    { icon: <CreditCard size={24} />, title: "Transactions", desc: "Manage payments", color: "from-blue-400 to-indigo-500" },
                    { icon: <BarChart2 size={24} />, title: "Analytics", desc: "Track your data", color: "from-purple-400 to-pink-500" },
                    { icon: <Wallet size={24} />, title: "Budget", desc: "Plan your finances", color: "from-amber-400 to-orange-500" },
                    { icon: <BookOpen size={24} />, title: "LMS", desc: "Learning courses", color: "from-cyan-400 to-blue-500" },
                    { icon: <Award size={24} />, title: "Certificates", desc: "Verify & earn", color: "from-rose-400 to-red-500" },
                    { icon: <Shield size={24} />, title: "Security", desc: "Keep safe", color: "from-violet-400 to-purple-500" },
                    { icon: <User size={24} />, title: "Profile", desc: "Manage account", color: "from-teal-400 to-green-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800/80 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Step-by-Step Dashboard Guidance */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><Zap className="text-amber-500" /> Getting Started Guide</h3>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: "Complete Your Profile", desc: "Add your personal information and profile picture to get personalized experience." },
                      { step: 2, title: "Connect Accounts", desc: "Link your bank accounts to automatically import transactions and track spending." },
                      { step: 3, title: "Set Up Budgets", desc: "Create budget categories to monitor your income and expenses effectively." },
                      { step: 4, title: "Explore LMS", desc: "Enroll in courses to learn new skills and earn certificates." },
                      { step: 5, title: "Join Internships", desc: "Apply for internship opportunities to gain real-world experience." },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policies Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><Scale className="text-gray-500" /> Policies & Guidelines</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Privacy Policy", desc: "Learn how we protect and handle your data", icon: <Shield size={20} /> },
                      { title: "Terms of Service", desc: "Understand our terms and conditions", icon: <FileText size={20} /> },
                      { title: "Cookie Policy", desc: "How we use cookies to improve your experience", icon: <BookMarked size={20} /> },
                      { title: "Data Security", desc: "Our commitment to keeping your data safe", icon: <Lock size={20} /> },
                    ].map((policy, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-blue-500 group-hover:text-blue-600">{policy.icon}</div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{policy.title}</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">{policy.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Explanations */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><FileQuestion className="text-purple-500" /> How the System Works</h3>
                  <div className="space-y-6">
                    {/* Workflow 1 */}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">1</div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Transaction Management</h4>
                      </div>
                      <div className="ml-14 p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
                        Connect your bank account → Transactions are automatically imported → Categorize and review → Get spending insights
                      </div>
                    </div>
                    {/* Workflow 2 */}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-bold">2</div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Budget Tracking</h4>
                      </div>
                      <div className="ml-14 p-4 rounded-lg bg-green-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
                        Set monthly budgets → Track expenses in real-time → Receive alerts → Review and adjust
                      </div>
                    </div>
                    {/* Workflow 3 */}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold">3</div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Learning & Certification</h4>
                      </div>
                      <div className="ml-14 p-4 rounded-lg bg-purple-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
                        Browse courses → Enroll and learn → Complete assessments → Earn certificates
                      </div>
                    </div>
                    {/* Workflow 4 */}
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-bold">4</div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Internship Application</h4>
                      </div>
                      <div className="ml-14 p-4 rounded-lg bg-amber-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-400">
                        Browse opportunities → Submit application → Track status → Get hired
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQs Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><HelpCircle className="text-teal-500" /> Frequently Asked Questions</h3>
                  <div className="space-y-3">
                    {[
                      { q: "How do I reset my password?", a: "Go to Settings > Security > Change Password. Enter your current password and create a new one." },
                      { q: "How are transactions categorized?", a: "Transactions are automatically categorized based on merchant information. You can manually change categories in the Transactions page." },
                      { q: "How do I earn certificates?", a: "Complete all modules in a course and pass the final assessment with the required score to earn a certificate." },
                      { q: "Is my data secure?", a: "Yes! We use industry-standard encryption and security measures to protect your personal and financial data." },
                      { q: "How do I contact support?", a: "Use the contact options below - we offer email, phone, and live chat support." },
                      { q: "Can I export my data?", a: "Yes, go to Settings > Data > Export Data to download your data in JSON format." },
                    ].map((faq, idx) => (
                      <FAQItem key={idx} question={faq.q} answer={faq.a} />
                    ))}
                  </div>
                </div>

                {/* Contact Support */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><MessageCircle className="text-red-500" /> Contact Support</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition group cursor-pointer">
                      <Mail className="w-10 h-10 text-blue-500 mb-3 group-hover:scale-110 transition" />
                      <h4 className="font-semibold text-gray-800 dark:text-white">Email Support</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get help within 24 hours</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">infogjglobalservices@gmail.com</p>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition group cursor-pointer">
                      <Phone className="w-10 h-10 text-green-500 mb-3 group-hover:scale-110 transition" />
                      <h4 className="font-semibold text-gray-800 dark:text-white">Phone Support</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mon-Fri, 9am-6pm</p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">+91 8445896023</p>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition group cursor-pointer">
                      <MessageCircle className="w-10 h-10 text-purple-500 mb-3 group-hover:scale-110 transition" />
                      <h4 className="font-semibold text-gray-800 dark:text-white">Live Chat</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Available 24/7</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">Start a conversation</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">For urgent issues, please include your account email and a detailed description of the problem.</p>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4"><ExternalLink className="text-orange-500" /> Additional Resources</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a href="#" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition group">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Video Tutorials</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Watch step-by-step guides</p>
                      </div>
                      <ExternalLink size={16} className="ml-auto text-gray-400 group-hover:text-blue-500" />
                    </a>
                    <a href="#" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition group">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Community Forum</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connect with other users</p>
                      </div>
                      <ExternalLink size={16} className="ml-auto text-gray-400 group-hover:text-green-500" />
                    </a>
                    <a href="#" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition group">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Knowledge Base</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browse detailed articles</p>
                      </div>
                      <ExternalLink size={16} className="ml-auto text-gray-400 group-hover:text-purple-500" />
                    </a>
                    <a href="#" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 transition group">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">Release Notes</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates & features</p>
                      </div>
                      <ExternalLink size={16} className="ml-auto text-gray-400 group-hover:text-red-500" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

{message && <div className="mt-4 px-4 py-2 rounded-md text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm">{message}</div>}

            {/* Dark Mode */}
            {activeTab === "darkmode" && (
              <motion.section variants={itemVariant} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                  {isDark ? <Moon className="text-indigo-500" /> : <Sun className="text-amber-500" />} 
                  Dark Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Toggle dark mode to switch between light and dark themes for the entire application.
                </p>
                
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                      {isDark ? <Moon className="text-white" size={24} /> : <Sun className="text-white" size={24} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isDark ? 'Switching to light mode...' : 'Switching to dark mode...'}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={toggle}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDark ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        isDark ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Note:</strong> Dark mode will be applied to all pages including Dashboard, Transactions, Messages, and all other sections of the application. Your preference will be saved automatically.
                  </p>
                </div>
              </motion.section>
            )}
        </main>
      </div>
    </div>
  );
};

export default Settings;

/* Helper components below (all included so nothing is undefined) */

function TabButton({ id, icon, children, active, onClick }) {
  return (
    <button onClick={onClick} id={`tab-${id}`} className={`flex items-center gap-2 py-2 px-4 rounded-full transition-all text-sm ${active ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25" : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"}`}>
      <span className="opacity-90">{icon}</span>
      <span>{children}</span>
    </button>
  );
}

function Toggle({ checked = false, onChange = () => {} }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full p-0.5 transition-colors ${checked ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} aria-pressed={checked}>
      <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

const ProfileUploader = ({ onUpload = () => {} }) => {
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profilePicture", file);
    setUploading(true);
    try {
      const res = await api.post("/api/users/profile/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res?.data?.profilePicture) onUpload(res.data.profilePicture);
      else if (res?.data?.url) onUpload(res.data.url); // fallback
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl border border-blue-500 shadow-sm hover:shadow-lg transition">
        {uploading ? "Uploading…" : "Upload"}
      </span>
      <input type="file" accept="image/*" onChange={handle} className="hidden" />
    </label>
  );
};

const ChangePassword = ({ onSubmit = () => {} }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const submit = () => {
    if (!currentPassword || !newPassword) return alert("Please fill both fields");
    if (newPassword !== confirmPassword) return alert("New passwords do not match");
    onSubmit(currentPassword, newPassword);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Current Password</label>
        <input type={visible ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white" />
      </div>

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">New Password</label>
        <input type={visible ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white" />
      </div>

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Confirm Password</label>
        <input type={visible ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white" />
      </div>

      <div className="flex items-end gap-3">
        <button type="button" onClick={submit} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25">Change Password</button>
        <button type="button" onClick={() => setVisible(v => !v)} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300">{visible ? <><EyeOff /> Hide</> : <><Eye /> Show</>}</button>
      </div>
    </div>
  );
};

// FAQ Item Component for collapsible FAQ
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-left"
      >
        <span className="font-medium text-gray-800 dark:text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  );
};

