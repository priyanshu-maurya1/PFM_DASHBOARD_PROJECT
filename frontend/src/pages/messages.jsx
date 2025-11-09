import React, { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import { Search, Send, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Messages = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const { isDark, toggle } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Load current user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get("/api/users/profile");
        if (mounted && res?.data?.user) setCurrentUser(res.data.user);
      } catch {
        if (mounted && !currentUser) {
          setCurrentUser({ _id: "672b4f25d9a9a3c2f08a1234", username: "Gajendra" });
        }
      }
    })();
    return () => (mounted = false);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingUsers(true);
    try {
      const res = await API.get("/api/users/search", { params: { q: searchQuery } });
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.users || data?.results || [];
      setUsers(list.filter((u) => u._id !== currentUser?._id));
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Normalize message data
  const normalizeMessages = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data?.messages || data?.results || [];
  };

  // Load chat messages
  const loadMessages = async (receiverId) => {
    if (!currentUser) return;
    setLoadingMessages(true);
    try {
      const res = await API.get(`/api/messages/${currentUser._id}/${receiverId}`);
      const msgs = normalizeMessages(res.data);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser || !currentUser) return;
    const payload = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: newMsg.trim(),
      timestamp: new Date().toISOString(),
    };
    try {
      await API.post("/api/messages", payload);
      setNewMsg("");
      await loadMessages(selectedUser._id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Auto-refresh messages every 3s
  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages(selectedUser._id);
      const interval = setInterval(() => loadMessages(selectedUser._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, currentUser]);

  const senderIdOf = (msg) =>
    msg.sender || msg.senderId || msg.from || msg.sender?._id || null;

  // Responsive/professional dark mode
  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-sky-50 via-blue-100 to-indigo-50 dark:from-[#151a23] dark:via-[#181f2b] dark:to-[#10141a]`}>
      {/* Fixed Sidebar (left) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />

        {/* Chat Container */}
        <main className="flex-1 p-6 mt-16">
          <div
            className={`rounded-2xl shadow-lg h-[80vh] overflow-hidden flex transition-all duration-300 border dark:border-[#232b3a]
              ${isDark ? "bg-[#181f2b] text-gray-100" : "bg-white text-gray-900"}
            `}
          >
            {/* Sidebar (User List) */}
            <div className={`w-1/3 border-r flex flex-col ${isDark ? "bg-[#151a23] border-[#232b3a] shadow-inner" : "bg-white border-gray-300 shadow-sm"}`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#232b3a] dark:bg-[#181f2b]">
                <h2 className="text-lg font-semibold flex items-center gap-2">💬 Chat Users</h2>
                <button
                  onClick={toggle}
                  className={`flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-md transition
                    ${isDark
                      ? "bg-[#232b3a] text-gray-200 hover:bg-[#1b2332]"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {isDark ? <Moon size={14} /> : <Sun size={14} />}
                  {isDark ? "Dark" : "Light"}
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-[#232b3a]">
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isDark ? "bg-[#232b3a]" : "bg-gray-100"}`}>
                  <Search size={18} className={`text-gray-400 ${isDark && "dark:text-gray-500"}`} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}
                  />
                  <button
                    onClick={handleSearch}
                    className={`px-3 py-1 rounded-md ${isDark ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              {/* User List */}
              <ul className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingUsers && <li className="p-3 text-center">🔍 Searching...</li>}
                {!loadingUsers && users.length === 0 && (
                  <li className="p-3 text-center text-gray-500 dark:text-gray-400">No users found 😕</li>
                )}
                {users.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition
                      ${selectedUser?._id === user._id
                        ? isDark
                          ? "bg-blue-700 text-white"
                          : "bg-blue-200 text-gray-900"
                        : isDark
                          ? "hover:bg-[#232b3a]"
                          : "hover:bg-gray-100"
                      }`}
                  >
                    <p className="font-medium">{user.username || user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${isDark ? "bg-[#181f2b] border-[#232b3a]" : "bg-white border-gray-300"}`}>
                    <h2 className="text-lg font-semibold">
                      Chat with {selectedUser.username || selectedUser.name}
                    </h2>
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {isDark ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  {/* Messages */}
                  <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${isDark ? "bg-[#151a23]" : "bg-gray-50"}`}>
                    {loadingMessages && <div className="text-gray-500 text-center dark:text-gray-400">Loading messages...</div>}
                    {!loadingMessages && messages.length === 0 && (
                      <div className="text-gray-500 text-center mt-10 dark:text-gray-400">
                        No messages yet. Say hi 👋
                      </div>
                    )}

                    <AnimatePresence>
                      {messages.map((msg) => {
                        const sid = senderIdOf(msg);
                        const isMe =
                          sid === currentUser?._id ||
                          (typeof sid === "object" && sid?._id === currentUser?._id);
                        const time =
                          msg.timestamp || msg.createdAt || new Date().toISOString();
                        const formatted = new Date(time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <motion.div
                            key={msg._id || msg.id || Math.random()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`p-3 rounded-2xl max-w-xs shadow-md
                                ${isMe
                                  ? "bg-blue-600 text-white"
                                  : isDark
                                    ? "bg-[#232b3a] text-gray-100"
                                    : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p>{msg.text || msg.message || msg.body}</p>
                              <p
                                className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"} text-right`}
                              >
                                {formatted}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Input */}
                  <div className={`p-4 flex items-center gap-2 border-t ${isDark ? "bg-[#181f2b] border-[#232b3a]" : "bg-white border-gray-300"}`}>
                    <input
                      type="text"
                      className={`flex-1 rounded-lg p-2 outline-none
                        ${isDark
                          ? "bg-[#232b3a] text-gray-200 border border-[#232b3a] focus:border-blue-500"
                          : "bg-gray-50 border border-gray-300 focus:border-blue-500"
                        }`}
                      placeholder="Type your message..."
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className={`px-4 py-2 rounded-lg flex items-center gap-1
                        ${isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                        transition`}
                    >
                      <Send size={16} /> Send
                    </button>
                  </div>
                </>
              ) : (
                <div className={`flex flex-col items-center justify-center flex-1 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                  <p className="text-lg mb-2">Select a user to start chatting 💬</p>
                  <p className="text-sm text-gray-400">
                    Your messages will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
