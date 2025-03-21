import { Response } from 'express';
import { AuthRequest } from '@/middleware/authRequest';
import { fetchExamQuestions,answerExam,
  createExam,registerAdmin, registerStudent, registerTeacher, 
  loginUser,  updateUserProfile,startExam,
  stopExam, fetchUserProfile,
  fetchStudentList,
  fetchTeacherList,
  fetchAdminList,
  fetchStudentScores,
  fetchTeacherExams,
  updateExam,
  deleteExam,
  getItemAnalysis,
  createSurvey, 
  fetchSurveyByCode, 
  submitSurveyResponse, 
  fetchSurveyResults,
  fetchUserSurveys,
  createGradeSection,
  getAllGradeSections,
  updateGradeSection,
  deleteGradeSection,
  updateUser,
  deleteUser,
  setExamAccess,
  getExamAccess,
  checkExamAccess,
  fetchStudentExamHistory,
  fetchAllExamsForAdmin,
  calculateExamMPS
} from '../utils/authUtils';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Register a new student
const handleRegisterStudent = async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName, address, lrn, gradeLevel, section } = req.body;
  console.log('Received registration request for student:', { email, firstName, lastName });

  try {
    const user = await registerStudent(email, password, firstName, lastName, address, lrn, gradeLevel, section);
    res.status(201).json({ message: 'Student registered successfully.', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Register a new teacher
const handleRegisterTeacher = async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName, address, domain, department } = req.body;
  try {
    const user = await registerTeacher(email, password, firstName, lastName, address, domain, department);
    res.status(201).json({ message: 'Teacher registered successfully.', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Register a new admin
const handleRegisterAdmin = async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName, address, } = req.body;
  try {
    const user = await registerAdmin(email, password, firstName, lastName, address);
    res.status(201).json({ message: 'Admin registered successfully.', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Login a user
const handleLogin = async (req: AuthRequest, res: Response) => {
  const { email, lrn, password } = req.body;
  try {
    const { token } = await loginUser(email, lrn, password);
    res.status(200).json({ 
      message: 'Login successful', 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Update a user's profile
const handleUpdateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { firstName, lastName, email, address, gradeLevel, section, domain, department, password } = req.body;
  
  try {
    // Validate password length if provided
    if (password && password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return; // Just return without a value
    }
    
    const updatedUser = await updateUserProfile(
      userId, 
      firstName, 
      lastName, 
      email,
      address,
      gradeLevel,
      section,
      domain,
      department,
      password
    );
    res.status(200).json({ message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Create a new exam
const handleCreateExam = async (req: AuthRequest, res: Response) => {
  const { testCode, classCode, examTitle, questions, isDraft } = req.body;
  const userId = req.user!.userId;
  
  try {
    const exam = await createExam(
      testCode, 
      classCode, 
      examTitle, 
      questions, 
      userId,
      isDraft
    );
    res.status(201).json({ 
      message: isDraft ? 'Exam saved as draft.' : 'Exam created successfully.',
      exam 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

interface AnswerExamRequest {
  testCode: string; // Now using testCode instead of examId
  userId: number;
  answers: Array<{ questionId: number; userAnswer: string }>;
}

// Answer exam
const handleAnswerExam = async (req: AuthRequest, res: Response) => {
  const body: AnswerExamRequest = req.body;
  const userId = req.user!.userId;
  console.log("Received answer exam request");
  const { testCode, answers } = body;

  try {
    const result = await answerExam(testCode, userId, answers);
    res.status(200).json({
      message: 'Answers submitted successfully',
      answeredQuestions: result.answeredQuestions,
      score: result.score
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

interface FetchExamQuestionsRequest {
  testCode: string; // Accepting testCode to identify the exam
}

const handleFetchExamQuestions = async (req: AuthRequest, res: Response) => {
  const body: FetchExamQuestionsRequest = req.body;
  console.log("Received fetch exam questions request:", body);
  const { testCode } = body;

  try {
    const examData = await fetchExamQuestions(testCode);
    res.status(200).json({
      message: 'Exam questions fetched successfully',
      exam: {
        examTitle: examData.examTitle,
        classCode: examData.classCode,
        testCode: examData.testCode,
        status: examData.status,  // Explicitly include status in the response
        questions: examData.questions,
      },
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleStartExam = async (req: AuthRequest, res: Response) => {
  const { testCode } = req.body;

  try {
    const exam = await startExam(testCode);
    res.status(200).json({ message: 'Exam started successfully', exam });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Handler function for stopping the exam
const handleStopExam = async (req: AuthRequest, res: Response) => {
  const { testCode } = req.body;

  try {
    const exam = await stopExam(testCode);
    res.status(200).json({ message: 'Exam stopped successfully', exam });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    const userProfile = await fetchUserProfile(userId);
    res.status(200).json({ userProfile });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

/**
 * Handler to fetch all students
 */
const handleGetStudents = async (_req: AuthRequest, res: Response) => {
  try {
    const students = await fetchStudentList();
    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Handler to fetch all teachers
 */
const handleGetTeachers = async (_req: AuthRequest, res: Response) => {
  try {
    const teachers = await fetchTeacherList();
    res.status(200).json({ teachers });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Handler to fetch all admins
 */
const handleGetAdmins = async (_req: AuthRequest, res: Response) => {
  try {
    const admins = await fetchAdminList();
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Handler to fetch student scores
 * Optional query params: studentId, examId
 */
const handleGetStudentScores = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
    const examId = req.query.examId ? parseInt(req.query.examId as string) : undefined;
    
    const scores = await fetchStudentScores(studentId, examId);
    res.status(200).json({ scores });
  } catch (error) {
    console.error('Error fetching student scores:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Handler to get exams created by a teacher
 */
const handleGetTeacherExams = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user!.userId;
  
  try {
    const exams = await fetchTeacherExams(teacherId);
    
    // Ensure we're returning full question data including images
    const examsWithDetails = await Promise.all(exams.map(async (exam) => {
      // Get questions with all details including images
      const questions = await prisma.question.findMany({
        where: { examId: exam.id },
        select: {
          id: true,
          questionText: true,
          questionType: true,
          options: true,
          correctAnswer: true,
          imageUrl: true
        }
      });
      
      // Get score statistics
      const scores = await prisma.score.findMany({
        where: { examId: exam.id }
      });
      
      // Get count of submissions
      const examAnswersCount = await prisma.examAnswer.count({
        where: { examId: exam.id }
      });
      
      return {
        ...exam,
        questions,
        scores,
        _count: { examAnswers: examAnswersCount }
      };
    }));
    
    res.status(200).json({ exams: examsWithDetails });
  } catch (error) {
    console.error('Error fetching teacher exams:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Handler to update an exam
 */
const handleUpdateExam = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user!.userId;
  const examId = parseInt(req.params.examId);
  const updateData = req.body;
  
  try {
    const updatedExam = await updateExam(examId, teacherId, updateData);
    res.status(200).json({ 
      message: 'Exam updated successfully',
      exam: updatedExam 
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Handler to delete an exam
 */
const handleDeleteExam = async (req: AuthRequest, res: Response) => {
  const teacherId = req.user!.userId;
  const examId = parseInt(req.params.examId);
  
  try {
    const result = await deleteExam(examId, teacherId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const handleGetExamAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const examId = parseInt(req.params.examId);
    const analysis = await getItemAnalysis(examId);
    res.json({ analysis });
  } catch (error) {
    console.error('Error getting exam analysis:', error);
    res.status(500).json({ error: 'Failed to get exam analysis' });
  }
};

// Create a new survey
const handleCreateSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, questions } = req.body;
    
    const survey = await createSurvey(userId, title, description, questions);
    
    res.status(201).json({
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Fetch survey by code
const handleFetchSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const survey = await fetchSurveyByCode(code);
    res.status(200).json({ survey });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

// Submit survey response
const handleSubmitSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const { respondent, answers } = req.body;

    if (!code || !answers) {
      throw new Error('Survey code and answers are required');
    }

    const response = await submitSurveyResponse(code, respondent, answers);
    
    res.status(200).json({
      message: 'Survey response submitted successfully',
      response
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Fetch survey results
const handleGetSurveyResults = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const results = await fetchSurveyResults(code);
    res.status(200).json({ results });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

// Add new handler to get user's surveys
const handleGetUserSurveys = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const surveys = await fetchUserSurveys(userId);
    res.status(200).json({ surveys });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleCreateGradeSection = async (req: AuthRequest, res: Response) => {
  const { grade, section } = req.body;
  
  try {
    const gradeSection = await createGradeSection(grade, section);
    res.status(201).json({ message: 'Grade section created successfully', gradeSection });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetAllGradeSections = async (_req: AuthRequest, res: Response) => {
  try {
    const gradeSections = await getAllGradeSections();
    res.status(200).json({ gradeSections });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleUpdateGradeSection = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { grade, section } = req.body;
  
  try {
    const updatedGradeSection = await updateGradeSection(Number(id), grade, section);
    res.status(200).json({ message: 'Grade section updated successfully', updatedGradeSection });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleDeleteGradeSection = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    await deleteGradeSection(Number(id));
    res.status(200).json({ message: 'Grade section deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleUpdateUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const updateData = req.body;

  try {
    // Validate password length if being updated
    if (updateData.password && updateData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const updatedUser = await updateUser(Number(userId), updateData);
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleDeleteUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
    await deleteUser(Number(userId));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetUserDetails = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        address: true,
        lrn: true,
        gradeLevel: true,
        section: true,
        department: true,
        domain: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleSetExamAccess = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const { gradeAccess } = req.body;

  try {
    const access = await setExamAccess(Number(examId), gradeAccess);
    res.status(200).json({ message: 'Exam access updated successfully', access });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetExamAccess = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;

  try {
    const access = await getExamAccess(Number(examId));
    res.status(200).json({ access });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleCheckExamAccess = async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const { grade, section } = req.query;

  try {
    const hasAccess = await checkExamAccess(
      Number(examId), 
      Number(grade), 
      section as string
    );
    res.status(200).json({ hasAccess });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetAllExams = async (_req: AuthRequest, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.status(200).json({ exams });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleImageUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    
    if (!image) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }
    
    // Extract the base64 data
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid image format' });
      return;
    }
    
    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');
    
    // Generate a unique filename
    const extension = imageType.split('/')[1];
    const filename = `${uuidv4()}.${extension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save the file
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    // Return the URL to the saved image
    const imageUrl = `/uploads/${filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

const handleGetAvailableSections = async (req: AuthRequest, res: Response) => {
  const { grade } = req.query;
  
  try {
    let sections;
    
    if (grade) {
      // If grade is provided, filter sections by grade
      sections = await prisma.gradeSection.findMany({
        where: { grade: Number(grade) },
        orderBy: { section: 'asc' }
      });
    } else {
      // Otherwise, get all sections grouped by grade
      sections = await prisma.gradeSection.findMany({
        orderBy: [
          { grade: 'asc' },
          { section: 'asc' }
        ]
      });
    }
    
    res.status(200).json({ sections });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Handler to fetch a student's exam history with detailed information
 */
const handleGetStudentExamHistory = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    
    const examHistory = await fetchStudentExamHistory(studentId);
    
    res.status(200).json({ 
      message: 'Student exam history retrieved successfully',
      examHistory 
    });
  } catch (error) {
    console.error('Error fetching student exam history:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Add this new handler for admin exam monitoring
const handleGetAllExamsForAdmin = async (_req: AuthRequest, res: Response) => {
  try {
    const exams = await fetchAllExamsForAdmin();
    res.status(200).json({ exams });
  } catch (error) {
    console.error('Error fetching all exams for admin:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Handler to get Mean Percentage Score (MPS) for an exam
 */
const handleGetExamMPS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const examId = parseInt(req.params.examId);
    
    // Validate that the exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, examTitle: true, testCode: true }
    });
    
    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }
    
    const mpsData = await calculateExamMPS(examId);
    
    res.status(200).json({
      exam: {
        id: exam.id,
        title: exam.examTitle,
        testCode: exam.testCode
      },
      ...mpsData
    });
  } catch (error) {
    console.error('Error calculating MPS:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export { handleRegisterAdmin, handleRegisterStudent, handleRegisterTeacher, handleLogin,  handleUpdateProfile,handleCreateExam,handleAnswerExam
  ,handleFetchExamQuestions, handleStartExam,handleStopExam, handleGetUserProfile,
  handleGetStudents,
  handleGetTeachers,
  handleGetAdmins,
  handleGetStudentScores,
  handleGetTeacherExams,
  handleUpdateExam,
  handleDeleteExam,
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
  handleGetExamMPS
};
