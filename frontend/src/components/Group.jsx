import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Globe, Key, Lock, Search, UserPlus,
  Loader2, Users, Plus, ArrowLeft, Calendar,
  Building2, MessageSquare, Bell, Trash2, Edit,
  ExternalLink, Copy, Check, LogOut, Settings, Send, Pin, MoreVertical, File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// ==========================================
// JoinGroupModal Component
// ==========================================
const JoinGroupModal = ({ onClose, onJoin, loading }) => {
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Invite code is required");
      return;
    }
    await onJoin(inviteCode.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white dark:bg-[#1e2a32] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2a3942]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow">
              <Key size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Join with Invite Code
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm font-mono tracking-wider transition"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#2a3942] text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#384b56] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Join Group
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// CreateGroupModal Component
// ==========================================
const CreateGroupModal = ({ onClose, onSubmit, loading: parentLoading }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  
  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Debounced search for users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setSearching(true);
        const res = await api.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        // Filter out already selected members
        const filtered = res.data.filter(
          user => !selectedMembers.find(m => m._id === user._id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedMembers]);

  const handleAddMember = (user) => {
    setSelectedMembers([...selectedMembers, user]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setLoading(true);
    // Pass member IDs to the submit function
    const memberIds = selectedMembers.map(m => m._id);
    await onSubmit({ name, description, privacy, members: memberIds });
    setLoading(false);
  };

  const privacyOptions = [
    {
      value: "public",
      label: "Public",
      sub: "Anyone can join",
      Icon: Globe,
      active: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-500",
    },
    {
      value: "invite-only",
      label: "Invite Only",
      sub: "Requires invite code",
      Icon: Key,
      active: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500",
    },
    {
      value: "private",
      label: "Private",
      sub: "Admin assigns members",
      Icon: Lock,
      active: "border-rose-500 bg-rose-50 dark:bg-rose-900/20",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white dark:bg-[#1e2a32] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2a3942]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow">
              <Users size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Create New Group
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Group Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Dev Squad"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm resize-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Privacy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {privacyOptions.map(({ value, label, sub, Icon, active, iconColor }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPrivacy(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    privacy === value
                      ? active
                      : "border-gray-200 dark:border-[#384b56] hover:border-gray-300 dark:hover:border-[#4a5b66]"
                  }`}
                >
                  <Icon size={20} className={privacy === value ? iconColor : "text-gray-400 dark:text-gray-500"} />
                  <span className={`text-xs font-semibold ${privacy === value ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Members Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Add Members (Optional)
            </label>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedMembers.map(member => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {member.username?.slice(0, 2).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">{member.username}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full transition-colors"
                    >
                      <X size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search users by username or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm transition"
              />
              
              {/* Search Results Dropdown */}
              {showSearch && (searchResults.length > 0 || searching) && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1e2a32] border border-gray-200 dark:border-[#384b56] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {searching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    searchResults.map(user => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleAddMember(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.username?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <UserPlus size={16} className="text-emerald-500" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#2a3942] text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#384b56] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || parentLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create Group
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// GroupCard Component
// ==========================================
const GroupCard = ({ group, onJoin, onLeave, onView, isJoining, isLeaving }) => {
  const privacyIcons = {
    public: <Globe size={14} className="text-emerald-500" />,
    "invite-only": <Key size={14} className="text-amber-500" />,
    private: <Lock size={14} className="text-rose-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1e2a32] rounded-xl border border-gray-200 dark:border-[#2a3942] p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{group.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            by {group.adminName} • {group.memberCount} members
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {privacyIcons[group.privacy]}
        </div>
      </div>

      {group.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center gap-2">
        {group.isMember || group.isGroupAdmin ? (
          <>
            <button
              onClick={() => onView(group._id)}
              className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              View Group
            </button>
            {!group.isGroupAdmin && (
              <button
                onClick={() => onLeave(group._id)}
                disabled={isLeaving}
                className="px-3 py-2 text-gray-500 hover:text-rose-500 transition-colors disabled:opacity-50"
              >
                {isLeaving ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => onJoin(group._id)}
            disabled={isJoining}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
          >
            {isJoining ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Join Group
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================
// GroupDetail Component
// ==========================================
const GroupDetail = ({ group, onBack, onLeave, user, isLeaving }) => {
  const [activeTab, setActiveTab] = useState("internships");
  const [internships, setInternships] = useState(group.internshipOpportunities || []);
  const [updates, setUpdates] = useState(group.workflowUpdates || []);
  const [messages, setMessages] = useState([]);
  const [showAddInternship, setShowAddInternship] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [inviteCode, setInviteCode] = useState(group.inviteCode);
  const [copied, setCopied] = useState(false);
  const [loadingInternship, setLoadingInternship] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingIntro, setSendingIntro] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);

  const [internshipForm, setInternshipForm] = useState({
    title: "", company: "", description: "", location: "", duration: "", stipend: "", applyLink: ""
  });

  const [updateForm, setUpdateForm] = useState({
    title: "", content: "", category: "general", priority: "normal"
  });

  const isGroupAdmin = group.isGroupAdmin;

  // Format message time
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get pinned messages
  const pinnedMessages = messages.filter(m => m.isPinned);

  // Load messages when tab is switched to messages
  useEffect(() => {
    if (activeTab === "messages") {
      const fetchMessages = async () => {
        try {
          setLoadingMessages(true);
          const res = await api.get(`/api/groups/${group._id}/messages?page=1&limit=50`);
          setMessages(res.data.messages || []);
          setHasMoreMessages(res.data.hasMore || false);
          setPage(1);
        } catch (err) {
          console.error("Error fetching messages:", err);
          toast.error("Failed to load messages");
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [activeTab, group._id]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMessages) return;
    try {
      setLoadingMessages(true);
      const nextPage = page + 1;
      const res = await api.get(`/api/groups/${group._id}/messages?page=${nextPage}&limit=50`);
      setMessages(prev => [...prev, ...(res.data.messages || [])]);
      setHasMoreMessages(res.data.hasMore || false);
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message to the group
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      const res = await api.post(`/api/groups/${group._id}/messages`, {
        text: newMessage.trim(),
        type: 'text'
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.messageData]);
        setNewMessage("");
        toast.success("Message sent!");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await api.delete(`/api/groups/${group._id}/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      toast.success("Message deleted");
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error(err.response?.data?.error || "Failed to delete message");
    }
  };

  // Pin/unpin a message
  const handlePinMessage = async (messageId) => {
    try {
      const res = await api.put(`/api/groups/${group._id}/messages/${messageId}/pin`);
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, isPinned: res.data.isPinned } : m
      ));
      toast.success(res.data.message);
    } catch (err) {
      console.error("Error pinning message:", err);
      toast.error(err.response?.data?.error || "Failed to pin message");
    }
  };

  // Share introduction
  const handleShareIntroduction = async (introduction, interests) => {
    try {
      setSendingIntro(true);
      const res = await api.post(`/api/groups/${group._id}/messages`, {
        text: introduction,
        type: 'introduction',
        interests: interests || []
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.messageData]);
        setShowIntroModal(false);
        toast.success("Introduction shared!");
      }
    } catch (err) {
      console.error("Error sharing introduction:", err);
      toast.error(err.response?.data?.error || "Failed to share introduction");
    } finally {
      setSendingIntro(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode || "");
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateInvite = async () => {
    try {
      const res = await api.post(`/api/groups/${group._id}/invite`);
      setInviteCode(res.data.inviteCode);
      toast.success("Invite code generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate invite");
    }
  };

  const handleAddInternship = async (e) => {
    e.preventDefault();
    if (!internshipForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoadingInternship(true);
    try {
      const res = await api.post(`/api/groups/${group._id}/internships`, internshipForm);
      setInternships([res.data.internship, ...internships]);
      setInternshipForm({ title: "", company: "", description: "", location: "", duration: "", stipend: "", applyLink: "" });
      setShowAddInternship(false);
      toast.success("Internship added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add internship");
    } finally {
      setLoadingInternship(false);
    }
  };

  const handleArchiveInternship = async (id) => {
    try {
      await api.delete(`/api/groups/${group._id}/internships/${id}/archive`);
      setInternships(internships.filter(i => i._id !== id));
      toast.success("Internship archived");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to archive");
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.title.trim() || !updateForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setLoadingUpdate(true);
    try {
      const res = await api.post(`/api/groups/${group._id}/updates`, updateForm);
      setUpdates([res.data.update, ...updates]);
      setUpdateForm({ title: "", content: "", category: "general", priority: "normal" });
      setShowAddUpdate(false);
      toast.success("Update added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add update");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleArchiveUpdate = async (id) => {
    try {
      await api.delete(`/api/groups/${group._id}/updates/${id}/archive`);
      setUpdates(updates.filter(u => u._id !== id));
      toast.success("Update archived");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to archive");
    }
  };

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      onLeave(group._id);
    }
  };

  const tabs = [
    { id: "internships", label: "Internships", count: internships.length, icon: Building2 },
    { id: "updates", label: "Updates", count: updates.length, icon: Bell },
    { id: "messages", label: "Messages", count: 0, icon: MessageSquare },
    { id: "members", label: "Members", count: group.members?.length || 0, icon: Users },
  ];

  const priorityColors = {
    normal: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    important: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    urgent: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {group.memberCount} members • Created by {group.adminName}
          </p>
        </div>
        {!isGroupAdmin && (
          <button
            onClick={handleLeave}
            disabled={isLeaving}
            className="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLeaving ? <Loader2 size={16} className="animate-spin" /> : "Leave Group"}
          </button>
        )}
      </div>

      {/* Invite Code Section */}
      {(isGroupAdmin || inviteCode) && (
        <div className="bg-gray-50 dark:bg-[#1e2a32] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Invite Code</p>
              <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{inviteCode || "Not generated"}</p>
            </div>
            <div className="flex gap-2">
              {isGroupAdmin && !inviteCode && (
                <button onClick={handleGenerateInvite} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">
                  Generate
                </button>
              )}
              {inviteCode && (
                <button onClick={handleCopyInvite} className="p-2 bg-gray-200 dark:bg-[#2a3942] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-[#384b56] transition-colors">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {group.description && (
        <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#1e2a32] p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className="text-xs bg-gray-200 dark:bg-[#384b56] px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "internships" && (
          <div className="space-y-3">
            {isGroupAdmin && (
              <button
                onClick={() => setShowAddInternship(!showAddInternship)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-[#384b56] text-gray-600 dark:text-gray-400 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-colors"
              >
                <Plus size={16} /> Add Internship
              </button>
            )}

            {showAddInternship && (
              <form onSubmit={handleAddInternship} className="bg-gray-50 dark:bg-[#1e2a32] rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Job Title *"
                  value={internshipForm.title}
                  onChange={e => setInternshipForm({ ...internshipForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Company"
                    value={internshipForm.company}
                    onChange={e => setInternshipForm({ ...internshipForm, company: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={internshipForm.location}
                    onChange={e => setInternshipForm({ ...internshipForm, location: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={internshipForm.description}
                  onChange={e => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm resize-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Duration"
                    value={internshipForm.duration}
                    onChange={e => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Stipend"
                    value={internshipForm.stipend}
                    onChange={e => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Apply Link"
                    value={internshipForm.applyLink}
                    onChange={e => setInternshipForm({ ...internshipForm, applyLink: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loadingInternship} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
                    {loadingInternship ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Add Internship"}
                  </button>
                  <button type="button" onClick={() => setShowAddInternship(false)} className="px-4 py-2 bg-gray-200 dark:bg-[#384b56] text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {internships.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No internships available yet.</p>
            ) : (
              internships.map(internship => (
                <div key={internship._id} className="bg-white dark:bg-[#1e2a32] rounded-xl border border-gray-200 dark:border-[#2a3942] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{internship.title}</h4>
                      {internship.company && <p className="text-sm text-gray-500 dark:text-gray-400">{internship.company}</p>}
                    </div>
                    {isGroupAdmin && (
                      <button onClick={() => handleArchiveInternship(internship._id)} className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {internship.location && <span className="text-xs bg-gray-100 dark:bg-[#2a3942] px-2 py-1 rounded">{internship.location}</span>}
                    {internship.duration && <span className="text-xs bg-gray-100 dark:bg-[#2a3942] px-2 py-1 rounded">{internship.duration}</span>}
                    {internship.stipend && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">{internship.stipend}</span>}
                  </div>
                  {internship.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{internship.description}</p>}
                  {internship.applyLink && (
                    <a href={internship.applyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                      Apply Now <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="space-y-3">
            {isGroupAdmin && (
              <button
                onClick={() => setShowAddUpdate(!showAddUpdate)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-[#384b56] text-gray-600 dark:text-gray-400 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-colors"
              >
                <Plus size={16} /> Add Update
              </button>
            )}

            {showAddUpdate && (
              <form onSubmit={handleAddUpdate} className="bg-gray-50 dark:bg-[#1e2a32] rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Update Title *"
                  value={updateForm.title}
                  onChange={e => setUpdateForm({ ...updateForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  required
                />
                <textarea
                  placeholder="Content *"
                  value={updateForm.content}
                  onChange={e => setUpdateForm({ ...updateForm, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm resize-none"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={updateForm.category}
                    onChange={e => setUpdateForm({ ...updateForm, category: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  >
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="reminder">Reminder</option>
                  </select>
                  <select
                    value={updateForm.priority}
                    onChange={e => setUpdateForm({ ...updateForm, priority: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#384b56] text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loadingUpdate} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
                    {loadingUpdate ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Post Update"}
                  </button>
                  <button type="button" onClick={() => setShowAddUpdate(false)} className="px-4 py-2 bg-gray-200 dark:bg-[#384b56] text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {updates.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No updates yet.</p>
            ) : (
              updates.map(update => (
                <div key={update._id} className="bg-white dark:bg-[#1e2a32] rounded-xl border border-gray-200 dark:border-[#2a3942] p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{update.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[update.priority]}`}>
                        {update.priority}
                      </span>
                    </div>
                    {isGroupAdmin && (
                      <button onClick={() => handleArchiveUpdate(update._id)} className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{update.content}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Calendar size={12} />
                    {new Date(update.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-2">
            {group.members?.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No members yet.</p>
            ) : (
              group.members.map(member => (
                <div key={member.userId} className="flex items-center gap-3 p-3 bg-white dark:bg-[#1e2a32] rounded-xl border border-gray-200 dark:border-[#2a3942]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {member.username?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{member.username || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.role === 'admin' ? 'Admin' : 'Member'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="flex flex-col h-[500px] bg-white dark:bg-[#1e2a32] rounded-xl border border-gray-200 dark:border-[#2a3942] overflow-hidden">
            {/* Messages Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2a3942] bg-gray-50 dark:bg-[#1e2a32]">
              <h3 className="font-semibold text-gray-900 dark:text-white">Group Messages</h3>
              <button
                onClick={() => setShowIntroModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <UserPlus size={14} />
                Share Introduction
              </button>
            </div>

            {/* Messages List */}
            <div 
              ref={messagesEndRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-emerald-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to send a message!</p>
                </div>
              ) : (
                <>
                  {/* Pinned Messages */}
                  {pinnedMessages.length > 0 && (
                    <div className="space-y-2 pb-2 border-b border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Pin size={12} />
                        Pinned Messages
                      </div>
                      {pinnedMessages.map(message => (
                        <div 
                          key={message._id}
                          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                {message.senderUsername?.slice(0, 2).toUpperCase() || "U"}
                              </div>
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {message.senderUsername}
                              </span>
                            </div>
                            <button
                              onClick={() => handlePinMessage(message._id)}
                              className="p-1 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                            >
                              <Pin size={12} fill="currentColor" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">{message.text}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatMessageTime(message.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regular Messages */}
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?._id;
                    const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {message.senderUsername?.slice(0, 2).toUpperCase() || "U"}
                          </div>
                        ) : (
                          <div className="w-8 flex-shrink-0" />
                        )}
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          {showAvatar && (
                            <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {message.senderUsername}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {formatMessageTime(message.createdAt)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              isOwnMessage
                                ? 'bg-emerald-500 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-bl-md'
                            }`}
                          >
                            {/* Check for introduction message */}
                            {message.isIntroduction ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-200 dark:text-emerald-300">
                                  <UserPlus size={12} />
                                  Introduction
                                </div>
                                <p className="whitespace-pre-wrap">{message.text}</p>
                                {message.interests && message.interests.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {message.interests.map((interest, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : message.type === 'image' ? (
                              <img src={message.fileUrl} alt="Shared" className="max-w-[200px] rounded-lg" />
                            ) : message.type === 'file' ? (
                              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                                <File size={16} />
                                {message.fileName || 'File'}
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.text}</p>
                            )}
                          </div>
                          
                          {/* Message Actions */}
                          <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            {(isGroupAdmin || isOwnMessage) && (
                              <>
                                <button
                                  onClick={() => handlePinMessage(message._id)}
                                  className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
                                  title={message.isPinned ? 'Unpin' : 'Pin'}
                                >
                                  <Pin size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message._id)}
                                  className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Load More Button */}
                  {hasMoreMessages && (
                    <button
                      onClick={loadMoreMessages}
                      disabled={loadingMessages}
                      className="w-full py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    >
                      {loadingMessages ? 'Loading...' : 'Load older messages'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-[#2a3942] p-3 bg-gray-50 dark:bg-[#1e2a32]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-full border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Introduction Modal */}
      <AnimatePresence>
        {showIntroModal && (
          <IntroductionModal
            onClose={() => setShowIntroModal(false)}
            onSubmit={handleShareIntroduction}
            loading={sendingIntro}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// IntroductionModal Component
// ==========================================
const IntroductionModal = ({ onClose, onSubmit, loading }) => {
  const [introduction, setIntroduction] = useState("");
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!introduction.trim()) {
      toast.error("Please write something about yourself");
      return;
    }
    setSending(true);
    await onSubmit(introduction.trim(), interests);
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white dark:bg-[#1e2a32] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2a3942]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow">
              <UserPlus size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Share Your Introduction
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Tell us about yourself <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Hi everyone! I'm a frontend developer passionate about React and UI/UX design..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm resize-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Your Interests (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add an interest and press Enter"
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-[#384b56] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-sm transition"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2.5 bg-gray-100 dark:bg-[#2a3942] text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#384b56] transition-colors"
              >
                Add
              </button>
            </div>
            
            {/* Interest Tags */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#2a3942] text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-[#384b56] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || loading || !introduction.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
            >
              {sending || loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Share Introduction
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// Main Group Component
// ==========================================
const Group = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [leavingGroupId, setLeavingGroupId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // Check if user is admin - handle both 'admin' role and missing role
  const isAdmin = user?.role === 'admin';

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyGroups = useCallback(async () => {
    try {
      const res = await api.get('/api/groups/my');
      setMyGroups(res.data);
    } catch (err) {
      console.error("Error fetching my groups:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
      fetchMyGroups();
    }
  }, [isAuthenticated, fetchGroups, fetchMyGroups]);

  const handleCreateGroup = async (groupData) => {
    try {
      setCreateLoading(true);
      await api.post('/api/groups', groupData);
      toast.success("Group created successfully!");
      setShowCreateModal(false);
      fetchGroups();
      fetchMyGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroupId(groupId);
      await api.post(`/api/groups/${groupId}/join`);
      toast.success("Joined group successfully!");
      fetchGroups();
      fetchMyGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join group");
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleJoinWithCode = async (inviteCode) => {
    try {
      setJoinLoading(true);
      await api.post('/api/groups/join', { inviteCode });
      toast.success("Joined group successfully!");
      setShowJoinModal(false);
      fetchGroups();
      fetchMyGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join group");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      setLeavingGroupId(groupId);
      await api.post(`/api/groups/${groupId}/leave`);
      toast.success("Left group successfully!");
      fetchGroups();
      fetchMyGroups();
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
        setView("list");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to leave group");
    } finally {
      setLeavingGroupId(null);
    }
  };

  const handleViewGroup = async (groupId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/groups/${groupId}`);
      setSelectedGroup(res.data);
      setView("detail");
    } catch (err) {
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = activeTab === "my" 
    ? myGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isAuthenticated) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Please log in to view groups</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Groups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Join communities and share opportunities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Key size={16} />
            Join with Code
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Create Group
            </button>
          )}
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1e2a32] text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-[#2a3942] outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1e2a32] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "my"
                ? "bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            My Groups
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : view === "detail" && selectedGroup ? (
        <GroupDetail
          group={selectedGroup}
          onBack={() => { setView("list"); setSelectedGroup(null); }}
          onLeave={handleLeaveGroup}
          user={user}
          isLeaving={leavingGroupId === selectedGroup?._id}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === "my" ? "You haven't joined any groups yet" : "No groups found"}
              </p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <GroupCard
                key={group._id}
                group={group}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
                onView={handleViewGroup}
                isJoining={joiningGroupId === group._id}
                isLeaving={leavingGroupId === group._id}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateGroupModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateGroup}
            loading={createLoading}
          />
        )}
        {showJoinModal && (
          <JoinGroupModal
            onClose={() => setShowJoinModal(false)}
            onJoin={handleJoinWithCode}
            loading={joinLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Group;

