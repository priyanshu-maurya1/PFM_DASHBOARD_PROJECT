import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Base uploads directory
const baseUploadsDir = path.join(__dirname, '../uploads');
console.log('Upload directory:', baseUploadsDir);

try {
  if (!fs.existsSync(baseUploadsDir)) {
    fs.mkdirSync(baseUploadsDir, { recursive: true });
    console.log('Created uploads directory:', baseUploadsDir);
  } else {
    console.log('Uploads directory already exists:', baseUploadsDir);
  }
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

// Helper function to get user-specific upload directory
const getUserUploadDir = (userId) => {
  const userDir = path.join(baseUploadsDir, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

// Configure multer for file uploads - uses dynamic destination based on user
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get userId from authenticated user (req.user is set by auth middleware)
    // Fall back to body.userId or query.userId for backward compatibility
    const userId = req.user?.id || req.body.userId || req.query.userId || 'default';
    
    const uploadPath = getUserUploadDir(userId);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to prevent duplicates
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + safeFilename);
  }
});

// Filter to allow all file types
const fileFilter = (req, file, cb) => {
  // Allow all file types
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit per file
  }
});

// Single file upload - requires authentication
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const userId = req.user.id;
    const relativePath = req.body.relativePath || req.file.originalname;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        relativePath: relativePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        url: `/uploads/${userId}/${path.relative(getUserUploadDir(userId), req.file.path)}`,
        userId: userId
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.json({ 
      success: false, 
      error: 'Upload failed: ' + error.message 
    });
  }
});

// Multiple files upload - requires authentication
router.post('/upload/multiple', authenticateToken, upload.array('files', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const userId = req.user.id;

    const filesInfo = req.files.map((file, index) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: `/uploads/${userId}/${path.relative(getUserUploadDir(userId), file.path)}`,
      userId: userId
    }));

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      files: filesInfo
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.json({
      success: false,
      error: 'Upload failed: ' + error.message
    });
  }
});

// Folder upload (batch) - requires authentication
router.post('/upload/folder', authenticateToken, upload.array('files', 100), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const userId = req.user.id;
    const totalFiles = parseInt(req.body.totalFiles) || req.files.length;

    const filesInfo = req.files.map((file, index) => {
      const relativePath = req.body.relativePaths ? JSON.parse(req.body.relativePaths)[index] : file.originalname;
      return {
        filename: file.filename,
        originalName: file.originalname,
        relativePath: relativePath,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
        url: `/uploads/${userId}/${path.relative(getUserUploadDir(userId), file.path)}`,
        userId: userId
      };
    });

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      totalFiles: totalFiles,
      uploadedFiles: req.files.length,
      files: filesInfo
    });
  } catch (error) {
    console.error('Folder upload error:', error);
    res.json({
      success: false,
      error: 'Upload failed: ' + error.message
    });
  }
});

// Get list of uploaded files - requires authentication, returns only user's files
router.get('/files', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userUploadsDir = getUserUploadDir(userId);

    if (!fs.existsSync(userUploadsDir)) {
      return res.json({
        success: true,
        files: [],
        message: 'No files found'
      });
    }

    const getAllFiles = (dir, userId) => {
      const results = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results.push(...getAllFiles(filePath, userId));
        } else {
          results.push({
            name: file,
            path: filePath,
            relativePath: path.relative(userUploadsDir, filePath),
            size: stat.size,
            modified: stat.mtime,
            userId: userId
          });
        }
      });
      return results;
    };

    const files = getAllFiles(userUploadsDir, userId);

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.json({
      success: false,
      error: 'Failed to get files: ' + error.message
    });
  }
});

