import express from 'express';
import os from 'os';
import { authenticateToken } from '../middlewares/auth.js';
import InternshipApplication from '../models/InternshipApplication.js';

const router = express.Router();

// Store server start time
const serverStartTime = Date.now();

// Get server statistics (public - no auth required for login page)
router.get('/api/server/stats', async (req, res) => {
  try {
    // Get uptime in seconds
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);

    // Format uptime string
    let uptimeStr = '';
    if (uptimeDays > 0) uptimeStr += `${uptimeDays}d `;
    if (uptimeHours % 24 > 0) uptimeStr += `${uptimeHours % 24}h `;
    if (uptimeMinutes % 60 > 0) uptimeStr += `${uptimeMinutes % 60}m`;
    if (uptimeStr === '') uptimeStr = `${uptimeSeconds}s`;

    // Get memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = Math.round((usedMem / totalMem) * 100);

    // Get CPU info
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
    const cpuCores = cpus.length;

    // Get load average (available on Unix-like systems, returns [1min, 5min, 15min])
    const loadAvg = os.loadavg();
    const loadPercent = Math.round((loadAvg[0] / cpuCores) * 100);

    // Get connected clients count from socket.io
    // Access the io instance from the app
    const io = req.app.get('io');
    let connectedClients = 0;
    
    if (io) {
      // Get all connected sockets
      connectedClients = io.sockets.sockets.size;
    }

    // Get process info
    const processInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      }
    };

    // Get system info
    const systemInfo = {
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      totalMemory: Math.round(totalMem / 1024 / 1024 / 1024) + ' GB',
      freeMemory: Math.round(freeMem / 1024 / 1024 / 1024) + ' GB',
      usedMemory: Math.round(usedMem / 1024 / 1024 / 1024) + ' GB'
    };

    res.json({
      success: true,
      stats: {
        uptime: {
          seconds: uptimeSeconds,
          formatted: uptimeStr.trim(),
          days: uptimeDays,
          hours: uptimeHours,
          minutes: uptimeMinutes
        },
        connectedClients: connectedClients,
        cpu: {
          model: cpuModel,
          cores: cpuCores,
          loadAverage: loadAvg.map(l => l.toFixed(2)),
          loadPercent: Math.min(loadPercent, 100)
        },
        memory: {
          total: systemInfo.totalMemory,
          used: systemInfo.usedMemory,
          free: systemInfo.freeMemory,
          usagePercent: memUsagePercent
        },
        process: processInfo,
        system: systemInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting server stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get server statistics' });
  }
});

