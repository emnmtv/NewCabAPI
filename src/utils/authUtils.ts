import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'fallback_secret';  // Make sure this matches the one in authMiddleware.ts

// Helper function to return default values for optional fields
const getOrDefault = (value: any, defaultValue: any = "") => value || defaultValue;

// Register a new student
const registerStudent = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  address?: string,
  lrn?: number,
  gradeLevel?: number,
  section?: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: getOrDefault(firstName),
      lastName: getOrDefault(lastName),
      address: getOrDefault(address),
      role: 'student',
      lrn: getOrDefault(lrn),
      gradeLevel: gradeLevel || 0,
      section: getOrDefault(section),
    },
  });

  return user;
};

// Register a new teacher
const registerTeacher = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  address?: string,
  domain?: string,
  department?: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: getOrDefault(firstName),
      lastName: getOrDefault(lastName),
      address: getOrDefault(address),
      role: 'teacher',
      domain: getOrDefault(domain),
      department: getOrDefault(department),
    },
  });

  return user;
};

// Register a new admin
const registerAdmin = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  address?: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: getOrDefault(firstName),
      lastName: getOrDefault(lastName),
      address: getOrDefault(address),
      role: 'admin',
    },
  });

  return user;
};

const loginUser = async (email: string | undefined, lrn: number | undefined, password: string) => {
  // Ensure at least one of email or LRN is provided
  if (!email && !lrn) {
    throw new Error('Email or LRN is required');
  }

  let user;

  // Check if email is provided
  if (email) {
    user = await prisma.user.findUnique({
      where: {
        email: email.trim(),  // Ensure it's a valid email and remove any leading/trailing spaces
      },
    });
  } 
  // If email is not provided, check for LRN
  else if (lrn) {
    user = await prisma.user.findUnique({
      where: {
        lrn: lrn,  // Ensure it's treated as a number
      },
    });
  }

  if (!user) {
    throw new Error('User not found');
  }

  // Ensure password is a string before comparing
  const isPasswordValid = await bcrypt.compare(String(password), user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Include role in the JWT token payload with 2 hour expiration
  const token = jwt.sign(
    { 
      userId: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours expiration
    }, 
    JWT_SECRET
  );
  
  return { token };
};


// Update a user's profile
const updateUserProfile = async (
  userId: number,
  firstName?: string,
  lastName?: string,
  email?: string,
  address?: string,
  gradeLevel?: number,
  section?: string,
  domain?: string,
  department?: string
) => {
  const updatedData: any = {};

  if (firstName) updatedData.firstName = firstName;
  if (lastName) updatedData.lastName = lastName;
  if (email) updatedData.email = email;
  if (address) updatedData.address = address;
  if (gradeLevel) updatedData.gradeLevel = gradeLevel;
  if (section) updatedData.section = section;
  if (domain) updatedData.domain = domain;
  if (department) updatedData.department = department;

  return await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });
};
// Exam question type enumeration
enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  ENUMERATION = 'enumeration',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}
// Create a new exam
const createExam = async (
  testCode: string,
  classCode: string,
  examTitle: string,
  questions: Array<{ questionText: string, questionType: QuestionType, options?: string[], correctAnswer: string }>,
  userId: number
) => {
  // Create exam record
  const exam = await prisma.exam.create({
    data: {
      testCode,
      classCode,
      examTitle,
      userId,
      questions: {
        create: questions.map(question => ({
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.questionType === 'enumeration' ? [] : (question.options || []),
          correctAnswer: question.correctAnswer,
        })),
      },
    },
  });

  return exam;
};

/**
 * Calculate and store the score for a user's exam
 */
const calculateAndStoreScore = async (userId: number, examId: number) => {
  // Get the total number of questions in the exam
  const examQuestions = await prisma.question.count({
    where: {
      examId,
    },
  });

  // Get all the user's answers for this exam
  const userAnswers = await prisma.examAnswer.findMany({
    where: {
      userId,
      examId,
    },
    select: {
      isCorrect: true,
    },
  });

  // Count correct answers
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  
  // Use the actual number of questions in the exam for the total
  const totalQuestions = examQuestions;
  
  // Calculate percentage based on correct answers vs total questions in exam
  const percentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100 * 10) / 10 
    : 0;

  // Store or update the score
  const score = await prisma.score.upsert({
    where: {
      userId_examId: {
        userId,
        examId,
      },
    },
    update: {
      score: correctAnswers,
      total: totalQuestions,
      percentage,
      submittedAt: new Date(),
    },
    create: {
      userId,
      examId,
      score: correctAnswers,
      total: totalQuestions,
      percentage,
    },
  });

  console.log(`Score calculated for user ${userId}, exam ${examId}: ${correctAnswers}/${totalQuestions} (${percentage}%)`);
  return score;
};

