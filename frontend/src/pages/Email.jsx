// src/pages/Email.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import API from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Paperclip,
  X,
  Mail,
  Type,
  MessageSquare,
} from "lucide-react";

export default function Email() {
  const { isDark, toggle } = useTheme();
  const [form, setForm] = useState({ to: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "message") {
      setCharCount(e.target.value.length);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      toast.success(`📎 Attached: ${file.name}`);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    toast("❌ Attachment removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Send JSON (not FormData)
      await API.post("/send", {
        to: form.to,
        subject: form.subject,
        message: form.message,
      });

      toast.success("✅ Email sent successfully!");
      setForm({ to: "", subject: "", message: "" });
      setAttachment(null);
      setCharCount(0);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex transition-all duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-indigo-50 via-sky-100 to-cyan-50 text-gray-900"
      }`}
    >
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-start mt-20 p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`shadow-lg rounded-2xl backdrop-blur-md border p-8 w-full max-w-2xl mb-6 ${
              isDark
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white/70 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Mail
                  size={22}
                  className={`${isDark ? "text-blue-400" : "text-sky-700"}`}
                />
                <h2
                  className={`text-xl font-semibold tracking-wide ${
                    isDark ? "text-blue-300" : "text-sky-800"
                  }`}
                >
                  Send Email
                </h2>
              </div>

              <button
                onClick={toggle}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-md transition ${
                  isDark
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                {isDark ? "Dark" : "Light"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail
                  size={18}
                  className={`absolute left-3 top-3 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                  placeholder="Recipient Email"
                  required
                  className={`w-full p-2 pl-10 rounded-lg border outline-none transition focus:ring-2 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:ring-blue-400"
                  }`}
                />
              </div>

              <div className="relative">
                <Type
                  size={18}
                  className={`absolute left-3 top-3 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                  className={`w-full p-2 pl-10 rounded-lg border outline-none transition focus:ring-2 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:ring-blue-400"
                  }`}
                />
              </div>

              <div className="relative">
                <MessageSquare
                  size={18}
                  className={`absolute left-3 top-3 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  rows="5"
                  required
                  className={`w-full p-2 pl-10 rounded-lg border outline-none resize-none transition focus:ring-2 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-800 focus:ring-blue-400"
                  }`}
                ></textarea>
                <p
                  className={`text-xs mt-1 text-right ${
                    charCount > 400
                      ? "text-red-500"
                      : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {charCount}/500
                </p>
              </div>

              {/* Attachment (kept UI, not sending) */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Attachment
                </label>
                <div className="flex items-center gap-3">
                  <label
                    className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition ${
                      isDark
                        ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <Paperclip size={16} />
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {attachment && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[150px] text-blue-500">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                }`}
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Email"}
              </motion.button>
            </form>
          </motion.div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 mb-4 px-5 py-2 rounded-md font-medium transition ${
              isDark
                ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {showPreview ? (
              <>
                <EyeOff size={18} /> Hide Preview
              </>
            ) : (
              <>
                <Eye size={18} /> Show Preview
              </>
            )}
          </button>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className={`shadow-md rounded-xl border p-6 w-full max-w-2xl backdrop-blur-md ${
                  isDark
                    ? "bg-gray-900/70 border-gray-800"
                    : "bg-white/80 border-gray-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold flex items-center gap-2 mb-3 ${
                    isDark ? "text-blue-400" : "text-sky-700"
                  }`}
                >
                  <Eye size={18} /> Live Preview
                </h3>
                <p>
                  <strong>To:</strong>{" "}
                  <span className="text-blue-500">{form.to || "—"}</span>
                </p>
                <p>
                  <strong>Subject:</strong> <span>{form.subject || "—"}</span>
                </p>
                {attachment && (
                  <p>
                    <strong>Attachment:</strong>{" "}
                    <span className="text-blue-400">{attachment.name}</span>
                  </p>
                )}
                <div className="border-t border-gray-300 dark:border-gray-700 my-3"></div>
                <div
                  className={`p-3 rounded-lg min-h-[100px] ${
                    isDark
                      ? "bg-gray-800 text-gray-100"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {form.message ? (
                    <p className="whitespace-pre-wrap">{form.message}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      Your message will appear here...
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
