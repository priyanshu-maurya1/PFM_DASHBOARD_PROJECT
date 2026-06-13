import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import Enrollment from '../models/Enrollment.js';
import InternshipApplication from '../models/InternshipApplication.js';

const router = express.Router();

// ==================== COURSES CATALOG ====================
// Static course catalog (could be moved to MongoDB if needed)
const courses = [
  {
    id: 'web-101',
    title: 'Complete 2026 Web Development Bootcamp',
    duration: '24 Weeks',
    instructor: 'Industry Experts',
    curriculum: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'React'],
    badge: 'Web',
    description: 'Master modern web development from scratch',
    courseLink: '/courses/web-development',
    testLink: '/tests/web-development',
    certificateLink: '/certificates/web-development',
    modules: [
      { title: 'HTML & CSS Fundamentals', topics: ['Semantic HTML', 'CSS Grid & Flexbox', 'Responsive Design'] },
      { title: 'JavaScript Essentials', topics: ['ES6+ Features', 'DOM Manipulation', 'Async/Await'] },
      { title: 'Node.js Backend', topics: ['RESTful APIs', 'Express.js', 'Authentication'] },
      { title: 'React Frontend', topics: ['Components', 'Hooks', 'State Management'] }
    ]
  },
  {
    id: 'mern-201',
    title: 'MERN Stack Mastery',
    duration: '16 Weeks',
    instructor: 'Senior Engineers',
    curriculum: ['MongoDB', 'Express', 'React', 'Node'],
    badge: 'MERN',
    description: 'Build full-stack applications with MERN',
    courseLink: '/courses/mern',
    testLink: '/tests/mern',
    certificateLink: '/certificates/mern',
    modules: [
      { title: 'MongoDB Basics', topics: ['NoSQL Concepts', 'CRUD Operations', 'Aggregation'] },
      { title: 'Express.js', topics: ['Routing', 'Middleware', 'Error Handling'] },
      { title: 'React Advanced', topics: ['Context API', 'Redux', 'React Router'] },
      { title: 'Full Stack Integration', topics: ['API Integration', 'Authentication', 'Deployment'] }
    ]
  },
  {
    id: 'java-401',
    title: 'Java Programming & Software Engineering',
    duration: '10 Weeks',
    instructor: 'Google / Coursera',
    curriculum: ['OOP', 'Java', 'Software Engineering'],
    badge: 'Java',
    description: 'Enterprise-grade Java development',
    courseLink: '/courses/java',
    testLink: '/tests/java',
    certificateLink: '/certificates/java',
    modules: [
      { title: 'Java Basics', topics: ['Variables', 'Control Flow', 'Methods'] },
      { title: 'OOP Concepts', topics: ['Classes', 'Inheritance', 'Polymorphism'] },
      { title: 'Advanced Java', topics: ['Collections', 'Streams', 'Concurrency'] },
      { title: 'Software Engineering', topics: ['Design Patterns', 'Testing', 'Debugging'] }
    ]
  },
  {
    id: 'python-402',
    title: 'Python for Everybody',
    duration: '12 Weeks',
    instructor: 'University of Michigan',
    curriculum: ['Python', 'APIs', 'Data'],
    badge: 'Python',
    description: 'Complete Python programming from basics',
    courseLink: '/courses/python',
    testLink: '/tests/python',
    certificateLink: '/certificates/python',
    modules: [
      { title: 'Python Basics', topics: ['Variables', 'Functions', 'Loops'] },
      { title: 'Data Structures', topics: ['Lists', 'Dictionaries', 'Tuples'] },
      { title: 'APIs & Web', topics: ['REST APIs', 'Flask', 'Requests'] },
      { title: 'Data Analysis', topics: ['NumPy', 'Pandas', 'Matplotlib'] }
    ]
  },
  {
    id: 'aws-701',
    title: 'AWS Cloud + DevOps Essentials',
    duration: '8 Weeks',
    instructor: 'AWS Trainers',
    curriculum: ['AWS', 'CI/CD', 'DevOps'],
    badge: 'AWS',
    description: 'Master cloud computing and DevOps',
    courseLink: '/courses/aws',
    testLink: '/tests/aws',
    certificateLink: '/certificates/aws',
    modules: [
      { title: 'AWS Fundamentals', topics: ['EC2', 'S3', 'VPC', 'Lambda'] },
      { title: 'DevOps Basics', topics: ['CI/CD', 'Docker', 'Kubernetes'] },
      { title: 'Infrastructure as Code', topics: ['Terraform', 'CloudFormation'] },
      { title: 'Monitoring', topics: ['CloudWatch', 'Logs', 'Alerts'] }
    ]
  }
];

