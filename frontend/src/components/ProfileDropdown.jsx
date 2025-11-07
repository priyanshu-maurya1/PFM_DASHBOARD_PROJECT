import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture
      ? `http://localhost:5000${user.profilePicture}`
      : '',
  });
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
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
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append('profilePicture', file);

      try {
        const response = await fetch(
          'http://localhost:5000/api/users/profile/upload',
          {
            method: 'POST',
            credentials: 'include',
            body: formDataUpload,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFormData({
            ...formData,
            profilePicture: `http://localhost:5000${data.profilePicture}`,
          });
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to upload profile picture');
        }
      } catch {
        alert('Error uploading profile picture');
      }
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch {
      alert('Error updating profile');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ✅ Top bar avatar + welcome text */}
      <div className="flex items-center space-x-3">
        <span className="hidden md:block text-gray-800 text-base font-semibold">
          Welcome, {user?.username}
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none hover:opacity-80 transition"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-300 shadow-sm">
            {user?.profilePicture ? (
              <img
                src={`http://localhost:5000${user.profilePicture}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-blue-700">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* ✅ Animated dropdown with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
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
                {user?.profilePicture ? (
                  <img
                    src={`http://localhost:5000${user.profilePicture}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-blue-700 flex items-center justify-center h-full">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-blue-600 bg-opacity-60 text-white text-xs flex items-center justify-center"
                  >
                    Change
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
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-1 focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400"
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
            />

            {/* ✅ Buttons */}
            <div className="flex flex-col space-y-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm transition"
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