// Delete a file - requires authentication and ownership check
router.delete('/file', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    let filePath = req.body.path;

    if (!filePath) {
      return res.json({
        success: false,
        error: 'File path required'
      });
    }

    console.log('Delete request received for path:', filePath, 'by user:', userId);
    
    // Handle different path formats and extract filename
    let filename = filePath;
    
    // Case 1: Path is /uploads/userId/filename - extract just filename
    if (filePath.startsWith(`/uploads/${userId}/`)) {
      filename = filePath.substring(`/uploads/${userId}/`.length);
    } 
    // Case 2: Path is /uploads/filename (without userId) - use filename directly
    else if (filePath.startsWith('/uploads/')) {
      filename = filePath.substring('/uploads/'.length);
      // If filename still looks like a userId (very long string like MongoDB ObjectId), 
      // it might be the old format - try the next case
      if (filename.includes('/')) {
        const parts = filename.split('/');
        const pathUserId = parts[0];
        if (pathUserId !== userId) {
          console.error('Security: User trying to access another user\'s file:', pathUserId, 'vs', userId);
          return res.json({
            success: false,
            error: 'Access denied'
          });
        }
        filename = parts.slice(1).join('/');
      }
    }
    // Case 3: Path is uploads/filename - strip prefix
    else if (filePath.startsWith('uploads/')) {
      filename = filePath.substring('uploads/'.length);
    }
    // Case 4: Path is just a filename - use as-is
    else {
      filename = filePath;
    }
    
    // Construct the full path within user's directory
    let fullPath = path.join(getUserUploadDir(userId), filename);
    
    // Normalize the path to handle any traversal attempts
    fullPath = path.normalize(fullPath);
    
    // Security: Ensure path is within user's uploads directory
    const userDir = getUserUploadDir(userId);
    const normalizedUserDir = path.normalize(userDir);
    if (!fullPath.startsWith(normalizedUserDir)) {
      console.error('Security: Path attempted to escape uploads directory:', fullPath);
      return res.json({
        success: false,
        error: 'Access denied'
      });
    }

    console.log('Attempting to delete file at:', fullPath);
    console.log('User directory:', normalizedUserDir);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('File deleted successfully:', fullPath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      console.error('File not found:', fullPath);
      // Try alternative path formats
      const altPaths = [
        path.join(getUserUploadDir(userId), path.basename(filePath)),
        path.join(getUserUploadDir(userId), filePath.replace(/^\/uploads\//, '').replace(/^uploads\//, ''))
      ];
      
      for (const altPath of altPaths) {
        const normalizedAltPath = path.normalize(altPath);
        console.log('Trying alternative path:', normalizedAltPath);
        if (fs.existsSync(normalizedAltPath)) {
          fs.unlinkSync(normalizedAltPath);
          console.log('File deleted successfully (alternative path):', normalizedAltPath);
          return res.json({
            success: true,
            message: 'File deleted successfully'
          });
        }
      }
      
      res.json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.json({
      success: false,
      error: 'Delete failed: ' + error.message
    });
  }
});

// Delete a file (using POST method - alternative) - requires authentication
router.post('/file/delete', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    let filePath = req.body.path;

    if (!filePath) {
      return res.json({
        success: false,
        error: 'File path required'
      });
    }

    console.log('Delete request (POST) received for path:', filePath, 'by user:', userId);
    
    // Handle different path formats and extract filename
    let filename = filePath;
    
    // Case 1: Path is /uploads/userId/filename - extract just filename
    if (filePath.startsWith(`/uploads/${userId}/`)) {
      filename = filePath.substring(`/uploads/${userId}/`.length);
    } 
    // Case 2: Path is /uploads/filename (without userId) - use filename directly
    else if (filePath.startsWith('/uploads/')) {
      filename = filePath.substring('/uploads/'.length);
      if (filename.includes('/')) {
        const parts = filename.split('/');
        const pathUserId = parts[0];
        if (pathUserId !== userId) {
          console.error('Security: User trying to access another user\'s file:', pathUserId, 'vs', userId);
          return res.json({
            success: false,
            error: 'Access denied'
          });
        }
        filename = parts.slice(1).join('/');
      }
    }
    // Case 3: Path is uploads/filename - strip prefix
    else if (filePath.startsWith('uploads/')) {
      filename = filePath.substring('uploads/'.length);
    }
    // Case 4: Path is just a filename - use as-is
    else {
      filename = filePath;
    }
    
    let fullPath = path.join(getUserUploadDir(userId), filename);
    fullPath = path.normalize(fullPath);
    
    // Security: Ensure path is within user's uploads directory
    const userDir = getUserUploadDir(userId);
    const normalizedUserDir = path.normalize(userDir);
    if (!fullPath.startsWith(normalizedUserDir)) {
      console.error('Security: Path attempted to escape uploads directory:', fullPath);
      return res.json({
        success: false,
        error: 'Access denied'
      });
    }

    console.log('Attempting to delete file at:', fullPath);
    console.log('User directory:', normalizedUserDir);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('File deleted successfully:', fullPath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      console.error('File not found:', fullPath);
      // Try alternative path formats
      const altPaths = [
        path.join(getUserUploadDir(userId), path.basename(filePath)),
        path.join(getUserUploadDir(userId), filePath.replace(/^\/uploads\//, '').replace(/^uploads\//, ''))
      ];
      
      for (const altPath of altPaths) {
        const normalizedAltPath = path.normalize(altPath);
        console.log('Trying alternative path:', normalizedAltPath);
        if (fs.existsSync(normalizedAltPath)) {
          fs.unlinkSync(normalizedAltPath);
          console.log('File deleted successfully (alternative path):', normalizedAltPath);
          return res.json({
            success: true,
            message: 'File deleted successfully'
          });
        }
      }
      
      res.json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.json({
      success: false,
      error: 'Delete failed: ' + error.message
    });
  }
});

export default router;

