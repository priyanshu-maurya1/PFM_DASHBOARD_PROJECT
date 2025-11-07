import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', profilePicture: '' });
  const [prefs, setPrefs] = useState({ marketingEmails: false, shareAnonymizedData: false, notifications: { transactions: true, budgets: true, reminders: true } });
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        if (res.data.user) {
          setProfile({ username: res.data.user.username, email: res.data.user.email, profilePicture: res.data.user.profilePicture });
        }
        const p = await api.get('/api/users/privacy');
        setPrefs(p.data.preferences || prefs);
        setTwoFactor(p.data.twoFactorEnabled || false);
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/api/users/profile', { username: profile.username, email: profile.email });
      setMessage(res.data.message || 'Saved');
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePrivacySave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/api/users/privacy', { preferences: prefs, twoFactorEnabled: twoFactor });
      setMessage(res.data.message || 'Preferences saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setMessage(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await api.post('/api/users/change-password', { currentPassword, newPassword });
      setMessage(res.data.message || 'Password changed');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users/export');
      // prompt download as JSON
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pfm-export-${profile.username || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Export failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await api.delete('/api/users');
      // On success, reload app or redirect to landing
      window.location.href = '/';
    } catch (err) {
      setMessage(err.response?.data?.error || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-8 mt-16">
          <h1 className="text-2xl font-bold text-sky-800">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your preferences, theme, and security options here.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <section className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-lg font-semibold mb-4">Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">Username</label>
                  <input className="mt-1 w-full border rounded p-2" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <input className="mt-1 w-full border rounded p-2" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                    {profile.profilePicture ? <img src={profile.profilePicture} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>}
                  </div>
                  <ProfileUploader onUpload={(url) => setProfile({ ...profile, profilePicture: url })} />
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handleProfileSave} disabled={loading}>Save Profile</button>
                  <button className="px-4 py-2 border rounded" onClick={() => { setProfile({ username: user?.username || '', email: user?.email || '', profilePicture: user?.profilePicture || '' }); }}>Reset</button>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-lg font-semibold mb-4">Privacy & Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Marketing emails</span>
                  <input type="checkbox" checked={prefs.marketingEmails} onChange={(e) => setPrefs({ ...prefs, marketingEmails: e.target.checked })} />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Share anonymized data</span>
                  <input type="checkbox" checked={prefs.shareAnonymizedData} onChange={(e) => setPrefs({ ...prefs, shareAnonymizedData: e.target.checked })} />
                </label>

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Notifications</p>
                  <label className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-700">Transaction alerts</span>
                    <input type="checkbox" checked={prefs.notifications?.transactions} onChange={(e) => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), transactions: e.target.checked } })} />
                  </label>
                  <label className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-700">Budget reminders</span>
                    <input type="checkbox" checked={prefs.notifications?.budgets} onChange={(e) => setPrefs({ ...prefs, notifications: { ...(prefs.notifications || {}), budgets: e.target.checked } })} />
                  </label>
                </div>

                <div className="flex gap-3 mt-4">
                  <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handlePrivacySave} disabled={loading}>Save Preferences</button>
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <section className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <ChangePassword onSubmit={handleChangePassword} />
            </section>

            <section className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-lg font-semibold mb-4">Data</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Export your account data (JSON). This includes recent transactions, budgets and messages.</p>
                <div className="flex gap-3 mt-3">
                  <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handleExport} disabled={loading}>Export Data</button>
                  <button className="px-4 py-2 border rounded text-red-600" onClick={handleDeleteAccount} disabled={loading}>Delete Account</button>
                </div>
              </div>
            </section>
          </div>

          {message && <div className="mt-4 text-sm text-indigo-700">{message}</div>}
        </main>
      </div>
    </div>
  );
};

const ProfileUploader = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profilePicture', file);
    setUploading(true);
    try {
      const res = await api.post('/api/users/profile/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpload(res.data.profilePicture);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <label className="px-3 py-2 border rounded cursor-pointer bg-white">
        {uploading ? 'Uploading...' : 'Upload'}
        <input type="file" accept="image/*" onChange={handle} className="hidden" />
      </label>
    </div>
  );
};

const ChangePassword = ({ onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submit = () => {
    if (!currentPassword || !newPassword) return alert('Please fill both fields');
    if (newPassword !== confirmPassword) return alert('New passwords do not match');
    onSubmit(currentPassword, newPassword);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600">Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm text-gray-600">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={submit}>Change Password</button>
      </div>
    </div>
  );
};

export default Settings;
