// routes/quizRoutes.js
import express from 'express';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Submit quiz result (protected route)
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { 
      username, college, course, role, week, 
      score, correct, total, percentage, grade, answers 
    } = req.body;

    // Validation
    if (!username || !course || !week || score === undefined || 
        correct === undefined || total === undefined || 
        percentage === undefined || !grade) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already completed this week's quiz
    const existingResult = await QuizResult.findOne({
      userId: req.user._id,
      week
    });

    if (existingResult) {
      // Update existing result only if new score is better
      if (score > existingResult.score) {
        existingResult.score = score;
        existingResult.correct = correct;
        existingResult.total = total;
        existingResult.percentage = percentage;
        existingResult.grade = grade;
        existingResult.answers = answers;
        existingResult.timestamp = Date.now();
        
        await existingResult.save();
        
        return res.json({ 
          message: 'Quiz result updated', 
          result: existingResult 
        });
      }
      
      return res.json({ 
        message: 'Previous result was better', 
        result: existingResult 
      });
    }

    // Create new quiz result
    const quizResult = new QuizResult({
      userId: req.user._id,
      username,
      college,
      course,
      role,
      week,
      score,
      correct,
      total,
      percentage,
      grade,
      answers
    });

    await quizResult.save();

    res.status(201).json({ 
      message: 'Quiz result saved successfully', 
      result: quizResult 
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ error: 'Failed to save quiz result' });
  }
});

// Get current user's quiz results (protected route)
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .sort({ timestamp: -1 });
    
    res.json({ results });
  } catch (error) {
    console.error('Error fetching user quiz results:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
});

// Get all users' quiz results for leaderboard (protected route)
router.get('/all-results', authenticateToken, async (req, res) => {
  try {
    // Get all quiz results with user info
    const results = await QuizResult.find()
      .populate('userId', 'username profilePicture')
      .sort({ score: -1, timestamp: -1 });
    
    // Group results by user and get best score per user, also count attempts
    const userMap = new Map();
    
    results.forEach(result => {
      const userId = result.userId?._id?.toString() || result.userId?.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          username: result.username,
          college: result.college,
          course: result.course,
          role: result.role,
          score: result.score,
          percentage: result.percentage,
          grade: result.grade,
          week: result.week,
          timestamp: result.timestamp,
          profilePicture: result.userId?.profilePicture || '',
          quizAttempts: 1
        });
      } else {
        // Increment quiz attempts for this user
        const existing = userMap.get(userId);
        existing.quizAttempts += 1;
        // Update score if new score is higher
        if (result.score > existing.score) {
          existing.score = result.score;
          existing.percentage = result.percentage;
          existing.grade = result.grade;
          existing.week = result.week;
          existing.timestamp = result.timestamp;
        }
      }
    });
    
    // Convert to array and sort by score
    const leaderboard = Array.from(userMap.values())
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    // Get aggregated stats
    const totalTests = results.length;
    const totalPoints = results.reduce((sum, r) => sum + r.score, 0);
    const uniqueUsers = userMap.size;
    
    res.json({ 
      leaderboard,
      stats: {
        totalUsers: uniqueUsers,
        totalTests,
        totalPoints
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Get weekly leaderboard (protected route)
router.get('/weekly/:week', authenticateToken, async (req, res) => {
  try {
    const { week } = req.params;
    
    const results = await QuizResult.find({ week })
      .populate('userId', 'username profilePicture')
      .sort({ score: -1 });
    
    // Group by user and get best score
    const userMap = new Map();
    
    results.forEach(result => {
      const userId = result.userId?._id?.toString() || result.userId?.toString();
      if (!userMap.has(userId) || result.score > userMap.get(userId).score) {
        userMap.set(userId, {
          id: userId,
          username: result.username,
          college: result.college,
          course: result.course,
          role: result.role,
          score: result.score,
          percentage: result.percentage,
          grade: result.grade,
          week: result.week,
          timestamp: result.timestamp
        });
      }
    });
    
    const leaderboard = Array.from(userMap.values())
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching weekly leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

// Get college-wise leaderboard (protected route)
router.get('/college/:college', authenticateToken, async (req, res) => {
  try {
    const { college } = req.params;
    
    const results = await QuizResult.find({ college })
      .sort({ score: -1 });
    
    // Aggregate by user
    const userMap = new Map();
    
    results.forEach(result => {
      const userId = result.userId?.toString();
      if (!userMap.has(userId) || result.score > userMap.get(userId).score) {
        userMap.set(userId, {
          id: userId,
          username: result.username,
          college: result.college,
          course: result.course,
          role: result.role,
          score: result.score,
          percentage: result.percentage,
          grade: result.grade,
          week: result.week
        });
      }
    });
    
    const leaderboard = Array.from(userMap.values())
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    const totalScore = leaderboard.reduce((sum, u) => sum + u.score, 0);
    
    res.json({ 
      leaderboard,
      college,
      totalScore,
      totalStudents: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching college leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch college leaderboard' });
  }
});

// Get course-wise leaderboard (protected route)
router.get('/course/:course', authenticateToken, async (req, res) => {
  try {
    const { course } = req.params;
    
    const results = await QuizResult.find({ course })
      .sort({ score: -1 });
    
    // Aggregate by user
    const userMap = new Map();
    
    results.forEach(result => {
      const userId = result.userId?.toString();
      if (!userMap.has(userId) || result.score > userMap.get(userId).score) {
        userMap.set(userId, {
          id: userId,
          username: result.username,
          college: result.college,
          course: result.course,
          role: result.role,
          score: result.score,
          percentage: result.percentage,
          grade: result.grade,
          week: result.week
        });
      }
    });
    
    const leaderboard = Array.from(userMap.values())
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    res.json({ 
      leaderboard,
      course,
      totalStudents: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching course leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch course leaderboard' });
  }
});

export default router;

