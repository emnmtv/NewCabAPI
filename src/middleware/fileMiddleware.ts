import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create storage configuration
const storage = multer.diskStorage({
  destination: (req: any, _file, cb) => {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    const type = req.body.uploadType || 'tasks'; // 'tasks' or 'submissions'
    
    // For student submissions, use their LRN if available
    let uploadDir;
    if (type === 'submissions' && req.user?.role === 'student') {
      // Get student LRN from database if needed
      uploadDir = path.join('uploads', type, userId.toString());
    } else {
      uploadDir = path.join('uploads', type, userId.toString());
    }
    
    // Create directories if they don't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp but preserve original name
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    // Store with unique name but keep original name for display
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter to allow specific file types
const fileFilter = (_req: any, _file: any, cb: any) => {
  // Accept all file types for now
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024 // 300MB limit
  }
}); 