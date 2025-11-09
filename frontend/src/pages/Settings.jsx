// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

/* Animation variants */
const containerVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, ease: "easeOut" } },
};
const itemVariant = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({ username: "", email: "", profilePicture: "" });
  const [originalProfile, setOriginalProfile] = useState({ username: "", email: "", profilePicture: "" });
  const [prefs, setPrefs] = useState({
    marketingEmails: false,
    shareAnonymizedData: false,
    notifications: { transactions: true, budgets: true, reminders: true },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50 via-sky-50 to-white">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6 pt-20 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="rounded-2xl p-6 bg-white/80 backdrop-blur-sm border border-slate-100 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-200 to-cyan-200 flex items-center justify-center shadow-md">
                <SettingsIcon className="text-sky-700" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-sky-800">Settings</h1>
                <p className="text-sm text-slate-500">Manage your profile, preferences, and security.</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={containerVariant} initial="hidden" animate="show" className="mt-6 border-b border-slate-100">
            <div className="flex gap-3 items-center">
              <TabButton id="profile" icon={<User size={16} />} active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>Profile</TabButton>
              <TabButton id="notifications" icon={<Bell size={16} />} active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")}>Notifications</TabButton>
              <TabButton id="security" icon={<Shield size={16} />} active={activeTab === "security"} onClick={() => setActiveTab("security")}>Security</TabButton>
              <TabButton id="data" icon={<Database size={16} />} active={activeTab === "data"} onClick={() => setActiveTab("data")}>Data</TabButton>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div variants={containerVariant} initial="hidden" animate="show" className="mt-6 space-y-6">
            {/* Profile */}
            {activeTab === "profile" && (
              <motion.section variants={itemVariant} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <h3 className="text-lg font-semibold text-sky-800 flex items-center gap-2 mb-4"><User /> Profile Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm text-slate-600">Username</label>
                    <input value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100" />

                    <label className="block text-sm text-slate-600">Email</label>
                    <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100" />

                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {profile.profilePicture ? <img src={profile.profilePicture} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-slate-400">avatar</div>}
                      </div>
                      <ProfileUploader onUpload={url => setProfile({ ...profile, profilePicture: url })} />
                    </div>

                    <div className="flex gap-3 mt-6">
                      {/* Save is now a simple button (like Reset) */}
                      <button type="button" onClick={handleProfileSave} disabled={loading} className="bg-white border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        <Check className="inline" /> Save Profile
                      </button>

                      <button type="button" onClick={handleReset} className="bg-white border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-50">Reset</button>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-white border border-slate-100">
                      <p className="text-sm text-slate-600 mb-2">Account</p>
                      <p className="text-sm text-slate-700">Member since:</p>
                      <p className="text-sm text-slate-500">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
                      <div className="mt-4">
                        <button onClick={() => setActiveTab("security")} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">Update Password</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <motion.section variants={itemVariant} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <h3 className="text-lg font-semibold text-sky-800 flex items-center gap-2 mb-4"><Bell /> Privacy & Notifications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-medium">Marketing emails</p>
                        <p className="text-sm text-slate-500">Receive promotional emails</p>
                      </div>
                      <Toggle checked={prefs.marketingEmails} onChange={v => setPrefs({ ...prefs, marketingEmails: v })} />
                    </label>

                    <label className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-medium">Share anonymized data</p>
                        <p className="text-sm text-slate-500">Help improve features (anonymous)</p>
                      </div>
                      <Toggle checked={prefs.shareAnonymizedData} onChange={v => setPrefs({ ...prefs, shareAnonymizedData: v })} />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                      <p className="font-medium mb-3">Notifications</p>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between"><span>Transaction alerts</span><Toggle checked={prefs.notifications?.transactions} onChange={v => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), transactions: v } })} /></label>
                        <label className="flex items-center justify-between"><span>Budget reminders</span><Toggle checked={prefs.notifications?.budgets} onChange={v => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), budgets: v } })} /></label>
                        <label className="flex items-center justify-between"><span>Other reminders</span><Toggle checked={prefs.notifications?.reminders} onChange={v => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), reminders: v } })} /></label>
                      </div>
                    </div>

                    <div className="text-right">
                      <button type="button" onClick={handlePrivacySave} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition">Save Preferences</button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <motion.section variants={itemVariant} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <h3 className="text-lg font-semibold text-sky-800 flex items-center gap-2 mb-4"><Shield /> Security</h3>
                <ChangePassword onSubmit={handleChangePassword} />
                <div className="mt-4 text-sm text-slate-500">Enable two-factor authentication for extra protection (coming soon).</div>
              </motion.section>
            )}

            {/* Data */}
            {activeTab === "data" && (
              <motion.section variants={itemVariant} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <h3 className="text-lg font-semibold text-sky-800 flex items-center gap-2 mb-4"><Database /> Data Management</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600">Export your account data (JSON) including transactions, budgets & messages.</p>
                    <div className="mt-4 flex gap-3">
                      <button type="button" onClick={handleExport} disabled={loading} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2"><UploadCloud /> Export Data</button>
                      <button type="button" onClick={handleDeleteAccount} disabled={loading} className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 flex items-center gap-2"><Trash2 /> Delete Account</button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-white p-4 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 font-medium">Backups</p>
                    <p className="text-sm text-slate-500 mt-2">We recommend exporting your data periodically. You can import on a new device later.</p>
                  </div>
                </div>
              </motion.section>
            )}
          </motion.div>

          {message && <div className="mt-4 px-4 py-2 rounded-md text-sm bg-sky-50 text-sky-700 border border-sky-100 shadow-sm">{message}</div>}
        </main>
      </div>
    </div>
  );
};

export default Settings;

/* Helper components below (all included so nothing is undefined) */

function TabButton({ id, icon, children, active, onClick }) {
  return (
    <button onClick={onClick} id={`tab-${id}`} className={`flex items-center gap-2 py-2 px-4 rounded-full transition-all text-sm ${active ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md" : "bg-white/80 text-slate-600 hover:bg-slate-50"}`}>
      <span className="opacity-90">{icon}</span>
      <span>{children}</span>
    </button>
  );
}

function Toggle({ checked = false, onChange = () => {} }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full p-0.5 transition-colors ${checked ? "bg-gradient-to-r from-sky-400 to-cyan-400" : "bg-slate-200"}`} aria-pressed={checked}>
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
      <span className="inline-block bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sky-700 hover:bg-sky-50 transition">
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
        <label className="block text-sm text-slate-600 mb-1">Current Password</label>
        <input type={visible ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">New Password</label>
        <input type={visible ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Confirm Password</label>
        <input type={visible ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl" />
      </div>

      <div className="flex items-end gap-3">
        <button type="button" onClick={submit} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-5 py-3 rounded-xl shadow-md">Change Password</button>
        <button type="button" onClick={() => setVisible(v => !v)} className="bg-white border border-slate-200 px-4 py-3 rounded-xl">{visible ? <><EyeOff /> Hide</> : <><Eye /> Show</>}</button>
      </div>
    </div>
  );
};
