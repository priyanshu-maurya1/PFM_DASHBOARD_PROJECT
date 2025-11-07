import React, { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const ChatApp = () => {
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

  // Try to get current user from backend; fall back to a placeholder
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get("/api/users/profile");
        if (mounted && res?.data?.user) setCurrentUser(res.data.user);
      } catch (err) {
        // If not authenticated or endpoint missing, use a local placeholder
        if (mounted && !currentUser) {
          setCurrentUser({ _id: "672b4f25d9a9a3c2f08a1234", username: "Gajendra" });
        }
      }
    })();
    return () => (mounted = false);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------
  // Search Users
  // -------------------------
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingUsers(true);
    try {
      const res = await API.get("/api/users/search", { params: { q: searchQuery } });
      // backend may return array directly or { users: [...] }
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.users || data?.results || [];
      setUsers(list.filter((u) => u._id !== currentUser?._id));
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // -------------------------
  // Load Messages for Selected User
  // -------------------------
  const normalizeMessages = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data?.messages || data?.results || [];
  };

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

  // -------------------------
  // Send Message
  // -------------------------
  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser || !currentUser) return;
    const payload = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: newMsg.trim(),
    };

    try {
      await API.post("/api/messages", payload);
      setNewMsg("");
      // optimistic refresh
      await loadMessages(selectedUser._id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // -------------------------
  // Auto Reload Messages
  // -------------------------
  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages(selectedUser._id);
      const interval = setInterval(() => loadMessages(selectedUser._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, currentUser]);

  // helper to get sender id from message object (flexible shape)
  const senderIdOf = (msg) => msg.sender || msg.senderId || msg.from || (msg.sender?._id) || null;

  return (
    <div className={`flex h-[90vh] ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`w-1/3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-r'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Search Users</h2>
            <button
              onClick={toggle}
              className={`text-sm px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}
              title="Toggle dark mode"
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              className={`border rounded w-full p-2 ${isDark ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white'}`}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className={`px-3 rounded ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              🔍
            </button>
          </div>
        </div>

        <ul className={`overflow-y-auto h-[70vh] ${isDark ? 'text-gray-200' : ''}`}>
          {loadingUsers && <li className="p-3">Searching...</li>}
          {!loadingUsers && users.length === 0 && (
            <li className="p-3 text-gray-500">No users found</li>
          )}
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
              }}
              className={`p-3 cursor-pointer ${isDark ? 'hover:bg-blue-700' : 'hover:bg-blue-100'} ${
                selectedUser?._id === user._id ? (isDark ? 'bg-blue-600' : 'bg-blue-200') : ""
              }`}
            >
              {user.username || user.name} <br />
              <span className="text-gray-500 text-sm">{user.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className={`p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chat with {selectedUser.username || selectedUser.name}</h2>
                <div className="text-sm text-gray-400">{isDark ? 'Dark mode' : 'Light mode'}</div>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {loadingMessages && <div className="text-gray-500">Loading messages...</div>}
              {!loadingMessages && messages.length === 0 && (
                <div className="text-gray-500">No messages yet. Say hi 👋</div>
              )}
              {messages.map((msg) => {
                const sid = senderIdOf(msg);
                const isMe = sid === currentUser?._id || (typeof sid === 'object' && sid?._id === currentUser?._id);
                return (
                  <div
                    key={msg._id || msg.id || Math.random()}
                    className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-2 rounded-xl max-w-xs ${isMe ? "bg-blue-500 text-white" : (isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-300')}`}>
                      {msg.text || msg.message || msg.body}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 ${isDark ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t'} flex`}>
              <input
                type="text"
                className={`rounded w-full p-2 mr-2 ${isDark ? 'bg-gray-900 text-gray-100 border-gray-600' : 'border'}`}
                placeholder="Type your message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className={`px-4 rounded ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className={`flex items-center justify-center flex-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            Select a user to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
