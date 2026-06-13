import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

/* ================= HELPERS ================= */

// File icon
const getFileIcon = (name = "", type = "") => {
  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return "🖼️";
  if (name.endsWith(".pdf")) return "📄";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "📝";
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "📊";
  if (type.startsWith("video/")) return "🎥";
  if (type.startsWith("audio/")) return "🎵";
  if (name.endsWith(".zip") || name.endsWith(".rar")) return "🗜️";
  return "📁";
};

// Size format
const formatFileSize = (bytes = 0) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// Image check
const isImage = (name = "") =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(name);

// Get proper URL for file access
const getFileUrl = (path, userId) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // If we have a userId, construct the proper URL
  if (userId) {
    return `http://localhost:5000/uploads/${userId}/${path}`;
  }
  return `http://localhost:5000${path}`;
};

// Download file
const downloadFile = (path, name, userId) => {
  const url = getFileUrl(path, userId);
  const a = document.createElement("a");
  a.href = url;
  a.download = name || "download";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/* ================= COMPONENT ================= */

export default function UploadFile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [storedFiles, setStoredFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Get userId from localStorage (set during login)
  const userId = localStorage.getItem('userId');

  const fileRef = useRef(null);
  const folderRef = useRef(null);

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

  /* ============== FETCH STORED FILES ============== */
  const fetchFiles = async () => {
    try {
      setLoading(true);
      // Backend now uses authentication - no need to send userId manually
      // The auth token is automatically included via API interceptor
      const res = await api.get('/api/upload/files');
      if (res.data?.success) {
        setStoredFiles(res.data.files || []);
      }
    } catch (error) {
      console.error("Fetch files error:", error);
      // Don't show error toast for auth errors - just set empty files
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error("Failed to load files");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  /* ============== FILE SELECT ============== */
  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) selected`);
  };

  /* ============== DRAG & DROP ============== */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      toast.success(`${droppedFiles.length} file(s) dropped`);
    }
  }, []);

  /* ============== REMOVE SELECTED FILE ============== */
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ============== UPLOAD ============== */
  const uploadFiles = async () => {
    if (!files.length) return toast.error("No files selected");

    setUploading(true);
    // Backend now gets userId from authentication token
    const prog = {};
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append("file", files[i]);
      // No need to append userId - backend gets it from auth token

      prog[i] = 0;
      setProgress({ ...prog });

      try {
        await api.post("/api/upload/upload", form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) => {
            prog[i] = Math.round((e.loaded * 100) / e.total);
            setProgress({ ...prog });
          },
        });
        prog[i] = 100;
        successCount++;
      } catch (error) {
        console.error(`Upload error for file ${i}:`, error);
        prog[i] = -1;
        errorCount++;
      }
      setProgress({ ...prog });
    }

    setUploading(false);
    setFiles([]);
    setProgress({});
    
    if (successCount > 0) {
      toast.success(`Upload completed! ${successCount} file(s) uploaded successfully.`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) failed to upload.`);
    }
    
    fetchFiles();
  };

  /* ============== DELETE ============== */
  const deleteFile = async (file) => {
    // Show confirmation dialog before deleting
    const confirmed = window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      // Determine the correct path to delete - use same format as the stored path
      // Include userId in the path to ensure proper routing
      const filename = file.relativePath || file.path;
      const apiPath = `/uploads/${userId}/${filename}`;

      console.log('Deleting file with path:', apiPath);
      console.log('UserId:', userId);
      console.log('Filename:', filename);
      
      const res = await api.delete("/api/upload/file", { 
        data: { path: apiPath } 
      });
      
      console.log('Delete response:', res.data);
      
      if (res.data?.success) {
        // Use file path to identify the correct file to remove (not index, as index may be from filtered list)
        setStoredFiles((prev) => prev.filter((f) => {
          const fPath = f.relativePath || f.path;
          return fPath !== filename;
        }));
        toast.success("File deleted successfully");
        
        // Re-fetch files to ensure UI is in sync with backend
        fetchFiles();
      } else {
        toast.error(res.data?.error || "Delete failed");
        // Still re-fetch to ensure UI is in sync
        fetchFiles();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed: " + (error.response?.data?.error || error.message));
      // Re-fetch to ensure UI is in sync even on error
      fetchFiles();
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section with Company Logo and User Profile */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              <p className="text-xs text-slate-500">File Management</p>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Full Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Upload Box */}
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="text-center py-10">
            <div className="text-6xl mb-4">📤</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Drag & Drop Files Here
            </p>
            <p className="text-gray-500 mb-6">or click the buttons below</p>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="min-w-[140px]"
              >
                📁 Select Files
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => folderRef.current?.click()}
                disabled={uploading}
                className="min-w-[140px]"
              >
                📂 Select Folder
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Supported: Images, PDFs, Documents, Videos, Audio, Archives
            </p>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="*"
              className="hidden"
              onChange={handleChange}
            />
            <input
              ref={folderRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Selected Files */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Selected Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">{getFileIcon(file.name, file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {uploading && (
                      <span className="text-sm font-medium">
                        {progress[index] === -1 ? (
                          <span className="text-red-500">❌ Failed</span>
                        ) : (
                          <span className={progress[index] === 100 ? "text-green-500" : ""}>
                            {progress[index] || 0}%
                          </span>
                        )}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Object.values(progress).filter(p => p !== -1).reduce((a, b) => a + b, 0) / files.length}%`
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={uploadFiles} 
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      🚀 Upload {files.length} File{files.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🖼️ Image Gallery
            </CardTitle>
            <CardDescription>Preview your uploaded images</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <span className="animate-spin text-2xl">⏳</span>
                <p className="text-gray-500 mt-2">Loading images...</p>
              </div>
            ) : storedFiles.filter(f => isImage(f.name)).length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <span className="text-4xl">🖼️</span>
                <p className="mt-2">No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {storedFiles
                  .filter(f => isImage(f.name))
                  .map((file, index) => {
                    // Build the proper URL based on the file path
                    const filePath = file.relativePath || file.path;
                    const imageUrl = getFileUrl(filePath, userId);
                    
                    return (
                      <div 
                        key={index} 
                        className="relative group rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={imageUrl}
                          alt={file.name}
                          className="h-48 w-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='12'%3EImage not found%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => window.open(imageUrl, "_blank")}
                          >
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteFile(file)}
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs truncate">{file.name}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Store */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📁 File Store
            </CardTitle>
            <CardDescription>All your uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <span className="animate-spin text-2xl">⏳</span>
                <p className="text-gray-500 mt-2">Loading files...</p>
              </div>
            ) : storedFiles.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <span className="text-4xl">📁</span>
                <p className="mt-2">No files uploaded yet</p>
                <p className="text-sm">Upload files using the drag & drop area above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {storedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(file.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size ? formatFileSize(file.size) : ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filePath = file.relativePath || file.path;
                          downloadFile(filePath, file.name, userId);
                        }}
                        title="Download"
                      >
                        ⬇️
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filePath = file.relativePath || file.path;
                          const url = getFileUrl(filePath, userId);
                          window.open(url, "_blank");
                        }}
                        title="View"
                      >
                        👁️
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFile(file)}
                        title="Delete"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
