import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';  // Store secret in an environment variable for production security

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

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Fetch a user's profile
const fetchProfile = async (userId: number) => {
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

// Update a user's profile
const updateUserProfile = async (
  userId: number,
  firstName?: string,
  lastName?: string,
  address?: string,
  lrn?: string,
  gradeLevel?: number,
  section?: string,
  domain?: string,
  department?: string
) => {
  const updatedData: any = {};

  // Only update the fields that are provided
  if (firstName) updatedData.firstName = firstName;
  if (lastName) updatedData.lastName = lastName;
  if (address) updatedData.address = address;
  if (lrn) updatedData.lrn = lrn;
  if (gradeLevel) updatedData.gradeLevel = gradeLevel;
  if (section) updatedData.section = section;
  if (domain) updatedData.domain = domain;
  if (department) updatedData.department = department;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });

  return updatedUser;
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
  questions: Array<{ questionText: string, questionType: QuestionType, options?: string[], correctAnswer: string }>
) => {
  // Create exam record
  const exam = await prisma.exam.create({
    data: {
      testCode,
      classCode,
      examTitle,
      questions: {
        create: questions.map(question => ({
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
        })),
      },
    },
  });

  return exam;
};

const answerExam = async ( 
  testCode: string, // Accepting testCode instead of examId
  userId: number, // Assuming you are keeping track of users
  answers: Array<{ questionId: number, userAnswer: string }>
) => {
  // First, fetch the examId using the testCode
  const exam = await prisma.exam.findUnique({
    where: { testCode },
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  const examId = exam.id; // Now you have the examId from the testCode

  // Fetch the exam questions
  const examQuestions = await prisma.question.findMany({
    where: { examId },
  });

  // Validate user answers and check correctness
  const correctAnswers = examQuestions.map(question => ({
    questionId: question.id,
    isCorrect: question.correctAnswer === answers.find(answer => answer.questionId === question.id)?.userAnswer,
  }));

  // Save answers or update if the user has already answered
  await Promise.all(answers.map(async (answer) => {
    const correctAnswer = correctAnswers.find(ca => ca.questionId === answer.questionId)?.isCorrect || false;

    await prisma.examAnswer.upsert({
      where: {
        examId_userId_questionId: {
          examId,
          userId,
          questionId: answer.questionId,
        },
      },
      update: {
        userAnswer: answer.userAnswer,
        isCorrect: correctAnswer,
      },
      create: {
        examId,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect: correctAnswer,
        userId,
      },
    });
  }));

  // Return the answered questions with correctness info
  const answeredQuestions = examQuestions.map(question => {
    const userAnswer = answers.find(answer => answer.questionId === question.id)?.userAnswer || 'Not answered';
    const isCorrect = correctAnswers.find(ca => ca.questionId === question.id)?.isCorrect || false;
    return {
      questionId: question.id,
      questionText: question.questionText, // Assuming the question text is stored here
      userAnswer,
      isCorrect,
    };
  });

  return answeredQuestions; // Return questions along with answers and correctness
};

const fetchExamQuestions = async (testCode: string) => {
  // First, fetch the examId using the testCode
  const exam = await prisma.exam.findUnique({
    where: { testCode },
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  const examId = exam.id; // Now you have the examId from the testCode

  // Fetch the exam questions
  const examQuestions = await prisma.question.findMany({
    where: { examId },
  });

  // Return the questions with the necessary details (e.g., question text)
  return examQuestions.map(question => ({
    questionId: question.id,
    questionText: question.questionText, // Assuming the question text is stored here
  }));
};


export { registerAdmin, registerStudent, registerTeacher, loginUser, fetchProfile, updateUserProfile, prisma,QuestionType,createExam ,answerExam, fetchExamQuestions};
