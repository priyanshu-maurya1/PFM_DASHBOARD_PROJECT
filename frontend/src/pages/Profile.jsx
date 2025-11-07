import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append('profilePicture', file);

      try {
        const response = await fetch('http://localhost:5000/api/users/profile/upload', {
          method: 'POST',
          credentials: 'include',
          body: formDataUpload
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({ ...formData, profilePicture: `http://localhost:5000${data.profilePicture}` });
          toast.success('Profile picture updated successfully!');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to upload profile picture');
        }
      } catch (error) {
        toast.error('Error uploading profile picture');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasChanges = formData.username !== user?.username || formData.email !== user?.email;
    if (!hasChanges) return;

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email
        })
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Error updating profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-10 px-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-sm bg-gray-100">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-blue-600 text-2xl font-bold bg-blue-50">
                    {formData.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg 
                  file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 
              transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