// ==================== INTERNSHIPS ====================
// Comprehensive internship data matching Dashboard
const internships = [
  { 
    id: 1, 
    role: "Frontend Developer Intern",
    company: "GJ Global Services", 
    location: "Remote", 
    duration: "3 Months", 
    stipend: "₹0/mo", 
    logo: "🏢",
    match: 92,
    tags: ["React", "TypeScript", "Tailwind"],
    deadline: "Mar 15, 2026",
    seats: 5,
    accent: "#3b82f6",
    description: "Build responsive UIs for enterprise SaaS products with senior engineers."
  },
  { 
    id: 2, 
    role: "ML Engineer Intern",
    company: "GJ Global Services", 
    location: "Remote", 
    duration: "6 Months", 
    stipend: "₹0/mo", 
    logo: "🤖",
    match: 78,
    tags: ["Python", "TensorFlow", "SQL"],
    deadline: "Mar 22, 2026",
    seats: 3,
    accent: "#8b5cf6",
    description: "Train and deploy ML models for real-time analytics and NLP pipelines."
  },
  { 
    id: 3, 
    role: "DevOps Intern",
    company: "GJ Global Services", 
    location: "Remote", 
    duration: "4 Months", 
    stipend: "₹0/mo", 
    logo: "☁️",
    match: 65,
    tags: ["AWS", "Docker", "Jenkins"],
    deadline: "Apr 1, 2026",
    seats: 2,
    accent: "#f97316",
    description: "Manage CI/CD pipelines and cloud infrastructure for enterprise clients."
  },
  { 
    id: 4, 
    role: "Cybersecurity Analyst Intern",
    company: "GJ Global Services", 
    location: "Remote", 
    duration: "3 Months", 
    stipend: "₹0/mo", 
    logo: "🛡️",
    match: 55,
    tags: ["Kali Linux", "Wireshark", "Python"],
    deadline: "Apr 10, 2026",
    seats: 4,
    accent: "#ef4444",
    description: "Conduct vulnerability assessments and penetration testing on client systems."
  },
  { 
    id: 5, 
    role: "UI/UX & Web Dev Intern",
    company: "GJ Global Services", 
    location: "Remote", 
    duration: "2 Months", 
    stipend: "₹10/mo", 
    logo: "🎨",
    match: 84,
    tags: ["Figma", "Vue.js", "CSS"],
    deadline: "Apr 5, 2026",
    seats: 6,
    accent: "#ec4899",
    description: "Design and prototype interfaces, translating Figma designs into working code."
  },
  { 
    id: 6, 
    role: "Backend Developer Intern",
    company: "GJ Global Services", 
    location: "Remote", 
    duration: "5 Months", 
    stipend: "₹0/mo", 
    logo: "💹",
    match: 70,
    tags: ["Node.js", "MongoDB", "Redis"],
    deadline: "Mar 28, 2026",
    seats: 3,
    accent: "#22c55e",
    description: "Build and maintain high-performance APIs for payment processing systems."
  }
];

