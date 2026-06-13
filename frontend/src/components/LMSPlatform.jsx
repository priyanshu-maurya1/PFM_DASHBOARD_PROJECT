import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Cpu,
  Zap,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
  FileText,
  PlayCircle,
  Download,
  X,
  Video,
  Star,
  Users,
  Moon,
  Sun,
  Menu,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://"))
    return profilePicture;
  return `http://localhost:5000${profilePicture}`;
};

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────
const COURSES = [
  {
    id: "web-101",
    title: "Complete 2026 Web Development Bootcamp",
    duration: "24 Weeks",
    instructor: "Industry Experts",
    curriculum: ["HTML5 & Semantic Markup", "CSS3 & Flexbox/Grid", "JavaScript ES6+", "React.js", "Node.js & Express"],
    badge: "Web",
    courseLink: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
    testLink: "/assessment-test",
    certificateLink: "/certificates/web-development",
    description:
      "Master modern web development from scratch. Learn to build responsive, interactive websites using the latest technologies.",
    prerequisites: ["Basic computer skills", "No prior coding experience needed"],
    syllabus: [
      "Week 1-2: HTML5 Fundamentals & Semantic Markup",
      "Week 3-4: CSS3 Styling & Flexbox/Grid",
      "Week 5-6: JavaScript ES6+ Fundamentals",
      "Week 7-8: DOM Manipulation & Events",
      "Week 9-12: React.js & Component Architecture",
      "Week 13-16: Node.js & Express Backend",
      "Week 17-20: Database Integration (MongoDB)",
      "Week 21-24: Final Project & Deployment",
    ],
    project: {
      title: "Full-Stack E-Commerce Platform",
      description:
        "Build a complete e-commerce website with shopping cart, user authentication, payment integration, and admin dashboard.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      duration: "4 weeks",
    },
    pdfLinks: [
      { title: "HTML5 Cheat Sheet", url: "https://htmlcheatsheet.com/HTML5-cheat-sheet.pdf" },
      { title: "CSS3 Complete Guide", url: "https://htmlcheatsheet.com/CSS3-cheat-sheet.pdf" },
      { title: "JavaScript ES6 Reference", url: "https://htmlcheatsheet.com/JS-cheat-sheet.pdf" },
    ],
    videoLinks: [
      { title: "Introduction to Web Development", url: "https://www.youtube.com/watch?v=pQN-pnXHbvg", thumbnail: "https://img.youtube.com/vi/pQN-pnXHbvg/hqdefault.jpg" },
      { title: "HTML & CSS Full Course", url: "https://www.youtube.com/watch?v=mU6anWqZJcc", thumbnail: "https://img.youtube.com/vi/mU6anWqZJcc/hqdefault.jpg" },
      { title: "JavaScript Full Course", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", thumbnail: "https://img.youtube.com/vi/PkZNo7MFNFg/hqdefault.jpg" },
      { title: "React JS Full Course", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", thumbnail: "https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg" },
    ],
    level: "Beginner",
    rating: 4.8,
    studentsEnrolled: 1250,
    price: "$299",
  },
  {
    id: "mern-201",
    title: "MERN Stack Mastery",
    duration: "16 Weeks",
    instructor: "Senior Engineers",
    curriculum: ["MongoDB & Mongoose", "Express.js REST APIs", "React Hooks & Context", "Node.js & NPM", "Redux State Management"],
    badge: "MERN",
    courseLink: "https://www.udemy.com/course/mern-stack-front-to-back/",
    testLink: "/assessment-test",
    certificateLink: "/certificates/mern",
    description:
      "Build full-stack applications with the powerful MERN stack. Master MongoDB, Express, React, and Node.js.",
    prerequisites: ["Basic JavaScript knowledge", "HTML/CSS fundamentals"],
    syllabus: [
      "Week 1-2: Node.js Deep Dive & NPM",
      "Week 3-4: Express.js Framework & REST APIs",
      "Week 5-6: MongoDB & Mongoose ODM",
      "Week 7-8: Authentication & JWT Tokens",
      "Week 9-10: React Hooks & Context API",
      "Week 11-12: State Management with Redux",
      "Week 13-14: API Integration & Error Handling",
      "Week 15-16: Deployment & DevOps Basics",
    ],
    project: {
      title: "Social Media Application",
      description:
        "Create a full-featured social media platform with posts, comments, likes, followers, and real-time notifications.",
      technologies: ["MongoDB", "Express", "React", "Node.js", "Socket.io"],
      duration: "4 weeks",
    },
    pdfLinks: [
      { title: "MongoDB Quick Start Guide", url: "https://www.mongodb.com/docs/assets/MongoDB_Architecture_Guide.pdf" },
      { title: "Node.js & Express Cheat Sheet", url: "https://expressjs.com/en/guide/routing.html" },
      { title: "React Hooks Cheat Sheet", url: "https://react.dev/learn" },
    ],
    videoLinks: [
      { title: "MERN Stack Crash Course", url: "https://www.youtube.com/watch?v=7CqJlxBYj-M", thumbnail: "https://img.youtube.com/vi/7CqJlxBYj-M/hqdefault.jpg" },
      { title: "Node.js & Express Full Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", thumbnail: "https://img.youtube.com/vi/Oe421EPjeBE/hqdefault.jpg" },
      { title: "React.js Full Course 2024", url: "https://www.youtube.com/watch?v=Ke90Tje7VS0", thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg" },
      { title: "MongoDB Complete Tutorial", url: "https://www.youtube.com/watch?v=c2M-rlkkT5o", thumbnail: "https://img.youtube.com/vi/c2M-rlkkT5o/hqdefault.jpg" },
    ],
    level: "Intermediate",
    rating: 4.7,
    studentsEnrolled: 890,
    price: "$349",
  },
  {
    id: "java-401",
    title: "Java Programming & Software Engineering",
    duration: "10 Weeks",
    instructor: "Google / Coursera",
    curriculum: ["Java Fundamentals & OOP", "Collections & Generics", "Exception Handling", "Spring Boot", "REST API Design"],
    badge: "Java",
    courseLink: "https://www.coursera.org/specializations/java-programming",
    testLink: "/assessment-test",
    certificateLink: "/certificates/java",
    description:
      "Enterprise-grade Java development. Master object-oriented programming and build scalable applications.",
    prerequisites: ["Basic programming logic", "Problem-solving skills"],
    syllabus: [
      "Week 1-2: Java Fundamentals & Syntax",
      "Week 3-4: Object-Oriented Programming",
      "Week 5-6: Collections & Generics",
      "Week 7-8: Exception Handling & File I/O",
      "Week 9-10: Spring Boot & REST APIs",
    ],
    project: {
      title: "Banking Management System",
      description:
        "Develop a secure banking application with account management, transactions, and admin controls.",
      technologies: ["Java", "Spring Boot", "MySQL", "Hibernate"],
      duration: "3 weeks",
    },
    pdfLinks: [
      { title: "Java Programming Cheat Sheet", url: "https://introcs.cs.princeton.edu/java/11cheatsheet/cheatsheet.pdf" },
      { title: "Spring Boot Reference Guide", url: "https://docs.spring.io/spring-boot/docs/current/reference/pdf/spring-boot-reference.pdf" },
    ],
    videoLinks: [
      { title: "Java Programming for Beginners", url: "https://www.youtube.com/watch?v=eIrMbAQSU34", thumbnail: "https://img.youtube.com/vi/eIrMbAQSU34/hqdefault.jpg" },
      { title: "OOP in Java Full Course", url: "https://www.youtube.com/watch?v=6T_HgnjoYwM", thumbnail: "https://img.youtube.com/vi/6T_HgnjoYwM/hqdefault.jpg" },
      { title: "Spring Boot Full Course", url: "https://www.youtube.com/watch?v=35X7tQ9XQqw", thumbnail: "https://img.youtube.com/vi/35X7tQ9XQqw/hqdefault.jpg" },
    ],
    level: "Intermediate",
    rating: 4.6,
    studentsEnrolled: 650,
    price: "$399",
  },
  {
    id: "python-402",
    title: "Python for Everybody",
    duration: "12 Weeks",
    instructor: "University of Michigan",
    curriculum: ["Python Basics & Data Types", "Control Flow & Functions", "Data Structures", "APIs & Web Scraping", "Pandas & Data Analysis"],
    badge: "Python",
    courseLink: "https://www.coursera.org/specializations/python",
    testLink: "/assessment-test",
    certificateLink: "/certificates/python",
    description:
      "Complete Python programming from basics to advanced. Learn data analysis, APIs, and automation.",
    prerequisites: ["No prior programming experience needed"],
    syllabus: [
      "Week 1-2: Python Basics & Data Types",
      "Week 3-4: Control Flow & Functions",
      "Week 5-6: Data Structures in Python",
      "Week 7-8: File Handling & Error Handling",
      "Week 9-10: Working with APIs",
      "Week 11-12: Data Analysis with Pandas",
    ],
    project: {
      title: "Data Analytics Dashboard",
      description:
        "Build an interactive data visualization dashboard to analyze and display business metrics.",
      technologies: ["Python", "Pandas", "Matplotlib", "Flask"],
      duration: "3 weeks",
    },
    pdfLinks: [
      { title: "Python 3 Cheat Sheet", url: "https://perso.limsi.fr/pointal/_media/python:cours:mementopython3-english.pdf" },
      { title: "Pandas Reference Guide", url: "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf" },
    ],
    videoLinks: [
      { title: "Python for Beginners - Full Course", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", thumbnail: "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg" },
      { title: "Python Data Science Tutorial", url: "https://www.youtube.com/watch?v=vmEHCJofslg", thumbnail: "https://img.youtube.com/vi/vmEHCJofslg/hqdefault.jpg" },
      { title: "Python APIs with Flask", url: "https://www.youtube.com/watch?v=Qr4QMBUPxWo", thumbnail: "https://img.youtube.com/vi/Qr4QMBUPxWo/hqdefault.jpg" },
    ],
    level: "Beginner",
    rating: 4.9,
    studentsEnrolled: 2100,
    price: "$249",
  },
  {
    id: "aws-701",
    title: "AWS Cloud + DevOps Essentials",
    duration: "8 Weeks",
    instructor: "AWS Trainers",
    curriculum: ["AWS EC2 & S3", "RDS & Cloud Storage", "CI/CD Pipelines", "Docker & Containers", "Kubernetes & ECS"],
    badge: "AWS",
    courseLink: "https://aws.amazon.com/training/learn-about/cloud-practitioner/",
    testLink: "/assessment-test",
    certificateLink: "/certificates/aws",
    description:
      "Master cloud computing and DevOps practices with AWS. Learn to deploy and manage applications in the cloud.",
    prerequisites: ["Basic understanding of IT concepts", "Command line familiarity"],
    syllabus: [
      "Week 1-2: AWS Fundamentals & EC2",
      "Week 3-4: S3, RDS & Cloud Storage",
      "Week 5-6: CI/CD with AWS CodePipeline",
      "Week 7-8: Containerization & ECS",
    ],
    project: {
      title: "Cloud-Native Application Deployment",
      description:
        "Deploy a scalable microservices application to AWS with automatic scaling and monitoring.",
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
      duration: "2 weeks",
    },
    pdfLinks: [
      { title: "AWS Cloud Practitioner Study Guide", url: "https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf" },
      { title: "Docker Official Cheat Sheet", url: "https://docs.docker.com/get-started/docker_cheatsheet.pdf" },
    ],
    videoLinks: [
      { title: "AWS Cloud Practitioner Full Course", url: "https://www.youtube.com/watch?v=SOTamWNgDKc", thumbnail: "https://img.youtube.com/vi/SOTamWNgDKc/hqdefault.jpg" },
      { title: "Docker & Containers Tutorial", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", thumbnail: "https://img.youtube.com/vi/fqMOX6JJhGo/hqdefault.jpg" },
      { title: "Kubernetes for Beginners", url: "https://www.youtube.com/watch?v=H0dkXcmZ0Ak", thumbnail: "https://img.youtube.com/vi/H0dkXcmZ0Ak/hqdefault.jpg" },
    ],
    level: "Advanced",
    rating: 4.5,
    studentsEnrolled: 420,
    price: "$449",
  },
];

const INTERNSHIPS = [
  {
    id: "int-1",
    role: "Backend Intern",
    company: "AeroTech",
    stipend: "$1500/mo",
    location: "Remote",
    type: "Full-time",
    duration: "3 months",
    requirements: ["Node.js", "MongoDB", "REST APIs"],
    description: "Work on scalable backend systems and API integrations for our aerospace data platform.",
  },
  {
    id: "int-2",
    role: "ML Intern",
    company: "VisionAI",
    stipend: "$2000/mo",
    location: "San Francisco",
    type: "Hybrid",
    duration: "6 months",
    requirements: ["Python", "TensorFlow", "Data Analysis"],
    description: "Research and implement machine learning models for real-time computer vision applications.",
  },
  {
    id: "int-3",
    role: "UI/UX Intern",
    company: "StudioFlow",
    stipend: "$1200/mo",
    location: "New York",
    type: "On-site",
    duration: "3 months",
    requirements: ["Figma", "CSS", "User Research"],
    description: "Design beautiful and accessible user interfaces for our creative workflow platform.",
  },
];

// ─────────────────────────────────────────────
// VIDEO MODAL - Inline YouTube Video Player
// ─────────────────────────────────────────────
const VideoModal = ({ video, onClose }) => {
  if (!video) return null;
  
  // Convert YouTube watch URL to embed URL if needed
  const getEmbedUrl = () => {
    if (video.embedUrl) return video.embedUrl;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = video.url?.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  
  const embedUrl = getEmbedUrl();
  if (!embedUrl) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-black rounded-2xl w-full max-w-4xl overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        {/* Video iframe */}
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {/* Video info */}
        <div className="p-4 bg-gray-900">
          <h3 className="text-white font-bold text-lg">{video.title}</h3>
          {video.duration && <p className="text-gray-400 text-sm mt-1">Duration: {video.duration}</p>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PDF MODAL - Inline PDF Viewer with Download
// ─────────────────────────────────────────────
const PDFModal = ({ pdf, onClose }) => {
  if (!pdf) return null;
  
  // Get API base URL - use consistent pattern with Dashboard
  const API_BASE_URL = 'http://localhost:5000';
  
  // Construct full URL for PDF
  const getPdfUrl = () => {
    if (!pdf.url) return '';
    if (pdf.url.startsWith('http://') || pdf.url.startsWith('https://')) {
      return pdf.url;
    }
    return `${API_BASE_URL}${pdf.url}`;
  };
  
  const pdfUrl = getPdfUrl();
  
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
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-red-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{pdf.title}</h3>
              {pdf.pages && <p className="text-red-100 text-sm">{pdf.size} • {pdf.pages} pages</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={pdf.title}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-500">PDF not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** YouTube thumbnail video card - opens in modal for inline playback */
const VideoCard = ({ video, darkMode, large = false, onPlay }) => {
  const [imgError, setImgError] = useState(false);
  // ✅ FIX: Try multiple YouTube thumbnail qualities as fallbacks
  const thumbnailSrc = imgError
    ? `https://img.youtube.com/vi/${video.url.split("v=")[1]?.split("&")[0]}/mqdefault.jpg`
    : video.thumbnail;

  const handleClick = () => {
    if (onPlay) {
      onPlay(video);
    }
  };

  if (large) {
    return (
      <div
        onClick={handleClick}
        className="group relative rounded-xl overflow-hidden block hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      >
        <div className="aspect-video bg-slate-900 relative">
          <img
            src={thumbnailSrc}
            alt={video.title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              // Final fallback: hide img and show gradient bg
              e.target.style.display = "none";
              setImgError(true);
            }}
          />
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <PlayCircle className="text-blue-400 w-12 h-12" />
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <PlayCircle className="text-white w-6 h-6" />
            </div>
          </div>
        </div>
        <div className={`p-3 ${darkMode ? "bg-gray-700" : "bg-slate-800"}`}>
          <p className="text-white font-semibold text-xs line-clamp-2 leading-relaxed">{video.title}</p>
          <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
            <PlayCircle size={10} /> Click to play
          </p>
        </div>
      </div>
    );
  }

  // Small card (used inside course card collapsible)
  return (
    <div
      onClick={handleClick}
      className="group relative rounded-lg overflow-hidden block cursor-pointer"
    >
      <div className="aspect-video bg-slate-900 relative">
        <img
          src={thumbnailSrc}
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => {
            e.target.style.display = "none";
            setImgError(true);
          }}
        />
        {imgError && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <PlayCircle className="text-blue-400 w-6 h-6" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlayCircle className="text-white w-4 h-4" />
          </div>
        </div>
      </div>
      <div className={`px-2 py-1.5 ${darkMode ? "bg-gray-700" : "bg-slate-800"}`}>
        <p className="text-white text-xs font-medium line-clamp-1">{video.title}</p>
      </div>
    </div>
  );
};

/** PDF card - opens in modal for inline viewing with download option */
const PDFCard = ({ pdf, darkMode, onView }) => {
  const handleClick = () => {
    if (onView) {
      onView(pdf);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors group cursor-pointer ${
        darkMode
          ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
          : "bg-red-50 border-red-100 hover:bg-red-100"
      }`}
    >
      <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? "bg-red-900" : "bg-red-500"}`}>
        <FileText className="text-white w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm truncate ${
            darkMode ? "text-gray-200 group-hover:text-red-400" : "text-slate-800 group-hover:text-red-700"
          }`}
        >
          {pdf.title}
        </p>
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>PDF · Click to view / download</p>
      </div>
      <Download
        className={`flex-shrink-0 ${darkMode ? "text-gray-400 group-hover:text-gray-200" : "text-red-400 group-hover:text-red-600"}`}
        size={18}
      />
    </div>
  );
};

/** Level badge */
const LevelBadge = ({ level }) => {
  const styles = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[level] || "bg-slate-100 text-slate-600"}`}>
      {level}
    </span>
  );
};

/** Star rating */
const StarRating = ({ rating }) => (
  <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
    <Star size={12} fill="currentColor" /> {rating}
  </span>
);

// ─────────────────────────────────────────────
// RESOURCES MODAL
// ─────────────────────────────────────────────
const ResourcesModal = ({ course, darkMode, onClose, onPlayVideo, onViewPDF }) => {
  if (!course) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-3xl w-full max-w-3xl shadow-2xl my-4 flex flex-col`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-3xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-xl font-bold text-white">Course Resources</h3>
              <p className="text-purple-100 text-sm mt-1 truncate">{course.title}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={course.courseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <ExternalLink size={12} /> Open Full Course →
                </a>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="text-white w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* PDFs */}
          {course.pdfLinks?.length > 0 && (
            <div>
              <h4
                className={`text-base font-bold flex items-center gap-2 mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                <FileText className="text-red-500" />
                PDF Documents
                <span className={`text-sm font-normal ${darkMode ? "text-gray-400" : "text-slate-400"}`}>
                  — click to view
                </span>
              </h4>
              <div className="space-y-2">
                {course.pdfLinks.map((pdf, i) => (
                  <PDFCard key={i} pdf={pdf} darkMode={darkMode} onView={onViewPDF} />
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {course.videoLinks?.length > 0 && (
            <div>
              <h4
                className={`text-base font-bold flex items-center gap-2 mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                <PlayCircle className="text-blue-500" />
                Video Tutorials
                <span className={`text-sm font-normal ${darkMode ? "text-gray-400" : "text-slate-400"}`}>
                  — click to play
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.videoLinks.map((video, i) => (
                  <VideoCard key={i} video={video} darkMode={darkMode} large onPlay={onPlayVideo} />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {!course.pdfLinks?.length && !course.videoLinks?.length && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className={darkMode ? "text-gray-400" : "text-slate-500"}>No resources available yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${darkMode ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-100"} rounded-b-3xl flex gap-3 flex-shrink-0`}
        >
          <a
            href={course.courseLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} /> Go to Full Course
          </a>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// COURSE CARD
// ─────────────────────────────────────────────
const CourseCard = ({ course, darkMode, enrollment, enrollingId, onEnroll, onOpenResources, onGoToInternships, onContinue, onPlayVideo, onViewPDF }) => {
  const [resOpen, setResOpen] = useState(false);
  const isEnrolled = !!enrollment;
  const totalRes = (course.videoLinks?.length || 0) + (course.pdfLinks?.length || 0);

  return (
    <div
      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} p-6 rounded-3xl border hover:shadow-xl transition-all duration-200 flex flex-col`}
    >
      {/* Top */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{course.badge}</span>
        {isEnrolled ? (
          <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} /> Enrolled
          </span>
        ) : (
          <LevelBadge level={course.level} />
        )}
      </div>

      {/* Title */}
      <h3 className={`font-bold text-lg mb-2 leading-snug ${darkMode ? "text-white" : "text-slate-900"}`}>
        {course.title}
      </h3>
      <p className={`text-sm mb-3 leading-relaxed ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
        {course.description}
      </p>

      {/* Meta */}
      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs mb-4 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
        <span className="flex items-center gap-1"><BookOpen size={12} /> {course.instructor}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
        <StarRating rating={course.rating} />
        <span className="flex items-center gap-1 text-blue-600 font-bold">{course.price}</span>
      </div>

      {/* Students */}
      <div className={`flex items-center gap-1 text-xs mb-4 ${darkMode ? "text-gray-500" : "text-slate-400"}`}>
        <Users size={12} />
        <span>{course.studentsEnrolled?.toLocaleString()} students enrolled</span>
      </div>

      {/* Curriculum */}
      <div className="mb-4 space-y-1.5">
        {course.curriculum?.slice(0, 5).map((item) => (
          <p key={item} className="flex gap-2 text-sm items-start">
            <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className={`${darkMode ? "text-gray-300" : "text-slate-700"}`}>{item}</span>
          </p>
        ))}
      </div>

      {/* Final Project */}
      {course.project && (
        <div
          className={`mb-4 p-3 rounded-xl border ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100"
          }`}
        >
          <p className={`text-xs font-bold mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
            📦 Final Project
          </p>
          <p className={`text-xs font-semibold ${darkMode ? "text-gray-200" : "text-slate-700"}`}>
            {course.project.title}
          </p>
          <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
            {course.project.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {course.project.technologies?.map((t) => (
              <span
                key={t}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  darkMode ? "bg-gray-600 text-gray-300" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar if enrolled */}
      {isEnrolled && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? "text-gray-400" : "text-slate-500"}>Progress</span>
            <span className="font-bold text-blue-600">{enrollment.progress || 0}%</span>
          </div>
          <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-slate-200"}`}>
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${enrollment.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Collapsible Resources */}
      {totalRes > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setResOpen((p) => !p)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Video size={12} className="text-purple-500" />
              Learning Resources ({totalRes} items)
            </span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${resOpen ? "rotate-90" : ""}`}
            />
          </button>

          {resOpen && (
            <div className="mt-3 space-y-4">
              {course.videoLinks?.length > 0 && (
                <div>
                  <p className={`text-xs font-bold mb-2 flex items-center gap-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                    <PlayCircle size={12} /> Video Tutorials ({course.videoLinks.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {course.videoLinks.map((video, i) => (
                      <VideoCard key={i} video={video} darkMode={darkMode} large={false} onPlay={onPlayVideo} />
                    ))}
                  </div>
                </div>
              )}
              {course.pdfLinks?.length > 0 && (
                <div>
                  <p className={`text-xs font-bold mb-2 flex items-center gap-1 ${darkMode ? "text-red-400" : "text-red-600"}`}>
                    <FileText size={12} /> PDF Resources ({course.pdfLinks.length})
                  </p>
                  <div className="space-y-2">
                    {course.pdfLinks.map((pdf, i) => (
                      <PDFCard key={i} pdf={pdf} darkMode={darkMode} onView={onViewPDF} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
        {/* Row 1 */}
        <a
          href={course.courseLink}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
        >
          <ExternalLink size={14} /> Open Full Course
        </a>

        {/* Row 2 */}
        <button
          onClick={onOpenResources}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition-colors"
        >
          <Video size={12} /> Resources
        </button>

        <button
          onClick={onGoToInternships}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors"
        >
          <Briefcase size={12} /> Internships
        </button>

        {/* Row 3 */}
        {isEnrolled ? (
          <button
            onClick={onContinue}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            <TrendingUp size={14} /> Continue Learning
          </button>
        ) : (
          <button
            onClick={() => onEnroll(course)}
            disabled={enrollingId === course.id}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrollingId === course.id ? (
              <><Loader2 size={14} className="animate-spin" /> Enrolling...</>
            ) : (
              "Enroll Now — Free Preview"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// RESOURCE BLOCK (full-width, per course)
// ─────────────────────────────────────────────
const CourseResourceBlock = ({ course, darkMode, onPlayVideo, onViewPDF }) => (
  <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} p-6 rounded-3xl border`}>
    {/* Header */}
    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{course.badge}</span>
        <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{course.title}</h3>
        <LevelBadge level={course.level} />
      </div>
      <a
        href={course.courseLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
      >
        <ExternalLink size={14} /> Open Course
      </a>
    </div>

    {/* Videos */}
    {course.videoLinks?.length > 0 && (
      <div className="mb-6">
        <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${darkMode ? "text-gray-200" : "text-slate-700"}`}>
          <PlayCircle className="text-red-500" size={18} />
          Video Tutorials
          <span className={`font-normal text-xs ${darkMode ? "text-gray-400" : "text-slate-400"}`}>
            ({course.videoLinks.length} videos · opens YouTube)
          </span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {course.videoLinks.map((video, i) => (
            <VideoCard key={i} video={video} darkMode={darkMode} large onPlay={onPlayVideo} />
          ))}
        </div>
      </div>
    )}

    {/* PDFs */}
    {course.pdfLinks?.length > 0 && (
      <div>
        <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${darkMode ? "text-gray-200" : "text-slate-700"}`}>
          <FileText className="text-red-500" size={18} />
          PDF Study Materials
          <span className={`font-normal text-xs ${darkMode ? "text-gray-400" : "text-slate-400"}`}>
            ({course.pdfLinks.length} files)
          </span>
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {course.pdfLinks.map((pdf, i) => (
            <PDFCard key={i} pdf={pdf} darkMode={darkMode} onView={onViewPDF} />
          ))}
        </div>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function LMSPlatform() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isDark: darkMode } = useTheme();

  const [view, setView] = useState("courses");
  // ✅ FIX: Initialize with COURSES so resources always render even before API responds
  const [courses, setCourses] = useState(COURSES);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(null);

  // ── Data Fetching ──────────────────────────
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/api/lms/courses");
      // ✅ FIX: Merge API courses with static COURSES so videoLinks/pdfLinks are never missing
      const apiCourses = res.data.courses || [];
      const merged = COURSES.map((staticCourse) => {
        const apiCourse = apiCourses.find((c) => c.id === staticCourse.id);
        return apiCourse
          ? {
              ...staticCourse,          // keep static videoLinks, pdfLinks, project, syllabus
              ...apiCourse,             // override with API fields (title, price, etc.)
              videoLinks: staticCourse.videoLinks,  // always keep static resource links
              pdfLinks: staticCourse.pdfLinks,
              project: staticCourse.project,
            }
          : staticCourse;
      });
      setCourses(merged.length > 0 ? merged : COURSES);
    } catch {
      // API down — static COURSES already set as default, nothing to do
    }
  }, []);

  const fetchMyEnrollments = useCallback(async () => {
    if (!isAuthenticated) { setMyEnrollments([]); return; }
    try {
      const res = await api.get("/api/lms/my-courses");
      setMyEnrollments(res.data.enrollments || []);
    } catch {
      setMyEnrollments([]);
    }
  }, [isAuthenticated]);

  const fetchInternships = useCallback(async () => {
    try {
      const res = await api.get("/api/lms/internships");
      setInternships(res.data.internships || []);
    } catch {
      setInternships(INTERNSHIPS);
    }
  }, []);

  const fetchMyApplications = useCallback(async () => {
    if (!isAuthenticated) { setAppliedInternships([]); return; }
    try {
      const res = await api.get("/api/lms/my-applications");
      setAppliedInternships(res.data.applications.map((a) => a.internshipId));
    } catch {
      setAppliedInternships([]);
    }
  }, [isAuthenticated]);

  // ✅ NEW: Fetch user stats from backend
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) { setUserStats(null); return; }
    try {
      const res = await api.get("/api/lms/stats");
      setUserStats(res.data.stats || null);
    } catch {
      setUserStats(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchCourses(), fetchMyEnrollments(), fetchInternships(), fetchMyApplications(), fetchStats()]);
      } catch {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchCourses, fetchMyEnrollments, fetchInternships, fetchMyApplications, fetchStats]);

  // ── Actions ────────────────────────────────
  const handleEnroll = async (course) => {
    if (!isAuthenticated) {
      toast.error("Please login to enroll.");
      navigate("/login");
      return;
    }
    if (myEnrollments.some((e) => e.courseId === course.id)) {
      toast.error("Already enrolled!");
      return;
    }
    setEnrollingId(course.id);
    try {
      const res = await api.post("/api/lms/enroll", { courseId: course.id });
      if (res.data.enrollment) {
        setMyEnrollments((prev) => [...prev, res.data.enrollment]);
        toast.success("🎉 Enrolled successfully!");
        // Refresh stats after enrollment
        fetchStats();
        setView("console");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Enrollment failed.");
    } finally {
      setEnrollingId(null);
    }
  };

  // ✅ NEW: Update course progress
  const handleUpdateProgress = async (enrollmentId, newProgress) => {
    if (!isAuthenticated) return;
    setUpdatingProgress(enrollmentId);
    try {
      const res = await api.put(`/api/lms/enrollments/${enrollmentId}/progress`, { progress: newProgress });
      if (res.data.enrollment) {
        setMyEnrollments((prev) =>
          prev.map((e) => (e._id === enrollmentId ? res.data.enrollment : e))
        );
        toast.success("Progress updated!");
        // Refresh stats after progress update
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update progress.");
    } finally {
      setUpdatingProgress(null);
    }
  };

  // ✅ NEW: Submit test score
  const handleSubmitTest = async (enrollmentId, score) => {
    if (!isAuthenticated) {
      toast.error("Please login to submit test.");
      navigate("/login");
      return;
    }
    try {
      const res = await api.post(`/api/lms/enrollments/${enrollmentId}/test`, { score });
      if (res.data.enrollment) {
        setMyEnrollments((prev) =>
          prev.map((e) => (e._id === enrollmentId ? res.data.enrollment : e))
        );
        if (res.data.passed) {
          toast.success("🎉 Congratulations! Certificate issued!");
        } else {
          toast.success("Test submitted! Score: " + score + "%");
        }
        // Refresh stats after test submission
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit test.");
    }
  };

  const handleApplyInternship = (internship) => {
    if (!isAuthenticated) {
      toast.error("Please login to apply.");
      navigate("/login");
      return;
    }
    if (appliedInternships.includes(internship.id)) {
      toast.error("Already applied!");
      return;
    }
    // ✅ FIX: Pass full internship object to ensure InternshipApply receives all details
    navigate("/internship-apply", {
      state: { internship },
    });
  };

  const getEnrollment = (courseId) => myEnrollments.find((e) => e.courseId === courseId);

  const navItems = [
    { key: "courses", label: "Courses", icon: <BookOpen size={16} /> },
    { key: "internships", label: "Internships", icon: <Briefcase size={16} /> },
   
    { key: "console", label: "My Learning", icon: <Cpu size={16} /> },
  ];

  // ── Loading / Error ────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-slate-50"} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className={`font-semibold ${darkMode ? "text-gray-300" : "text-slate-600"}`}>Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-slate-50"} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className={`font-semibold mb-4 ${darkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-slate-50 text-slate-900"}`}>
      {/* ── HEADER ───────────────────────────── */}
      <header
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"} border-b px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-40`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s"
            alt="GJ Global Services Logo"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div>
            <h1 className={`text-lg font-black leading-none ${darkMode ? "text-white" : "text-slate-900"}`}>
              GJ GLOBAL <span className="text-blue-600">SERVICES</span>
            </h1>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-400"}`}>Learning Management System</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                view === key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <div className={`hidden sm:flex items-center gap-3 ${darkMode ? "bg-gray-700" : "bg-slate-100"} px-4 py-2 rounded-full`}>
              {user.profilePicture ? (
                <img src={getProfilePictureUrl(user.profilePicture)} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className={`text-sm font-bold leading-none ${darkMode ? "text-gray-100" : "text-slate-800"}`}>{user.username}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{user.email}</p>
              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-xl ${darkMode ? "bg-gray-700 text-gray-200" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setMobileMenuOpen((p) => !p)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"} px-4 py-3 flex flex-col gap-1`}
        >
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setView(key); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                view === key
                  ? "bg-blue-600 text-white"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* ── MAIN ─────────────────────────────── */}
      <main className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📚", bg: "bg-blue-100", value: courses.length, label: "Available Courses" },
            { icon: "🎓", bg: "bg-green-100", value: myEnrollments.length, label: "Enrolled Courses" },
            { icon: "✅", bg: "bg-yellow-100", value: myEnrollments.filter((e) => e.status === "completed").length, label: "Completed" },
            { icon: "🏆", bg: "bg-purple-100", value: myEnrollments.filter((e) => e.certificateIssued).length, label: "Certificates" },
          ].map(({ icon, bg, value, label }) => (
            <div
              key={label}
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} p-4 rounded-2xl border shadow-sm flex items-center gap-3`}
            >
              <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>{icon}</div>
              <div>
                <p className={`text-2xl font-extrabold leading-none ${darkMode ? "text-white" : "text-slate-900"}`}>{value}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACCESS */}
        <div className="grid md:grid-cols-1 gap-4 mb-8">
          <div
            onClick={() => setView("internships")}
            className={`p-5 rounded-2xl cursor-pointer border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
              darkMode ? "bg-gradient-to-r from-green-900 to-teal-900 border-gray-700 hover:border-green-500" : "bg-gradient-to-r from-green-50 to-teal-50 border-green-100 hover:border-green-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-green-500/30" : "bg-green-100"}`}>
                  <Briefcase className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Internship Opportunities</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-600"}`}>Apply for {internships.length} open positions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${darkMode ? "bg-green-500/30 text-green-400" : "bg-green-100 text-green-700"}`}>
                  {internships.length} Open
                </span>
                <ChevronRight className={darkMode ? "text-green-400" : "text-green-600"} size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            VIEW: COURSES
        ══════════════════════════════════════ */}
        {view === "courses" && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="text-blue-600" size={24} />
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>Available Courses</h2>
            </div>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              {courses.length} professional courses — enroll, learn, and earn certificates.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {courses.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  darkMode={darkMode}
                  enrollment={getEnrollment(c.id)}
                  enrollingId={enrollingId}
                  onEnroll={handleEnroll}
                  onOpenResources={() => setSelectedCourse(c)}
                  onGoToInternships={() => setView("internships")}
                  onContinue={() => setView("console")}
                  onPlayVideo={(v) => setSelectedVideo(v)}
                  onViewPDF={(p) => setSelectedPDF(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════
            VIEW: MY LEARNING
        ══════════════════════════════════════ */}
        {view === "console" && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="text-blue-600" size={24} />
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>My Learning Dashboard</h2>
            </div>

            {myEnrollments.length === 0 ? (
              <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
                <GraduationCap size={64} className="mx-auto text-slate-300 mb-4" />
                <p className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-slate-400"}`}>No enrolled courses yet.</p>
                <p className={`text-sm mb-6 ${darkMode ? "text-gray-500" : "text-slate-400"}`}>Browse our courses and start learning today!</p>
                <button
                  onClick={() => setView("courses")}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myEnrollments.map((enrollment) => {
                  const course = enrollment.course || courses.find((c) => c.id === enrollment.courseId) || {};
                  const isCompleted = enrollment.status === "completed";

                  return (
                    <div
                      key={enrollment._id}
                      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} p-5 rounded-2xl border hover:shadow-md transition-shadow`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{course.badge}</span>
                            {isCompleted && (
                              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Award size={12} /> Completed
                              </span>
                            )}
                          </div>
                          <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{course.title}</h3>
                          <p className={`text-xs flex items-center gap-3 mt-1 ${darkMode ? "text-gray-500" : "text-slate-400"}`}>
                            <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                            <span className="flex items-center gap-1"><BookOpen size={12} /> {course.instructor}</span>
                          </p>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className={darkMode ? "text-gray-400" : "text-slate-500"}>Progress</span>
                              <span className="font-bold text-blue-600">{enrollment.progress || 0}%</span>
                            </div>
                            <div className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-slate-200"}`}>
                              <div
                                className={`h-2 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-blue-600"}`}
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                            {/* ✅ Progress Update Buttons */}
                            {!isCompleted && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleUpdateProgress(enrollment._id, Math.min(100, (enrollment.progress || 0) + 10))}
                                  disabled={updatingProgress === enrollment._id}
                                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {updatingProgress === enrollment._id ? "Updating..." : "+10% Progress"}
                                </button>
                                <button
                                  onClick={() => handleUpdateProgress(enrollment._id, 100)}
                                  disabled={updatingProgress === enrollment._id}
                                  className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Mark Complete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={course.courseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                          >
                            <ExternalLink size={14} /> Continue Learning
                          </a>
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                          >
                            <Video size={14} /> Resources
                          </button>
                          <button
                            onClick={() => navigate("/assessment-test", { state: { enrollmentId: enrollment._id, courseId: enrollment.courseId } })}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${
                              enrollment.testScore
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : `border ${darkMode ? "border-blue-700 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"}`
                            }`}
                          >
                            {enrollment.testScore ? (
                              <><Award size={14} /> Score: {enrollment.testScore}%</>
                            ) : (
                              "📝 Take Assessment"
                            )}
                          </button>
                          {enrollment.certificateIssued && (
                            <a
                              href={course.certificateLink || enrollment.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
                            >
                              <Award size={14} /> Certificate
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════
            VIEW: INTERNSHIPS
        ══════════════════════════════════════ */}
        {view === "internships" && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="text-blue-600" size={24} />
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>Available Internships</h2>
            </div>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              {internships.length} open positions — apply and kickstart your career.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <div
                  key={internship.id}
                  className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} p-6 rounded-3xl border hover:shadow-xl transition-all duration-200 flex flex-col`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-bold text-xl ${darkMode ? "text-white" : "text-slate-900"}`}>{internship.role}</h3>
                      <p className={`text-sm font-semibold mt-0.5 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{internship.company}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-blue-900/50" : "bg-blue-50"}`}>
                      <Briefcase className="text-blue-600" size={22} />
                    </div>
                  </div>

                  <p className={`text-sm mb-4 leading-relaxed ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{internship.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold text-lg">{internship.stipend}</span>
                    </div>
                    <div className={`flex flex-wrap gap-3 text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                      <span className="flex items-center gap-1">📍 {internship.location}</span>
                      <span className="flex items-center gap-1">💼 {internship.type}</span>
                      <span className="flex items-center gap-1">⏱ {internship.duration}</span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-500" : "text-slate-400"}`}>Required Skills:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {internship.requirements?.map((req) => (
                        <span
                          key={req}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-100 text-slate-600"}`}
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {appliedInternships.includes(internship.id) ? (
                      <button
                        disabled
                        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Application Submitted
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyInternship(internship)}
                        disabled={applyingId === internship.id}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {applyingId === internship.id ? (
                          <><Loader2 size={16} className="animate-spin" /> Applying...</>
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════
            VIEW: RESOURCES
        ══════════════════════════════════════ */}
        {view === "resources" && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Video className="text-purple-600" size={24} />
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>Video Tutorials & PDF Resources</h2>
            </div>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              All learning materials organized by course — click videos to watch on YouTube, or download PDFs for offline study.
            </p>

            {/* ✅ FIX: Always render from COURSES fallback if courses state is somehow empty */}
            {(courses.length > 0 ? courses : COURSES).map((c) => (
              <div key={c.id} className={`mb-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} p-6 rounded-3xl border`}>
                {/* Course header */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{c.badge}</span>
                    <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{c.title}</h3>
                    <LevelBadge level={c.level} />
                  </div>
                  <a
                    href={c.courseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <ExternalLink size={14} /> Open Course
                  </a>
                </div>

                {/* ✅ Videos — always render if data exists */}
                {c.videoLinks && c.videoLinks.length > 0 ? (
                  <div className="mb-6">
                    <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${darkMode ? "text-gray-200" : "text-slate-700"}`}>
                      <PlayCircle className="text-red-500" size={18} />
                      Video Tutorials
                      <span className={`font-normal text-xs ${darkMode ? "text-gray-400" : "text-slate-400"}`}>
                        ({c.videoLinks.length} videos · opens YouTube)
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {c.videoLinks.map((video, i) => (
                        <VideoCard key={`${c.id}-vid-${i}`} video={video} darkMode={darkMode} large onPlay={(v) => { setSelectedVideo(v); }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm mb-4 ${darkMode ? "text-gray-500" : "text-slate-400"}`}>No video tutorials yet.</p>
                )}

                {/* ✅ PDFs — always render if data exists */}
                {c.pdfLinks && c.pdfLinks.length > 0 ? (
                  <div>
                    <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${darkMode ? "text-gray-200" : "text-slate-700"}`}>
                      <FileText className="text-red-500" size={18} />
                      PDF Study Materials
                      <span className={`font-normal text-xs ${darkMode ? "text-gray-400" : "text-slate-400"}`}>
                        ({c.pdfLinks.length} files)
                      </span>
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {c.pdfLinks.map((pdf, i) => (
                        <PDFCard key={`${c.id}-pdf-${i}`} pdf={pdf} darkMode={darkMode} onView={(p) => { setSelectedPDF(p); }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-500" : "text-slate-400"}`}>No PDF resources yet.</p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer
        className={`border-t py-8 text-center text-sm mt-12 ${darkMode ? "border-gray-700 text-gray-500" : "text-slate-400"}`}
      >
        <p className="font-semibold">© 2026 GJ Global Services. All rights reserved.</p>
        <p className="mt-1">Learning Management System · Powered by React</p>
      </footer>

      {/* ── RESOURCES MODAL ────────────────────── */}
      <ResourcesModal
        course={selectedCourse}
        darkMode={darkMode}
        onClose={() => setSelectedCourse(null)}
        onPlayVideo={(v) => setSelectedVideo(v)}
        onViewPDF={(p) => setSelectedPDF(p)}
      />

      {/* ── VIDEO MODAL ────────────────────── */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* ── PDF MODAL ────────────────────── */}
      {selectedPDF && (
        <PDFModal
          pdf={selectedPDF}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
  );
}
