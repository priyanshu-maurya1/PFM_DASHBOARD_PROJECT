import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Helper function to get profile picture URL
const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return '';
  if (profilePicture.startsWith('http')) return profilePicture;
  return `http://localhost:5000${profilePicture}`;
};

const ProfileDropdown = () => {
  const { user, logout, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    profilePicture: '',
  });
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        profilePicture: getProfilePictureUrl(user.profilePicture),
      });
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', file);

    try {
      const response = await api.post('/api/users/profile/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.profilePicture) {
        const newProfilePicture = getProfilePictureUrl(response.data.profilePicture);
        setFormData((prev) => ({ ...prev, profilePicture: newProfilePicture }));
        updateUser({ profilePicture: response.data.profilePicture });
        toast.success('Profile picture uploaded successfully');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to upload profile picture';
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put('/api/users/profile', {
        username: formData.username,
        email: formData.email,
      });

      if (response.data.user) {
        updateUser({
          username: response.data.user.username,
          email: response.data.user.email,
        });
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset formData to current user values
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        profilePicture: getProfilePictureUrl(user.profilePicture),
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Top bar avatar + welcome text */}
      <div className="flex items-center space-x-3">
        <span className="hidden md:block text-gray-800 text-base font-semibold">
          Welcome, {user?.username || 'User'}
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none hover:opacity-80 transition"
          disabled={!user}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-300 shadow-sm">
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-blue-700">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Animated dropdown with Framer Motion */}
      <AnimatePresence>
        {isOpen && user && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-blue-100 z-50 p-4"
          >
            {/* Profile header */}
            <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 pb-3">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-blue-50 border border-blue-200">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-blue-700 flex items-center justify-center h-full">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 bg-blue-600 bg-opacity-60 text-white text-xs flex items-center justify-center hover:bg-opacity-70 transition disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Change'}
                  </button>
                )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Username"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-1 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      disabled={isSaving}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      disabled={isSaving}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900 text-base">
                      {user?.username}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />

            {/* Buttons */}
            <div className="flex flex-col space-y-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 text-sm transition"
                  >
                    Edit Profile
                  </button>
                  <a
                    href="/profile"
                    className="w-full bg-white border border-blue-100 text-blue-600 py-2 rounded-lg hover:bg-blue-50 text-center text-sm transition"
                  >
                    View Full Profile
                  </a>
                </>
              )}
              <button
                onClick={logout}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm transition"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