// ==================== PDF RESOURCES ====================
// Sample PDF resources (in production, these would be stored in MongoDB or file system)
// For demo purposes, all PDFs point to the sample resource
const pdfResources = [
  { id: "p1", category: "Web Development", title: "HTML5 Complete Reference", size: "2.4 MB", pages: 156, url: "/resources/sample-resource.pdf" },
  { id: "p2", category: "Web Development", title: "CSS3 Mastery Guide", size: "3.8 MB", pages: 234, url: "/resources/sample-resource.pdf" },
  { id: "p3", category: "Web Development", title: "JavaScript ES6 Quick Reference", size: "1.9 MB", pages: 89, url: "/resources/sample-resource.pdf" },
  { id: "p4", category: "Web Development", title: "React.js Best Practices", size: "2.1 MB", pages: 112, url: "/resources/sample-resource.pdf" },
  { id: "p5", category: "Data Science & AI", title: "Python Data Science Handbook", size: "4.2 MB", pages: 289, url: "/resources/sample-resource.pdf" },
  { id: "p6", category: "Data Science & AI", title: "Pandas Cheat Sheet", size: "1.8 MB", pages: 67, url: "/resources/sample-resource.pdf" },
  { id: "p7", category: "Data Science & AI", title: "Machine Learning Guide", size: "3.5 MB", pages: 198, url: "/resources/sample-resource.pdf" },
  { id: "p8", category: "Data Science & AI", title: "TensorFlow Manual", size: "4.8 MB", pages: 267, url: "/resources/sample-resource.pdf" },
  { id: "p9", category: "Cloud & DevOps", title: "AWS Services Overview", size: "5.2 MB", pages: 312, url: "/resources/sample-resource.pdf" },
  { id: "p10", category: "Cloud & DevOps", title: "Docker Containerization", size: "2.9 MB", pages: 156, url: "/resources/sample-resource.pdf" },
  { id: "p11", category: "Cloud & DevOps", title: "Kubernetes Architecture", size: "3.7 MB", pages: 201, url: "/resources/sample-resource.pdf" },
  { id: "p12", category: "Cloud & DevOps", title: "Linux Administration", size: "4.1 MB", pages: 245, url: "/resources/sample-resource.pdf" },
  { id: "p13", category: "Cybersecurity", title: "Cybersecurity Fundamentals", size: "3.4 MB", pages: 189, url: "/resources/sample-resource.pdf" },
  { id: "p14", category: "Cybersecurity", title: "Ethical Hacking Guide", size: "4.5 MB", pages: 256, url: "/resources/sample-resource.pdf" },
  { id: "p15", category: "Cybersecurity", title: "Network Security Protocols", size: "2.8 MB", pages: 134, url: "/resources/sample-resource.pdf" },
  { id: "p16", category: "Cybersecurity", title: "Security Audit Checklist", size: "1.2 MB", pages: 45, url: "/resources/sample-resource.pdf" },
];

