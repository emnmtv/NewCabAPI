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
authRouter.post('/register-admin', handleRegisterAdmin);
authRouter.post('/register-student', handleRegisterStudent );
authRouter.post('/register-teacher', handleRegisterTeacher);
authRouter.post('/login',handleLogin );
authRouter.post('/exam',authenticateToken,handleCreateExam);
authRouter.post('/answer',handleAnswerExam);
authRouter.post('/question',handleFetchExamQuestions);
authRouter.post('/startexam',handleStartExam);
authRouter.post('/stopexam',handleStopExam);


authRouter.put('/profile', authenticateToken, handleUpdateProfile);
authRouter.get('/user-profile', authenticateToken, handleGetUserProfile);

export { authRouter };