// Modify the answerExam function to calculate and return the score
const answerExam = async (testCode: string, userId: number, answers: Array<{ questionId: number; userAnswer: string }>) => {
  // First find the exam ID by testCode
  const exam = await prisma.exam.findUnique({
    where: { testCode },
    select: { id: true }
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  // Process and save the answers (existing code)
  const answeredQuestions = [];
  
  for (const answer of answers) {
    // Get the correct answer for this question
    const question = await prisma.question.findUnique({
      where: { id: answer.questionId },
      select: { correctAnswer: true }
    });

    if (!question) {
      throw new Error(`Question with ID ${answer.questionId} not found`);
    }

    // Determine if the answer is correct
    const isCorrect = answer.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();

    // Update or create the answer in the database
    const examAnswer = await prisma.examAnswer.upsert({
      where: {
        examId_userId_questionId: {
          examId: exam.id,
          userId,
          questionId: answer.questionId
        }
      },
      update: {
        userAnswer: answer.userAnswer,
        isCorrect
      },
      create: {
        examId: exam.id,
        userId,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect
      }
    });

    answeredQuestions.push(examAnswer);
  }

  // Calculate and store the score
  const score = await calculateAndStoreScore(userId, exam.id);

  // Return both the answered questions and the score
  return {
    answeredQuestions,
    score
  };
};


const fetchExamQuestions = async (testCode: string) => { 
  // Fetch the exam details
  const exam = await prisma.exam.findUnique({
    where: { testCode },
    select: { 
      id: true, 
      status: true,  // Make sure status is selected
      examTitle: true, 
      classCode: true, 
      testCode: true 
    },
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  // If the exam is not started, return only exam details without questions
  if (exam.status !== "started") {
    return {
      examTitle: exam.examTitle,
      classCode: exam.classCode,
      testCode: exam.testCode,
      status: exam.status,  // Explicitly include status in the response
      questions: null, // Indicating that questions are not available yet
    };
  }

  // Fetch the exam questions if the exam has started
  const examQuestions = await prisma.question.findMany({
    where: { examId: exam.id },
    select: {
      id: true,
      questionText: true,
      questionType: true,
      options: true, // Includes options if stored as JSON
    }
  });

  return {
    examTitle: exam.examTitle,
    classCode: exam.classCode,
    testCode: exam.testCode,
    status: exam.status,  // Explicitly include status in the response
    questions: examQuestions.map(question => ({
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options, // Sending options if applicable
    })),
  };
};



const startExam = async (testCode: string) => {
  const exam = await prisma.exam.update({
    where: { testCode },
    data: { status: "started" },
  });

  return exam;
};

// Function to stop the exam
const stopExam = async (testCode: string) => { 
  const exam = await prisma.exam.update({
    where: { testCode },
    data: { status: "stopped" }, // Assuming "stopped" is the status for a stopped exam
  });

  return exam;
};

// Add this new function
const fetchUserProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      address: true,
      role: true,
      lrn: true,
      gradeLevel: true,
      section: true,
      domain: true,
      department: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Remove this function if not needed
export const joinExam = (/* socketId: string, testCode: string */) => {
  // Logic to handle joining the exam can be added here if needed
};

// Add these new functions for fetching user lists

/**
 * Fetch list of all students
 */
const fetchStudentList = async () => {
  const students = await prisma.user.findMany({
    where: {
      role: 'student'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      lrn: true,
      gradeLevel: true,
      section: true,
      createdAt: true
    },
    orderBy: {
      lastName: 'asc'
    }
  });
  
  return students;
};

/**
 * Fetch list of all teachers
 */
const fetchTeacherList = async () => {
  const teachers = await prisma.user.findMany({
    where: {
      role: 'teacher'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      domain: true,
      department: true,
      createdAt: true
    },
    orderBy: {
      lastName: 'asc'
    }
  });
  
  return teachers;
};

/**
 * Fetch list of all administrators
 */
const fetchAdminList = async () => {
  const admins = await prisma.user.findMany({
    where: {
      role: 'admin'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true
    },
    orderBy: {
      lastName: 'asc'
    }
  });
  
  return admins;
};

/**
 * Fetch student scores with student and exam details
 * Can filter by studentId, examId, or return all scores
 */
const fetchStudentScores = async (studentId?: number, examId?: number) => {
  const whereClause: any = {};
  
  // Add filters if provided
  if (studentId) {
    whereClause.userId = studentId;
  }
  
  if (examId) {
    whereClause.examId = examId;
  }
  
  // Fetch scores with related student and exam information
  const scores = await prisma.score.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          lrn: true,
          gradeLevel: true,
          section: true,
          email: true
        }
      },
      exam: {
        select: {
          id: true,
          testCode: true,
          examTitle: true,
          classCode: true,
          // Remove or replace createdAt depending on your schema
          // If createdAt doesn't exist but you have a similar field:
          // created: true,  // If your field is named differently
          // Or remove it entirely if no such field exists
        }
      }
    },
    orderBy: [
      { submittedAt: 'desc' }
    ]
  });
  
  return scores;
};

export { registerAdmin, registerStudent, 
  registerTeacher, loginUser,  
  updateUserProfile, prisma,QuestionType,
  createExam ,answerExam, fetchExamQuestions,
  startExam, stopExam, fetchUserProfile,
  calculateAndStoreScore,
  fetchStudentList,
  fetchTeacherList,
  fetchAdminList,
  fetchStudentScores
};
