import { useState } from "react";
import toast from "react-hot-toast";
import API from "../utils/api";

export default function EmailForm({ onRefresh }) {
  const [form, setForm] = useState({ to: "", subject: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/send", form);
      toast.success("✅ Email sent successfully!");
      setForm({ to: "", subject: "", message: "" });
      onRefresh();
    } catch (err) {
      toast.error("❌ Failed to send email");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
      <h2 className="text-xl font-semibold">Send Email</h2>
      <input
        name="to"
        value={form.to}
        onChange={handleChange}
        placeholder="Recipient Email"
        className="border w-full p-2 rounded"
        required
      />
      <input
        name="subject"
        value={form.subject}
        onChange={handleChange}
        placeholder="Subject"
        className="border w-full p-2 rounded"
        required
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Message"
        className="border w-full p-2 rounded"
        rows="4"
        required
      ></textarea>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send Email
      </button>
    </form>
  );
}
