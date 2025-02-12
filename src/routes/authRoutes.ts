import express from 'express';
import { handleAnswerExam,handleGetProfile,handleLogin,
    handleRegisterAdmin,handleRegisterStudent,
    handleRegisterTeacher,
    handleUpdateProfile,
    handleCreateExam, 
    handleFetchExamQuestions,
    handleStartExam,
    handleStopExam,

} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const authRouter = express.Router();

// Public routes
authRouter.post('/register-admin', handleRegisterAdmin);
authRouter.post('/register-student', handleRegisterStudent );
authRouter.post('/register-teacher', handleRegisterTeacher);
authRouter.post('/login',handleLogin );
authRouter.post('/exam',handleCreateExam);
authRouter.post('/answer',handleAnswerExam);
authRouter.post('/question',handleFetchExamQuestions);
authRouter.post('/startexam',handleStartExam);
authRouter.post('/stopexam',handleStopExam);

// Protected routes
authRouter.get('/profile', authenticateToken, handleGetProfile);
authRouter.put('/profile', authenticateToken, handleUpdateProfile);

export { authRouter };