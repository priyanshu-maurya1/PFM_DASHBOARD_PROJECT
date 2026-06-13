import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import NotificationBell from "../components/NotificationBell";
import SpendingChart from "../components/SpendingChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseSummary from "../components/IncomeExpenseSummary";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

// Font URL
const FONT = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500&display=swap";

// API Base URL
const getApiBaseUrl = () => (typeof api !== 'undefined' ? api.defaults.baseURL : import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Default internships data (will be replaced with API data)
const DEFAULT_INTERNSHIPS = [
  { id:1, company:"GJ Global Services", role:"Frontend Developer Intern", location:"Remote", duration:"3 Months", stipend:"₹0/mo", logo:"🏢", match:92, tags:["React","TypeScript","Tailwind"], deadline:"Mar 15, 2026", seats:5, accent:"#3b82f6", desc:"Build responsive UIs for enterprise SaaS products with senior engineers." },
  { id:2, company:"GJ Global Services", role:"ML Engineer Intern", location:" Remote", duration:"6 Months", stipend:"₹0/mo", logo:"🤖", match:78, tags:["Python","TensorFlow","SQL"], deadline:"Mar 22, 2026", seats:3, accent:"#8b5cf6", desc:"Train and deploy ML models for real-time analytics and NLP pipelines." },
  { id:3, company:"GJ Global Services", role:"DevOps Intern", location:"Remote ", duration:"4 Months", stipend:"₹0/mo", logo:"☁️", match:65, tags:["AWS","Docker","Jenkins"], deadline:"Apr 1, 2026", seats:2, accent:"#f97316", desc:"Manage CI/CD pipelines and cloud infrastructure for enterprise clients." },
  { id:4, company:"GJ Global Services", role:"Cybersecurity Analyst Intern", location:"Remote", duration:"3 Months", stipend:"₹0/mo", logo:"🛡️", match:55, tags:["Kali Linux","Wireshark","Python"], deadline:"Apr 10, 2026", seats:4, accent:"#ef4444", desc:"Conduct vulnerability assessments and penetration testing on client systems." },
  { id:5, company:"GJ Global Services", role:"UI/UX & Web Dev Intern", location:"Remote", duration:"2 Months", stipend:"₹10/mo", logo:"🎨", match:84, tags:["Figma","Vue.js","CSS"], deadline:"Apr 5, 2026", seats:6, accent:"#ec4899", desc:"Design and prototype interfaces, translating Figma designs into working code." },
  { id:6, company:"GJ Global Services", role:"Backend Developer Intern", location:"Remote ", duration:"5 Months", stipend:"₹0/mo", logo:"💹", match:70, tags:["Node.js","MongoDB","Redis"], deadline:"Mar 28, 2026", seats:3, accent:"#22c55e", desc:"Build and maintain high-performance APIs for payment processing systems." },
];

// Static courses data (fallback if API fails)
const DEFAULT_COURSES = [
  { id:1, category:"Web Development", icon:"🌐", accent:"#3b82f6", modules:[
    { id:"w1", title:"HTML & CSS Fundamentals", duration:"4h", status:"completed", xp:200 },
    { id:"w2", title:"JavaScript Essentials", duration:"6h", status:"completed", xp:300 },
    { id:"w3", title:"React.js Core Concepts", duration:"8h", status:"in-progress", xp:400 },
    { id:"w4", title:"Node.js & Express", duration:"6h", status:"locked", xp:350 },
    { id:"w5", title:"MongoDB & REST APIs", duration:"5h", status:"locked", xp:300 },
    { id:"w6", title:"Full-Stack Capstone", duration:"10h", status:"locked", xp:500 },
  ]},
  { id:2, category:"Data Science & AI", icon:"🤖", accent:"#8b5cf6", modules:[
    { id:"d1", title:"Python for Data Science", duration:"5h", status:"completed", xp:250 },
    { id:"d2", title:"Pandas & NumPy", duration:"4h", status:"in-progress", xp:200 },
    { id:"d3", title:"Machine Learning Basics", duration:"8h", status:"locked", xp:400 },
    { id:"d4", title:"Deep Learning & Neural Nets", duration:"10h", status:"locked", xp:500 },
    { id:"d5", title:"NLP & Transformers", duration:"8h", status:"locked", xp:450 },
    { id:"d6", title:"AI Capstone Project", duration:"12h", status:"locked", xp:600 },
  ]},
  { id:3, category:"Cloud & DevOps", icon:"☁️", accent:"#f97316", modules:[
    { id:"c1", title:"Linux Fundamentals", duration:"4h", status:"completed", xp:200 },
    { id:"c2", title:"Docker & Containers", duration:"5h", status:"locked", xp:300 },
    { id:"c3", title:"Kubernetes Orchestration", duration:"7h", status:"locked", xp:400 },
    { id:"c4", title:"AWS Core Services", duration:"8h", status:"locked", xp:450 },
    { id:"c5", title:"CI/CD Pipelines", duration:"5h", status:"locked", xp:350 },
    { id:"c6", title:"Cloud Architecture Project", duration:"10h", status:"locked", xp:500 },
  ]},
  { id:4, category:"Cybersecurity", icon:"🔐", accent:"#ef4444", modules:[
    { id:"s1", title:"Network Security Basics", duration:"5h", status:"locked", xp:250 },
    { id:"s2", title:"Ethical Hacking 101", duration:"6h", status:"locked", xp:350 },
    { id:"s3", title:"Penetration Testing", duration:"8h", status:"locked", xp:450 },
    { id:"s4", title:"Web App Security", duration:"6h", status:"locked", xp:400 },
    { id:"s5", title:"Security Audit & Compliance", duration:"5h", status:"locked", xp:350 },
    { id:"s6", title:"Security Capstone", duration:"10h", status:"locked", xp:550 },
  ]},
];

// Sample projects data
const SAMPLE_PROJECTS = [
  { id: 1, title: "E-Commerce Platform", description: "Full-stack e-commerce application with React and Node.js", status: "in-progress", progress: 65, dueDate: "2026-04-15", team: ["You", "Alex"], tech: ["React", "Node.js", "MongoDB"] },
  { id: 2, title: "Portfolio Website", description: "Personal portfolio with responsive design", status: "completed", progress: 100, dueDate: "2026-03-01", team: ["You"], tech: ["HTML", "CSS", "JavaScript"] },
  { id: 3, title: "Chat Application", description: "Real-time chat app with WebSocket", status: "in-progress", progress: 40, dueDate: "2026-05-01", team: ["You", "Sarah", "Mike"], tech: ["React", "Socket.io", "Express"] },
  { id: 4, title: "Weather Dashboard", description: "Weather tracking dashboard with API integration", status: "completed", progress: 100, dueDate: "2026-02-15", team: ["You"], tech: ["React", "OpenWeatherAPI"] },
];

// Default resources (fallback if API fails)
const DEFAULT_VIDEO_RESOURCES = [
  { id: 1, category: "Web Development", videos: [
    { id: "v1", title: "Complete HTML5 Tutorial", duration: "2h 30m", thumbnail: "https://img.youtube.com/vi/pQN-pnXHbvg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/pQN-pnXHbvg", watchUrl: "https://www.youtube.com/watch?v=pQN-pnXHbvg" },
    { id: "v2", title: "CSS3 Masterclass", duration: "3h 15m", thumbnail: "https://img.youtube.com/vi/yfoY53QXEnI/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/yfoY53QXEnI", watchUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI" },
    { id: "v3", title: "JavaScript ES6+ Complete", duration: "4h 45m", thumbnail: "https://img.youtube.com/vi/W6NZfCO5SIk/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/W6NZfCO5SIk", watchUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk" },
    { id: "v4", title: "React.js Full Course", duration: "5h 20m", thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/Ke90Tje7VS0", watchUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0" },
  ]},
  { id: 2, category: "Data Science & AI", videos: [
    { id: "v5", title: "Python for Data Science", duration: "4h 00m", thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc", watchUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
    { id: "v6", title: "Pandas & NumPy Tutorial", duration: "3h 30m", thumbnail: "https://img.youtube.com/vi/vmEHCJofslg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/vmEHCJofslg", watchUrl: "https://www.youtube.com/watch?v=vmEHCJofslg" },
    { id: "v7", title: "Machine Learning A-Z", duration: "6h 15m", thumbnail: "https://img.youtube.com/vi/GwIo3gDZCVQ/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/GwIo3gDZCVQ", watchUrl: "https://www.youtube.com/watch?v=GwIo3gDZCVQ" },
    { id: "v8", title: "Deep Learning with TensorFlow", duration: "4h 45m", thumbnail: "https://img.youtube.com/vi/tm1k5wD6uBw/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/tm1k5wD6uBw", watchUrl: "https://www.youtube.com/watch?v=tm1k5wD6uBw" },
  ]},
  { id: 3, category: "Cloud & DevOps", videos: [
    { id: "v9", title: "AWS Cloud Practitioner", duration: "4h 30m", thumbnail: "https://img.youtube.com/vi/SOTamWNgDKc/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/SOTamWNgDKc", watchUrl: "https://www.youtube.com/watch?v=SOTamWNgDKc" },
    { id: "v10", title: "Docker & Containers", duration: "3h 00m", thumbnail: "https://img.youtube.com/vi/fqMOX6JJhGo/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/fqMOX6JJhGo", watchUrl: "https://www.youtube.com/watch?v=fqMOX6JJhGo" },
    { id: "v11", title: "Kubernetes for Beginners", duration: "3h 45m", thumbnail: "https://img.youtube.com/vi/H0dkXcmZ0Ak/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/H0dkXcmZ0Ak", watchUrl: "https://www.youtube.com/watch?v=H0dkXcmZ0Ak" },
    { id: "v12", title: "Linux Command Line", duration: "4h 00m", thumbnail: "https://img.youtube.com/vi/zWl327O-K7c/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/zWl327O-K7c", watchUrl: "https://www.youtube.com/watch?v=zWl327O-K7c" },
  ]},
  { id: 4, category: "Cybersecurity", videos: [
    { id: "v13", title: "Cybersecurity Fundamentals", duration: "3h 00m", thumbnail: "https://img.youtube.com/vi/ysxfz7F2pGg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/ysxfz7F2pGg", watchUrl: "https://www.youtube.com/watch?v=ysxfz7F2pGg" },
    { id: "v14", title: "Ethical Hacking with Kali Linux", duration: "4h 30m", thumbnail: "https://img.youtube.com/vi/VtNRc5lJ2Zg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/VtNRc5lJ2Zg", watchUrl: "https://www.youtube.com/watch?v=VtNRc5lJ2Zg" },
    { id: "v15", title: "Network Security Testing", duration: "5h 00m", thumbnail: "https://img.youtube.com/vi/3Kq1MIfTWCE/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/3Kq1MIfTWCE", watchUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" },
    { id: "v16", title: "Wireshark Network Analyzer", duration: "2h 45m", thumbnail: "https://img.youtube.com/vi/8qIk16M4LyU/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/8qIk16M4LyU", watchUrl: "https://www.youtube.com/watch?v=8qIk16M4LyU" },
  ]},
];

const DEFAULT_PDF_RESOURCES = [
  { id: 1, category: "Web Development", pdfs: [
    { id: "p1", title: "HTML5 Complete Reference", size: "2.4 MB", pages: 156, url: "/resources/sample-resource.pdf" },
    { id: "p2", title: "CSS3 Mastery Guide", size: "3.8 MB", pages: 234, url: "/resources/sample-resource.pdf" },
    { id: "p3", title: "JavaScript ES6 Quick Reference", size: "1.9 MB", pages: 89, url: "/resources/sample-resource.pdf" },
    { id: "p4", title: "React.js Best Practices", size: "2.1 MB", pages: 112, url: "/resources/sample-resource.pdf" },
  ]},
  { id: 2, category: "Data Science & AI", pdfs: [
    { id: "p5", title: "Python Data Science Handbook", size: "4.2 MB", pages: 289, url: "/resources/sample-resource.pdf" },
    { id: "p6", title: "Pandas Cheat Sheet", size: "1.8 MB", pages: 67, url: "/resources/sample-resource.pdf" },
    { id: "p7", title: "Machine Learning Guide", size: "3.5 MB", pages: 198, url: "/resources/sample-resource.pdf" },
    { id: "p8", title: "TensorFlow Manual", size: "4.8 MB", pages: 267, url: "/resources/sample-resource.pdf" },
  ]},
  { id: 3, category: "Cloud & DevOps", pdfs: [
    { id: "p9", title: "AWS Services Overview", size: "5.2 MB", pages: 312, url: "/resources/sample-resource.pdf" },
    { id: "p10", title: "Docker Containerization", size: "2.9 MB", pages: 156, url: "/resources/sample-resource.pdf" },
    { id: "p11", title: "Kubernetes Architecture", size: "3.7 MB", pages: 201, url: "/resources/sample-resource.pdf" },
    { id: "p12", title: "Linux Administration", size: "4.1 MB", pages: 245, url: "/resources/sample-resource.pdf" },
  ]},
  { id: 4, category: "Cybersecurity", pdfs: [
    { id: "p13", title: "Cybersecurity Fundamentals", size: "3.4 MB", pages: 189, url: "/resources/sample-resource.pdf" },
    { id: "p14", title: "Ethical Hacking Guide", size: "4.5 MB", pages: 256, url: "/resources/sample-resource.pdf" },
    { id: "p15", title: "Network Security Protocols", size: "2.8 MB", pages: 134, url: "/resources/sample-resource.pdf" },
    { id: "p16", title: "Security Audit Checklist", size: "1.2 MB", pages: 45, url: "/resources/sample-resource.pdf" },
  ]},
];

// UI Components
const Bar = ({v, m, color="#3b82f6", h=6}) => (
  <div style={{background:"#e2e8f0",borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,Math.round((v/m)*100))}%`,height:"100%",background:color,borderRadius:99,transition:"width .5s"}}/>
  </div>
);

const Chip = ({text, color}) => (
  <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700}}>{text}</span>
);

const Toast = ({msg, type, onClose}) => (
  <div style={{
    position:"fixed",top:24,right:24,zIndex:9999,
    background:type==="success"?"#dcfce7":type==="error"?"#fee2e2":"#fef3c7",
    border:`1px solid ${type==="success"?"#22c55e":type==="error"?"#ef4444":"#f59e0b"}`,
    color:type==="success"?"#22c55e":type==="error"?"#ef4444":"#f59e0b",
    borderRadius:14,padding:"13px 22px",fontSize:14,fontWeight:700,
    boxShadow:"0 8px 40px #0009",animation:"fsi .3s ease",cursor:"pointer"
  }} onClick={onClose}>
    {msg}
  </div>
);

const LoadingSpinner = ({size = 40}) => (
  <div style={{display:'flex',justifyContent:'center',alignItems:'center',padding:40}}>
    <div style={{
      width:size,height:size,border:'3px solid #e2e8f0',borderTopColor:'#3b82f6',
      borderRadius:'50%',animation:'spin 1s linear infinite'
    }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const ErrorMessage = ({message, onRetry}) => (
  <div style={{textAlign:'center',padding:40,color:'#ef4444'}}>
    <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
    <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>Something went wrong</div>
    <div style={{fontSize:14,color:'#64748b',marginBottom:16}}>{message}</div>
    {onRetry && (
      <button onClick={onRetry} style={{
        padding:'8px 20px',background:'#3b82f6',color:'#fff',border:'none',
        borderRadius:8,cursor:'pointer',fontWeight:600
      }}>Try Again</button>
    )}
  </div>
);

// Video Card Component
const VideoCard = ({ video, accent, onPlay, isDark }) => (
  <div onClick={() => onPlay(video)} style={{ background: isDark ? "#1e293b" : "#ffffff", borderRadius: 14, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", overflow: "hidden", cursor: "pointer", transition: "all 0.2s ease" }}>
    <div style={{ position: "relative", aspectRatio: "16/9", background: `linear-gradient(135deg, ${accent}22, ${accent}44)` }}>
      <img src={video.thumbnail} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = 'none'; }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.8)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{video.duration}</div>
    </div>
    <div style={{ padding: "12px 14px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", marginBottom: 6, lineHeight: 1.4 }}>{video.title}</div>
    </div>
  </div>
);

// PDF Card Component
const PDFCard = ({ pdf, accent, onDownload, isDark }) => (
  <div onClick={() => onDownload(pdf)} style={{ background: isDark ? "#1e293b" : "#ffffff", borderRadius: 12, border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", padding: 16, cursor: "pointer", transition: "all 0.2s ease" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ width: 44, height: 52, background: `linear-gradient(135deg, ${accent}22, ${accent}44)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", marginBottom: 4 }}>{pdf.title}</div>
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}><span>{pdf.size}</span><span>•</span><span>{pdf.pages} pages</span></div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </div>
    </div>
  </div>
);

// Video Modal Component
const VideoModal = ({ video, onClose }) => {
  if (!video) return null;
  
  // Use embedUrl directly if available, otherwise convert from watchUrl
  const getEmbedUrl = () => {
    if (video.embedUrl) return video.embedUrl;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = video.url?.match(regExp) || video.watchUrl?.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#000", borderRadius: 16, maxWidth: 900, width: "100%", maxHeight: "90vh", overflow: "hidden", position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>✕</button>
        <div style={{ aspectRatio: "16/9" }}>
          <iframe src={getEmbedUrl()} title={video.title} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <div style={{ padding: "16px 20px", background: "#1a1a1a" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{video.title}</div>
          <div style={{ fontSize: 13, color: "#888" }}>{video.duration}</div>
        </div>
      </div>
    </div>
  );
};

// PDF Viewer Modal Component - displays PDF inline within dashboard
const PDFModal = ({ pdf, onClose }) => {
  if (!pdf) return null;
  
  // Construct the full URL for the PDF
  const pdfUrl = pdf.url ? `${getApiBaseUrl()}${pdf.url}` : '';
  
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdf.title + '.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 1000, width: "100%", maxHeight: "95vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #dc2626)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{pdf.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{pdf.size} • {pdf.pages} pages</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#3b82f6", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        {/* PDF Viewer */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <iframe 
            src={pdfUrl} 
            title={pdf.title}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, logout, initialLoading, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // ProtectedRoute handles auth - no duplicate guard needed
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Theme-aware colors
  const colors = {
    background: isDark ? "#0f172a" : "#f0f9ff",
    backgroundGradient: isDark ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    cardBorder: isDark ? "#334155" : "#e2e8f0",
    textPrimary: isDark ? "#f8fafc" : "#0f172a",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    inputBg: isDark ? "#334155" : "#f8fafc",
    inputBorder: isDark ? "#475569" : "#e2e8f0",
    buttonPrimary: "linear-gradient(135deg, #3b82f6, #6366f1)",
    shadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
    headerBg: isDark ? "#1e293b" : "#ffffff",
    headerBorder: isDark ? "#334155" : "#e2e8f0",
    modalBg: isDark ? "#1e293b" : "#fff",
    modalOverlay: "rgba(0,0,0,0.85)",
  };
  
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [internships, setInternships] = useState(DEFAULT_INTERNSHIPS);

  
  const [activeTab, setActiveTab] = useState("finance");
  const [financialData, setFinancialData] = useState({});
  const [financialLoading, setFinancialLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [xp, setXp] = useState(950);
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [videoResources, setVideoResources] = useState(DEFAULT_VIDEO_RESOURCES);
  const [pdfResources, setPdfResources] = useState(DEFAULT_PDF_RESOURCES);
  
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get('/api/lms/courses');
      if (response.data && response.data.courses) {
        const transformedCourses = response.data.courses.map((course, idx) => ({
          id: idx + 1,
          category: course.title,
          icon: ['🌐', '🤖', '☎️', '🔐', '💼'][idx % 5],
          accent: ['#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#22c55e'][idx % 5],
          description: course.description,
          modules: course.modules?.map((mod, modIdx) => ({
            id: `${course.id}-${modIdx}`,
            title: mod.title,
            duration: "4h",
            status: modIdx < 2 ? "completed" : modIdx === 2 ? "in-progress" : "locked",
            xp: 150 + (modIdx * 50)
          })) || []
        }));
        setCourses(transformedCourses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses(DEFAULT_COURSES);
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      const response = await api.get('/api/lms/my-courses');
      if (response.data && response.data.enrollments) {
        setCourses(prev => prev.map(course => {
          const enrollment = response.data.enrollments.find(e => e.course?.id === `web-${course.id}` || e.courseId === course.id);
          if (enrollment) {
            return { ...course, progress: enrollment.progress, status: enrollment.status };
          }
          return course;
        }));
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await api.get('/api/lms/my-applications');
      if (response.data && response.data.applications) {
        setMyApplications(response.data.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const response = await api.get('/api/lms/resources');
      if (response.data && response.data.resources) {
        // Transform the API response to match our expected format
        const transformedResources = response.data.resources.map((cat, idx) => ({
          id: idx + 1,
          category: cat.category,
          videos: cat.videos || [],
          pdfs: cat.pdfs || []
        }));
        setVideoResources(transformedResources);
        setPdfResources(transformedResources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      // Keep using default resources on error
    }
  }, []);

const fetchFinancialData = useCallback(async () => {
    setFinancialLoading(true);
    try {
      const [spending, monthly, incomeExpense] = await Promise.all([
        api.get('/api/dashboard/spending-by-category'),
        api.get('/api/dashboard/monthly-summary'),
        api.get('/api/dashboard/income-vs-expense')
      ]);
      setFinancialData({
        spending: spending.data?.data || spending.data || [],
        monthly: monthly.data?.data || monthly.data || [],
        incomeExpense: incomeExpense.data || {income:0, expense:0, net:0}
      });
      showToast('Financial data loaded from backend!');
    } catch (error) {
      console.error('Financial data error:', error);
      if (error.response?.status === 404) {
        showToast('Link your bank via Plaid for financial charts', 'info');
      } else {
        showToast('Using demo financial data', 'info');
      }
    } finally {
      setFinancialLoading(false);
    }
  }, [showToast]);

  const fetchInternships = useCallback(async () => {
    try {
      const response = await api.get('/api/vacancies');
      if (response.data && response.data.vacancies) {
        setInternships(response.data.vacancies);
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
      // Keep using default internships on error
    }
  }, []);



  useEffect(() => {
  const loadData = async () => {
      setLoading(true);
      setApiError(null);
      try {
        // 🔐 GRACEFUL AUTH: Try refresh, fallback to demo data on fail
        try {
          console.log('🔄 Dashboard refreshing auth...');
          if (typeof refreshUser === 'function') {
            const authOk = await refreshUser();
            if (!authOk) {
              console.warn('⚠️ Auth refresh failed - using demo data');
              throw new Error('Using demo data (auth failed)');
            }
          } else {
            console.log('ℹ️ refreshUser not ready - skipping auth check');
          }
        } catch (authErr) {
          console.warn('Dashboard auth error:', authErr.message);
          // Continue with demo data below
        }
        
        showToast('Loading dashboard data...');
        const [coursesRes, appsRes, resourcesRes, internshipsRes] = await Promise.all([
          api.get('/api/lms/courses').catch(() => ({data: {courses: []}})),
          api.get('/api/lms/my-applications').catch(() => ({data: {applications: []}})),
          api.get('/api/lms/resources').catch(() => ({data: {resources: []}})), 
          api.get('/api/lms/internships').catch(() => ({data: {internships: []}}))
        ]);
        
        // Transform backend courses to match frontend format
        const transformedCourses = coursesRes.data.courses.map((course, idx) => ({
          id: idx + 1,
          category: course.title,
          icon: ['🌐','🤖','☁️','🔐','💼'][idx % 5],
          accent: ['#3b82f6','#8b5cf6','#f97316','#ef4444','#22c55e'][idx % 5],
          modules: course.modules?.map((mod, modIdx) => ({
            id: `${course.id}-${modIdx}`,
            title: mod.title,
            duration: `${Math.floor(Math.random()*8)+2}h`,
            status: modIdx < 2 ? 'completed' : modIdx === 2 ? 'in-progress' : 'locked', 
            xp: 150 + (modIdx * 50)
          })) || []
        }));
        
        setCourses(transformedCourses);
        setMyApplications(appsRes.data.applications);
        setVideoResources(resourcesRes.data.resources);
        setPdfResources(resourcesRes.data.resources);
        setInternships(internshipsRes.data.internships || []);
        
        showToast(`✅ Dashboard loaded! ${transformedCourses.length} courses, ${internshipsRes.data.internships?.length || 0} internships`);
      } catch (err) {
        console.error('Dashboard data error:', err);
        setApiError('Using demo data (backend temporarily unavailable)');
        showToast('Using demo data for offline viewing', 'info');
      } finally {
        setDataLoaded(true);
        setLoading(false);
      }
};
    loadData();
  }, []);

  // 🔧 FIX: Force refresh user profile on dashboard mount if not loaded  
  useEffect(() => {
    if (!user && isAuthenticated) {
      if (typeof refreshUser === 'function') {
        console.log('🔄 Dashboard: Refreshing user profile...');
        refreshUser();
      }
    }
  }, [user, isAuthenticated, refreshUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    setProfileDropdownOpen(false);
    navigate('/profile');
  };

  const handleGoToTransactions = () => {
    setProfileDropdownOpen(false);
    navigate('/transactions');
  };

  const handleViewCourse = (course) => {
    navigate('/LMSPlatform', { state: { course } });
    showToast(`Opening ${course.category} course...`, 'info');
  };

  const handleEnroll = async (course) => {
    setSubmitting(true);
    try {
      const response = await api.post('/api/lms/enroll', { courseId: course.id });
      if (response.data) {
        showToast(`Successfully enrolled in ${course.category}!`, 'success');
        fetchEnrollments();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to enroll';
      if (errorMsg.includes('already enrolled')) {
        showToast('You are already enrolled in this course', 'info');
      } else {
        showToast(errorMsg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDone = async (courseId, moduleId) => {
    try {
      const enrollmentResponse = await api.get('/api/lms/my-courses');
      const enrollment = enrollmentResponse.data?.enrollments?.find(e => e.courseId === `web-${courseId}` || e.course?.id === `web-${courseId}`);
      if (enrollment) {
        await api.put(`/api/lms/enrollments/${enrollment._id}/progress`, {
          progress: Math.min(100, (enrollment.progress || 0) + 20)
        });
        showToast("🎉 Module complete! +150 XP", 'success');
        setXp(p => p + 150);
        fetchEnrollments();
      } else {
        setCourses(prev => prev.map(c => {
          if (c.id !== courseId) return c;
          const mods = c.modules.map(m => m.id === moduleId ? { ...m, status: "completed" } : m);
          return { ...c, modules: mods };
        }));
        showToast("🎉 Module complete! +150 XP", 'success');
        setXp(p => p + 150);
      }
    } catch (err) {
      console.error('Error marking done:', err);
      setCourses(prev => prev.map(c => {
        if (c.id !== courseId) return c;
        const mods = c.modules.map(m => m.id === moduleId ? { ...m, status: "completed" } : m);
        return { ...c, modules: mods };
      }));
      showToast("🎉 Module complete! +150 XP", 'success');
      setXp(p => p + 150);
    }
  };

  const handleApply = (internship) => {
    navigate('/internship-apply', { state: { internship } });
    showToast(`Opening application for ${internship.role}...`, 'info');
  };

  const handleViewProject = (project) => {
    showToast(`Opening project: ${project.title}`, 'info');
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleViewPDF = (pdf) => {
    setSelectedPDF(pdf);
  };

  const handleClosePDFModal = () => {
    setSelectedPDF(null);
  };

  const handleDownloadPDF = (pdf) => {
    // Open PDF in viewer modal instead of just showing a toast
    setSelectedPDF(pdf);
  };

  const getCategoryAccent = (category) => {
    const accents = { "Web Development": "#3b82f6", "Data Science & AI": "#8b5cf6", "Cloud & DevOps": "#f97316", "Cybersecurity": "#ef4444" };
    return accents[category] || "#3b82f6";
  };

  const getCategoryVideos = (category) => {
    const resource = videoResources.find(r => r.category === category);
    return resource ? resource.videos : [];
  };

  const getCategoryPDFs = (category) => {
    const resource = pdfResources.find(r => r.category === category);
    return resource ? resource.pdfs : [];
  };

  const allTags = ["All", ...Array.from(new Set(internships.flatMap(i => i.tags)))];
  const filteredInternships = internships.filter(i => {
    const matchesSearch = i.company.toLowerCase().includes(search.toLowerCase()) || i.role.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filterTag === "All" || i.tags.includes(filterTag));
  });

  const allMods = courses.flatMap(c => c.modules);
  const doneMods = allMods.filter(m => m.status === "completed").length;
  const totalXP = allMods.filter(m => m.status === "completed").reduce((s, m) => s + m.xp, 0) + xp;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const pendingApplications = myApplications.filter(a => a.status === 'pending').length;

  const card = { background: colors.cardBg, borderRadius: 16, border: `1px solid ${colors.cardBorder}`, padding: "20px 24px", marginBottom: 24, boxShadow: colors.shadow };
  const secTitle = (txt) => <div style={{ fontSize: 18, fontWeight: 800, color: colors.textPrimary, marginBottom: 16 }}>{txt}</div>;

  const getTabStyle = (tab) => ({
    padding: "10px 20px",
    background: activeTab === tab ? "linear-gradient(135deg, #3b82f6, #6366f1)" : colors.inputBg,
    color: activeTab === tab ? "#fff" : colors.textSecondary,
    border: `1px solid ${activeTab === tab ? "#6366f1" : colors.inputBorder}`,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    transition: "all 0.2s"
  });

  if (loading) {
    return (
      <>
        <link rel="stylesheet" href={FONT} />
        <div style={{ minHeight: "100vh", background: colors.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href={FONT} />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.background}; }
        @keyframes fsi { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${colors.background}; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        button:active { transform: scale(0.97); }
        input:focus, textarea:focus, select:focus { border-color: #3b82f6 !important; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {selectedVideo && <VideoModal video={selectedVideo} onClose={handleCloseVideoModal} />}
      {selectedPDF && <PDFModal pdf={selectedPDF} onClose={handleClosePDFModal} />}

      <div style={{ minHeight: "100vh", background: colors.backgroundGradient, color: colors.textPrimary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ background: colors.headerBg, borderBottom: `1px solid ${colors.headerBorder}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50, boxShadow: colors.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s" alt="Logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#38bdf8", lineHeight: 1.2 }}>GJ Global Services</div>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase" }}>Pvt. Ltd.Enterprise Software & Technology Solutions</div>
            </div>
          </div>

<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={handleGoToTransactions} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
              <span>💳</span> Transactions
            </button>

            <NotificationBell />

            {user && (
              <div style={{ position: "relative" }} ref={profileDropdownRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 12px", background: colors.inputBg, borderRadius: 12, border: `1px solid ${colors.inputBorder}`, cursor: "pointer" }} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                  {user.profilePicture ? (
user.profilePicture.startsWith('http') ? user.profilePicture : `${getApiBaseUrl()}${user.profilePicture}`
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#38bdf8,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{user.username || "User"}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{user.email || ""}</div>
                  </div>
                  <span style={{ color: "#64748b", fontSize: 10, marginLeft: 4 }}>▼</span>
                </div>

                {profileDropdownOpen && (
                  <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 200, background: colors.cardBg, borderRadius: 12, border: `1px solid ${colors.cardBorder}`, boxShadow: "0 10px 40px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 100 }}>
                    <button onClick={handleViewProfile} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: 600, color: colors.textPrimary, transition: "background 0.15s" }} onMouseOver={(e) => e.target.style.background = colors.inputBg} onMouseOut={(e) => e.target.style.background = "none"}>
                      <span style={{ fontSize: 16 }}>👤</span> View Full Profile
                    </button>
                    <div style={{ height: 1, background: colors.cardBorder, margin: "0 8px" }} />
                    <button onClick={handleLogout} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#ef4444", transition: "background 0.15s" }} onMouseOver={(e) => e.target.style.background = colors.inputBg} onMouseOut={(e) => e.target.style.background = "none"}>
                      <span style={{ fontSize: 16 }}>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: colors.textPrimary, marginBottom: 4 }}>{t('appName')} {t('dashboard')}</h1>
            <p style={{ fontSize: 13, color: colors.textSecondary }}>{t('yourFinancialOverview')}</p>
          </div>

{/* Quick Access Cards - Video Tutorials & PDF Resources */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
            <div 
              onClick={() => setActiveTab("resources")}
              style={{ 
                ...card, 
                padding: "20px 24px", 
                cursor: "pointer", 
                border: "2px solid transparent",
                transition: "all 0.2s ease",
                background: isDark ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(59,130,246,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = colors.shadow;
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  📺
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginBottom: 4 }}>Video Tutorials</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Learn with expert-led video courses</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>
                Browse Videos → 
              </div>
            </div>

            <div 
              onClick={() => setActiveTab("resources")}
              style={{ 
                ...card, 
                padding: "20px 24px", 
                cursor: "pointer", 
                border: "2px solid transparent",
                transition: "all 0.2s ease",
                background: isDark ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#f59e0b";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(245,158,11,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  📚
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginBottom: 4 }}>PDF Resources</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Download study materials & guides</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>
                Browse PDFs →
              </div>
            </div>
          </div>

          {/* Quick Access Cards - Internship Opportunities */}
          <div style={{ marginBottom: 24 }}>
            <div 
              onClick={() => setActiveTab("internships")}
              style={{ 
                ...card, 
                padding: "20px 24px", 
                cursor: "pointer", 
                border: "2px solid transparent",
                transition: "all 0.2s ease",
                background: isDark ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#22c55e";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(34,197,94,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = colors.shadow;
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                    💼
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginBottom: 4 }}>Internship Opportunities</div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>Apply now for {internships.length} open positions at GJ Global Services</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ padding: "6px 14px", background: "#22c55e22", color: "#22c55e", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    {internships.length} Positions
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>
                    View All →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            <div style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📚</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{courses.length}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Courses Enrolled</div>
              </div>
            </div>
            <div style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✅</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{doneMods}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Modules Completed</div>
              </div>
            </div>
            <div style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏆</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{totalXP}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Total XP Earned</div>
              </div>
            </div>

          </div>

{/* Tab Navigation */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <button style={getTabStyle("finance")} onClick={() => {setActiveTab("finance"); fetchFinancialData();}}>💰 Finance</button>
            <button style={getTabStyle("courses")} onClick={() => setActiveTab("courses")}>📚 My Courses</button>
            <button style={getTabStyle("projects")} onClick={() => setActiveTab("projects")}>🚀 Projects</button>
            <button style={getTabStyle("internships")} onClick={() => setActiveTab("internships")}>💼 Internships</button>
            <button style={getTabStyle("resources")} onClick={() => setActiveTab("resources")}>📺 Videos & PDFs</button>
          </div>

{apiError && <ErrorMessage message={apiError} onRetry={() => window.location.reload()} />}

          {/* COURSES TAB */}
          {/* FINANCE TAB */}
{activeTab === "finance" && (
            <div style={card}>
              {secTitle("💰 Financial Dashboard")}
              <div style={{display:"flex",alignItems:"center",gap:12,mb:20}}>
                <button onClick={fetchFinancialData} style={{padding:"8px 16px",background:"#22c55e",color:"white",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  🔄 Load Financial Data
                </button>
                <span style={{fontSize:12,color:colors.textSecondary}}>Requires Plaid bank link</span>
              </div>
              {financialLoading ? (
                <LoadingSpinner />
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))",gap:20}}>
                  <div>
                    <IncomeExpenseSummary refresh={refreshKey} />
                  </div>
                  <div>
                    <SpendingChart data={financialData.spending} refresh={refreshKey} />
                  </div>
                  <div>
                    <MonthlyChart data={financialData.monthly} refresh={refreshKey} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "courses" && !error && (
            <div style={card}>
              {secTitle("📚 My Courses")}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {courses.map(c => {
                  const done = c.modules.filter(m => m.status === "completed").length;
                  const isOpen = expanded === c.id;
                  return (
                    <div key={c.id} style={{ background: colors.inputBg, borderRadius: 14, border: `1px solid ${isOpen ? c.accent + "55" : colors.inputBorder}`, overflow: "hidden", transition: "border-color .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : c.id)}>
                        <span style={{ fontSize: 22 }}>{c.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>{c.category}</div>
                          <div style={{ fontSize: 11, color: colors.textSecondary }}>{done}/{c.modules.length} modules · {c.modules.reduce((a, m) => a + parseInt(m.duration), 0)}h total</div>
                        </div>
                        <div style={{ width: 110, marginRight: 12 }}><Bar v={done} m={c.modules.length} color={c.accent} /></div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: c.accent, minWidth: 40, textAlign: "right" }}>{Math.round((done / c.modules.length) * 100)}%</div>
                        <span style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {c.modules.map((m, idx) => (
                            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: colors.cardBg, borderRadius: 11, padding: "11px 14px", border: m.status === "in-progress" ? `1px solid ${c.accent}55` : `1px solid ${colors.inputBorder}`, opacity: m.status === "locked" ? 0.5 : 1 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, background: m.status === "completed" ? "#22c55e22" : m.status === "in-progress" ? c.accent + "22" : colors.inputBg, border: `2px solid ${m.status === "completed" ? "#22c55e" : m.status === "in-progress" ? c.accent : "#94a3b8"}`, color: m.status === "completed" ? "#22c55e" : m.status === "in-progress" ? c.accent : colors.textSecondary }}>{m.status === "completed" ? "✓" : idx + 1}</div>
                              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>{m.title}</div><div style={{ fontSize: 11, color: colors.textSecondary }}>⏱ {m.duration} · 🏅 {m.xp} XP</div></div>
                              <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 99, fontWeight: 700, background: m.status === "completed" ? "#22c55e22" : m.status === "in-progress" ? c.accent + "22" : colors.inputBg, color: m.status === "completed" ? "#22c55e" : m.status === "in-progress" ? c.accent : colors.textSecondary }}>{m.status === "completed" ? "✓ Done" : m.status === "in-progress" ? "⚡ Active" : "🔒 Locked"}</span>
                              {m.status === "completed" && (
                                <button onClick={() => handleViewCourse(c)} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Course →</button>
                              )}
                              {m.status === "in-progress" && <button onClick={() => handleMarkDone(c.id, m.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Mark Done ✓</button>}
                            </div>
                          ))}
                          <button onClick={() => handleViewCourse(c)} style={{ marginTop: 8, padding: "10px 20px", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>🎓 View Full Course →</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && !error && (
            <div style={card}>
              {secTitle("🚀 My Projects")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {projects.map(project => (
                  <div key={project.id} style={{ background: colors.inputBg, borderRadius: 14, border: `1px solid ${colors.inputBorder}`, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginBottom: 4 }}>{project.title}</h3>
                        <p style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>{project.description}</p>
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: project.status === "completed" ? "#22c55e22" : "#f59e0b22", color: project.status === "completed" ? "#22c55e" : "#f59e0b" }}>{project.status === "completed" ? "✅ Completed" : "🔄 In Progress"}</span>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Bar v={project.progress} m={100} color={project.status === "completed" ? "#22c55e" : "#f59e0b"} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {project.tech.map(t => <Chip key={t} text={t} color="#3b82f6" />)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: colors.textSecondary }}>
                      <div>👥 {project.team.join(", ")}</div>
                      <div>📅 Due: {new Date(project.dueDate).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => handleViewProject(project)} style={{ marginTop: 12, width: "100%", padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Project →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERNSHIPS TAB */}
          {activeTab === "internships" && !error && (
            <div style={card}>
              {secTitle("💼 Internship Opportunities")}
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search role or company…" style={{ background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: 10, padding: "9px 14px", color: colors.textPrimary, fontSize: 13, outline: "none", flex: 1, minWidth: 200, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                {allTags.map(t => (
                  <button key={t} onClick={() => setFilterTag(t)} style={{ background: filterTag === t ? "#0f2647" : colors.inputBg, border: `1px solid ${filterTag === t ? "#38bdf8" : colors.inputBorder}`, color: filterTag === t ? "#38bdf8" : colors.textSecondary, borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {filteredInternships.map(i => (
                  <div key={i.id} style={{ background: colors.inputBg, borderRadius: 14, border: `1px solid ${colors.inputBorder}`, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", gap: 11, marginBottom: 10 }}>
                      <span style={{ fontSize: 30 }}>{i.logo}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: colors.textPrimary }}>{i.role}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>{i.company}</div>
                      </div>
                      <div style={{ background: i.match >= 80 ? "#22c55e22" : i.match >= 65 ? "#f59e0b22" : "#ef444422", color: i.match >= 80 ? "#22c55e" : i.match >= 65 ? "#f59e0b" : "#ef4444", borderRadius: 8, padding: "3px 9px", fontSize: 13, fontWeight: 900, height: "fit-content" }}>{i.match}%</div>
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10, lineHeight: 1.55 }}>{i.desc}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>{i.tags.map(t => <Chip key={t} text={t} color={i.accent} />)}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                      {[["📍", i.location], ["⏳", i.duration], ["💰", i.stipend], ["🪑", `${i.seats} seats`]].map(([ic, v], idx) => (
                        <div key={idx} style={{ fontSize: 12, color: colors.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>{ic} {v}</div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 11, color: colors.textSecondary }}>Deadline: {i.deadline}</div>
                    <button onClick={() => handleApply(i)} disabled={submitting} style={{ marginTop: 12, width: "100%", padding: "8px 16px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(59,130,246,0.3)", opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? "Processing..." : "📝 Apply Now"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESOURCES TAB - Videos & PDFs */}
          {activeTab === "resources" && !error && (
            <div style={card}>
              {secTitle("📺 Video Tutorials & PDF Resources")}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {videoResources.map((vr, idx) => {
                  const accent = getCategoryAccent(vr.category);
                  return (
                    <div key={vr.id || idx} style={{ background: colors.inputBg, borderRadius: 14, border: `1px solid ${colors.inputBorder}`, padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 24 }}>{vr.category === "Web Development" ? "🌐" : vr.category === "Data Science & AI" ? "🤖" : vr.category === "Cloud & DevOps" ? "☁️" : "🔐"}</span>
                        <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary }}>{vr.category}</div>
                        <span style={{ fontSize: 12, color: colors.textSecondary }}>{vr.videos?.length || 0} videos • {vr.pdfs?.length || 0} PDFs</span>
                      </div>
                      
                      {/* Videos Section */}
                      {vr.videos && vr.videos.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b", marginBottom: 12 }}>🎬 Video Tutorials</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                            {vr.videos.map(video => (
                              <VideoCard key={video.id} video={video} accent={accent} onPlay={handlePlayVideo} isDark={isDark} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* PDFs Section */}
                      {vr.pdfs && vr.pdfs.length > 0 && (
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b", marginBottom: 12 }}>📚 PDF Resources</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                            {vr.pdfs.map(pdf => (
                              <PDFCard key={pdf.id} pdf={pdf} accent={accent} onDownload={handleDownloadPDF} isDark={isDark} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
