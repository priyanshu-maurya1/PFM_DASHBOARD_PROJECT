import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { 
  Send, Paperclip, Smile, Phone, Video, 
  MoreVertical, CheckCheck, FileText, Image as ImageIcon, 
  Loader2, Search, ArrowLeft, User, Users, LogOut, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Group from "../components/Group";

// Get socket URL from environment or use Vite proxy for socket.io
const SOCKET_URL = '/socket.io/'; // Proxy-relative → backend:5000 ✓

const Messages = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for conversations and messages
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // View state - toggle between 'messages' and 'groups'
  const [activeView, setActiveView] = useState('messages');
  
  // Chat state
  const [newMsg, setNewMsg] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return '';
    if (profilePicture.startsWith('http')) return profilePicture;
    return `http://localhost:5000${profilePicture}`;
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

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const userId = user._id || user.id;
    
    // Create socket connection with both WebSocket and polling transports
    // WebSocket is primary, polling is fallback
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      // Join user's personal room
      newSocket.emit("setup", userId);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      // Try forcing polling if WebSocket fails
      if (error.message && error.message.includes('websocket')) {
        console.log('WebSocket failed, attempting polling fallback...');
        newSocket.io.opts.transports = ["polling"];
        newSocket.connect();
      }
      setIsConnected(false);
    });

    // Handle transport upgrade errors gracefully
    newSocket.on("upgrade", (transport) => {
      console.log("Socket transport upgraded to:", transport.name);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Socket reconnection attempt:", attemptNumber);
      // Try polling on reconnection if WebSocket keeps failing
      newSocket.io.opts.transports = ["polling", "websocket"];
    });

    // Listen for incoming messages - FIXED: normalize IDs for proper comparison
    newSocket.on("message_received", (msg) => {
      console.log("Message received:", msg);
      
      // Normalize message IDs to strings to ensure proper comparison
      const normalizedMsg = {
        ...msg,
        senderId: String(msg.senderId),
        receiverId: String(msg.receiverId),
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString()
      };
      
      // If chatting with the sender or receiver, add to messages
      const currentUserId = String(currentUser?._id || currentUser?.id);
      const selectedUserId = selectedUser?._id || selectedUser?.userId;
      
      // Add message if we're chatting with the sender OR we're the receiver
      if (
        (selectedUser && String(normalizedMsg.senderId) === String(selectedUserId)) ||
        (String(normalizedMsg.receiverId) === currentUserId && String(normalizedMsg.senderId) === String(selectedUserId))
      ) {
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          const exists = prev.some(m => m._id === normalizedMsg._id);
          if (!exists) {
            return [...prev, normalizedMsg];
          }
          return prev;
        });
      }
      
      // Refresh conversations to update last message
      fetchConversations();
    });

    // Typing indicators
    newSocket.on("typing", ({ senderId }) => {
      if (selectedUser && (senderId === selectedUser._id || senderId === selectedUser.userId)) {
        // Handle typing indicator UI if needed
      }
    });

    newSocket.on("stop_typing", ({ senderId }) => {
      if (selectedUser && (senderId === selectedUser._id || senderId === selectedUser.userId)) {
        // Handle stop typing indicator UI if needed
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, selectedUser, currentUser]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user?._id && !user?.id) return;

    try {
      const userId = user._id || user.id;
// Fixed: Use proper endpoint for authenticated user
const response = await api.get(`/api/conversations/${userId}`); // Backend expects /api/conversations/:userId
      setConversations(response.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    }
  }, [user]);

  // Fetch conversations on mount and when user changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set current user
  useEffect(() => {
    if (user) {
      setCurrentUser({
        ...user,
        _id: user._id || user.id
      });
    }
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const userId = currentUser._id;
        const receiverId = selectedUser._id || selectedUser.userId;
        
        const response = await api.get(`/api/messages/${userId}/${receiverId}`);
        setMessages(response.data || []);
        
        // Join chat room
        if (socket && isConnected) {
          socket.emit("join_chat", { userId, receiverId });
        }
        
        // Mark messages as read
        await api.put(`/api/messages/read/${receiverId}/${userId}`);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser, socket, isConnected]);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        fetchConversations();
      }
    }, 300);
  };

  // Search users (to start new conversation)
  const searchUsers = async (query) => {
    try {
      const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      // Filter out the current user from search results
      const currentUserId = user._id || user.id;
      const filteredUsers = (response.data || []).filter(u => u._id !== currentUserId);
      
      // Convert search results to conversation format
      const searchResults = filteredUsers.map(u => ({
        userId: u._id,
        username: u.username,
        profilePicture: u.profilePicture,
        lastMessage: null,
        unreadCount: 0,
        isSearchResult: true
      }));
      setConversations(searchResults);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMsg.trim() || !selectedUser || !currentUser) return;

    const msgData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id || selectedUser.userId,
      text: newMsg.trim(),
      type: "text",
      timestamp: new Date().toISOString(),
    };

    try {
      // Save to backend
      const response = await api.post("/api/messages", msgData);
      
      // Add the message to UI immediately with the response from server
      // Note: Backend already emits message_received via socket, no need to emit again
      if (response.data?.message) {
        const msg = response.data.message;
        // Handle populated senderId/receiverId (they become objects after population)
        const savedMessage = {
          ...msg,
          senderId: String(msg.senderId?._id || msg.senderId),
          receiverId: String(msg.receiverId?._id || msg.receiverId),
          timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        };
        setMessages(prev => [...prev, savedMessage]);
      }
      
      setNewMsg("");
      setShowEmoji(false);
      
      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser || !currentUser) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const fileUrl = response.data.fileUrl;
      const fileType = response.data.type;
      const fileName = response.data.fileName;

      const fileMsg = {
        senderId: currentUser._id,
        receiverId: selectedUser._id || selectedUser.userId,
        text: fileUrl,
        type: fileType,
        fileName: fileName,
        timestamp: new Date().toISOString(),
      };

      // Save to backend
      await api.post("/api/messages", fileMsg);
      
      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Handle user selection
  const handleSelectUser = (conversation) => {
    const userData = {
      _id: conversation.userId,
      username: conversation.username,
      profilePicture: conversation.profilePicture
    };
    setSelectedUser(userData);
    setSearchQuery("");
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Truncate text
  const truncateText = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Loading state
  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#0b141a]">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0b141a]">
      
      {/* Header Section with Company Logo and User Profile */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Company Logo Section - Left */}
          <div className="flex items-center gap-3">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s" 
              alt="GJ Global Services Logo" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
          <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-sky-700 to-indigo-600 bg-clip-text text-transparent">
                  GJ Global Services
                </h1>
                {/* Messages/Groups Toggle */}
                <div className="flex bg-gray-100 dark:bg-[#2a3942] rounded-lg p-1 ml-4">
                  <button
                    onClick={() => setActiveView('messages')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'messages'
                        ? 'bg-white dark:bg-[#1e2a32] text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => setActiveView('groups')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'groups'
                        ? 'bg-white dark:bg-[#1e2a32] text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Groups
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">{activeView === 'messages' ? 'Messages' : 'Groups'}</p>
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
      </div>

      {/* Main Content - Conversations and Chat OR Groups */}
      <div className="flex flex-1 overflow-hidden">
      
      {/* Show Group component if activeView is 'groups' */}
      {activeView === 'groups' ? (
        <Group onBack={() => setActiveView('messages')} />
      ) : (
      /* Messages View */
      <>
      <div className={`w-80 bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-[#22283e] flex flex-col ${
        selectedUser ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header */}
        <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-[#22283e]">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Messages</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#2a3942] text-gray-800 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
              <Users size={48} className="mb-4 opacity-50" />
              <p className="text-center">No conversations yet</p>
              <p className="text-sm text-center opacity-70">Search for users to start chatting</p>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((conversation) => {
                const isSelected = selectedUser && (
                  (selectedUser._id && conversation.userId === selectedUser._id) ||
                  (selectedUser.userId && conversation.userId === selectedUser.userId)
                );
                
                return (
                  <motion.div
                    key={conversation.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => handleSelectUser(conversation)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-[#2a3942] ${
                      isSelected ? 'bg-green-50 dark:bg-[#2a3942]' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold overflow-hidden">
                        {conversation.profilePicture ? (
                          <img 
                            src={getProfilePictureUrl(conversation.profilePicture)} 
                            alt={conversation.username} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-white text-lg">{conversation.username?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                          {conversation.username}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp || conversation.lastMessage.createdAt) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage ? (
                            <>
                              {String(conversation.lastMessage.senderId) === String(currentUser?._id) && "You: "}
                              {conversation.lastMessage.type === 'image' ? '📷 Image' : 
                               conversation.lastMessage.type === 'file' ? '📎 File' : 
                               truncateText(conversation.lastMessage.text)}
                            </>
                          ) : conversation.isSearchResult ? (
                            <span className="text-green-600 dark:text-green-400">Tap to chat</span>
                          ) : (
                            <span className="opacity-50">No messages yet</span>
                          )}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a]">
          
          {/* Chat Header */}
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex justify-between items-center border-b border-gray-200 dark:border-[#22283e]">
            <div className="flex items-center gap-3">
              {/* Back Button (mobile) */}
              <button 
                onClick={() => setSelectedUser(null)}
                className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-[#2a3942] rounded-full transition"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* User Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center font-bold overflow-hidden">
                  {selectedUser.profilePicture ? (
                    <img 
                      src={getProfilePictureUrl(selectedUser.profilePicture)} 
                      alt={selectedUser.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-lg">{selectedUser.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#202c33] rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">{selectedUser.username}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-5 text-gray-600 dark:text-gray-300 px-2">
              <Phone className="cursor-pointer hover:text-green-600 transition" size={22} />
              <Video className="cursor-pointer hover:text-green-600 transition" size={22} />
              <MoreVertical className="cursor-pointer" size={20} />
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
            style={{ 
              backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundOpacity: 0.05
            }}
          >
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm opacity-70">Send a message to start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  // Normalize IDs to strings for proper comparison
                  const msgSenderId = String(msg.senderId);
                  const currentUserId = String(currentUser?._id);
                  const isMe = msgSenderId === currentUserId;
                  
                  // Get timestamp - handle both timestamp and createdAt fields
                  const msgTimestamp = msg.timestamp || msg.createdAt;
                  const prevTimestamp = messages[i-1]?.timestamp || messages[i-1]?.createdAt;
                  const showDate = i === 0 || new Date(msgTimestamp).toDateString() !== new Date(prevTimestamp).toDateString();
                  
                  return (
                    <React.Fragment key={msg._id || i}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-white/80 dark:bg-[#2a3942] px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                            {new Date(msgTimestamp).toDateString()}
                          </span>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`relative p-2 px-3 rounded-lg max-w-[75%] shadow-sm ${
                          isMe 
                          ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-800 dark:text-white rounded-tr-none" 
                          : "bg-white dark:bg-[#202c33] text-gray-800 dark:text-white rounded-tl-none"
                        }`}>
                          {/* Image Type */}
                          {msg.type === "image" && (
                            <div className="relative">
                              <img 
                                src={msg.text} 
                                className="rounded mb-2 max-w-full cursor-pointer hover:opacity-90 transition" 
                                alt="attachment"
                                onClick={() => window.open(msg.text, '_blank')}
                              />
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <ImageIcon size={12} />
                                <span>Image</span>
                              </div>
                            </div>
                          )}
                          
                          {/* File Type */}
                          {msg.type === "file" && (
                            <a 
                              href={msg.text} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded mb-2 hover:bg-black/10 dark:hover:bg-white/10 transition"
                            >
                              <FileText size={24} className="text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm truncate block">{msg.fileName}</span>
                                <span className="text-xs opacity-60">File attachment</span>
                              </div>
                            </a>
                          )}

                          {/* Audio Type */}
                          {msg.type === "audio" && (
                            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded mb-2">
                              <div className="flex-1">
                                <audio controls className="w-full h-8">
                                  <source src={msg.text} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            </div>
                          )}

                          {/* Text Message */}
                          {msg.type === "text" && (
                            <p className="text-[14.5px] leading-relaxed break-words">{msg.text}</p>
                          )}
                  
                          {/* Timestamp and Read Receipt */}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] opacity-60">
                              {new Date(msgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <CheckCheck 
                                size={14} 
                                className={msg.isRead ? "text-blue-400" : "text-gray-400"}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2 bg-[#f0f2f5] dark:bg-[#202c33] flex items-end gap-2 relative">
            <div className="flex gap-2 text-gray-500 dark:text-gray-400">
              <button 
                onClick={() => setShowEmoji(!showEmoji)} 
                className="p-2 hover:bg-gray-200 dark:hover:bg-[#2a3942] rounded-full transition"
                title="Add emoji"
              >
                <Smile size={24} />
              </button>
              
              <input 
                type="file" 
                hidden 
                ref={fileRef} 
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.mp4,.mov,.avi"
              />
              <button 
                onClick={() => fileRef.current?.click()} 
                className="p-2 hover:bg-gray-200 dark:hover:bg-[#2a3942] rounded-full transition"
                title="Attach file"
              >
                 <Paperclip size={24} className="-rotate-45" />
              </button>
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Type a message"
                className="w-full bg-white dark:bg-[#2a3942] dark:text-white p-2.5 px-4 rounded-lg outline-none text-[15px] focus:ring-2 focus:ring-green-500 transition-all"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              />
            </div>

            <button 
              onClick={handleSendMessage}
              disabled={!newMsg.trim() || uploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 p-2.5 rounded-full text-white transition-all transform active:scale-95 disabled:transform-none"
              title="Send message"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <Send size={22} />
              )}
            </button>

            {/* Emoji Picker Overlay */}
            {showEmoji && (
              <div className="absolute bottom-20 left-4 shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                  <button 
                    onClick={() => setShowEmoji(false)}
                    className="absolute -top-2 -right-2 z-10 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                  <EmojiPicker 
                    theme={localStorage.getItem("theme") === "dark" ? "dark" : "light"}
                    onEmojiClick={(emojiData) => {
                      setNewMsg(prev => prev + emojiData.emoji);
                    }}
                    width={300}
                    height={400}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        ) : (
        /* No Chat Selected State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#0b141a]">
          <div className="text-center p-8 max-w-md">
            {/* Company Logo */}
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s" 
                alt="GJ Global Services Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">GJ Global Services Messages</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Select a conversation from the sidebar to start chatting, or search for users to begin a new conversation.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Real-time messaging
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                File sharing
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Emoji support
              </span>
            </div>
          </div>
        </div>
        )}

      </>
      )}

      </div>

    </div>
  );
};

export default Messages;
