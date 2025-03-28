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
  calculateExamMPS,
  createSubject,
  updateSubject,
  deleteSubject,
  getAllSubjects,
  getSubjectById,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  assignSubjectToSection,
  removeSubjectFromSection,
  getTeacherSubjects,
  getSectionSubjects,
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

// Subject controllers
const handleCreateSubject = async (req: AuthRequest, res: Response) => {
  const { name, code, description } = req.body;
  
  try {
    const subject = await createSubject(name, code, description);
    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleUpdateSubject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, code, description } = req.body;
  
  try {
    const subject = await updateSubject(Number(id), { name, code, description });
    res.status(200).json({ message: 'Subject updated successfully', subject });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleDeleteSubject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    await deleteSubject(Number(id));
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetAllSubjects = async (_req: AuthRequest, res: Response) => {
  try {
    const subjects = await getAllSubjects();
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetSubjectById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    const subject = await getSubjectById(Number(id));
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(200).json({ subject });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleAssignTeacherToSubject = async (req: AuthRequest, res: Response) => {
  const { teacherId, subjectId } = req.body;
  
  try {
    const assignment = await assignTeacherToSubject(Number(teacherId), Number(subjectId));
    res.status(200).json({ message: 'Teacher assigned to subject successfully', assignment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleRemoveTeacherFromSubject = async (req: AuthRequest, res: Response) => {
  const { teacherId, subjectId } = req.params;
  
  try {
    await removeTeacherFromSubject(Number(teacherId), Number(subjectId));
    res.status(200).json({ message: 'Teacher removed from subject successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleAssignSubjectToSection = async (req: AuthRequest, res: Response) => {
  const { grade, section, subjectId } = req.body;
  
  try {
    const assignment = await assignSubjectToSection(Number(grade), section, Number(subjectId));
    res.status(200).json({ message: 'Subject assigned to section successfully', assignment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleRemoveSubjectFromSection = async (req: AuthRequest, res: Response) => {
  const { grade, section, subjectId } = req.params;
  
  try {
    await removeSubjectFromSection(Number(grade), section, Number(subjectId));
    res.status(200).json({ message: 'Subject removed from section successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetTeacherSubjects = async (req: AuthRequest, res: Response) => {
  const { teacherId } = req.params;
  
  try {
    const subjects = await getTeacherSubjects(Number(teacherId));
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleGetSectionSubjects = async (req: AuthRequest, res: Response) => {
  const { grade, section } = req.params;
  
  try {
    const subjects = await getSectionSubjects(Number(grade), section);
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const handleUpdateSubjectSchedule = async (req: AuthRequest, res: Response) => {
  const { subjectId } = req.params;
  const { scheduleType, startTime, endTime, dayOfWeek, startDay, endDay, daysOfWeek: selectedDays } = req.body;
  
  try {
    // Define available days
    const availableDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    // Convert the different schedule types to daysOfWeek array
    let scheduleDays;
    switch (scheduleType) {
      case 'SINGLE':
        scheduleDays = [dayOfWeek];
        break;
      case 'RANGE':
        const startIndex = availableDays.indexOf(startDay);
        const endIndex = availableDays.indexOf(endDay);
        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Invalid day range');
        }
        scheduleDays = availableDays.slice(startIndex, endIndex + 1);
        break;
      case 'MULTIPLE':
        scheduleDays = selectedDays;
        break;
      default:
        throw new Error('Invalid schedule type');
    }

    // Update the subject with the schedule information
    const subject = await prisma.subject.update({
      where: { id: Number(subjectId) },
      data: {
        scheduleType,
        startTime,
        endTime,
        daysOfWeek: scheduleDays
      }
    });
    
    res.status(200).json({ message: 'Subject schedule updated successfully', subject });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Add these new controller functions
const handleGetTeacherAssignedSubjects = async (req: AuthRequest, res: Response) => {
  try {

    const teacherId = req.user?.userId;
    if (!teacherId) {
       res.status(401).json({ error: 'User not authenticated' });
       return;
    }

    const subjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
        subject: {
          include: {
            sections: true
         
          }
        }
      }
    });

    res.status(200).json({ subjects});
  } 
  catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
// const handleGetSectionSubjects = async (req: AuthRequest, res: Response) => {
//   const { grade, section } = req.params;
  
//   try {
//     const subjects = await getSectionSubjects(Number(grade), section);
//     res.status(200).json({ subjects });
//   } catch (error) {
//     res.status(400).json({ error: (error as Error).message });
// //   }
// };

const handleGetStudentSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
     res.status(401).json({ error: 'User not authenticated' });
     return;
    }

    // First get the student's grade and section
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { gradeLevel: true, section: true }
    });

    if (!student?.gradeLevel || !student?.section) {
      res.status(400).json({ error: 'Student grade or section not found' });
      return;
    }

    // Then get all subjects assigned to their grade and section
    const subjects = await prisma.sectionSubject.findMany({
      where: {
        grade: student.gradeLevel,
        section: student.section
      },
      include: {
        subject: {
          include: {
            teachers: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(200).json({ subjects });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Task creation
export const handleCreateSubjectTask = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const { subjectId } = req.params;
    const { title, description, dueDate, totalScore, studentLRNs } = req.body;
    
    // Get the original filename from the uploaded file
    const fileName = req.file ? req.file.originalname : undefined;
    const fileUrl = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : undefined;

    // Parse studentLRNs from JSON string if it's a string
    let parsedStudentLRNs = studentLRNs;
    if (typeof studentLRNs === 'string') {
      try {
        parsedStudentLRNs = JSON.parse(studentLRNs);
      } catch (e) {
        console.error('Error parsing studentLRNs:', e);
        parsedStudentLRNs = [];
      }
    }

    // Create the task
    const task = await prisma.subjectTask.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        totalScore: parseInt(totalScore),
        subjectId: parseInt(subjectId),
        teacherId,
        fileUrl,
        fileName
      }
    });

    // If studentLRNs were provided, set up initial visibility
    if (parsedStudentLRNs && Array.isArray(parsedStudentLRNs) && parsedStudentLRNs.length > 0) {
      // Get students by their LRNs
      const students = await prisma.user.findMany({
        where: {
          lrn: {
            in: parsedStudentLRNs
          },
          role: 'student'
        }
      });

      // Create visibility records for each student
      for (const student of students) {
        await prisma.taskVisibility.create({
          data: {
            taskId: task.id,
            studentId: student.id
          }
        });
      }
    }

    res.status(201).json({ 
      message: 'Task created successfully', 
      task,
      visibleToStudents: parsedStudentLRNs?.length || 0
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get tasks for a subject
export const handleGetSubjectTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId } = req.params;
    
    // Get the subject first
    const subject = await prisma.subject.findUnique({
      where: {
        id: parseInt(subjectId)
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });
    
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    
    const tasks = await prisma.subjectTask.findMany({
      where: {
        subjectId: parseInt(subjectId)
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            score: true,
            submittedAt: true,
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({ 
      subject,
      tasks 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Submit task
export const handleSubmitTask = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const { taskId } = req.params;
    
    // Get the original filename from the uploaded file
    const fileName = req.file ? req.file.originalname : undefined;
    const fileUrl = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : undefined;
    
    // Check if student already submitted
    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        taskId: parseInt(taskId),
        studentId
      }
    });
    
    let submission;
    
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.taskSubmission.update({
        where: {
          id: existingSubmission.id
        },
        data: {
          fileUrl,
          fileName,
          submittedAt: new Date()
        }
      });
    } else {
      // Create new submission
      submission = await prisma.taskSubmission.create({
        data: {
          taskId: parseInt(taskId),
          studentId,
          fileUrl,
          fileName,
          submittedAt: new Date()
        }
      });
    }
    
    res.status(200).json({ 
      message: 'Task submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get student submissions for a task
export const handleGetStudentTaskSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const submissions = await prisma.taskSubmission.findMany({
      where: {
        taskId: parseInt(taskId)
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({ submissions });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Score a submission
export const handleScoreSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { score, comment } = req.body;

    const submission = await prisma.taskSubmission.update({
      where: {
        id: parseInt(submissionId)
      },
      data: {
        score: parseInt(score),
        comment
      }
    });

    res.status(200).json({ message: 'Submission scored successfully', submission });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Add students to task visibility
export const handleAddTaskVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { studentLRNs } = req.body; // Array of student LRNs
    
    if (!Array.isArray(studentLRNs)) {
      res.status(400).json({ error: 'studentLRNs must be an array' });
      return;
    }

    // Convert string LRNs to integers
    const lrnNumbers = studentLRNs.map(lrn => parseInt(lrn));

    // First get all students by their LRNs
    const students = await prisma.user.findMany({
      where: {
        lrn: {
          in: lrnNumbers
        },
        role: 'student'
      }
    });

    // Create visibility records for each student
    for (const student of students) {
      try {
        await prisma.taskVisibility.create({
          data: {
            taskId: parseInt(taskId),
            studentId: student.id
          }
        });
      } catch (e) {
        // Skip if already exists (unique constraint error)
        console.log('Skipping duplicate visibility record');
      }
    }

    res.status(200).json({ 
      message: 'Task visibility updated successfully',
      addedStudents: students.length 
    });
  } catch (error) {
    console.error('Error adding task visibility:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Remove students from task visibility
export const handleRemoveTaskVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { studentLRNs } = req.body;

    // Get student IDs from LRNs
    const students = await prisma.user.findMany({
      where: {
        lrn: {
          in: studentLRNs
        },
        role: 'student'
      },
      select: {
        id: true
      }
    });

    // Remove visibility records
    await prisma.taskVisibility.deleteMany({
      where: {
        taskId: parseInt(taskId),
        studentId: {
          in: students.map(s => s.id)
        }
      }
    });

    res.status(200).json({ 
      message: 'Task visibility removed successfully',
      removedStudents: students.length 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get students who can see the task
export const handleGetTaskVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const visibility = await prisma.taskVisibility.findMany({
      where: {
        taskId: parseInt(taskId)
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            lrn: true,
            gradeLevel: true,
            section: true
          }
        }
      }
    });

    res.status(200).json({ visibility });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get students by grade and section
export const handleGetStudentsBySection = async (req: AuthRequest, res: Response) => {
  try {
    const { grade, section } = req.params;
    
    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        gradeLevel: parseInt(grade),
        section: section
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lrn: true,
        gradeLevel: true,
        section: true
      }
    });
    
    res.status(200).json({ students });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Delete a subject task
export const handleDeleteSubjectTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const teacherId = req.user?.userId;
    
    if (!teacherId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    // Check if task exists and belongs to the teacher
    const task = await prisma.subjectTask.findFirst({
      where: {
        id: parseInt(taskId),
        teacherId
      }
    });
    
    if (!task) {
      res.status(404).json({ error: 'Task not found or you do not have permission to delete it' });
      return;
    }
    
    // Delete all task visibility records
    await prisma.taskVisibility.deleteMany({
      where: {
        taskId: parseInt(taskId)
      }
    });
    
    // Delete all task submissions
    await prisma.taskSubmission.deleteMany({
      where: {
        taskId: parseInt(taskId)
      }
    });
    
    // Delete the task
    await prisma.subjectTask.delete({
      where: {
        id: parseInt(taskId)
      }
    });
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get sections for a subject
export const handleGetSubjectSections = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId } = req.params;
    
    const sections = await prisma.sectionSubject.findMany({
      where: {
        subjectId: parseInt(subjectId)
      },
      select: {
        grade: true,
        section: true
      }
    });
    
    res.status(200).json({ sections });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get tasks for a student
export const handleGetStudentTasks = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    // Get all tasks visible to this student
    const visibleTasks = await prisma.taskVisibility.findMany({
      where: {
        studentId
      },
      include: {
        task: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            submissions: {
              where: {
                studentId
              }
            }
          }
        }
      }
    });
    
    // Format the response
    const tasks = visibleTasks.map(visibility => {
      const task = visibility.task;
      const hasSubmitted = task.submissions.length > 0;
      const submission = hasSubmitted ? task.submissions[0] : null;
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        totalScore: task.totalScore,
        subject: task.subject,
        teacher: task.teacher,
        fileUrl: task.fileUrl,
        fileName: task.fileName,
        createdAt: task.createdAt,
        submission: hasSubmitted && submission ? {
          id: submission.id,
          fileUrl: submission.fileUrl,
          fileName: submission.fileName,
          submittedAt: submission.submittedAt,
          score: submission.score,
          comment: submission.comment
        } : null
      };
    });
    
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get task details for a student
export const handleGetStudentTaskDetails = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const { taskId } = req.params;
    
    // Check if student has visibility to this task
    const visibility = await prisma.taskVisibility.findFirst({
      where: {
        taskId: parseInt(taskId),
        studentId
      }
    });
    
    if (!visibility) {
      res.status(403).json({ error: 'You do not have access to this task' });
      return;
    }
    
    // Get task details
    const task = await prisma.subjectTask.findUnique({
      where: {
        id: parseInt(taskId)
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        submissions: {
          where: {
            studentId
          }
        }
      }
    });
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    // Format the response
    const hasSubmitted = task.submissions.length > 0;
    const submission = hasSubmitted ? task.submissions[0] : null;
    
    const taskDetails = {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      totalScore: task.totalScore,
      subject: task.subject,
      teacher: task.teacher,
      fileUrl: task.fileUrl,
      fileName: task.fileName,
      createdAt: task.createdAt,
      submission: hasSubmitted && submission ? {
        id: submission.id,
        fileUrl: submission.fileUrl,
        fileName: submission.fileName,
        submittedAt: submission.submittedAt,
        score: submission.score,
        comment: submission.comment
      } : null
    };
    
    res.status(200).json({ task: taskDetails });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

// Update handleEditSubmission to handle file removal
export const handleEditSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const submissionId = parseInt(req.params.submissionId);
    const studentId = req.user?.userId;
    const file = req.file;

    if (!submissionId || !studentId) {
       res.status(400).json({ error: 'Missing required parameters' });
       return;
    }

    // Check if submission exists and belongs to student
    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        id: submissionId,
        studentId: studentId
      },
      include: {
        task: true
      }
    });

    if (!existingSubmission) {
       res.status(404).json({ error: 'Submission not found' });
       return;
    }

    // Delete old file if it exists
    if (existingSubmission.fileUrl) {
      const oldFilePath = path.join(__dirname, '../../', existingSubmission.fileUrl);
      try {
        await fs.promises.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    // Update submission - if no new file, clear file fields
    const updatedSubmission = await prisma.taskSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        fileUrl: file ? `/uploads/tasks/${existingSubmission.task.id}/${file.filename}` : null,
        fileName: file ? file.originalname : null,
        submittedAt: new Date()
      }
    });

    res.status(200).json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Error editing submission:', error);
    res.status(500).json({ error: 'Failed to edit submission' });
  }
}

 

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
  handleGetExamMPS,
  handleCreateSubject,
  handleUpdateSubject,
  handleDeleteSubject,
  handleGetAllSubjects,
  handleGetSubjectById,
  handleAssignTeacherToSubject,
  handleRemoveTeacherFromSubject,
  handleAssignSubjectToSection,
  handleRemoveSubjectFromSection,
  handleGetTeacherSubjects,
  handleGetSectionSubjects,
  handleUpdateSubjectSchedule,
  handleGetTeacherAssignedSubjects,
  handleGetStudentSubjects,

};
