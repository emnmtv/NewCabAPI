import express from 'express';
import { 
  handleAnswerExam,handleLogin,
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
    handleGetUserSurveys,
    handleCreateGradeSection,
    handleGetAllGradeSections,
    handleUpdateGradeSection,
    handleDeleteGradeSection,
    handleUpdateUser,
    handleDeleteUser,
    handleGetUserDetails,
    handleSetExamAccess,
    handleGetExamAccess,
    handleCheckExamAccess,
    handleGetAllExams,
    handleImageUpload,
    handleGetAvailableSections,
    handleGetStudentExamHistory,
    handleGetAllExamsForAdmin,
    handleGetExamMPS,
    handleCreateSubject,
    handleGetAllSubjects,
    handleGetSubjectById,
    handleUpdateSubject,
    handleDeleteSubject,
    handleAssignTeacherToSubject,
    handleRemoveTeacherFromSubject,
    handleGetTeacherSubjects,
    handleAssignSubjectToSection,
    handleRemoveSubjectFromSection,
    handleGetSectionSubjects,
    handleUpdateSubjectSchedule,
    handleGetTeacherAssignedSubjects,
    handleGetStudentSubjects,
    handleCreateSubjectTask,
    handleGetSubjectTasks,
    handleSubmitTask,
    handleGetStudentTaskSubmissions,
    handleScoreSubmission,
    handleAddTaskVisibility,
    handleRemoveTaskVisibility,
    handleGetTaskVisibility,
    handleGetStudentsBySection,
    handleDeleteSubjectTask,
    handleGetSubjectSections,
    handleGetStudentTasks,
    handleGetStudentTaskDetails,
    handleEditSubmission,
    handleDeleteFile,
    handleGetStudentExamAnswers,
    handleUpdateStudentExamAnswer,
    handleUpdateStudentExamScore,
    handleCreateQuestionBankItem,
    handleGetQuestionBankItems,
    handleUpdateQuestionBankItem,
    handleDeleteQuestionBankItem,
    handleCreateQuestionBankFolder,
    handleGetQuestionBankFolders,
    handleUpdateQuestionBankFolder,
    handleDeleteQuestionBankFolder,
    handleDeleteProfilePicture,
    handleGetComponentSettings,
    handleUpdateComponentSettings,
    handleInitializeComponentSettings,
    handleGetProfileEditPermissions,
    handleUpdateProfileEditPermissions,
    handleUpdateStudentLRN
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { upload } from '../middleware/fileMiddleware';

const authRouter = express.Router();

// Public routes

authRouter.post('/login',handleLogin );


// Update profile route to support both regular updates and file uploads
authRouter.put('/profile', authenticateToken, upload.single('profilePicture'), handleUpdateProfile);
authRouter.delete('/profile-picture', authenticateToken, handleDeleteProfilePicture);
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

// Add student LRN specific update route
authRouter.put('/student/lrn', authenticateToken, handleUpdateStudentLRN);

// Survey routes - note that some don't require authentication
authRouter.post('/survey', authenticateToken, handleCreateSurvey);
authRouter.get('/my-surveys', authenticateToken, handleGetUserSurveys);
authRouter.get('/survey/:code', handleFetchSurvey); // No auth required
authRouter.post('/survey/:code/submit', handleSubmitSurvey); // No auth required
authRouter.get('/survey/:code/results', authenticateToken, handleGetSurveyResults);

// Add these new routes
authRouter.post('/grade-section', authenticateToken, handleCreateGradeSection);
authRouter.get('/grade-sections', authenticateToken, handleGetAllGradeSections);
authRouter.put('/grade-section/:id', authenticateToken, handleUpdateGradeSection);
authRouter.delete('/grade-section/:id', authenticateToken, handleDeleteGradeSection);

// Add these routes
authRouter.put('/user/:userId', authenticateToken, handleUpdateUser);
authRouter.delete('/user/:userId', authenticateToken, handleDeleteUser);

// Add this route
authRouter.get('/user/:userId', authenticateToken, handleGetUserDetails);

// Add these routes
authRouter.post('/exam/:examId/access', authenticateToken, handleSetExamAccess);
authRouter.get('/exam/:examId/access', authenticateToken, handleGetExamAccess);
authRouter.get('/exam/:examId/check-access', authenticateToken, handleCheckExamAccess);

// Add this route
authRouter.get('/exams', authenticateToken, handleGetAllExams);

// Add this new route
authRouter.post('/upload-image', authenticateToken, handleImageUpload);

// Add this route
authRouter.get('/available-sections', authenticateToken, handleGetAvailableSections);

// Add this new route
authRouter.get('/student-exam-history', authenticateToken, handleGetStudentExamHistory);

// Add this route for admin exam monitoring
authRouter.get('/admin/exams', authenticateToken, handleGetAllExamsForAdmin);

// Add this new route for MPS calculation
authRouter.get('/exam/:examId/mps', authenticateToken, handleGetExamMPS);

// Subject routes
authRouter.post('/subjects', authenticateToken, handleCreateSubject);
authRouter.get('/subjects', authenticateToken, handleGetAllSubjects);
authRouter.get('/subjects/:id', authenticateToken, handleGetSubjectById);
authRouter.put('/subjects/:id', authenticateToken, handleUpdateSubject);
authRouter.delete('/subjects/:id', authenticateToken, handleDeleteSubject);

// Teacher-Subject assignment routes
authRouter.post('/teacher-subject', authenticateToken, handleAssignTeacherToSubject);
authRouter.delete('/teacher-subject/:teacherId/:subjectId', authenticateToken, handleRemoveTeacherFromSubject);
authRouter.get('/teacher/:teacherId/subjects', authenticateToken, handleGetTeacherSubjects);

// Section-Subject assignment routes
authRouter.post('/section-subject', authenticateToken, handleAssignSubjectToSection);
authRouter.delete('/section-subject/:grade/:section/:subjectId', authenticateToken, handleRemoveSubjectFromSection);
authRouter.get('/section/:grade/:section/subjects', authenticateToken, handleGetSectionSubjects);

// Replace schedule routes with this single route
authRouter.put('/subjects/:subjectId/schedule', authenticateToken, handleUpdateSubjectSchedule);

// Add these new routes
authRouter.get('/teacher/subjects/assigned', authenticateToken, handleGetTeacherAssignedSubjects);
authRouter.get('/student/subjects', authenticateToken, handleGetStudentSubjects);

// Task routes
authRouter.post('/subjects/:subjectId/tasks', authenticateToken, upload.array('files', 10), handleCreateSubjectTask);
authRouter.get('/subjects/:subjectId/tasks', authenticateToken, handleGetSubjectTasks);
authRouter.post('/tasks/:taskId/submit', authenticateToken, upload.array('files', 10), handleSubmitTask);
authRouter.get('/tasks/:taskId/submissions',authenticateToken,handleGetStudentTaskSubmissions);
authRouter.put('/submissions/:submissionId/score',authenticateToken,handleScoreSubmission);

// Add these new routes for task visibility
authRouter.post('/tasks/:taskId/visibility', authenticateToken, handleAddTaskVisibility);
authRouter.delete('/tasks/:taskId/visibility', authenticateToken, handleRemoveTaskVisibility);
authRouter.get('/tasks/:taskId/visibility', authenticateToken, handleGetTaskVisibility);

// Add this route
authRouter.get('/students/grade/:grade/section/:section', authenticateToken, handleGetStudentsBySection);

// Add this route
authRouter.delete('/tasks/:taskId', authenticateToken, handleDeleteSubjectTask);

// Add this route
authRouter.get('/subjects/:subjectId/sections', authenticateToken, handleGetSubjectSections);

// Add these routes
authRouter.get('/student/tasks', authenticateToken, handleGetStudentTasks);
authRouter.get('/student/tasks/:taskId', authenticateToken, handleGetStudentTaskDetails);

// Add this route
authRouter.put('/submissions/:submissionId', 
  authenticateToken, 
  upload.array('files', 10), 
  handleEditSubmission
);

// Add this route for file deletion
authRouter.delete('/files/:fileId', authenticateToken, handleDeleteFile);

// Add these routes for exam answer management
authRouter.get('/exam/:examId/student/:studentId/answers', authenticateToken, handleGetStudentExamAnswers);
authRouter.put('/exam-answer/:answerId', authenticateToken, handleUpdateStudentExamAnswer);
authRouter.put('/exam/:examId/student/:studentId/score', authenticateToken, handleUpdateStudentExamScore);

// Add these routes for question bank
authRouter.post('/question-bank', authenticateToken, handleCreateQuestionBankItem);
authRouter.get('/question-bank', authenticateToken, handleGetQuestionBankItems);
authRouter.put('/question-bank/:questionId', authenticateToken, handleUpdateQuestionBankItem);
authRouter.delete('/question-bank/:questionId', authenticateToken, handleDeleteQuestionBankItem);

// Add these routes for question bank folders
authRouter.post('/question-bank/folders', authenticateToken, handleCreateQuestionBankFolder);
authRouter.get('/question-bank/folders', authenticateToken, handleGetQuestionBankFolders);
authRouter.put('/question-bank/folders/:folderId', authenticateToken, handleUpdateQuestionBankFolder);
authRouter.delete('/question-bank/folders/:folderId', authenticateToken, handleDeleteQuestionBankFolder);

// Add these new routes
authRouter.get('/component-settings/:role', authenticateToken, handleGetComponentSettings);
authRouter.put('/component-settings/:role/:componentPath', authenticateToken, handleUpdateComponentSettings);
authRouter.post('/component-settings/initialize', authenticateToken, handleInitializeComponentSettings);

// Add these new routes for profile edit permissions
authRouter.get('/profile-edit-permissions', authenticateToken, handleGetProfileEditPermissions);
authRouter.put('/profile-edit-permissions', authenticateToken, handleUpdateProfileEditPermissions);

export { authRouter };