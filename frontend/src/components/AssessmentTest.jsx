import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Timer, Award, CheckCircle, Lock, Mail, Download, Mic, ShieldCheck, AlertTriangle, Eye, BookOpen, Send, XCircle, UserX, MonitorX, Copy } from 'lucide-react';
import { jsPDF } from "jspdf";
import api from '../utils/api';


  const QUESTIONS = [
    // Original HTML/CSS/React/JS questions (10 questions)
    { q: "Which HTML element is used for the largest heading?", options: ["<head>", "<h6>", "<h1>", "<heading>"], correct: 2, category: "Web Dev" },
    { q: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1, category: "Web Dev" },
    { q: "Which hook is used for state management in React?", options: ["useEffect", "useContext", "useState", "useReducer"], correct: 2, category: "React" },
    { q: "What is the purpose of the 'key' prop in React lists?", options: ["To style elements", "To help React identify changed items", "To encrypt data", "To create animations"], correct: 1, category: "React" },
    { q: "Which JavaScript method is used to add elements to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], correct: 0, category: "Web Dev" },
    { q: "What is the virtual DOM in React?", options: ["A real DOM copy", "A lightweight copy of the real DOM in memory", "A database", "A CSS framework"], correct: 1, category: "React" },
    { q: "Which attribute is used to define inline styles in HTML?", options: ["font", "class", "styles", "style"], correct: 3, category: "Web Dev" },
    { q: "What does API stand for?", options: ["Application Programming Interface", "Advanced Programming Interface", "Application Process Integration", "Automated Programming Interface"], correct: 0, category: "Web Dev" },
    { q: "Which HTTP method is used to retrieve data?", options: ["POST", "PUT", "GET", "DELETE"], correct: 2, category: "Web Dev" },
    { q: "What is JSX in React?", options: ["JavaScript XML", "JavaScript Extension", "Java Syntax Extension", "JSON XML"], correct: 0, category: "React" },
  
    // Math Reasoning (7 questions)
    { q: "If x + 5 = 12, what is the value of x?", options: ["5", "7", "12", "17"], correct: 1, category: "Math" },
    { q: "What is 15% of 200?", options: ["15", "20", "30", "35"], correct: 2, category: "Math" },
    { q: "If a triangle has angles of 60° and 70°, what is the third angle?", options: ["40°", "50°", "60°", "70°"], correct: 1, category: "Math" },
    { q: "What is the next number in the sequence: 2, 4, 8, 16, __?", options: ["20", "24", "32", "64"], correct: 2, category: "Math" },
    { q: "If a rectangle has length 8 and width 5, what is its area?", options: ["13", "26", "40", "80"], correct: 2, category: "Math" },
    { q: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1, category: "Math" },
    { q: "If 3x = 21, what is x?", options: ["6", "7", "8", "9"], correct: 1, category: "Math" },
  
    // MongoDB (7 questions)
    { q: "What type of database is MongoDB?", options: ["Relational", "NoSQL Document", "Graph", "Key-Value"], correct: 1, category: "MongoDB" },
    { q: "Which command is used to insert a document in MongoDB?", options: ["add()", "insert()", "insertOne()", "create()"], correct: 2, category: "MongoDB" },
    { q: "What is the default port for MongoDB?", options: ["3306", "5432", "27017", "8080"], correct: 2, category: "MongoDB" },
    { q: "Which operator is used to match documents in MongoDB queries?", options: ["$match", "$find", "$search", "$select"], correct: 0, category: "MongoDB" },
    { q: "What format does MongoDB use to store data?", options: ["XML", "JSON", "BSON", "CSV"], correct: 2, category: "MongoDB" },
    { q: "Which method is used to retrieve all documents from a collection?", options: ["getAll()", "find()", "select()", "fetchAll()"], correct: 1, category: "MongoDB" },
    { q: "What is a collection in MongoDB?", options: ["A table", "A group of documents", "A database", "A field"], correct: 1, category: "MongoDB" },
  
    // Git (7 questions)
    { q: "Which command initializes a new Git repository?", options: ["git start", "git init", "git create", "git new"], correct: 1, category: "Git" },
    { q: "What does 'git clone' do?", options: ["Deletes a repository", "Creates a copy of a repository", "Merges branches", "Commits changes"], correct: 1, category: "Git" },
    { q: "Which command shows the status of your working directory?", options: ["git check", "git status", "git info", "git show"], correct: 1, category: "Git" },
    { q: "What does 'git pull' do?", options: ["Pushes changes", "Fetches and merges changes", "Creates a branch", "Deletes a branch"], correct: 1, category: "Git" },
    { q: "Which command is used to create a new branch?", options: ["git new-branch", "git branch", "git create", "git checkout"], correct: 1, category: "Git" },
    { q: "What does 'git commit' do?", options: ["Uploads to remote", "Saves changes to local repository", "Creates a branch", "Merges branches"], correct: 1, category: "Git" },
    { q: "Which command merges branches?", options: ["git combine", "git merge", "git join", "git unite"], correct: 1, category: "Git" },
  
    // Cybersecurity (7 questions)
    { q: "What does HTTPS stand for?", options: ["Hypertext Transfer Protocol Secure", "High Transfer Protocol System", "Hypertext Transmission Protocol Safe", "HTTP Security"], correct: 0, category: "Cybersecurity" },
    { q: "What is phishing?", options: ["A type of virus", "A social engineering attack", "A firewall", "An encryption method"], correct: 1, category: "Cybersecurity" },
    { q: "What does a firewall do?", options: ["Encrypts data", "Monitors and controls network traffic", "Stores passwords", "Scans for viruses"], correct: 1, category: "Cybersecurity" },
    { q: "What is SQL injection?", options: ["A database optimization", "A code injection attack", "A password manager", "A backup method"], correct: 1, category: "Cybersecurity" },
    { q: "What does VPN stand for?", options: ["Virtual Private Network", "Very Private Network", "Virtual Protocol Network", "Verified Private Network"], correct: 0, category: "Cybersecurity" },
    { q: "What is two-factor authentication?", options: ["Two passwords", "Extra security layer requiring two forms of verification", "Dual firewall", "Two antivirus programs"], correct: 1, category: "Cybersecurity" },
    { q: "What is malware?", options: ["Good software", "Malicious software", "System software", "Open-source software"], correct: 1, category: "Cybersecurity" },
  
    // SQL (7 questions)
    { q: "Which SQL statement is used to retrieve data?", options: ["GET", "SELECT", "FETCH", "RETRIEVE"], correct: 1, category: "SQL" },
    { q: "What does 'WHERE' clause do in SQL?", options: ["Sorts data", "Filters data", "Joins tables", "Groups data"], correct: 1, category: "SQL" },
    { q: "Which command is used to add new records?", options: ["ADD", "INSERT", "CREATE", "NEW"], correct: 1, category: "SQL" },
    { q: "What does 'JOIN' do in SQL?", options: ["Combines rows from tables", "Deletes data", "Creates tables", "Updates records"], correct: 0, category: "SQL" },
    { q: "Which keyword removes duplicate rows?", options: ["UNIQUE", "DISTINCT", "DIFFERENT", "REMOVE"], correct: 1, category: "SQL" },
    { q: "What does 'GROUP BY' do?", options: ["Filters rows", "Groups rows with same values", "Sorts data", "Joins tables"], correct: 1, category: "SQL" },
    { q: "Which command deletes a table?", options: ["DELETE TABLE", "REMOVE TABLE", "DROP TABLE", "ERASE TABLE"], correct: 2, category: "SQL" },
  
    // DBMS (7 questions)
    { q: "What does DBMS stand for?", options: ["Data Base Management System", "Database Management System", "Digital Base Management System", "Data Business Management System"], correct: 1, category: "DBMS" },
    { q: "What is a primary key?", options: ["A duplicate key", "A unique identifier for records", "A foreign key", "An index"], correct: 1, category: "DBMS" },
    { q: "What is normalization in DBMS?", options: ["Backing up data", "Organizing data to reduce redundancy", "Encrypting data", "Indexing data"], correct: 1, category: "DBMS" },
    { q: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Advanced, Controlled, Isolated, Durable", "Atomic, Complete, Isolated, Durable", "All, Consistent, Independent, Dependent"], correct: 0, category: "DBMS" },
    { q: "What is a foreign key?", options: ["A primary key in another table", "A unique key", "An encrypted key", "A backup key"], correct: 0, category: "DBMS" },
    { q: "What is an index in DBMS?", options: ["A backup", "A data structure to speed up queries", "A type of key", "A constraint"], correct: 1, category: "DBMS" },
    { q: "What is a transaction in DBMS?", options: ["A backup", "A sequence of operations performed as a single unit", "A query", "A table"], correct: 1, category: "DBMS" },
  
    // Python (8 questions)
    { q: "Which keyword is used to define a function in Python?", options: ["function", "def", "func", "define"], correct: 1, category: "Python" },
    { q: "What is the output of: print(2 ** 3)?", options: ["5", "6", "8", "9"], correct: 2, category: "Python" },
    { q: "Which data structure is ordered and mutable in Python?", options: ["Tuple", "Set", "List", "Dictionary"], correct: 2, category: "Python" },
    { q: "What does 'len()' function do?", options: ["Calculates length", "Returns length of object", "Creates list", "Deletes elements"], correct: 1, category: "Python" },
    { q: "Which operator is used for floor division?", options: ["/", "//", "%", "**"], correct: 1, category: "Python" },
    { q: "What is the correct way to create a dictionary?", options: ["[]", "{}", "()", "<<>>"], correct: 1, category: "Python" },
    { q: "Which method adds an element to a list?", options: ["add()", "append()", "insert()", "push()"], correct: 1, category: "Python" },
    { q: "What does 'import' keyword do?", options: ["Exports data", "Includes external modules", "Creates variables", "Deletes functions"], correct: 1, category: "Python" },
  
    // C Programming (10 questions)
    { q: "What is the correct syntax to declare a pointer in C?", options: ["int ptr;", "int *ptr;", "int &ptr;", "pointer int ptr;"], correct: 1, category: "C Programming" },
    { q: "Which header file is required for printf() and scanf()?", options: ["<stdlib.h>", "<conio.h>", "<stdio.h>", "<string.h>"], correct: 2, category: "C Programming" },
    { q: "What does 'malloc()' function do?", options: ["Frees memory", "Allocates memory dynamically", "Copies memory", "Compares memory"], correct: 1, category: "C Programming" },
    { q: "Which operator is used to access the value of a pointer?", options: ["&", "*", "->", "::"], correct: 1, category: "C Programming" },
    { q: "What is the size of 'int' data type in C (typically)?", options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"], correct: 2, category: "C Programming" },
    { q: "Which loop is guaranteed to execute at least once?", options: ["for loop", "while loop", "do-while loop", "nested loop"], correct: 2, category: "C Programming" },
    { q: "What does 'sizeof()' operator return?", options: ["Value of variable", "Size in bytes", "Address of variable", "Type of variable"], correct: 1, category: "C Programming" },
    { q: "Which function is used to allocate memory for an array?", options: ["malloc()", "calloc()", "realloc()", "Both malloc() and calloc()"], correct: 3, category: "C Programming" },
    { q: "What is the output of: printf(\"%d\", 5/2); ?", options: ["2.5", "2", "3", "Error"], correct: 1, category: "C Programming" },
    { q: "Which keyword is used to prevent modification of a variable?", options: ["static", "const", "volatile", "extern"], correct: 1, category: "C Programming" },
  
    // Additional React Questions (10 questions)
    { q: "What is the purpose of useEffect hook?", options: ["To manage state", "To handle side effects", "To create context", "To optimize performance"], correct: 1, category: "React" },
    { q: "Which method is used to update state in class components?", options: ["updateState()", "setState()", "changeState()", "modifyState()"], correct: 1, category: "React" },
    { q: "What does 'props' stand for in React?", options: ["Properties", "Proposals", "Protocols", "Procedures"], correct: 0, category: "React" },
    { q: "Which hook is used to access context in functional components?", options: ["useContext", "useProvider", "useConsumer", "useValue"], correct: 0, category: "React" },
    { q: "What is the correct way to pass a function as a prop?", options: ["prop={function()}", "prop='function'", "prop={functionName}", "prop=function"], correct: 2, category: "React" },
    { q: "Which lifecycle method is called after component renders?", options: ["componentWillMount", "componentDidMount", "componentWillUpdate", "shouldComponentUpdate"], correct: 1, category: "React" },
    { q: "What does useRef hook return?", options: ["A state value", "A mutable ref object", "A callback function", "A context value"], correct: 1, category: "React" },
    { q: "How do you conditionally render components in React?", options: ["if-else statements only", "Ternary operators or &&", "switch statements only", "for loops"], correct: 1, category: "React" },
    { q: "What is React.Fragment used for?", options: ["Creating fragments of code", "Grouping elements without extra DOM nodes", "Breaking components", "Creating loops"], correct: 1, category: "React" },
    { q: "Which hook is used for performance optimization?", options: ["useState", "useEffect", "useMemo", "useContext"], correct: 2, category: "React" },
  ];
 

// Group questions by category for section-based display
const QUESTIONS_BY_CATEGORY = {
  "Web Dev": QUESTIONS.filter(q => q.category === "Web Dev"),
  "React": QUESTIONS.filter(q => q.category === "React"),
  "Math": QUESTIONS.filter(q => q.category === "Math"),
  "MongoDB": QUESTIONS.filter(q => q.category === "MongoDB"),
  "Git": QUESTIONS.filter(q => q.category === "Git"),
  "Cybersecurity": QUESTIONS.filter(q => q.category === "Cybersecurity"),
  "SQL": QUESTIONS.filter(q => q.category === "SQL"),
  "Python": QUESTIONS.filter(q => q.category === "Python"),
  "C Programming": QUESTIONS.filter(q => q.category === "C Programming"),
};

// Two main sections for the assessment
const SECTIONS = [
  {
    name: "Programming & Web Development",
    categories: ["Web Dev", "React", "Python", "C Programming", "SQL", "MongoDB", "Git"]
  },
  {
    name: "Mathematics & Applied Skills",
    categories: ["Math", "Cybersecurity"]
  }
];

// Group questions by the two main sections
const QUESTIONS_BY_SECTION = {
  "Programming & Web Development": QUESTIONS.filter(q => 
    ["Web Dev", "React", "Python", "C Programming", "SQL", "MongoDB", "Git"].includes(q.category)
  ),
  "Mathematics & Applied Skills": QUESTIONS.filter(q => 
    ["Math", "Cybersecurity"].includes(q.category)
  )
};

const CATEGORIES = Object.keys(QUESTIONS_BY_SECTION);

export default function AssessmentPlatform() {
  const [view, setView] = useState('login');
  const [credentials, setCredentials] = useState({ fullName: '', email: '' });
  const [authError, setAuthError] = useState('');
  
  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  // devOtp removed - production ready
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0); // Track current section
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [score, setScore] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [proctoringLogs, setProctoringLogs] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [examBlocked, setExamBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [faceDetectionCount, setFaceDetectionCount] = useState(0);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(0);
  const [noFaceDetected, setNoFaceDetected] = useState(0);
  const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [mouseLeaveCount, setMouseLeaveCount] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [examEndTime, setExamEndTime] = useState(null);
  const [attemptStatus, setAttemptStatus] = useState('checking');
  const [certificateId, setCertificateId] = useState('');
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Generate unique certificate ID
  const generateCertificateId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GJGS-${timestamp}-${random}`;
  }, []);

  // Generate unique browser fingerprint
  const generateFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const fingerprint = canvas.toDataURL();
    
    const data = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: fingerprint,
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(data));
  }, []);

  // Generate QR Code using canvas
  const generateQRCode = useCallback((text) => {
    const canvas = document.createElement('canvas');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Simple QR-like pattern (placeholder - in production use a real QR library)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    const blockSize = 10;
    const textHash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < size / blockSize; i++) {
      for (let j = 0; j < size / blockSize; j++) {
        if ((i * j * textHash) % 3 === 0) {
          ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
        }
      }
    }
    
    // Add positioning squares
    const drawPositionSquare = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, 30, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 5, y + 5, 20, 20);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 10, y + 10, 10, 10);
    };
    
    drawPositionSquare(0, 0);
    drawPositionSquare(size - 30, 0);
    drawPositionSquare(0, size - 30);
    
    return canvas.toDataURL();
  }, []);

  
  // Load company logo from URL
  const loadCompanyLogo = useCallback(async () => {
    const logoUrl = 'https://static.vecteezy.com/system/resources/previews/005/284/105/non_2x/financial-accounting-logo-creative-finance-logo-vector.jpg';
    
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to load logo:', error);
      return null;
    }
  }, []);

  // Load medal image from URL
  const loadMedalImage = useCallback(async () => {
    const medalUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlqDuMSzRuml5-4PuPrA5GeXuOe2_1uhQ2DtQxC0QJOQ&s';
    
    try {
      const response = await fetch(medalUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to load medal:', error);
      return null;
    }
  }, []);

  // Database functions (localStorage simulation)
  const saveToDatabase = useCallback((data) => {
    try {
      const db = JSON.parse(localStorage.getItem('examDatabase') || '{}');
      const userKey = credentials.email.toLowerCase();
      
      if (!db[userKey]) {
        db[userKey] = {
          attempts: [],
          fingerprints: []
        };
      }
      
      db[userKey].attempts.push({
        ...data,
        attemptNumber: db[userKey].attempts.length + 1,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('examDatabase', JSON.stringify(db));
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  }, [credentials.email]);

  const checkPreviousAttempt = useCallback((email) => {
    try {
      const db = JSON.parse(localStorage.getItem('examDatabase') || '{}');
      const userKey = email.toLowerCase();
      
      if (db[userKey] && db[userKey].attempts.length > 0) {
        const lastAttempt = db[userKey].attempts[db[userKey].attempts.length - 1];
        return {
          hasAttempted: true,
          lastAttempt: lastAttempt,
          totalAttempts: db[userKey].attempts.length
        };
      }
      
      return { hasAttempted: false, totalAttempts: 0 };
    } catch (error) {
      console.error('Database check error:', error);
      return { hasAttempted: false, totalAttempts: 0 };
    }
  }, []);

  const checkFingerprint = useCallback((email, fingerprint) => {
    try {
      const db = JSON.parse(localStorage.getItem('examDatabase') || '{}');
      const userKey = email.toLowerCase();
      
      if (db[userKey] && db[userKey].fingerprints) {
        return db[userKey].fingerprints.includes(fingerprint);
      }
      
      return false;
    } catch (error) {
      console.error('Fingerprint check error:', error);
      return false;
    }
  }, []);

  const saveFingerprint = useCallback((email, fingerprint) => {
    try {
      const db = JSON.parse(localStorage.getItem('examDatabase') || '{}');
      const userKey = email.toLowerCase();
      
      if (!db[userKey]) {
        db[userKey] = { attempts: [], fingerprints: [] };
      }
      
      if (!db[userKey].fingerprints.includes(fingerprint)) {
        db[userKey].fingerprints.push(fingerprint);
      }
      
      localStorage.setItem('examDatabase', JSON.stringify(db));
    } catch (error) {
      console.error('Fingerprint save error:', error);
    }
  }, []);

  // Add proctoring log
  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setProctoringLogs(prev => [...prev.slice(-9), { message, type, timestamp }]);
    
    if (type === 'warning') {
      setWarningCount(prev => prev + 1);
    }
    
    if (type === 'critical') {
      setWarningCount(prev => prev + 2);
    }
  }, []);

  // Block exam for cheating
  const blockExam = useCallback((reason) => {
    setExamBlocked(true);
    setBlockReason(reason);
    addLog(`EXAM TERMINATED: ${reason}`, 'critical');
    
    saveToDatabase({
      status: 'TERMINATED',
      reason: reason,
      score: 0,
      answers: answers,
      questionsAttempted: Object.keys(answers).length,
      violations: {
        warnings: warningCount,
        tabSwitches: tabSwitchCount,
        copyPasteAttempts: copyPasteAttempts,
        fullscreenExits: fullscreenExits,
        mouseLeaveCount: mouseLeaveCount,
        multipleFaces: multipleFacesDetected,
        noFaceDetected: noFaceDetected
      },
      proctoringLogs: proctoringLogs,
      duration: examStartTime ? Math.floor((Date.now() - examStartTime) / 1000) : 0,
      fingerprint: generateFingerprint()
    });
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setView('blocked');
  }, [answers, warningCount, tabSwitchCount, copyPasteAttempts, fullscreenExits, mouseLeaveCount, multipleFacesDetected, noFaceDetected, proctoringLogs, examStartTime, addLog, saveToDatabase, generateFingerprint]);

  // Check for excessive violations
  useEffect(() => {
    if (view === 'quiz') {
      if (tabSwitchCount >= 3) {
        blockExam('Multiple tab switches detected (3+ violations)');
      } else if (copyPasteAttempts >= 5) {
        blockExam('Excessive copy/paste attempts (5+ violations)');
      } else if (fullscreenExits >= 2) {
        blockExam('Exited fullscreen mode multiple times');
      } else if (noFaceDetected >= 10) {
        blockExam('Face not detected for extended period');
      } else if (multipleFacesDetected >= 5) {
        blockExam('Multiple faces detected (possible external help)');
      } else if (warningCount >= 15) {
        blockExam('Excessive security violations (15+ warnings)');
      }
    }
  }, [view, tabSwitchCount, copyPasteAttempts, fullscreenExits, noFaceDetected, multipleFacesDetected, warningCount, blockExam]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && view === 'quiz' && !examBlocked) {
        setTabSwitchCount(prev => prev + 1);
        addLog('Tab switch detected - CRITICAL VIOLATION', 'critical');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [view, examBlocked, addLog]);

  // Prevent right-click and keyboard shortcuts
  useEffect(() => {
    const preventActions = (e) => {
      if (view === 'quiz' && !examBlocked) {
        if (e.type === 'contextmenu') {
          e.preventDefault();
          addLog('Right-click attempt blocked', 'warning');
        }
        
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          setCopyPasteAttempts(prev => prev + 1);
          addLog(`Copy/Paste attempt blocked (${e.key.toUpperCase()})`, 'warning');
        }
        
        if (e.key === 'F12' || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
          e.preventDefault();
          addLog('Developer tools access blocked', 'critical');
        }
        
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          addLog('Alt+Tab blocked', 'warning');
        }
      }
    };

    const preventCopy = (e) => {
      if (view === 'quiz' && !examBlocked) {
        e.preventDefault();
        setCopyPasteAttempts(prev => prev + 1);
        addLog('Copy attempt via menu blocked', 'warning');
      }
    };

    const preventPaste = (e) => {
      if (view === 'quiz' && !examBlocked) {
        e.preventDefault();
        setCopyPasteAttempts(prev => prev + 1);
        addLog('Paste attempt blocked', 'warning');
      }
    };

    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('keydown', preventActions);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    
    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('keydown', preventActions);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
    };
  }, [view, examBlocked, addLog]);

  // Mouse leave detection
  useEffect(() => {
    const handleMouseLeave = () => {
      if (view === 'quiz' && !examBlocked) {
        setMouseLeaveCount(prev => prev + 1);
        addLog('Mouse left exam window', 'warning');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [view, examBlocked, addLog]);

  // Fullscreen enforcement
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (view === 'quiz' && !examBlocked && !document.fullscreenElement) {
        setFullscreenExits(prev => prev + 1);
        addLog('Exited fullscreen mode - VIOLATION', 'critical');
        
        document.documentElement.requestFullscreen().catch(() => {
          addLog('Failed to restore fullscreen', 'critical');
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [view, examBlocked, addLog]);

  // Audio level monitoring
  useEffect(() => {
    if (isMicActive && streamRef.current && view === 'quiz') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(streamRef.current);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > 30) {
          addLog('Suspicious voice activity detected', 'warning');
        }
      };

      const interval = setInterval(checkAudio, 3000);
      audioContextRef.current = audioContext;

      return () => {
        clearInterval(interval);
        audioContext.close();
      };
    }
  }, [isMicActive, view, addLog]);

  // Simple face detection
  useEffect(() => {
    if (isCameraActive && videoRef.current && view === 'quiz') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const detectFace = () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;
        
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let skinPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
            skinPixels++;
          }
        }
        
        const totalPixels = pixels.length / 4;
        const skinPercentage = (skinPixels / totalPixels) * 100;
        
        setFaceDetectionCount(prev => prev + 1);
        
        if (skinPercentage < 2) {
          setNoFaceDetected(prev => prev + 1);
          if (noFaceDetected % 5 === 0 && noFaceDetected > 0) {
            addLog('No face detected in camera', 'warning');
          }
        }
        
        if (skinPercentage > 15) {
          setMultipleFacesDetected(prev => prev + 1);
          if (multipleFacesDetected % 3 === 0 && multipleFacesDetected > 0) {
            addLog('Multiple faces detected', 'critical');
          }
        }
      };

      faceDetectionIntervalRef.current = setInterval(detectFace, 5000);

      return () => {
        if (faceDetectionIntervalRef.current) {
          clearInterval(faceDetectionIntervalRef.current);
        }
      };
    }
  }, [isCameraActive, view, noFaceDetected, multipleFacesDetected, addLog]);

  // Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSendingOtp(true);

    if (!credentials.fullName.trim()) {
      setAuthError('Full Name is required.');
      setSendingOtp(false);
      return;
    }

    if (!credentials.email.toLowerCase().endsWith('@gmail.com')) {
      setAuthError('Valid @gmail.com address required.');
      setSendingOtp(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/send-otp', {
        email: credentials.email
      });

      if (response.data.ok || response.data.message) {
        setOtpSent(true);
        setView('otp');
        addLog('OTP sent to email', 'success');
        
      } else {
        setAuthError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      setAuthError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const response = await api.post('/api/auth/verify-otp', {
        email: credentials.email,
        otp: otpCode
      });

      if (response.data.ok || response.data.emailVerified) {
        setOtpVerified(true);
        addLog('OTP verified successfully', 'success');
        // Proceed to camera/mic setup
        await initializeAssessment();
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      setOtpError(error.response?.data?.error || 'Failed to verify OTP. Please try again.');
    }
  };

  // Initialize assessment after OTP verification
  const initializeAssessment = async () => {
    setAttemptStatus('checking');

    const attemptCheck = checkPreviousAttempt(credentials.email);
    const fingerprint = generateFingerprint();
    const fingerprintExists = checkFingerprint(credentials.email, fingerprint);

    if (attemptCheck.hasAttempted) {
      setAttemptStatus('blocked');
      setAuthError(`Access Denied: You have already attempted this exam on ${new Date(attemptCheck.lastAttempt.timestamp).toLocaleString()}. Only one attempt is allowed per user.`);
      addLog('Previous attempt detected - Access denied', 'critical');
      setView('login');
      return;
    }

    if (fingerprintExists) {
      setAttemptStatus('blocked');
      setAuthError('Access Denied: This device has been used for this exam before. Each user is allowed only one attempt.');
      addLog('Device fingerprint match - Access denied', 'critical');
      setView('login');
      return;
    }

    setAttemptStatus('allowed');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      streamRef.current = stream;
      setIsMicActive(true);
      setIsCameraActive(true);
      setExamStartTime(Date.now());

      saveFingerprint(credentials.email, fingerprint);

      try {
        await document.documentElement.requestFullscreen();
        addLog('Fullscreen mode activated', 'success');
      } catch (err) {
        addLog('Fullscreen mode failed - continuing anyway', 'warning');
      }

      setView('quiz');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      addLog('Assessment started - AI proctoring active', 'success');
      addLog('Camera monitoring initialized', 'info');
      addLog('Audio detection enabled', 'info');
      addLog('Face detection started', 'info');
      addLog('Anti-cheat systems online', 'success');

    } catch (err) {
      setAuthError('Camera and Microphone access required for proctored assessment.');
      console.error('Media error:', err);
      addLog('Media access denied', 'critical');
      setView('login');
    }
  };

  // Timer countdown
  useEffect(() => {
    let timer;
    if (view === 'quiz' && timeLeft > 0 && !examBlocked) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 60 && prev % 10 === 0) {
            addLog(`${prev} seconds remaining`, 'warning');
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && view === 'quiz' && !examBlocked) {
      finishQuiz();
    }

    return () => clearInterval(timer);
  }, [view, timeLeft, examBlocked]);

  const finishQuiz = () => {
    setExamEndTime(Date.now());
    let correctCount = 0;
    
    QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correct) correctCount++;
    });

    const finalScore = Math.round((correctCount / QUESTIONS.length) * 100);
    setScore(finalScore);
    
    // Generate certificate ID
    const certId = generateCertificateId();
    setCertificateId(certId);
    
    saveToDatabase({
      status: 'COMPLETED',
      score: finalScore,
      certificateId: certId,
      answers: answers,
      correctAnswers: correctCount,
      totalQuestions: QUESTIONS.length,
      questionsAttempted: Object.keys(answers).length,
      violations: {
        warnings: warningCount,
        tabSwitches: tabSwitchCount,
        copyPasteAttempts: copyPasteAttempts,
        fullscreenExits: fullscreenExits,
        mouseLeaveCount: mouseLeaveCount,
        multipleFaces: multipleFacesDetected,
        noFaceDetected: noFaceDetected
      },
      proctoringLogs: proctoringLogs,
      duration: examStartTime ? Math.floor((Date.now() - examStartTime) / 1000) : timeLeft === 0 ? 1800 : (1800 - timeLeft),
      fingerprint: generateFingerprint(),
      timeUp: timeLeft === 0
    });
    
    setView('result');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    setIsMicActive(false);
    setIsCameraActive(false);
    
    addLog('Assessment completed successfully', 'success');
  };

  // Send score via email
  const sendScoreEmail = async () => {
    setSendingEmail(true);
    const correctAnswers = QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
    const totalQuestions = QUESTIONS.length;
    const passed = score >= 70;
    const duration = examStartTime && examEndTime ? Math.floor((examEndTime - examStartTime) / 1000) : 1800 - timeLeft;

    const emailBody = `
Assessment Results - GJ Global Services Proctored Platform
=====================================================

CANDIDATE INFORMATION
---------------------
Full Name: ${credentials.fullName}
Email: ${credentials.email}
Certificate ID: ${certificateId}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Start Time: ${new Date(examStartTime).toLocaleTimeString()}
End Time: ${new Date(examEndTime || Date.now()).toLocaleTimeString()}
Duration: ${Math.floor(duration / 60)}m ${duration % 60}s

PERFORMANCE SUMMARY
-------------------
Final Score: ${score}%
Status: ${passed ? '✓ PASSED' : '✗ NOT PASSED'}
Correct Answers: ${correctAnswers}/${totalQuestions}
Questions Attempted: ${Object.keys(answers).length}/${totalQuestions}

PROCTORING & SECURITY REPORT
-----------------------------
Total Warnings: ${warningCount}
Tab Switches: ${tabSwitchCount}
Copy/Paste Attempts: ${copyPasteAttempts}
Fullscreen Exits: ${fullscreenExits}
Mouse Leave Events: ${mouseLeaveCount}
Face Detection Issues: ${noFaceDetected}
Multiple Faces Detected: ${multipleFacesDetected}
Camera Monitoring: ✓ Active
Audio Detection: ✓ Enabled
AI Proctoring: ✓ Enabled

INTEGRITY STATUS
----------------
${warningCount < 5 ? '✓ High Integrity - Minimal violations' : 
  warningCount < 10 ? '⚠ Moderate Integrity - Some violations detected' : 
  '✗ Low Integrity - Multiple violations detected'}

VERIFICATION
------------
Certificate ID: ${certificateId}
Verify at: https://gjglobal.verify/${certificateId}

---
This is an automated message from GJ Global Services Assessment Platform.
${passed ? 'Congratulations on passing the assessment!' : 'Thank you for taking the assessment.'}
    `.trim();

    try {
      const mailtoLink = `mailto:${credentials.email}?subject=${encodeURIComponent('GJ Global Services - Your Assessment Results')}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      setTimeout(() => {
        setEmailSent(true);
        setSendingEmail(false);
      }, 1000);
    } catch (error) {
      console.error('Email error:', error);
      setSendingEmail(false);
      alert('Failed to send email. Please try downloading the results instead.');
    }
  };

  const downloadCertificate = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Background gradient effect
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 297, 210, 'F');

    // Decorative border
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(4);
    doc.rect(8, 8, 281, 194);
    
    doc.setDrawColor(96, 165, 250);
    doc.setLineWidth(1);
    doc.rect(12, 12, 273, 186);

    // Company Logo (top left)
    try {
      const logoData = await loadCompanyLogo();
      if (logoData) {
        // Add the logo image - positioned at x=20, y=18 with 40x40 size
        doc.addImage(logoData, 'JPEG', 20, 18, 40, 40);
      } else {
        // Fallback to placeholder if logo fails to load
        doc.setFillColor(59, 130, 246);
        doc.roundedRect(20, 18, 40, 40, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text("GJ", 40, 43, { align: "center" });
      }
    } catch (error) {
      console.error('Error adding logo to certificate:', error);
      // Fallback to placeholder
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(20, 18, 40, 40, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("GJ", 40, 43, { align: "center" });
    }
    
    // Company name next to logo
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("GJ GLOBAL SERVICES", 65, 32);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text("Assessment & Certification Division", 65, 39);
    doc.text("www.gjglobal.com", 65, 45);

    // Get medal based on score
    const medal = getMedalInfo(score);
    
    // Medal badge - displayed based on score using the medal image
    try {
      const medalData = await loadMedalImage();
      if (medalData) {
        // Add the medal image - positioned at center with 45x45 size
        doc.addImage(medalData, 'PNG', 126, 58, 45, 45);
      } else {
        // Fallback to circles if medal fails to load
        doc.setFillColor(...medal.color);
        doc.circle(148.5, 80, 22, 'F');
        doc.setFillColor(...medal.borderColor);
        doc.circle(148.5, 80, 19, 'F');
        doc.setFillColor(...medal.color);
        doc.circle(148.5, 80, 16, 'F');
      }
    } catch (error) {
      console.error('Error adding medal to certificate:', error);
      // Fallback to circles if medal fails
      doc.setFillColor(...medal.color);
      doc.circle(148.5, 80, 22, 'F');
      doc.setFillColor(...medal.borderColor);
      doc.circle(148.5, 80, 19, 'F');
      doc.setFillColor(...medal.color);
      doc.circle(148.5, 80, 16, 'F');
    }
    
    // Medal text
    doc.setTextColor(...medal.borderColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(medal.name, 148.5, 105, { align: "center" });

    // Certificate title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(36);
    doc.setFont(undefined, 'bold');
    doc.text("CERTIFICATE OF ACHIEVEMENT", 148.5, 110, { align: "center" });

    // Decorative line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(70, 115, 225, 115);

    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text("This is to certify that", 148.5, 125, { align: "center" });

    // Candidate name
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    const candidateName = credentials.fullName || credentials.email.split('@')[0].toUpperCase();
    doc.text(candidateName, 148.5, 138, { align: "center" });
    
    // Underline for name
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(80, 140, 217, 140);

    // Achievement text
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text("has successfully completed the", 148.5, 150, { align: "center" });
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text("AI-Proctored Technical Assessment", 148.5, 157, { align: "center" });
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text("demonstrating proficiency in web development technologies", 148.5, 163, { align: "center" });

    // Score badge with medal
    const scoreColor = score >= 80 ? [251, 191, 36] : score >= 70 ? [34, 197, 94] : [239, 68, 68];
    doc.setFillColor(...scoreColor);
    doc.roundedRect(115, 168, 70, 14, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(`${medal.name} - ${score}%`, 148.5, 177, { align: "center" });

    // Bottom section with details and signature
    const bottomY = 188;
    
    // Left: Date and Certificate ID
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, 'normal');
    const issueDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Issue Date: ${issueDate}`, 25, bottomY);
    doc.text(`Certificate ID: ${certificateId}`, 25, bottomY + 5);
    doc.text(`Name: ${credentials.fullName}`, 25, bottomY + 10);
    doc.text(`Email: ${credentials.email}`, 25, bottomY + 15);

    // Right: Digital Signature
    doc.setFont(undefined, 'bold');
    doc.text("Digitally Verified", 240, bottomY, { align: "center" });
    
    // Signature line with name
    doc.setFont('Times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Mr. Gajendra Singh", 240, bottomY + 8, { align: "center" });
    
    // Title
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Chief Assessment Officer", 240, bottomY + 12, { align: "center" });
    doc.line(220, bottomY + 5, 260, bottomY + 5);

    // Security features footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("This certificate is digitally signed and verified through AI-proctored assessment | Verification: gjglobal.com/verify", 148.5, 203, { align: "center" });

    // Watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont(undefined, 'bold');
    doc.text("VERIFIED", 148.5, 115, { 
      align: "center",
      angle: 45,
      opacity: 0.1
    });

    doc.save(`GJ_Certificate_${candidateName}_${certificateId}.pdf`);
  };

  const downloadDetailedResults = async () => {
    const doc = new jsPDF();
    const correctAnswers = QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
    const duration = examStartTime && examEndTime ? Math.floor((examEndTime - examStartTime) / 1000) : 1800 - timeLeft;

    // Header with logo
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Company Logo
    try {
      const logoData = await loadCompanyLogo();
      if (logoData) {
        // Add the logo image - positioned at x=10, y=5 with 35x35 size
        doc.addImage(logoData, 'JPEG', 10, 5, 35, 35);
      } else {
        // Fallback to placeholder
        doc.setFillColor(255, 255, 255);
        doc.circle(27, 22.5, 12, 'F');
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("GJ", 27, 25, { align: "center" });
      }
    } catch (error) {
      console.error('Error adding logo to detailed results:', error);
      // Fallback to placeholder
      doc.setFillColor(255, 255, 255);
      doc.circle(27, 22.5, 12, 'F');
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("GJ", 27, 25, { align: "center" });
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("GJ Global Services", 55, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("AI-Proctored Assessment - Detailed Report", 55, 28);
    doc.setFontSize(9);
    doc.text(`Certificate ID: ${certificateId}`, 55, 35);

    // Candidate Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Candidate Information", 20, 60);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 65, 170, 25, 'F');
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${credentials.fullName}`, 25, 72);
    doc.text(`Email: ${credentials.email}`, 25, 79);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 25, 86);
    doc.text(`Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`, 25, 93);

    // Score Summary with visual
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Performance Summary", 20, 105);
    
    doc.setFillColor(239, 246, 255);
    doc.rect(20, 110, 170, 35, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.rect(20, 110, 170, 35);
    
    doc.setFontSize(32);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text(`${score}%`, 105, 128, { align: "center" });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${correctAnswers}/${QUESTIONS.length} Correct Answers`, 105, 138, { align: "center" });

    // Proctoring Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Security & Proctoring Report", 20, 160);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 165, 170, 50, 'F');
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total Warnings: ${warningCount}`, 25, 172);
    doc.text(`Tab Switches: ${tabSwitchCount}`, 25, 179);
    doc.text(`Copy/Paste Attempts: ${copyPasteAttempts}`, 25, 186);
    doc.text(`Fullscreen Exits: ${fullscreenExits}`, 25, 193);
    doc.text(`Face Detection Issues: ${noFaceDetected}`, 110, 172);
    doc.text(`Multiple Faces: ${multipleFacesDetected}`, 110, 179);
    doc.text(`Mouse Leave Events: ${mouseLeaveCount}`, 110, 186);
    
    doc.setFont(undefined, 'bold');
    doc.text(`✓ Camera Active  ✓ Audio Enabled  ✓ AI Proctoring`, 25, 205);

    // Integrity Score with visual indicator
    doc.setFontSize(12);
    const integrityScore = Math.max(0, 100 - (warningCount * 2));
    doc.text(`Integrity Score: ${integrityScore}%`, 20, 225);
    
    // Integrity bar
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 230, 170, 8, 'F');
    const barColor = integrityScore >= 80 ? [34, 197, 94] : integrityScore >= 60 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(...barColor);
    doc.rect(20, 230, (integrityScore / 100) * 170, 8, 'F');

    // Add new page for questions
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("Question-by-Question Breakdown", 20, 20);

    let yPos = 35;
    QUESTIONS.forEach((q, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const isCorrect = answers[idx] === q.correct;
      
      // Question number with colored background
      doc.setFillColor(isCorrect ? 34 : 239, isCorrect ? 197 : 68, isCorrect ? 94 : 68);
      doc.roundedRect(20, yPos - 5, 8, 8, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${idx + 1}`, 24, yPos + 1, { align: "center" });
      
      // Question text
      doc.setTextColor(0, 0, 0);
      doc.text(q.q, 32, yPos, { maxWidth: 158 });
      yPos += 7;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Your Answer: ${answers[idx] !== undefined ? q.options[answers[idx]] : 'Not Answered'}`, 32, yPos);
      yPos += 5;
      doc.text(`Correct Answer: ${q.options[q.correct]}`, 32, yPos);
      yPos += 5;

      doc.setFont(undefined, 'bold');
      doc.setTextColor(...(isCorrect ? [34, 197, 94] : [239, 68, 68]));
      doc.text(`${isCorrect ? '✓ Correct' : '✗ Incorrect'}`, 32, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;
    });

    // Proctoring logs
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Proctoring Activity Log", 20, 20);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 25, 170, 5, 'F');
    
    let logY = 35;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    proctoringLogs.slice(-30).forEach(log => {
      if (logY > 270) {
        doc.addPage();
        logY = 20;
      }
      
      const logColor = log.type === 'critical' ? [239, 68, 68] : 
                       log.type === 'warning' ? [251, 191, 36] : 
                       log.type === 'success' ? [34, 197, 94] : [71, 85, 105];
      
      doc.setTextColor(...logColor);
      doc.text(`●`, 22, logY);
      doc.setTextColor(0, 0, 0);
      doc.text(`[${log.timestamp}] ${log.message}`, 27, logY);
      logY += 5;
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("This report is generated by GJ Global Services AI-Proctored Assessment Platform", 105, 285, { align: "center" });
    doc.text(`Certificate ID: ${certificateId} | Verify at: gjglobal.com/verify`, 105, 290, { align: "center" });

    doc.save(`GJ_Detailed_Results_${credentials.email.split('@')[0]}_${certificateId}.pdf`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TpxEw0mn-9hD-0WCwm1IUgtkKx68e0CUUg&s"
              alt="GJ Global Services Logo"
              className="w-10 h-10 object-contain rounded-lg"
            />
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                GJ Global Services
              </h1>
              <p className="text-xs text-slate-400">Assessment Platform</p>
            </div>
          </div>
          {view === 'quiz' && !examBlocked && (
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Mic className="w-4 h-4" />
                <span className="text-sm font-semibold">Audio Live</span>
              </div>
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-2">
                <Timer className="w-5 h-5 text-red-400" />
                <span className={`text-xl font-black ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGIN VIEW */}
      {view === 'login' && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-md">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              {/* Logo Section */}
              <div className="flex items-center gap-3 px-6 h-16 border-b border-white/40 dark:border-slate-700 dark:bg-slate-800/50 -mx-8 -mt-8 mb-8 rounded-t-3xl">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TpxEw0mn-9hD-0WCwm1IUgtkKx68e0CUUg&s"
                  alt="GJ Global Services Logo"
                  className="w-9 h-9 object-contain rounded-md"
                />
                <h1 className="text-lg font-bold bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-cyan-400">
                  GJ Global Services
                </h1>
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-black mb-2">Welcome</h2>
                <p className="text-slate-400">Verify your email to begin proctored assessment</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={credentials.fullName}
                    onChange={(e) => setCredentials({ ...credentials, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Gmail Address
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                {authError && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{authError}</p>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Camera monitoring required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mic className="w-4 h-4 text-blue-400" />
                    <span>Audio detection enabled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>AI proctoring active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-yellow-300">ONE ATTEMPT ONLY</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingOtp ? 'SENDING OTP...' : 'SEND OTP'}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                <p>By proceeding, you consent to AI-based proctoring</p>
                <p className="mt-1">Your activity will be monitored and recorded</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION VIEW */}
      {view === 'otp' && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-md">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              {/* Logo Section */}
              <div className="flex items-center gap-3 px-6 h-16 border-b border-white/40 dark:border-slate-700 dark:bg-slate-800/50 -mx-8 -mt-8 mb-8 rounded-t-3xl">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TpxEw0mn-9hD-0WCwm1IUgtkKx68e0CUUg&s"
                  alt="GJ Global Services Logo"
                  className="w-9 h-9 object-contain rounded-md"
                />
                <h1 className="text-lg font-bold bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-cyan-400">
                  GJ Global Services
                </h1>
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-black mb-2">Verify OTP</h2>
                <p className="text-slate-400">Enter the 6-digit code sent to {credentials.email}</p>
                
                {/* Dev OTP display removed - production ready */}
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-2xl font-bold tracking-widest"
                    maxLength="6"
                    required
                  />
                </div>

                {otpError && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{otpError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-blue-500/25"
                >
                  VERIFY & START ASSESSMENT
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setView('login');
                    setOtpSent(false);
                    setOtpCode('');
                    setOtpError('');
                    setDevOtp('');
                  }}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  ← Back to Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* QUIZ VIEW */}
      {view === 'quiz' && !examBlocked && (
        <>
{/* Fixed Camera Preview - Bottom Left Corner */}
          <div className="fixed bottom-6 left-6 z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl p-2 shadow-2xl shadow-blue-500/20">
              {/* Camera Header */}
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-green-400">LIVE</span>
                </div>
                <Camera className="w-4 h-4 text-blue-400" />
              </div>
              
              {/* Video Preview */}
              <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                {/* Face detection overlay indicator */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    noFaceDetected > 3 ? 'bg-red-500/80 text-white' : 
                    multipleFacesDetected > 0 ? 'bg-yellow-500/80 text-black' :
                    'bg-green-500/80 text-white'
                  }`}>
                    {noFaceDetected > 3 ? 'No Face!' : multipleFacesDetected > 0 ? 'Multiple Faces!' : 'Face Detected'}
                  </div>
                </div>
              </div>
              
              {/* Camera Status */}
              <div className="mt-2 text-xs text-center">
                <span className="text-slate-400">Exam Proctoring Active</span>
              </div>
            </div>
          </div>

{/* Security Alerts Panel - Bottom Right Corner */}
          <div className="fixed bottom-6 right-6 z-50">
            <div className={`bg-slate-900/90 backdrop-blur-xl border-2 rounded-2xl p-4 shadow-2xl ${
              warningCount >= 10 ? 'border-red-500/50 shadow-red-500/20' :
              warningCount >= 5 ? 'border-yellow-500/50 shadow-yellow-500/20' :
              'border-slate-700'
            }`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className={`w-5 h-5 ${
                  warningCount >= 10 ? 'text-red-400' :
                  warningCount >= 5 ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
                <span className="font-bold text-sm">Security Status</span>
              </div>
              
              {/* Remaining Warnings */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Warnings:</span>
                  <span className={`font-bold ${
                    warningCount >= 10 ? 'text-red-400' :
                    warningCount >= 5 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {warningCount} / 15
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-44 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${
                    warningCount >= 10 ? 'bg-red-500' :
                    warningCount >= 5 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} style={{ width: `${Math.min((warningCount / 15) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {15 - warningCount > 0 
                    ? `${15 - warningCount} warnings remaining` 
                    : 'MAXIMUM WARNINGS REACHED'}
                </p>
              </div>
              
              {/* Violation Counters */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tab Switches:</span>
                  <span className={`font-bold ${tabSwitchCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {tabSwitchCount}/3
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Copy/Paste:</span>
                  <span className={`font-bold ${copyPasteAttempts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {copyPasteAttempts}/5
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">No Face:</span>
                  <span className={`font-bold ${noFaceDetected > 5 ? 'text-red-400' : 'text-green-400'}`}>
                    {noFaceDetected}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Multi-Face:</span>
                  <span className={`font-bold ${multipleFacesDetected > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {multipleFacesDetected}/5
                  </span>
                </div>
              </div>
              
              {/* Alert if violations detected */}
              {(warningCount > 0 || tabSwitchCount > 0 || copyPasteAttempts > 0) && (
                <div className={`mt-3 p-2 rounded-lg ${
                  warningCount >= 10 ? 'bg-red-500/20 border border-red-500/50' :
                  'bg-yellow-500/20 border border-yellow-500/50'
                }`}>
                  <p className={`text-xs font-bold ${
                    warningCount >= 10 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    ⚠️ Security violations detected! Please comply with exam rules.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex h-[calc(100vh-80px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="mb-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm font-bold">
                      {CATEGORIES[currentCategory]} - Question {currentIdx + 1}
                    </span>
                    <span className="text-sm font-bold">
                      {currentIdx + 1} / {QUESTIONS.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Progress: {Math.round(((currentIdx + 1) / QUESTIONS.length) * 100)}%
                  </p>
                </div>

                <h2 className="text-2xl font-bold mb-8 leading-relaxed">
                  {QUESTIONS[currentIdx].q}
                </h2>

                {/* Radio Button Options */}
                <div className="space-y-3">
                  {QUESTIONS[currentIdx].options.map((opt, i) => (
                    <label
                      key={i}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        answers[currentIdx] === i
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-slate-800 hover:border-slate-600 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentIdx}`}
                        checked={answers[currentIdx] === i}
                        onChange={() => setAnswers({ ...answers, [currentIdx]: i })}
                        className="w-5 h-5 accent-blue-500 cursor-pointer"
                      />
                      <span className="flex-1">{opt}</span>
                      {answers[currentIdx] === i && (
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>

                {/* Previous and Next Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))}
                    disabled={currentIdx === 0}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-5 rounded-2xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← PREVIOUS
                  </button>
                  <button
                    onClick={() =>
                      currentIdx < QUESTIONS.length - 1
                        ? setCurrentIdx((c) => c + 1)
                        : finishQuiz()
                    }
                    disabled={answers[currentIdx] === undefined}
                    className="flex-1 bg-gradient-to-r from-white to-slate-200 text-slate-950 py-5 rounded-2xl font-black text-lg hover:from-slate-100 hover:to-slate-300 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentIdx < QUESTIONS.length - 1
                      ? 'NEXT QUESTION →'
                      : 'COMPLETE ASSESSMENT'}
                  </button>
                </div>
              </div>
            </div>
          </div>

              {/* Category/Section Navigation Panel (Right Sidebar) */}
              <div className="w-80 border-l border-slate-800 bg-slate-950/50 backdrop-blur-xl p-4 overflow-y-auto">
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 mb-4">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    Assessment Sections
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Click a section to view its questions
                  </p>
                  
                  {/* Section Tabs */}
                  <div className="space-y-1">
                    {CATEGORIES.map((section, idx) => {
                      const sectionQuestions = QUESTIONS_BY_SECTION[section];
                      const answeredInSection = sectionQuestions.filter((_, qIdx) => {
                        let globalStartIdx = 0;
                        for (let i = 0; i < idx; i++) {
                          globalStartIdx += QUESTIONS_BY_SECTION[CATEGORIES[i]].length;
                        }
                        return answers[globalStartIdx + qIdx] !== undefined;
                      }).length;
                      
                      return (
                        <button
                          key={section}
                          onClick={() => {
                            setCurrentCategory(idx);
                            let startIdx = 0;
                            for (let i = 0; i < idx; i++) {
                              startIdx += QUESTIONS_BY_SECTION[CATEGORIES[i]].length;
                            }
                            setCurrentIdx(startIdx);
                          }}
                          className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-all flex justify-between items-center ${
                            currentCategory === idx
                              ? 'bg-blue-500 text-white border-2 border-blue-300'
                              : answeredInSection === sectionQuestions.length
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <span>{section}</span>
                          <span className="text-xs opacity-75">
                            {answeredInSection}/{sectionQuestions.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Questions in Current Section */}
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 mb-4">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    {CATEGORIES[currentCategory]} Questions
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Click to jump to question
                  </p>
                  
                  {/* Question Grid for Current Section */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {QUESTIONS_BY_SECTION[CATEGORIES[currentCategory]].map((_, idx) => {
                      let globalIdx = 0;
                      for (let i = 0; i < currentCategory; i++) {
                        globalIdx += QUESTIONS_BY_SECTION[CATEGORIES[i]].length;
                      }
                      globalIdx += idx;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentIdx(globalIdx)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                            currentIdx === globalIdx
                              ? 'bg-blue-500 text-white border-2 border-blue-300'
                              : answers[globalIdx] !== undefined
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          }`}
                          title={answers[globalIdx] !== undefined ? 'Answered' : 'Not answered'}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-slate-900/50 rounded-2xl p-3 border border-slate-800 mb-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Legend:</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-300"></div>
                      <span className="text-slate-300">Current Question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50"></div>
                      <span className="text-slate-300">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
                      <span className="text-slate-300">Not Answered</span>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-slate-900/50 rounded-2xl p-3 border border-slate-800 mb-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Summary:</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Answered:</span>
                    <span className="text-green-400 font-bold">{Object.keys(answers).length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Remaining:</span>
                    <span className="text-yellow-400 font-bold">{QUESTIONS.length - Object.keys(answers).length}</span>
                  </div>
                </div>

                {/* Proctoring Stats */}
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Security Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Warnings</span>
                      <span className={`font-bold ${warningCount > 3 ? 'text-red-400' : 'text-green-400'}`}>
                        {warningCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tab Switches</span>
                      <span className={`font-bold ${tabSwitchCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {tabSwitchCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copy/Paste</span>
                      <span className={`font-bold ${copyPasteAttempts > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {copyPasteAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fullscreen Exits</span>
                      <span className={`font-bold ${fullscreenExits > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {fullscreenExits}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      {/* BLOCKED VIEW */}
      {view === 'blocked' && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-red-500/10 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl p-12 shadow-2xl text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                <UserX className="w-10 h-10 text-red-400" />
              </div>
              
              <h2 className="text-3xl font-black mb-4 text-red-400">
                EXAM TERMINATED
              </h2>
              
              <p className="text-xl mb-6">Security Violation Detected</p>
              
              <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-red-500/30">
                <p className="text-lg font-bold mb-2">Reason:</p>
                <p className="text-red-300">{blockReason}</p>
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-slate-700">
                <p className="font-bold mb-4">Violation Summary:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Total Warnings</p>
                    <p className="text-2xl font-bold text-red-400">{warningCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Tab Switches</p>
                    <p className="text-2xl font-bold text-red-400">{tabSwitchCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Copy/Paste Attempts</p>
                    <p className="text-2xl font-bold text-red-400">{copyPasteAttempts}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Fullscreen Exits</p>
                    <p className="text-2xl font-bold text-red-400">{fullscreenExits}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-300">
                  This attempt has been recorded and reported. You cannot retake this exam.
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white py-4 rounded-2xl font-bold transition-all"
              >
                RETURN TO LOGIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT VIEW */}
      {view === 'result' && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 shadow-2xl">
              <div className="text-center mb-8">
                {/* Medal Image for Result View */}
                <div className="inline-flex items-center justify-center mb-6">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlqDuMSzRuml5-4PuPrA5GeXuOe2_1uhQ2DtQxC0QJOQ&s" 
                    alt="Medal" 
                    className="w-24 h-24 object-contain"
                  />
                </div>

                <h2 className="text-3xl font-black mb-2">
                  {score >= 70 ? 'ASSESSMENT PASSED' : 'ASSESSMENT COMPLETE'}
                </h2>
                <p className="text-slate-400">
                  {score >= 70
                    ? 'Congratulations! You have successfully passed the assessment.'
                    : 'Thank you for completing the assessment.'}
                </p>
                
                {score >= 70 && (
                  <div className="mt-4 inline-block bg-blue-500/10 border border-blue-500/30 rounded-xl px-6 py-3">
                    <p className="text-sm text-blue-300 font-semibold">
                      Certificate ID: {certificateId}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl p-8 mb-8 border border-blue-500/30">
                <div className="text-center">
                  <div className="text-7xl font-black mb-2">{score}%</div>
                  <div className="text-xl text-slate-300">Final Score</div>
                  <div className="mt-4 text-sm text-slate-400">
                    {credentials.fullName && <p>Name: {credentials.fullName}</p>}
                    <p>Email: {credentials.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {Object.keys(answers).length}
                  </div>
                  <div className="text-sm text-slate-400">Answered</div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {QUESTIONS.filter((q, i) => answers[i] === q.correct).length}
                  </div>
                  <div className="text-sm text-slate-400">Correct</div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                  <div className={`text-3xl font-bold mb-1 ${warningCount > 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {warningCount}
                  </div>
                  <div className="text-sm text-slate-400">Warnings</div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {Math.max(0, 100 - (warningCount * 2))}%
                  </div>
                  <div className="text-sm text-slate-400">Integrity</div>
                </div>
              </div>

              {emailSent && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-300">
                    Results sent to {credentials.email}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={sendScoreEmail}
                  disabled={sendingEmail}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {sendingEmail
                    ? 'SENDING EMAIL...'
                    : emailSent
                    ? 'EMAIL SENT ✓'
                    : 'EMAIL RESULTS TO ME'}
                </button>

                {score >= 70 && (
                  <button
                    onClick={downloadCertificate}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    DOWNLOAD CERTIFICATE
                  </button>
                )}

                <button
                  onClick={downloadDetailedResults}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD DETAILED RESULTS
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white py-4 rounded-2xl font-bold transition-all"
                >
                  BACK TO HOME
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-slate-500">
                <p>This attempt has been permanently recorded</p>
                <p className="mt-1">No retakes allowed - One attempt per user</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}