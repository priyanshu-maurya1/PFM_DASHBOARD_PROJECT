import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { User, LogOut } from "lucide-react";

const ORG_NAME = "GJ Global Services";
const COURSES = ["Web Development", "Data Science", "AI & ML", "Cybersecurity", "Cloud Computing", "UI/UX Design"];
const COLLEGES = ["IIT Delhi", "BITS Pilani", "NIT Trichy", "VIT Vellore", "IIT Bombay", "IIIT Hyderabad", "Manipal Institute", "SRM Chennai", "Other"];
const storageKey = "gj_students_v2";

const G = {
  bg: "#f0f9ff", border: "rgba(59,130,246,0.15)", purple: "#3b82f6",
  violet: "#6366f1", gold: "#f59e0b", silver: "#94a3b8", bronze: "#cd7f32",
  text: "#1e293b", muted: "#64748b", green: "#22c55e", red: "#ef4444",
};

const QUIZ_BANK = {
  "Web Development": [
    { q: "What does HTML stand for?", opts: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Logic", "Home Tool Markup Language"], ans: 0 },
    { q: "Which CSS property controls text size?", opts: ["font-weight", "text-size", "font-size", "text-style"], ans: 2 },
    { q: "Which tag is used for JavaScript in HTML?", opts: ["<js>", "<script>", "<code>", "<javascript>"], ans: 1 },
    { q: "What does CSS stand for?", opts: ["Colorful Style Sheets", "Cascading Style Sheets", "Creative Style Syntax", "Computer Style Sheets"], ans: 1 },
    { q: "Which HTTP method sends form data?", opts: ["GET", "PUSH", "POST", "SEND"], ans: 2 },
    { q: "Correct HTML for a hyperlink?", opts: ["<a href='url'>", "<link url='url'>", "<href='url'>", "<url href='url'>"], ans: 0 },
    { q: "Which is NOT a JavaScript framework?", opts: ["React", "Django", "Vue", "Angular"], ans: 1 },
    { q: "What does 'responsive design' mean?", opts: ["Fast loading", "Adapts to screen sizes", "Uses animations", "Server-side rendering"], ans: 1 },
  ],
  "Data Science": [
    { q: "What does 'pandas' refer to in Python?", opts: ["A game library", "Data manipulation library", "Web framework", "ML library"], ans: 1 },
    { q: "What is a DataFrame?", opts: ["A video frame", "2D labeled data structure", "A database", "Graph structure"], ans: 1 },
    { q: "Which chart best shows distribution?", opts: ["Pie chart", "Line chart", "Histogram", "Bar chart"], ans: 2 },
    { q: "What is 'overfitting'?", opts: ["Model too simple", "Model memorizes training data", "Model underfits data", "Model is too fast"], ans: 1 },
    { q: "What is the mean of [2,4,6,8]?", opts: ["4", "5", "6", "3"], ans: 1 },
    { q: "Which library is used for ML in Python?", opts: ["NumPy", "Matplotlib", "Scikit-learn", "Seaborn"], ans: 2 },
    { q: "What does 'null' data represent?", opts: ["Zero value", "Missing value", "String value", "Infinite"], ans: 1 },
    { q: "What is feature engineering?", opts: ["Building software features", "Creating input variables for ML", "Engineering hardware", "Testing models"], ans: 1 },
  ],
  "AI & ML": [
    { q: "What is a neural network?", opts: ["Internet network", "System inspired by human brain", "Computer hardware", "Database system"], ans: 1 },
    { q: "What does 'training' a model mean?", opts: ["Teaching humans", "Learning patterns from data", "Writing code", "Testing software"], ans: 1 },
    { q: "What is supervised learning?", opts: ["Learning with labeled data", "Learning without data", "Learning with rewards", "Unsupervised learning"], ans: 0 },
    { q: "What does GPT stand for?", opts: ["General Purpose Technology", "Generative Pre-trained Transformer", "Graphics Processing Tool", "Global Python Toolkit"], ans: 1 },
    { q: "What is 'gradient descent'?", opts: ["Downhill skiing", "Optimization algorithm", "Data cleaning", "Visualization tool"], ans: 1 },
    { q: "What is an 'epoch' in ML training?", opts: ["A type of model", "One full pass through training data", "A learning rate", "A loss function"], ans: 1 },
    { q: "Which activation function outputs 0 or 1?", opts: ["ReLU", "Sigmoid", "Tanh", "Linear"], ans: 1 },
    { q: "What is transfer learning?", opts: ["Moving data between systems", "Using pre-trained model on new task", "Learning faster", "Copying datasets"], ans: 1 },
  ],
  "Cybersecurity": [
    { q: "What does VPN stand for?", opts: ["Virtual Private Network", "Very Private Node", "Verified Protocol Network", "Virtual Public Network"], ans: 0 },
    { q: "What is phishing?", opts: ["A fishing app", "Fraudulent attempt to steal info", "Network scanning", "File encryption"], ans: 1 },
    { q: "What does 'encryption' do?", opts: ["Deletes data", "Converts data to unreadable format", "Backs up data", "Compresses files"], ans: 1 },
    { q: "What is a firewall?", opts: ["Physical security", "Network security barrier", "Antivirus software", "Password manager"], ans: 1 },
    { q: "What is two-factor authentication?", opts: ["Two passwords", "Password + second verification", "Biometric only", "Email verification"], ans: 1 },
    { q: "What is SQL injection?", opts: ["Adding SQL databases", "Malicious SQL code attack", "Database backup", "Query optimization"], ans: 1 },
    { q: "What does HTTPS provide over HTTP?", opts: ["Faster speed", "Encrypted communication", "More storage", "Better SEO"], ans: 1 },
    { q: "What is a DDoS attack?", opts: ["Data deletion", "Overwhelming server with traffic", "Password cracking", "Malware installation"], ans: 1 },
  ],
  "Cloud Computing": [
    { q: "What is SaaS?", opts: ["Software as a Service", "Storage as a Solution", "Server as a System", "Security as a Service"], ans: 0 },
    { q: "Which is NOT a cloud provider?", opts: ["AWS", "Azure", "GCP", "Linux"], ans: 3 },
    { q: "What is 'serverless' computing?", opts: ["No servers exist", "Cloud manages servers automatically", "Local computing", "Offline computing"], ans: 1 },
    { q: "What does 'scalability' mean in cloud?", opts: ["Security feature", "Ability to grow resources as needed", "Data backup", "Network speed"], ans: 1 },
    { q: "What is a CDN?", opts: ["Content Delivery Network", "Cloud Data Node", "Central Database Network", "Code Deployment Node"], ans: 0 },
    { q: "What is 'elasticity' in cloud computing?", opts: ["Flexible pricing", "Auto-scaling up and down", "Data flexibility", "Network elasticity"], ans: 1 },
    { q: "What is IaaS?", opts: ["Internet as a Service", "Infrastructure as a Service", "Integration as a Service", "Intelligence as a Service"], ans: 1 },
    { q: "What is a container in cloud?", opts: ["Physical box", "Lightweight isolated app package", "Storage bucket", "Virtual machine"], ans: 1 },
  ],
  "UI/UX Design": [
    { q: "What does UX stand for?", opts: ["User Experience", "Unique Exchange", "Universal Extension", "User Extension"], ans: 0 },
    { q: "What is a wireframe?", opts: ["A metal frame", "Low-fidelity page layout sketch", "High-res mockup", "Final design"], ans: 1 },
    { q: "What is 'usability'?", opts: ["Visual appeal", "Ease of use", "Color scheme", "Code quality"], ans: 1 },
    { q: "What does 'CTA' mean in UI?", opts: ["Click To Action", "Call To Action", "Custom Text Area", "Content Type Area"], ans: 1 },
    { q: "What is the 'F-pattern' in UX?", opts: ["Font pattern", "How users scan screens (top then left)", "Filter pattern", "Form pattern"], ans: 1 },
    { q: "What is Figma used for?", opts: ["Writing code", "UI/UX design tool", "Database design", "Game development"], ans: 1 },
    { q: "What is 'whitespace' in design?", opts: ["White background", "Empty space between elements", "Error state", "Text color"], ans: 1 },
    { q: "What is A/B testing in UX?", opts: ["Testing two users", "Comparing two design versions", "Alpha beta testing", "Automated browser testing"], ans: 1 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("leaderboard");
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("course");
  const [animKey, setAnimKey] = useState(0);
  const [notification, setNotification] = useState(null);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [quizCourse, setQuizCourse] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const getProfilePictureUrl = (pic) => {
    if (!pic || typeof pic !== 'string') return '';
    if (pic.startsWith('http://') || pic.startsWith('https://')) return pic;
    if (pic.startsWith('/uploads/') || pic.startsWith('uploads/'))
      return `http://localhost:5000${pic.startsWith('/') ? '' : '/'}${pic}`;
    return `http://localhost:5000/uploads/${pic}`;
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target))
        setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleViewProfile = () => { setProfileDropdownOpen(false); navigate('/profile'); };

  const fetchLeaderboard = async () => {
    if (!isAuthenticated) {
      try { const s = localStorage.getItem(storageKey); if (s) setStudents(JSON.parse(s)); } catch (_) {}
      return;
    }
    try {
      setLoading(true); setError(null);
      const res = await api.get('/api/quiz/all-results');
      if (res.data?.leaderboard) {
        setStudents(res.data.leaderboard.map(e => ({
          id: e.id, name: e.username,
          college: e.college || "Student", course: e.course || "Web Development",
          score: e.score || 0, weekScore: 0, monthScore: 0,
          profilePicture: e.profilePicture || '', quizAttempts: e.quizAttempts || 1,
        })));
      }
    } catch (err) {
      console.error(err); setError('Failed to fetch leaderboard data');
      try { const s = localStorage.getItem(storageKey); if (s) setStudents(JSON.parse(s)); } catch (_) {}
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) setCurrentUser({
      id: user._id || user.id, name: user.username,
      college: user.college || "Student", course: user.course || "Web Development",
      score: 0, weekScore: 0, monthScore: 0, profilePicture: user.profilePicture || '',
    });
  }, [user]);

  useEffect(() => { fetchLeaderboard(); }, [isAuthenticated]);

  useEffect(() => {
    const poll = async () => {
      try {
        if (isAuthenticated) {
          const res = await api.get('/api/quiz/all-results');
          if (res.data?.leaderboard) {
            const fresh = res.data.leaderboard.map(e => ({
              id: e.id, name: e.username,
              college: e.college || "Student", course: e.course || "Web Development",
              score: e.score || 0, weekScore: 0, monthScore: 0,
              profilePicture: e.profilePicture || '', quizAttempts: e.quizAttempts || 1,
            }));
            setStudents(prev => { if (JSON.stringify(prev) !== JSON.stringify(fresh)) setAnimKey(k => k + 1); return fresh; });
          }
        } else {
          const s = localStorage.getItem(storageKey);
          if (s) { const fresh = JSON.parse(s); setStudents(prev => { if (JSON.stringify(prev) !== JSON.stringify(fresh)) setAnimKey(k => k + 1); return fresh; }); }
        }
      } catch (_) {}
    };
    const iv = setInterval(poll, 4000);
    return () => clearInterval(iv);
  }, [isAuthenticated]);

  const saveStudents = async (list) => {
    setStudents(list);
    try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch (_) {}
    if (isAuthenticated && currentUser) {
      try {
        const me = list.find(s => s.id === currentUser.id);
        if (me) await api.post('/api/quiz/submit', {
          username: me.name, college: me.college, course: me.course, role: 'student',
          week: new Date().toISOString().split('T')[0], score: me.score,
          correct: Math.floor(me.score / 50), total: 8,
          percentage: Math.round((me.score / 500) * 100),
          grade: me.score >= 400 ? 'A' : me.score >= 300 ? 'B' : me.score >= 200 ? 'C' : 'D',
          answers: [],
        });
      } catch (err) { console.error(err); }
    }
  };

  const notify = (msg, type = "success") => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3500); };

  const handleQuizDone = async ({ correct, total, course }) => {
    const points = correct * 50 + (correct === total ? 100 : 0);
    if (currentUser) {
      const existing = students.find(s => s.id === currentUser.id);
      const updated = existing
        ? students.map(s => s.id === currentUser.id
            ? { ...s, score: s.score + points, weekScore: s.weekScore + points, monthScore: s.monthScore + points, quizAttempts: (s.quizAttempts || 1) + 1 }
            : s)
        : [...students, { id: currentUser.id, name: currentUser.name, college: currentUser.college, course, score: points, weekScore: points, monthScore: points, profilePicture: currentUser.profilePicture || '', quizAttempts: 1 }];
      await saveStudents(updated);
      setCurrentUser(updated.find(s => s.id === currentUser.id));
      setScoreAnim(true); setTimeout(() => setScoreAnim(false), 500);
    }
    setQuizResult({ correct, total, points, course });
    setView("result");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s" alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-sky-700 to-indigo-600 bg-clip-text text-transparent">GJ Global Services</h1>
              <p className="text-xs text-slate-500">Leaderboard</p>
            </div>
          </div>
          {user && (
            <div className="relative" ref={profileDropdownRef}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors" onClick={() => setProfileDropdownOpen(o => !o)}>
                {user.profilePicture ? (
                  <img src={getProfilePictureUrl(user.profilePicture)} alt={user.username} className="w-10 h-10 rounded-full object-cover border-2 border-sky-400" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
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
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50">
                    <p className="text-sm font-semibold text-slate-800">{user.username || 'User'}</p>
                    <p className="text-xs text-slate-500">{user.email || 'No email'}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={handleViewProfile} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"><User size={16} /> View Full Profile</button>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"><LogOut size={16} /> Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <main className="p-6 pt-20 max-w-6xl mx-auto">
          {notification && <Notification {...notification} />}
          {view === "leaderboard" && <LeaderboardView students={students} currentUser={currentUser} activeTab={activeTab} setActiveTab={t => { setActiveTab(t); setAnimKey(k => k + 1); }} animKey={animKey} scoreAnim={scoreAnim} onStartQuiz={() => setView("quiz-pick")} loading={loading} error={error} />}
          {view === "quiz-pick" && <QuizPicker onBack={() => setView("leaderboard")} onPick={c => { setQuizCourse(c); setView("quiz"); }} />}
          {view === "quiz" && quizCourse && <QuizView course={quizCourse} currentUser={currentUser} onBack={() => setView("quiz-pick")} onDone={handleQuizDone} />}
          {view === "result" && quizResult && <ResultView result={quizResult} currentUser={currentUser} onLeaderboard={() => setView("leaderboard")} onRetry={() => setView("quiz-pick")} />}
        </main>
      </div>
    </div>
  );
}

// ── Notification ───────────────────────────────────────────────────────────────
function Notification({ msg, type }) {
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background: type==="success"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", border:`1px solid ${type==="success"?"rgba(34,197,94,0.4)":"rgba(239,68,68,0.4)"}`, borderRadius:12, padding:"12px 20px", color: type==="success"?"#4ade80":"#f87171", fontSize:14, fontWeight:600, maxWidth:320, backdropFilter:"blur(12px)" }}>
      {msg}
    </div>
  );
}

// ── Quiz Picker ────────────────────────────────────────────────────────────────
function QuizPicker({ onBack, onPick }) {
  const icons = { "Web Development":"🌐","Data Science":"📊","AI & ML":"🤖","Cybersecurity":"🔒","Cloud Computing":"☁️","UI/UX Design":"🎨" };
  const desc  = { "Web Development":"HTML, CSS, JS & frameworks","Data Science":"Pandas, stats & visualization","AI & ML":"Neural nets, training & models","Cybersecurity":"Threats, encryption & defense","Cloud Computing":"AWS, Azure & cloud concepts","UI/UX Design":"Wireframes, usability & Figma" };
  return (
    <div style={{ minHeight:"100vh", padding:"28px 16px", maxWidth:720, margin:"0 auto" }}>
      <button onClick={onBack} style={{ marginBottom:28, fontSize:12, background:"transparent", border:"1px solid rgba(14,165,233,0.2)", color:"#0ea5e9", borderRadius:10, padding:"10px 20px", fontWeight:600, cursor:"pointer" }}>← Back</button>
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontSize:48, marginBottom:10 }}>🧠</div>
        <h1 style={{ fontSize:30, fontWeight:800, color:"#1e293b" }}>Choose Your Quiz</h1>
        <p style={{ color:G.muted, fontSize:14, marginTop:6 }}>8 questions · 20s each · Up to 500 pts</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
        {COURSES.map(course => (
          <button key={course} onClick={() => onPick(course)} style={{ background:"#fff", border:"1px solid rgba(14,165,233,0.15)", borderRadius:16, padding:20, cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.2s" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{icons[course]}</div>
            <div style={{ fontWeight:700, fontSize:15, color:"#1e293b", marginBottom:4 }}>{course}</div>
            <div style={{ color:G.muted, fontSize:12, marginBottom:14 }}>{desc[course]}</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontSize:11, color:G.purple, fontWeight:700 }}>8 Qs · 500 pts max</span>
              <span style={{ marginLeft:"auto", color:G.muted }}>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Quiz View ──────────────────────────────────────────────────────────────────
function QuizView({ course, currentUser, onBack, onDone }) {
  const questions = QUIZ_BANK[course] || [];
  const [idx, setIdx]           = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [guestName, setGuestName] = useState("");
  const [nameReady, setNameReady] = useState(!!currentUser);
  const timerRef = useRef(null);
  const q = questions[idx];

  useEffect(() => { if (!nameReady) return; setTimeLeft(20); setSelected(null); setAnswered(false); }, [idx, nameReady]);

  useEffect(() => {
    if (!nameReady || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); doAnswer(null, score); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, answered, nameReady]);

  const doAnswer = (optIdx, curScore) => {
    clearInterval(timerRef.current);
    setSelected(optIdx); setAnswered(true);
    const correct = optIdx === q.ans;
    const ns = correct ? curScore + 1 : curScore;
    if (correct) setScore(ns);
    setTimeout(() => {
      if (idx + 1 >= questions.length) onDone({ correct: ns, total: questions.length, course, playerName: currentUser?.name || guestName });
      else setIdx(i => i + 1);
    }, 1100);
  };

  if (!nameReady) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420, textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🧠</div>
        <h2 style={{ fontSize:26, fontWeight:800, color:"#1e293b", marginBottom:6 }}>{course}</h2>
        <p style={{ color:G.muted, fontSize:14, marginBottom:28 }}>Enter your name to show on the leaderboard</p>
        <input style={{ width:"100%", background:"#fff", border:"1px solid rgba(14,165,233,0.2)", borderRadius:12, padding:"13px 16px", color:"#1e293b", fontSize:16, marginBottom:12, textAlign:"center", outline:"none" }}
          placeholder="Your name" value={guestName} onChange={e => setGuestName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && guestName.trim() && setNameReady(true)} autoFocus />
        <button style={{ width:"100%", background:"linear-gradient(135deg,#0ea5e9,#38bdf8)", border:"none", color:"#fff", borderRadius:12, padding:"13px 26px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10 }} onClick={() => guestName.trim() && setNameReady(true)} disabled={!guestName.trim()}>🚀 Start Quiz</button>
        <button style={{ width:"100%", background:"transparent", border:"1px solid rgba(14,165,233,0.2)", color:"#0ea5e9", borderRadius:10, padding:"10px 20px", fontWeight:600, cursor:"pointer", marginBottom:16 }} onClick={() => { setGuestName("Anonymous"); setNameReady(true); }}>Play Anonymously</button>
        <button style={{ background:"none", border:"none", color:G.muted, fontSize:13, cursor:"pointer" }} onClick={onBack}>← Back to courses</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", padding:"24px 16px", maxWidth:620, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <button style={{ background:"transparent", border:"1px solid rgba(14,165,233,0.2)", color:"#0ea5e9", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }} onClick={onBack}>✕ Quit</button>
        <div style={{ fontSize:13, color:G.muted }}>Q {idx+1} / {questions.length}</div>
        <div style={{ fontSize:16, fontWeight:800, color:timeLeft<=5?G.red:G.purple }}>{timeLeft}s</div>
      </div>
      <div style={{ height:4, background:"rgba(59,130,246,0.1)", borderRadius:2, marginBottom:6, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:"linear-gradient(90deg,#0ea5e9,#38bdf8)", borderRadius:2, transition:"width 0.3s" }} />
      </div>
      <div style={{ height:4, background:"rgba(59,130,246,0.08)", borderRadius:2, marginBottom:28, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(timeLeft/20)*100}%`, borderRadius:2, background:timeLeft<=5?"linear-gradient(90deg,#ef4444,#f97316)":"linear-gradient(90deg,#0ea5e9,#38bdf8)", transition:"width 0.8s linear" }} />
      </div>
      <span style={{ fontSize:11, background:"rgba(59,130,246,0.15)", color:"#2563eb", padding:"4px 12px", borderRadius:20, fontWeight:700, marginBottom:20, display:"inline-block" }}>{course}</span>
      <div key={idx} style={{ marginTop:14, marginBottom:28 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#1e293b", lineHeight:1.45 }}>{q.q}</h2>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {q.opts.map((opt, i) => {
          const isCorrect = answered && i === q.ans;
          const isWrong   = answered && i === selected && i !== q.ans;
          return (
            <button key={i} disabled={answered} onClick={() => doAnswer(i, score)}
              style={{ background: isCorrect?"rgba(34,197,94,0.15)":isWrong?"rgba(239,68,68,0.12)":"#fff", border: `1.5px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":"rgba(14,165,233,0.15)"}`, borderRadius:14, padding:"14px 18px", textAlign:"left", color: isCorrect?"#16a34a":isWrong?"#dc2626":"#475569", fontSize:14, fontWeight:600, cursor:answered?"default":"pointer", width:"100%", transition:"all 0.18s" }}>
              <span style={{ opacity:0.45, marginRight:10, fontSize:12 }}>{["A","B","C","D"][i]}</span>{opt}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop:24, textAlign:"center", color:G.muted, fontSize:13 }}>✅ {score} correct · {score*50} pts earned</div>
    </div>
  );
}

// ── Result View ────────────────────────────────────────────────────────────────
function ResultView({ result, currentUser, onLeaderboard, onRetry }) {
  const { correct, total, points, course } = result;
  const pct = Math.round((correct / total) * 100);
  const isPerfect = correct === total;
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪";
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:460, textAlign:"center" }}>
        <div style={{ fontSize:68, marginBottom:14 }}>{emoji}</div>
        <h1 style={{ fontSize:30, fontWeight:800, color:"#1e293b", marginBottom:6 }}>{isPerfect?"Perfect Score! 🎉":pct>=70?"Great Job!":"Quiz Complete!"}</h1>
        <p style={{ color:G.muted, fontSize:14, marginBottom:28 }}>{course}</p>
        <div style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:20, padding:"26px 22px", marginBottom:22 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            {[["#3b82f6",`${correct}/${total}`,"Correct"],["#38bdf8",`${pct}%`,"Accuracy"],[G.gold,`+${points}`,"Points"]].map(([color,val,label]) => (
              <div key={label}><div style={{ fontSize:30, fontWeight:800, color }}>{val}</div><div style={{ color:G.muted, fontSize:12, marginTop:4 }}>{label}</div></div>
            ))}
          </div>
          {isPerfect && <div style={{ marginTop:14, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"8px 14px", color:"#d97706", fontSize:13, fontWeight:700 }}>🌟 +100 Bonus for perfect score!</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={onLeaderboard} style={{ background:"linear-gradient(135deg,#0ea5e9,#38bdf8)", border:"none", color:"#fff", borderRadius:12, padding:"13px 26px", fontSize:15, fontWeight:700, cursor:"pointer" }}>View Leaderboard 🏆</button>
          <button onClick={onRetry}       style={{ background:"transparent", border:"1px solid rgba(14,165,233,0.2)", color:"#0ea5e9", borderRadius:10, padding:"10px 20px", fontWeight:600, cursor:"pointer" }}>Try Another Quiz →</button>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard View ───────────────────────────────────────────────────────────
function LeaderboardView({ students, currentUser, activeTab, setActiveTab, scoreAnim, onStartQuiz, loading, error }) {
  const ITEMS_PER_PAGE = 10;
  const tabs = [
    { key:"course",   label:"All-Time", icon:"📚" },
    { key:"weekly",   label:"Weekly",   icon:"⚡" },
    { key:"monthly",  label:"Monthly",  icon:"📅" },
    { key:"college",  label:"College",  icon:"🏫" },
  ];

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when tab changes
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  // ── Build ranked list ───────────────────────────────────────────────────────
  const ranked = (() => {
    if (activeTab === "college") {
      const map = {};
      students.forEach(s => {
        if (!map[s.college]) map[s.college] = { name: s.college, score: 0, students: 0 };
        map[s.college].score    += s.score;
        map[s.college].students += 1;
      });
      return Object.values(map).sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
    }
    const sf = activeTab === "weekly" ? "weekScore" : activeTab === "monthly" ? "monthScore" : "score";
    return [...students].sort((a, b) => b[sf] - a[sf]).map((s, i) => ({ ...s, rank: i + 1, displayScore: s[sf] }));
  })();

  const totalPages = Math.max(1, Math.ceil(ranked.length / ITEMS_PER_PAGE));
  // Clamp so switching tabs with fewer pages never leaves stale page
  const page      = Math.min(currentPage, totalPages);
  const startIdx  = (page - 1) * ITEMS_PER_PAGE;
  const pageRows  = ranked.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const myRank    = currentUser ? ranked.findIndex(r => r.id === currentUser.id) + 1 : 0;

  const goToPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Button style helper
  const paginationBtn = (disabled) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 10, boxSizing: 'border-box',
    border:      disabled ? '1px solid #e2e8f0' : '1px solid #3b82f6',
    background:  disabled ? '#f1f5f9'           : '#ffffff',
    color:       disabled ? '#94a3b8'           : '#3b82f6',
    fontSize: 13, fontWeight: 700,
    cursor:      disabled ? 'not-allowed'       : 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm text-gray-500 dark:text-gray-400">LIVE · {students.length} students · {ORG_NAME}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="flex items-center gap-2 text-sm text-gray-500"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>Loading...</div>}
            <button onClick={onStartQuiz} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg flex items-center gap-2 font-medium transition-all">
              <span>🧠</span> Take Quiz
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>}

      {/* My Rank */}
      {currentUser && myRank > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-700/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.name} size={44} gradient="linear-gradient(135deg,#3b82f6,#6366f1)" profilePicture={currentUser.profilePicture} />
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">Your Ranking</div>
                <div className="text-sm text-gray-500">{currentUser.college} · {currentUser.course}</div>
              </div>
            </div>
            <div className="flex gap-6">
              {[["#"+myRank,"Rank","text-blue-600"],[(currentUser.score||0).toLocaleString(),"Points","text-indigo-600"],[currentUser.quizAttempts||1,"Quizzes","text-purple-600"]].map(([val, label, cls]) => (
                <div key={label} className="text-center">
                  <div className={`text-2xl font-bold ${cls} ${label==="Points"&&scoreAnim?"animate-bounce":""}`}>{val}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab===t.key?"bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg":"bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white border border-gray-200 dark:border-gray-600"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Empty */}
      {ranked.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-white/20">
          <div className="text-5xl mb-4">📭</div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">No students yet</div>
          <p className="text-gray-500 mt-2 mb-6">Be the first — take a quiz now!</p>
          <button onClick={onStartQuiz} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium">🧠 Take Quiz</button>
        </div>
      )}

      {/* Podium */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[ranked[1], ranked[0], ranked[2]].map((p, i) => {
            const center = i === 1;
            const rank   = center ? 1 : i === 0 ? 2 : 3;
            const grads  = ["linear-gradient(135deg,#3b82f6,#6366f1)","linear-gradient(135deg,#94a3b8,#cbd5e1)","linear-gradient(135deg,#cd7f32,#b8860b)"];
            return (
              <div key={p.name+i} style={{ marginTop: center ? 0 : 16 }}
                className={`rounded-2xl p-5 text-center ${center?"bg-gradient-to-b from-blue-100 to-white dark:from-blue-900/30 dark:to-gray-800 border-2 border-blue-300":"bg-white/80 dark:bg-gray-800/80 border border-gray-200"}`}>
                <Avatar name={p.name} size={48} gradient={grads[rank-1]} profilePicture={p.profilePicture} />
                <div className="text-2xl mt-2">{["🥇","🥈","🥉"][rank-1]}</div>
                <div className="font-semibold text-gray-800 dark:text-white mt-1">{p.name}</div>
                <div className="text-xs text-gray-500">{p.college||"—"}</div>
                <div className="font-bold text-lg mt-2" style={{ color: center?"#3b82f6":"#64748b" }}>
                  {(p.displayScore??p.score).toLocaleString()} <span className="text-xs opacity-50">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full Table ── */}
      {ranked.length > 0 && (
        <div style={{ boxSizing:'border-box', background:'rgba(255,255,255,0.85)', borderRadius:16, border:'1px solid rgba(226,232,240,0.8)', overflow:'hidden', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.07)' }}>

          {/* Table head */}
          <div style={{ display:'grid', gridTemplateColumns:'52px 1fr 88px 130px', padding:'13px 20px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', boxSizing:'border-box' }}>
            {['#','Student','Quizzes','Score'].map((h, i) => (
              <div key={h} style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', textAlign: i >= 2 ? (i===2?'center':'right') : 'left' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {pageRows.map((p, i) => {
            const absIdx  = startIdx + i;
            const isMe    = currentUser && p.id === currentUser.id;
            const score   = p.displayScore ?? p.score;
            const barPct  = Math.round((score / ((ranked[0]?.displayScore ?? ranked[0]?.score) || 1)) * 100);
            const rankClr = ['#f59e0b','#94a3b8','#cd7f32'];
            return (
              <div key={p.id || p.name + i}
                style={{
                  display:'grid', gridTemplateColumns:'52px 1fr 88px 130px',
                  padding:'13px 20px', borderBottom:'1px solid #f1f5f9',
                  alignItems:'center', boxSizing:'border-box',
                  background: isMe ? 'rgba(59,130,246,0.05)' : 'transparent',
                  borderLeft: isMe ? '3px solid #3b82f6' : '3px solid transparent',
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(14,165,233,0.03)'; }}
                onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Rank cell */}
                <div style={{ fontWeight:800, fontSize:15, color: absIdx<3 ? rankClr[absIdx] : '#94a3b8' }}>
                  {absIdx < 3 ? ["🥇","🥈","🥉"][absIdx] : `#${p.rank}`}
                </div>

                {/* Student cell */}
                <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                  <Avatar name={p.name} size={34} gradient={absIdx<3?"linear-gradient(135deg,#3b82f6,#6366f1)":"linear-gradient(135deg,#94a3b8,#cbd5e1)"} profilePicture={p.profilePicture} />
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:600, fontSize:14, color: isMe?'#3b82f6':'#1e293b' }}>{p.name}</span>
                      {isMe && <span style={{ padding:'1px 8px', background:'rgba(59,130,246,0.12)', color:'#3b82f6', fontSize:11, fontWeight:700, borderRadius:20 }}>YOU</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3 }}>
                      <span style={{ fontSize:12, color:'#64748b' }}>{activeTab==="college"?`${p.students} students`:p.college}</span>
                      <div style={{ flex:1, height:4, background:'#e2e8f0', borderRadius:2, overflow:'hidden', maxWidth:80 }}>
                        <div style={{ height:'100%', width:`${barPct}%`, background: absIdx===0?'linear-gradient(90deg,#3b82f6,#6366f1)':'#94a3b8', borderRadius:2, transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quizzes cell */}
                <div style={{ textAlign:'center' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', background:'rgba(139,92,246,0.1)', color:'#7c3aed', fontSize:12, fontWeight:700, borderRadius:20 }}>
                    {p.quizAttempts||1} 📝
                  </span>
                </div>

                {/* Score cell */}
                <div style={{ textAlign:'right', fontWeight:800, fontSize:15, color: absIdx===0?'#3b82f6':absIdx<3?'#64748b':'#94a3b8' }}>
                  {score.toLocaleString()} <span style={{ fontSize:11, opacity:0.45, fontWeight:400 }}>pts</span>
                </div>
              </div>
            );
          })}

          {/* ── Pagination footer ── */}
          {totalPages > 1 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid #e2e8f0', background:'#f8fafc', boxSizing:'border-box' }}>
              <button onClick={goToPrev} disabled={page === 1} style={paginationBtn(page === 1)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                Previous
              </button>

              <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>
                Page <strong style={{ color:'#3b82f6' }}>{page}</strong> of <strong style={{ color:'#3b82f6' }}>{totalPages}</strong>
                <span style={{ marginLeft:8, color:'#94a3b8', fontSize:12 }}>({ranked.length} total)</span>
              </span>

              <button onClick={goToNext} disabled={page >= totalPages} style={paginationBtn(page >= totalPages)}>
                Next
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">{ORG_NAME} · Live updates every 4s</div>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36, gradient, profilePicture }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const getUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http://') || pic.startsWith('https://')) return pic;
    if (pic.startsWith('/uploads/') || pic.startsWith('uploads/')) return `http://localhost:5000${pic.startsWith('/') ? '' : '/'}${pic}`;
    return `http://localhost:5000/uploads/${pic}`;
  };
  const url = profilePicture ? getUrl(profilePicture) : '';
  if (url) return <img src={url} alt={name||'User'} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:gradient||"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36, fontWeight:800, color:"#fff", flexShrink:0 }}>
      {initials}
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ color:"#aaa", fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>{label}</label>
      {children}
      {error && <p style={{ color:G.red, fontSize:12, marginTop:4 }}>{error}</p>}
    </div>
  );
}