// Video resources with YouTube embed URLs
const videoResources = [
  { id: "v1", category: "Web Development", title: "Complete HTML5 Tutorial", duration: "2h 30m", thumbnail: "https://img.youtube.com/vi/pQN-pnXHbvg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/pQN-pnXHbvg", watchUrl: "https://www.youtube.com/watch?v=pQN-pnXHbvg" },
  { id: "v2", category: "Web Development", title: "CSS3 Masterclass", duration: "3h 15m", thumbnail: "https://img.youtube.com/vi/yfoY53QXEnI/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/yfoY53QXEnI", watchUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI" },
  { id: "v3", category: "Web Development", title: "JavaScript ES6+ Complete", duration: "4h 45m", thumbnail: "https://img.youtube.com/vi/W6NZfCO5SIk/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/W6NZfCO5SIk", watchUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk" },
  { id: "v4", category: "Web Development", title: "React.js Full Course", duration: "5h 20m", thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/Ke90Tje7VS0", watchUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0" },
  { id: "v5", category: "Data Science & AI", title: "Python for Data Science", duration: "4h 00m", thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc", watchUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
  { id: "v6", category: "Data Science & AI", title: "Pandas & NumPy Tutorial", duration: "3h 30m", thumbnail: "https://img.youtube.com/vi/vmEHCJofslg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/vmEHCJofslg", watchUrl: "https://www.youtube.com/watch?v=vmEHCJofslg" },
  { id: "v7", category: "Data Science & AI", title: "Machine Learning A-Z", duration: "6h 15m", thumbnail: "https://img.youtube.com/vi/GwIo3gDZCVQ/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/GwIo3gDZCVQ", watchUrl: "https://www.youtube.com/watch?v=GwIo3gDZCVQ" },
  { id: "v8", category: "Data Science & AI", title: "Deep Learning with TensorFlow", duration: "4h 45m", thumbnail: "https://img.youtube.com/vi/tm1k5wD6uBw/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/tm1k5wD6uBw", watchUrl: "https://www.youtube.com/watch?v=tm1k5wD6uBw" },
  { id: "v9", category: "Cloud & DevOps", title: "AWS Cloud Practitioner", duration: "4h 30m", thumbnail: "https://img.youtube.com/vi/SOTamWNgDKc/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/SOTamWNgDKc", watchUrl: "https://www.youtube.com/watch?v=SOTamWNgDKc" },
  { id: "v10", category: "Cloud & DevOps", title: "Docker & Containers", duration: "3h 00m", thumbnail: "https://img.youtube.com/vi/fqMOX6JJhGo/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/fqMOX6JJhGo", watchUrl: "https://www.youtube.com/watch?v=fqMOX6JJhGo" },
  { id: "v11", category: "Cloud & DevOps", title: "Kubernetes for Beginners", duration: "3h 45m", thumbnail: "https://img.youtube.com/vi/H0dkXcmZ0Ak/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/H0dkXcmZ0Ak", watchUrl: "https://www.youtube.com/watch?v=H0dkXcmZ0Ak" },
  { id: "v12", category: "Cloud & DevOps", title: "Linux Command Line", duration: "4h 00m", thumbnail: "https://img.youtube.com/vi/zWl327O-K7c/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/zWl327O-K7c", watchUrl: "https://www.youtube.com/watch?v=zWl327O-K7c" },
  { id: "v13", category: "Cybersecurity", title: "Cybersecurity Fundamentals", duration: "3h 00m", thumbnail: "https://img.youtube.com/vi/ysxfz7F2pGg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/ysxfz7F2pGg", watchUrl: "https://www.youtube.com/watch?v=ysxfz7F2pGg" },
  { id: "v14", category: "Cybersecurity", title: "Ethical Hacking with Kali Linux", duration: "4h 30m", thumbnail: "https://img.youtube.com/vi/VtNRc5lJ2Zg/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/VtNRc5lJ2Zg", watchUrl: "https://www.youtube.com/watch?v=VtNRc5lJ2Zg" },
  { id: "v15", category: "Cybersecurity", title: "Network Security Testing", duration: "5h 00m", thumbnail: "https://img.youtube.com/vi/3Kq1MIfTWCE/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/3Kq1MIfTWCE", watchUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" },
  { id: "v16", category: "Cybersecurity", title: "Wireshark Network Analyzer", duration: "2h 45m", thumbnail: "https://img.youtube.com/vi/8qIk16M4LyU/sddefault.jpg", embedUrl: "https://www.youtube.com/embed/8qIk16M4LyU", watchUrl: "https://www.youtube.com/watch?v=8qIk16M4LyU" },
];

// Group resources by category
const getResourcesByCategory = () => {
  const categories = ["Web Development", "Data Science & AI", "Cloud & DevOps", "Cybersecurity"];
  return categories.map(category => ({
    category,
    videos: videoResources.filter(v => v.category === category),
    pdfs: pdfResources.filter(p => p.category === category)
  }));
};

// Helper to enrich enrollment with course data
const enrichEnrollments = async (enrollments) => {
  return enrollments.map(enrollment => ({
    ...enrollment.toObject(),
    course: courses.find(c => c.id === enrollment.courseId)
  }));
};

// ==================== PUBLIC ROUTES ====================

// GET all courses
router.get('/courses', async (req, res) => {
  try {
    const { category, badge } = req.query;
    let filteredCourses = [...courses];
    
    if (badge && badge !== 'all') {
      filteredCourses = filteredCourses.filter(c => c.badge === badge);
    }
    
    res.json({ courses: filteredCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
});

// GET single course
router.get('/courses/:id', async (req, res) => {
  try {
    const course = courses.find(c => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Server error fetching course' });
  }
});

// GET all internships
router.get('/internships', async (req, res) => {
  try {
    res.json({ internships });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Server error fetching internships' });
  }
});

// ==================== RESOURCES (VIDEOS & PDFS) ====================

// GET all resources (videos and PDFs grouped by category)
router.get('/resources', async (req, res) => {
  try {
    const resources = getResourcesByCategory();
    res.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Server error fetching resources' });
  }
});

// GET video resources only
router.get('/resources/videos', async (req, res) => {
  try {
    const { category } = req.query;
    let filteredVideos = [...videoResources];
    
    if (category && category !== 'all') {
      filteredVideos = filteredVideos.filter(v => v.category === category);
    }
    
    res.json({ videos: filteredVideos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Server error fetching videos' });
  }
});

// GET PDF resources only
router.get('/resources/pdfs', async (req, res) => {
  try {
    const { category } = req.query;
    let filteredPdfs = [...pdfResources];
    
    if (category && category !== 'all') {
      filteredPdfs = filteredPdfs.filter(p => p.category === category);
    }
    
    res.json({ pdfs: filteredPdfs });
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ error: 'Server error fetching PDFs' });
  }
});

// GET single video by ID
router.get('/resources/videos/:id', async (req, res) => {
  try {
    const video = videoResources.find(v => v.id === req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ video });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Server error fetching video' });
  }
});

// GET single PDF by ID
router.get('/resources/pdfs/:id', async (req, res) => {
  try {
    const pdf = pdfResources.find(p => p.id === req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    res.json({ pdf });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({ error: 'Server error fetching PDF' });
  }
});

// ==================== AUTHENTICATED ROUTES ====================

// GET user profile with enrollments
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id });
    const enrichedEnrollments = await enrichEnrollments(enrollments);
    
    const stats = {
      totalEnrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      inProgressCourses: enrollments.filter(e => e.status === 'active').length,
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0
    };
    
    res.json({ 
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      },
      enrollments: enrichedEnrollments,
      stats
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// GET user's enrolled courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id }).sort({ enrolledAt: -1 });
    const enrichedEnrollments = await enrichEnrollments(enrollments);
    res.json({ enrollments: enrichedEnrollments });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
});

// POST enroll in a course
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Verify course exists
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ 
      userId: req.user._id, 
      courseId 
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Create new enrollment
    const enrollment = new Enrollment({
      userId: req.user._id,
      courseId,
      progress: 0,
      status: 'active',
      completedModules: [],
      lastAccessedAt: new Date()
    });
    
    await enrollment.save();
    
    const enrichedEnrollment = await enrichEnrollments([enrollment]);
    
    res.status(201).json({ 
      message: 'Enrolled successfully',
      enrollment: enrichedEnrollment[0]
    });
  } catch (error) {
    console.error('Error enrolling:', error);
    res.status(500).json({ error: 'Server error enrolling' });
  }
});

// GET single enrollment details
router.get('/enrollments/:id', authenticateToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Verify ownership
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const enrichedEnrollment = await enrichEnrollments([enrollment]);
    res.json({ enrollment: enrichedEnrollment[0] });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ error: 'Server error fetching enrollment' });
  }
});