// Get server health check
router.get('/api/server/health', async (req, res) => {
  try {
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    
    // Get memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsagePercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

    // Get connected clients
    const io = req.app.get('io');
    let connectedClients = 0;
    if (io) {
      connectedClients = io.sockets.sockets.size;
    }

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: formatUptime(uptimeSeconds)
      },
      clients: connectedClients,
      memory: memUsagePercent
    });
  } catch (error) {
    console.error('Error getting server health:', error);
    res.status(500).json({ success: false, status: 'unhealthy', error: error.message });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

// Get all internships/vacancies (public endpoint for dashboard)
router.get('/api/vacancies', async (req, res) => {
  try {
    // For now, return predefined vacancy data from database or default
    // In production, this would fetch from InternshipApplication or a Vacancy model
    
    // Default vacancies (in case no data in database)
    const defaultVacancies = [
      { 
        id: 1, 
        company: "GJ Global Services", 
        role: "Frontend Developer Intern", 
        location: "Remote", 
        duration: "3 Months", 
        stipend: "₹0/mo", 
        logo: "🏢", 
        match: 92, 
        tags: ["React", "TypeScript", "Tailwind"], 
        deadline: "Mar 15, 2026", 
        seats: 5, 
        accent: "#3b82f6", 
        desc: "Build responsive UIs for enterprise SaaS products with senior engineers.",
        requirements: ["HTML/CSS", "JavaScript", "React basics"],
        responsibilities: ["Develop UI components", "Fix bugs", "Write tests"]
      },
      { 
        id: 2, 
        company: "GJ Global Services", 
        role: "ML Engineer Intern", 
        location: "Remote", 
        duration: "6 Months", 
        stipend: "₹0/mo", 
        logo: "🤖", 
        match: 78, 
        tags: ["Python", "TensorFlow", "SQL"], 
        deadline: "Mar 22, 2026", 
        seats: 3, 
        accent: "#8b5cf6", 
        desc: "Train and deploy ML models for real-time analytics and NLP pipelines.",
        requirements: ["Python", "Machine Learning basics", "SQL"],
        responsibilities: ["Train ML models", "Analyze data", "Deploy models"]
      },
      { 
        id: 3, 
        company: "GJ Global Services", 
        role: "DevOps Intern", 
        location: "Remote", 
        duration: "4 Months", 
        stipend: "₹0/mo", 
        logo: "☁️", 
        match: 65, 
        tags: ["AWS", "Docker", "Jenkins"], 
        deadline: "Apr 1, 2026", 
        seats: 2, 
        accent: "#f97316", 
        desc: "Manage CI/CD pipelines and cloud infrastructure for enterprise clients.",
        requirements: ["Linux", "Cloud basics", "Networking"],
        responsibilities: ["Maintain pipelines", "Monitor servers", "Automate tasks"]
      },
      { 
        id: 4, 
        company: "GJ Global Services", 
        role: "Cybersecurity Analyst Intern", 
        location: "Remote", 
        duration: "3 Months", 
        stipend: "₹0/mo", 
        logo: "🛡️", 
        match: 55, 
        tags: ["Kali Linux", "Wireshark", "Python"], 
        deadline: "Apr 10, 2026", 
        seats: 4, 
        accent: "#ef4444", 
        desc: "Conduct vulnerability assessments and penetration testing on client systems.",
        requirements: ["Networking", "Security basics", "Linux"],
        responsibilities: ["Conduct assessments", "Write reports", "Research threats"]
      },
      { 
        id: 5, 
        company: "GJ Global Services", 
        role: "UI/UX & Web Dev Intern", 
        location: "Remote", 
        duration: "2 Months", 
        stipend: "₹10/mo", 
        logo: "🎨", 
        match: 84, 
        tags: ["Figma", "Vue.js", "CSS"], 
        deadline: "Apr 5, 2026", 
        seats: 6, 
        accent: "#ec4899", 
        desc: "Design and prototype interfaces, translating Figma designs into working code.",
        requirements: ["Design basics", "Figma", "CSS"],
        responsibilities: ["Create designs", "Prototyping", "User research"]
      },
      { 
        id: 6, 
        company: "GJ Global Services", 
        role: "Backend Developer Intern", 
        location: "Remote", 
        duration: "5 Months", 
        stipend: "₹0/mo", 
        logo: "💹", 
        match: 70, 
        tags: ["Node.js", "MongoDB", "Redis"], 
        deadline: "Mar 28, 2026", 
        seats: 3, 
        accent: "#22c55e", 
        desc: "Build and maintain high-performance APIs for payment processing systems.",
        requirements: ["JavaScript", "Node.js basics", "API concepts"],
        responsibilities: ["Develop APIs", "Write documentation", "Optimize queries"]
      }
    ];

    // Try to get from database
    try {
      const applications = await InternshipApplication.find({}).limit(100);
      if (applications && applications.length > 0) {
        // Map database applications to vacancy format
        const vacanciesFromDB = applications.map((app, idx) => ({
          id: app._id,
          company: "GJ Global Services",
          role: app.position || "Intern",
          location: app.location || "Remote",
          duration: app.duration || "3 Months",
          stipend: app.stipend || "₹0/mo",
          logo: "🏢",
          match: Math.floor(Math.random() * 30) + 65,
          tags: app.skills || ["General"],
          deadline: app.applicationDeadline ? new Date(app.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Apr 30, 2026",
          seats: app.openings || 5,
          accent: ["#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#22c55e", "#ec4899"][idx % 6],
          desc: app.description || "Join our team as an intern.",
          status: app.status,
          applicantCount: app.applicants ? app.applicants.length : 0
        }));
        return res.json({ success: true, vacancies: vacanciesFromDB });
      }
    } catch (dbError) {
      console.log('Could not fetch from database, using defaults:', dbError.message);
    }

    // Return default vacancies
    res.json({ success: true, vacancies: defaultVacancies });
  } catch (error) {
    console.error('Error getting vacancies:', error);
    res.status(500).json({ success: false, error: 'Failed to get vacancies' });
  }
});

// Get vacancy statistics
router.get('/api/vacancies/stats', authenticateToken, async (req, res) => {
  try {
    const totalApplications = await InternshipApplication.countDocuments({});
    
    const statusCounts = await InternshipApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalApplications,
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr._id || 'unknown'] = curr.count;
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting vacancy stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get vacancy statistics' });
  }
});

export default router;

