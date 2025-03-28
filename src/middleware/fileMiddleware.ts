import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create storage configuration
const storage = multer.diskStorage({
  destination: (req: any, _file, cb) => {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    const type = req.body.uploadType || 'tasks'; // 'tasks' or 'submissions'
    
    // Create directory structure: uploads/type/userId
    const uploadDir = path.join('uploads', type, userId.toString());
    
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
  
   cb(null,true);

};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024 // 5MB limit
  }
}); 