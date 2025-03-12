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
    handleGetStudents,
    handleGetTeachers,
    handleGetAdmins,
    handleGetStudentScores,
    handleGetTeacherExams,
    handleUpdateExam,
    handleDeleteExam,
    handleGetExamAnalysis,
    handleCreateSurvey,
    handleFetchSurvey,
    handleSubmitSurvey,
    handleGetSurveyResults,
    handleGetUserSurveys
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
authRouter.get('/students', authenticateToken, handleGetStudents);
authRouter.get('/teachers', authenticateToken, handleGetTeachers);
authRouter.get('/admins', authenticateToken, handleGetAdmins);
authRouter.get('/scores', authenticateToken, handleGetStudentScores);
authRouter.get('/teacher-exams', authenticateToken, handleGetTeacherExams);
authRouter.put('/exam/:examId', authenticateToken, handleUpdateExam);
authRouter.delete('/exam/:examId', authenticateToken, handleDeleteExam);
authRouter.get('/exam-analysis/:examId', authenticateToken, handleGetExamAnalysis);

// Survey routes - note that some don't require authentication
authRouter.post('/survey', authenticateToken, handleCreateSurvey);
authRouter.get('/my-surveys', authenticateToken, handleGetUserSurveys);
authRouter.get('/survey/:code', handleFetchSurvey); // No auth required
authRouter.post('/survey/:code/submit', handleSubmitSurvey); // No auth required
authRouter.get('/survey/:code/results', authenticateToken, handleGetSurveyResults);

export { authRouter };