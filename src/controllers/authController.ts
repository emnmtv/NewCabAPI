import { Response } from 'express';
import { AuthRequest } from '@/middleware/authRequest';
import { fetchExamQuestions,answerExam,
  createExam,registerAdmin, registerStudent, registerTeacher, 
  loginUser,  updateUserProfile,startExam,
  stopExam, fetchUserProfile,
  fetchStudentList,
  fetchTeacherList,
  fetchAdminList,
  fetchStudentScores
} from '../utils/authUtils';

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
  const { firstName, lastName, email, address, gradeLevel, section, domain, department } = req.body;
  try {
    const updatedUser = await updateUserProfile(
      userId, 
      firstName, 
      lastName, 
      email,
      address,
      gradeLevel,
      section,
      domain,
      department
    );
    res.status(200).json({ message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Create a new exam
const handleCreateExam = async (req: AuthRequest, res: Response) => {
  const { testCode, classCode, examTitle, questions } = req.body;
  const userId = req.user!.userId; // Get userId from the request
  
  try {
    const exam = await createExam(testCode, classCode, examTitle, questions, userId); // Pass userId
    res.status(201).json({ message: 'Exam created successfully.', exam });
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

export { handleRegisterAdmin, handleRegisterStudent, handleRegisterTeacher, handleLogin,  handleUpdateProfile,handleCreateExam,handleAnswerExam
  ,handleFetchExamQuestions, handleStartExam,handleStopExam, handleGetUserProfile,
  handleGetStudents,
  handleGetTeachers,
  handleGetAdmins,
  handleGetStudentScores
};
