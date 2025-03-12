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
  questions: Array<{
    questionText: string,
    questionType: string,
    options: any,
    correctAnswer: string
  }>,
  userId: number,
  isDraft: boolean
) => {
  // Check if testCode already exists
  const existingExam = await prisma.exam.findUnique({
    where: { testCode }
  });

  if (existingExam) {
    throw new Error('Test code already exists. Please choose a different one.');
  }

  const exam = await prisma.exam.create({
    data: {
      testCode,
      classCode,
      examTitle,
      isDraft,
      status: isDraft ? 'draft' : 'pending',
      userId,
      questions: {
        create: questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      }
    },
    include: {
      questions: true
    }
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

/**
 * Fetch all exams created by a specific teacher
 */
const fetchTeacherExams = async (teacherId: number) => {
  const exams = await prisma.exam.findMany({
    where: {
      userId: teacherId
    },
    include: {
      questions: true,
      scores: {
        select: {
          score: true,
          total: true,
          percentage: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      },
      _count: {
        select: {
          examAnswers: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return exams;
};

/**
 * Update an existing exam
 */
const updateExam = async (
  examId: number,
  teacherId: number,
  updateData: {
    testCode?: string;
    classCode?: string;
    examTitle?: string;
    questions?: Array<{
      questionText: string;
      questionType: string;
      options: any;
      correctAnswer: string;
    }>;
    isDraft?: boolean;
  }
) => {
  // First verify the teacher owns this exam
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      userId: teacherId
    }
  });

  if (!exam) {
    throw new Error('Exam not found or you do not have permission to edit it');
  }

  // Check if new testCode is unique if it's being updated
  if (updateData.testCode && updateData.testCode !== exam.testCode) {
    const existingExam = await prisma.exam.findUnique({
      where: { testCode: updateData.testCode }
    });
    if (existingExam) {
      throw new Error('Test code already exists. Please choose a different one.');
    }
  }

  // Start a transaction to handle both exam and questions updates
  const updatedExam = await prisma.$transaction(async (tx) => {
    // If there are questions to update
    if (updateData.questions) {
      // Delete existing questions
      await tx.question.deleteMany({
        where: { examId }
      });

      // Create new questions
      await tx.question.createMany({
        data: updateData.questions.map(q => ({
          examId,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      });
    }

    // Update the exam details
    return await tx.exam.update({
      where: { id: examId },
      data: {
        testCode: updateData.testCode,
        classCode: updateData.classCode,
        examTitle: updateData.examTitle,
        isDraft: updateData.isDraft,
        status: updateData.isDraft ? 'draft' : 'pending'
      },
      include: {
        questions: true
      }
    });
  });

  return updatedExam;
};

/**
 * Delete an exam
 */
const deleteExam = async (examId: number, teacherId: number) => {
  // Verify the teacher owns this exam
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      userId: teacherId
    }
  });

  if (!exam) {
    throw new Error('Exam not found or you do not have permission to delete it');
  }

  // Delete the exam and all related data in a transaction
  await prisma.$transaction(async (tx) => {
    // Delete related scores
    await tx.score.deleteMany({
      where: { examId }
    });

    // Delete related exam answers
    await tx.examAnswer.deleteMany({
      where: { examId }
    });

    // Delete related questions
    await tx.question.deleteMany({
      where: { examId }
    });

    // Finally delete the exam
    await tx.exam.delete({
      where: { id: examId }
    });
  });

  return { success: true, message: 'Exam deleted successfully' };
};

const getItemAnalysis = async (examId: number) => {
  const analysis = await prisma.examAnswer.groupBy({
    by: ['questionId', 'isCorrect'],
    where: {
      examId: examId
    },
    _count: {
      isCorrect: true
    }
  });

  // Get all questions for this exam
  const questions = await prisma.question.findMany({
    where: {
      examId: examId
    },
    select: {
      id: true,
      questionText: true,
      correctAnswer: true
    }
  });

  // Get total number of students who took the exam
  const totalStudents = await prisma.score.count({
    where: {
      examId: examId
    }
  });

  // Format the analysis
  const itemAnalysis = questions.map((question, index) => {
    const correctCount = analysis.find(a => 
      a.questionId === question.id && a.isCorrect === true
    )?._count.isCorrect || 0;

    const incorrectCount = analysis.find(a => 
      a.questionId === question.id && a.isCorrect === false
    )?._count.isCorrect || 0;

    return {
      questionId: question.id,
      questionNumber: index + 1,
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      correctCount,
      incorrectCount,
      totalAnswered: correctCount + incorrectCount,
      totalStudents,
      percentageCorrect: totalStudents ? Math.round((correctCount / totalStudents) * 100) : 0
    };
  });

  return itemAnalysis;
};

// Create a new survey
const createSurvey = async (
  userId: number,
  title: string,
  description: string | null,
  questions: Array<{
    questionText: string,
    questionType: string,
    options: any,
    required: boolean,
    order: number
  }>
) => {
  // Generate a random 6-character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const survey = await prisma.survey.create({
    data: {
      title,
      description,
      code,
      userId,
      questions: {
        create: questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
          required: q.required,
          order: q.order
        }))
      }
    },
    include: {
      questions: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  return survey;
};

// Add new function to fetch user's surveys
const fetchUserSurveys = async (userId: number) => {
  const surveys = await prisma.survey.findMany({
    where: {
      userId
    },
    include: {
      questions: true,
      responses: {
        select: {
          id: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return surveys;
};

// Fetch survey by code
const fetchSurveyByCode = async (code: string) => {
  const survey = await prisma.survey.findUnique({
    where: { code },
    include: {
      questions: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!survey || !survey.isActive) {
    throw new Error('Survey not found or inactive');
  }

  return survey;
};

// Submit survey response
const submitSurveyResponse = async (
  code: string,
  respondent: string | null,
  answers: Array<{
    questionId: number,
    answer: string | string[]
  }>
) => {
  if (!code) {
    throw new Error('Survey code is required');
  }

  const formattedCode = code.trim().toUpperCase();

  const survey = await prisma.survey.findUnique({
    where: { 
      code: formattedCode
    }
  });

  if (!survey || !survey.isActive) {
    throw new Error('Survey not found or inactive');
  }

  // Validate that all questionIds exist in the survey
  const validQuestionIds = await prisma.surveyQuestion.findMany({
    where: {
      surveyId: survey.id
    },
    select: {
      id: true
    }
  });

  const validIds = new Set(validQuestionIds.map(q => q.id));
  const invalidQuestions = answers.filter(a => !validIds.has(a.questionId));

  if (invalidQuestions.length > 0) {
    throw new Error('Invalid question IDs provided');
  }

  const response = await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      respondent,
      answers: {
        create: answers.map(a => ({
          questionId: a.questionId,
          answer: Array.isArray(a.answer) ? JSON.stringify(a.answer) : a.answer,
        }))
      }
    }
  });

  return response;
};

// Fetch survey results
const fetchSurveyResults = async (code: string) => {
  const survey = await prisma.survey.findUnique({
    where: { code },
    include: {
      questions: {
        include: {
          answers: {
            include: {
              response: true
            }
          }
        }
      },
      responses: {
        include: {
          answers: true
        }
      }
    }
  });

  if (!survey) {
    throw new Error('Survey not found');
  }

  return survey;
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
  fetchStudentScores,
  fetchTeacherExams,
  updateExam,
  deleteExam,
  getItemAnalysis,
  createSurvey,
  fetchSurveyByCode,
  submitSurveyResponse,
  fetchSurveyResults,
  fetchUserSurveys
};