// PUT update enrollment progress
router.put('/enrollments/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Verify ownership
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update progress
    enrollment.progress = Math.min(100, Math.max(0, progress));
    enrollment.lastAccessedAt = new Date();
    
    // Mark as completed if progress reaches 100%
    if (enrollment.progress === 100) {
      enrollment.status = 'completed';
    }
    
    await enrollment.save();
    
    const enrichedEnrollment = await enrichEnrollments([enrollment]);
    
    res.json({ 
      message: 'Progress updated',
      enrollment: enrichedEnrollment[0]
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Server error updating progress' });
  }
});

// POST complete a module
router.post('/enrollments/:id/complete-module', authenticateToken, async (req, res) => {
  try {
    const { moduleIndex } = req.body;
    
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Verify ownership
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if module already completed
    const alreadyCompleted = enrollment.completedModules.some(
      m => m.moduleIndex === moduleIndex
    );
    
    if (alreadyCompleted) {
      return res.status(400).json({ error: 'Module already completed' });
    }
    
    // Add module to completed list
    enrollment.completedModules.push({
      moduleIndex,
      completedAt: new Date()
    });
    
    // Recalculate progress
    const course = courses.find(c => c.id === enrollment.courseId);
    if (course) {
      enrollment.progress = Math.round(
        (enrollment.completedModules.length / course.modules.length) * 100
      );
      
      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
      }
    }
    
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
    
    const enrichedEnrollment = await enrichEnrollments([enrollment]);
    res.json({ 
      message: 'Module completed',
      enrollment: enrichedEnrollment[0]
    });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({ error: 'Server error completing module' });
  }
});

// POST submit test
router.post('/enrollments/:id/test', authenticateToken, async (req, res) => {
  try {
    const { score } = req.body;
    
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Verify ownership
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update test score
    enrollment.testScore = Math.max(enrollment.testScore || 0, score);
    enrollment.testAttempts += 1;
    enrollment.lastAccessedAt = new Date();
    
    // Award certificate if score >= 70%
    if (enrollment.testScore >= 70 && !enrollment.certificateIssued) {
      enrollment.certificateIssued = true;
      enrollment.certificateUrl = `/certificates/${enrollment._id}.pdf`;
      enrollment.status = 'completed';
      enrollment.progress = 100;
    }
    
    await enrollment.save();
    
    const enrichedEnrollment = await enrichEnrollments([enrollment]);
    res.json({ 
      message: enrollment.testScore >= 70 ? 'Congratulations! Certificate issued!' : 'Test submitted',
      passed: enrollment.testScore >= 70,
      enrollment: enrichedEnrollment[0]
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Server error submitting test' });
  }
});

// DELETE unenroll from course
router.delete('/enrollments/:id', authenticateToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Verify ownership
    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Error unenrolling:', error);
    res.status(500).json({ error: 'Server error unenrolling' });
  }
});

