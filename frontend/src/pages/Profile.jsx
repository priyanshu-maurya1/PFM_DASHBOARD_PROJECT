import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import UploadFile from '../components/uploadfile';
import api from '../utils/api';

// Leaderboard storage key (shared with Leaderboard.jsx)
const LEADERBOARD_STORAGE_KEY = "gj_students_v2";

const Profile = () => {
  const { user, updateUser, refreshUser, initialLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);

  // Guard: Wait for auth initialization
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }
  
  // Quiz results state
  const [quizResults, setQuizResults] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalPoints: 0
  });

  // Leaderboard rankings state
  const [leaderboardRankings, setLeaderboardRankings] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // Initialize formData from AuthContext user (no redundant API call)
  useEffect(() => {
    if (user && !loading) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        profilePicture: user.profilePicture ? `${api.defaults.baseURL}${user.profilePicture}` : ''
      });
      setLoading(false);
    }
  }, [user]);

  // Fetch user's quiz results
  useEffect(() => {
    const fetchQuizResults = async () => {
      // Only fetch quiz results if user is authenticated
      if (!user) {
        setQuizLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/api/quiz/results');
        if (response.data?.results) {
          const results = response.data.results;
          setQuizResults(results.slice(0, 5)); // Show latest 5 quizzes
          
          // Calculate stats
          if (results.length > 0) {
            const totalQuizzes = results.length;
            const totalPoints = results.reduce((sum, r) => sum + r.score, 0);
            const averageScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes);
            const bestScore = Math.max(...results.map(r => r.percentage));
            
            setQuizStats({
              totalQuizzes,
              averageScore,
              bestScore,
              totalPoints
            });
          }
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        // Silently fail - quiz results are optional
      } finally {
        setQuizLoading(false);
      }
    };

    fetchQuizResults();
  }, [user]);

  // Fetch leaderboard rankings from localStorage (shared with Leaderboard.jsx)
  useEffect(() => {
    const fetchLeaderboard = () => {
      try {
        const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
        if (stored) {
          const students = JSON.parse(stored);
          // Sort by score descending
          const sorted = [...students].sort((a, b) => b.score - a.score).map((s, i) => ({ ...s, rank: i + 1 }));
          setLeaderboardRankings(sorted.slice(0, 10)); // Top 10 rankings
          
          // Find current user's rank if logged in
          if (user?.username) {
            const userRanking = sorted.find(s => s.name.toLowerCase() === user.username.toLowerCase());
            if (userRanking) {
              setCurrentUserRank(userRanking);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Poll for updates every 4 seconds
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formDataUpload = new FormData();
      formDataUpload.append('profilePicture', file);

      try {
        const response = await api.post('/api/users/profile/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log('Upload response:', response.data);

        if (response.data?.profilePicture) {
          const newProfilePicture = `${api.defaults.baseURL}${response.data.profilePicture}`;
          setFormData({ ...formData, profilePicture: newProfilePicture });
          // Update AuthContext with new profile picture
          await refreshUser();
          toast.success('Profile picture updated successfully!');
        } else {
          toast.error(response.data?.error || 'Failed to upload profile picture');
        }
      } catch (error) {
        console.error('Profile upload error:', error);
        console.error('Upload error response:', error.response?.data);
        toast.error(error.response?.data?.error || 'Error uploading profile picture');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasChanges = formData.username !== user?.username || formData.email !== user?.email;
    if (!hasChanges) return;

    try {
      const response = await api.put('/api/auth/profile', { 
        username: formData.username, 
        email: formData.email 
      });

      if (response.data?.user) {
        // Update AuthContext with new user data
        updateUser({ username: formData.username, email: formData.email });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data?.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Error updating profile');
    }
  };

  // Grade color helper
  const getGradeColor = (grade) => {
    const colors = {
      S: '#d97706',
      A: '#059669',
      B: '#2563eb',
      C: '#ea580c',
      D: '#dc2626'
    };
    return colors[grade] || '#64748b';
  };

  // Grade badge helper
  const getGradeBadge = (grade) => {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        background: `${getGradeColor(grade)}22`,
        border: `2px solid ${getGradeColor(grade)}`,
        color: getGradeColor(grade),
        fontWeight: '800',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        {grade}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
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
                    onError={(e) => {
                      console.error('Image load error for URL:', formData.profilePicture);
                      // Hide the broken image and show the fallback
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.profile-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="profile-fallback flex items-center justify-center w-full h-full text-blue-600 text-2xl font-bold bg-blue-50"
                  style={{ display: formData.profilePicture ? 'none' : 'flex' }}
                >
                  {formData.username?.[0]?.toUpperCase() || '?'}
                </div>
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

        {/* Quiz Results Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🏆
              </div>
              <h3 className="text-xl font-bold text-gray-800">Quiz Performance</h3>
            </div>
          </div>

          {quizLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading quiz results...</p>
            </div>
          ) : quizResults.length > 0 ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{quizStats.totalQuizzes}</div>
                  <div className="text-xs text-blue-500 font-medium mt-1">Total Quizzes</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{quizStats.averageScore}%</div>
                  <div className="text-xs text-green-500 font-medium mt-1">Average Score</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200">
                  <div className="text-2xl font-bold text-amber-600">{quizStats.bestScore}%</div>
                  <div className="text-xs text-amber-500 font-medium mt-1">Best Score</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{quizStats.totalPoints}</div>
                  <div className="text-xs text-purple-500 font-medium mt-1">Total Points</div>
                </div>
              </div>

              {/* Recent Quiz Results */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Recent Quiz Attempts</h4>
                <div className="space-y-3">
                  {quizResults.map((result, index) => (
                    <div 
                      key={result._id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition"
                    >
                      <div className="flex items-center gap-4">
                        {getGradeBadge(result.grade)}
                        <div>
                          <div className="font-medium text-gray-800">{result.course}</div>
                          <div className="text-sm text-gray-500">{result.week}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{result.percentage}%</div>
                        <div className="text-xs text-gray-500">{result.correct}/{result.total} correct</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Quiz Results Yet</h4>
              <p className="text-gray-500 mb-4">Take your first quiz to see your performance here!</p>
              <Link
                to="/Leaderboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🏆 Go to Leaderboard
              </Link>
            </div>
          )}
        </div>

        {/* Leaderboard Rankings Section with Company Logo */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img 
                src="/main-logo.png" 
                alt="GJ Global Services Logo" 
                style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }}
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">🏆 Leaderboard Rankings</h3>
                <p className="text-xs text-gray-500">Top 10 Students</p>
              </div>
            </div>
            <Link
              to="/Leaderboard"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {leaderboardLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading rankings...</p>
            </div>
          ) : leaderboardRankings.length > 0 ? (
            <>
              {/* Current User Rank Card */}
              {currentUserRank && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                        #{currentUserRank.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Your Ranking</div>
                        <div className="text-xs text-gray-500">{currentUserRank.college} · {currentUserRank.course}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{currentUserRank.score.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Rankings List */}
              <div className="space-y-2">
                {leaderboardRankings.map((student, index) => {
                  const isTop3 = student.rank <= 3;
                  const medals = ['🥇', '🥈', '🥉'];
                  const colors = ['text-amber-500', 'text-gray-400', 'text-orange-400'];
                  
                  return (
                    <div 
                      key={student.id || index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isTop3 ? 'bg-gradient-to-r from-gray-50 to-white' : 'bg-gray-50'
                      } border ${isTop3 ? 'border-gray-200' : 'border-gray-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          isTop3 ? colors[student.rank - 1] : 'text-gray-500'
                        }`}>
                          {isTop3 ? medals[student.rank - 1] : `#${student.rank}`}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.college}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{student.score.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Rankings Yet</h4>
              <p className="text-gray-500 mb-4">Be the first to take a quiz and get on the leaderboard!</p>
              <Link
                to="/Leaderboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🧠 Take a Quiz
              </Link>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📤 File Upload Manager</h3>
          <p className="text-gray-600 mb-6">Upload, preview, and manage your files directly from your profile.</p>
          <UploadFile />
        </div>
      </main>
    </div>
  );
};

export default Profile;

