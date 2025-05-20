import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Import modules with any type
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// Only allow PDF and DOCX files
const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Route to handle document uploads and text extraction
router.post('/upload/document', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    // Extract text based on file type
    if (fileExtension === '.pdf') {
      // Process PDF file
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (fileExtension === '.docx') {
      // Process DOCX file
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Unsupported file format. Only PDF and DOCX are supported.' 
      });
      return;
    }

    // Return the extracted text
    res.status(200).json({ 
      success: true,
      extractedText,
      fileName: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error: any) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error processing document: ${error.message}` 
    });
  }
});

export default router; 