// GET user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id });
    
    const stats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      inProgressCourses: enrollments.filter(e => e.status === 'active').length,
      totalCertificates: enrollments.filter(e => e.certificateIssued).length,
      averageScore: enrollments.filter(e => e.testScore).length > 0
        ? Math.round(
            enrollments
              .filter(e => e.testScore)
              .reduce((sum, e) => sum + e.testScore, 0) / 
            enrollments.filter(e => e.testScore).length
          )
        : 0,
      totalLearningHours: enrollments.reduce((sum, e) => {
        const course = courses.find(c => c.id === e.courseId);
        return sum + (course ? parseInt(course.duration) : 0);
      }, 0)
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// ==================== ADMIN ROUTES ====================

// GET all enrollments (admin)
router.get('/admin/enrollments', authenticateToken, async (req, res) => {
  try {
    // In production, add admin role check here
    const enrollments = await Enrollment.find().sort({ enrolledAt: -1 });
    const enrichedEnrollments = await enrichEnrollments(enrollments);
    
    const stats = {
      totalEnrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      activeCourses: enrollments.filter(e => e.status === 'active').length,
      certificatesIssued: enrollments.filter(e => e.certificateIssued).length
    };
    
    res.json({ enrollments: enrichedEnrollments, stats });
  } catch (error) {
    console.error('Error fetching admin enrollments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all users with their enrollments (admin)
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    // Get all unique user IDs from enrollments
    const enrollments = await Enrollment.find();
    const uniqueUserIds = [...new Set(enrollments.map(e => e.userId.toString()))];
    
    // This would normally query the User collection
    // For now, return enrollment stats per user
    const userStats = uniqueUserIds.map(userId => {
      const userEnrollments = enrollments.filter(
        e => e.userId.toString() === userId
      );
      return {
        userId,
        totalEnrollments: userEnrollments.length,
        completedCourses: userEnrollments.filter(e => e.status === 'completed').length,
        averageProgress: Math.round(
          userEnrollments.reduce((sum, e) => sum + e.progress, 0) / userEnrollments.length
        )
      };
    });
    
    res.json({ users: userStats });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== INTERNSHIP APPLICATION ROUTES ====================

// POST apply for an internship
router.post('/apply-internship', authenticateToken, async (req, res) => {
  try {
    const { internshipId, role, company, applicationData } = req.body;
    
    if (!internshipId || !role || !company) {
      return res.status(400).json({ error: 'Internship details are required' });
    }
    
    // Check if already applied
    const existingApplication = await InternshipApplication.findOne({ 
      userId: req.user._id, 
      internshipId 
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this internship' });
    }
    
    // Create new application
    const application = new InternshipApplication({
      userId: req.user._id,
      internshipId,
      role,
      company,
      status: 'pending',
      applicationData: applicationData || {}
    });
    
    await application.save();
    
    res.status(201).json({ 
      message: 'Application submitted successfully! We will review your application and contact you soon.',
      application: {
        id: application._id,
        internshipId: application.internshipId,
        role: application.role,
        company: application.company,
        status: application.status,
        appliedAt: application.appliedAt,
        applicationData: application.applicationData
      }
    });
  } catch (error) {
    console.error('Error applying for internship:', error);
    res.status(500).json({ error: 'Server error applying for internship' });
  }
});

// GET user's internship applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await InternshipApplication.find({ userId: req.user._id })
      .sort({ appliedAt: -1 });
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

// GET all internship applications (admin)
router.get('/admin/internship-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await InternshipApplication.find()
      .populate('userId', 'username email')
      .sort({ appliedAt: -1 });
    
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };
    
    res.json({ applications, stats });
  } catch (error) {
    console.error('Error fetching admin applications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update application status (admin)
router.put('/admin/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const application = await InternshipApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.status = status;
    await application.save();
    
    res.json({ 
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

