import express from 'express';
import { handleAnswerExam,handleLogin,
    handleRegisterAdmin,handleRegisterStudent,
    handleRegisterTeacher,
    handleUpdateProfile,
    handleCreateExam, 
    handleFetchExamQuestions,
    handleStartExam,
    handleStopExam,
    handleGetUserProfile,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const authRouter = express.Router();

// Public routes

authRouter.post('/login',handleLogin );



authRouter.put('/profile', authenticateToken, handleUpdateProfile);
authRouter.get('/user-profile', authenticateToken, handleGetUserProfile);
authRouter.post('/register-admin',authenticateToken,handleRegisterAdmin);
authRouter.post('/register-student',authenticateToken, handleRegisterStudent );
authRouter.post('/register-teacher',authenticateToken, handleRegisterTeacher);
authRouter.post('/exam',authenticateToken,handleCreateExam);
authRouter.post('/answer',authenticateToken,handleAnswerExam);
authRouter.post('/question',authenticateToken,handleFetchExamQuestions);
authRouter.post('/startexam',authenticateToken,handleStartExam);
authRouter.post('/stopexam',authenticateToken,handleStopExam);

export { authRouter };