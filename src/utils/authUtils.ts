import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';

const prisma = new PrismaClient();
const JWT_SECRET = 'fallback_secret';  // Make sure this matches the one in authMiddleware.ts
const EXPIRATION_TIMES = {
  admin: 0, // No expiration
  teacher: 24 * 60 * 60, // 24 hours in seconds
  student: 2 * 60 * 60 // 2 hours in seconds
};
// Helper function to return default values for optional fields
const getOrDefault = (value: any, defaultValue: any = "") => value || defaultValue;

// Register a new student
const registerStudent = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  address?: string,
  lrn?: string,
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

const loginUser = async (email: string | undefined, lrn: string | undefined, password: string) => {
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
        lrn: lrn.toString(),  // Ensure it's treated as a string
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

  // Get expiration time based on role
  const expirationTime = EXPIRATION_TIMES[user.role as keyof typeof EXPIRATION_TIMES];
  
 // Create token payload
 const tokenPayload: any = {
  userId: user.id,
  role: user.role
};

// Only add expiration if it's not an admin (expiration time > 0)
if (expirationTime > 0) {
  tokenPayload.exp = Math.floor(Date.now() / 1000) + expirationTime;
}

// Sign the token with the payload
const token = jwt.sign(tokenPayload, JWT_SECRET);

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
  department?: string,
  password?: string,
  profilePicture?: string,
  lrn?: string
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
  if (profilePicture) updatedData.profilePicture = profilePicture;
  if (lrn) updatedData.lrn = lrn;
  // If password is provided, hash it
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedData.password = hashedPassword;
  }

  return await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });
};

export const deleteProfilePicture = async (userId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { profilePicture: null },
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
    correctAnswer: string,
    imageUrl?: string  // Add optional imageUrl parameter
  }>,
  userId: number,
  isDraft: boolean,
  // Add new parameters for timer, scheduling, and attempts
  durationMinutes?: number,
  startDateTime?: Date,
  endDateTime?: Date,
  maxAttempts?: number,
  attemptSpacing?: number
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
      // Add the new fields
      durationMinutes,
      startDateTime,
      endDateTime,
      maxAttempts,
      attemptSpacing,
      questions: {
        create: questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          imageUrl: q.imageUrl || null  // Include the imageUrl field
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
const calculateAndStoreScore = async (userId: number, examId: number, attemptId?: number) => {
  // Get the total number of questions in the exam
  const examQuestions = await prisma.question.count({
    where: {
      examId,
    },
  });

  // Get all the user's answers for this exam
  let whereClause: any = {
    userId,
    examId,
  };
  
  // If attemptId is provided, filter answers by that attempt
  if (attemptId) {
    whereClause.attemptId = attemptId;
  }
  
  const userAnswers = await prisma.examAnswer.findMany({
    where: whereClause,
    select: {
      isCorrect: true,
      questionId: true,
      userAnswer: true,
      question: true
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

  // Get the attempt details
  let attempt;
  if (attemptId) {
    attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId }
    });
  }

  // Either update existing score or create new one
  // With the modified schema, there's only one score per user per exam
  const existingScore = await prisma.score.findFirst({
    where: {
      userId,
      examId
    }
  });
  
  let score;
  if (existingScore) {
    // Update existing score with latest attempt information
    score = await prisma.score.update({
      where: { id: existingScore.id },
      data: {
        score: correctAnswers,
        total: totalQuestions,
        percentage,
        attemptId, // Always update to latest attempt ID
        submittedAt: new Date() // Update submission time
      }
    });
  } else {
    // Create a new score record
    score = await prisma.score.create({
      data: {
        userId,
        examId,
        score: correctAnswers,
        total: totalQuestions,
        percentage,
        attemptId // Include attempt ID if provided
      }
    });
  }

  // Always create attempt record if we have a completed attempt
  // This preserves the history of all attempts
  if (attempt && attempt.isCompleted) {
    // Format answers data for storing
    const answersData = userAnswers.map(answer => ({
      questionId: answer.questionId,
      questionText: answer.question?.questionText || "",
      userAnswer: answer.userAnswer,
      isCorrect: answer.isCorrect,
      correctAnswer: answer.question?.correctAnswer || ""
    }));

    // Create an attempt record to store the historical data
    await prisma.attemptRecord.create({
      data: {
        attemptId: attempt.id,
        userId,
        examId,
        attemptNumber: attempt.attemptNumber,
        score: correctAnswers,
        total: totalQuestions,
        percentage,
        answersData,
        timeSpent: attempt.timeSpent,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt || new Date(),
      }
    });
  }

  console.log(`Score calculated for user ${userId}, exam ${examId}, attempt ${attemptId}: ${correctAnswers}/${totalQuestions} (${percentage}%)`);
  return score;
};

// Modify the answerExam function to associate answers with specific attempts
const answerExam = async (
  testCode: string, 
  userId: number, 
  answers: Array<{ questionId: number; userAnswer: string }>,
  attemptId?: number // Add attemptId parameter
) => {
  // First find the exam ID by testCode
  const exam = await prisma.exam.findUnique({
    where: { testCode },
    select: { 
      id: true,
      durationMinutes: true,
      maxAttempts: true
    }
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  let currentAttemptId = attemptId;

  // If no attemptId is provided, check for an active attempt
  if (!currentAttemptId) {
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId: exam.id,
        userId,
        isCompleted: false
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
    
    if (activeAttempt) {
      currentAttemptId = activeAttempt.id;
    } else {
      // Create a new attempt if none exists
      const newAttempt = await createExamAttempt(exam.id, userId);
      currentAttemptId = newAttempt.id;
    }
  }

  // At this point, we should have a valid attemptId in currentAttemptId

  // Process and save the answers
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

    // Update or create the answer in the database with attemptId
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
        isCorrect,
        attemptId: currentAttemptId // Include attemptId in the update
      },
      create: {
        examId: exam.id,
        userId,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
        attemptId: currentAttemptId // Include attemptId in the create
      }
    });

    answeredQuestions.push(examAnswer);
  }

  // Complete the attempt if requested
  let attemptCompleted = false;
  let finalAttempt = null;

  if (currentAttemptId) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: currentAttemptId }
    });
    
    // If the attempt exists and is not already completed, complete it
    if (attempt && !attempt.isCompleted) {
      finalAttempt = await completeExamAttempt(currentAttemptId, userId);
      attemptCompleted = true;
    } else if (attempt) {
      finalAttempt = attempt;
    }
  }

  // Calculate and store the score
  const score = await calculateAndStoreScore(userId, exam.id, currentAttemptId);

  // Return both the answered questions and the score
  return {
    answeredQuestions,
    score,
    attemptCompleted,
    attemptId: currentAttemptId,
    attempt: finalAttempt
  };
};


const fetchExamQuestions = async (testCode: string) => { 
  // Fetch the exam details
  const exam = await prisma.exam.findUnique({
    where: { testCode },
    select: { 
      id: true, 
      status: true,
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
      status: exam.status,
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
      options: true,
      imageUrl: true  // Make sure to include imageUrl
    }
  });

  return {
    examTitle: exam.examTitle,
    classCode: exam.classCode,
    testCode: exam.testCode,
    status: exam.status,
    questions: examQuestions.map(question => ({
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options,
      imageUrl: question.imageUrl ? `/uploads/${path.basename(question.imageUrl)}` : null  // Format the image URL properly
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
      profilePicture: true,
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
      profilePicture: true,
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
      profilePicture: true,
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
      profilePicture: true,
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
          durationMinutes: true,
          maxAttempts: true,
          startDateTime: true,
          endDateTime: true,
          attempts: {
            select: {
              id: true,
              startedAt: true,
              completedAt: true,
              attemptNumber: true,
              timeSpent: true,
              isCompleted: true,
              records: {
                select: {
                  id: true,
                  score: true,
                  total: true,
                  percentage: true,
                  startedAt: true,
                  completedAt: true,
                  timeSpent: true
                }
              }
            },
            where: studentId ? { userId: studentId } : undefined,
            orderBy: { attemptNumber: 'asc' }
          } 
        },
      },
      attempt: {
        select: {
          id: true,
          attemptNumber: true,
          startedAt: true,
          completedAt: true,
          timeSpent: true,
          isCompleted: true
        }
      }
    },
    orderBy: [
      { submittedAt: 'desc' }
    ]
  });
  
  // Get attempt records for more detailed historical view when filtering by student and exam
  let attemptRecords: any[] = [];
  if (studentId && examId) {
    attemptRecords = await prisma.attemptRecord.findMany({
      where: {
        userId: studentId,
        examId: examId
      },
      orderBy: {
        attemptNumber: 'desc'
      },
      include: {
        attempt: true
      }
    });
  }
  
  return {
    scores,
    attemptRecords
  };
};

/**
 * Restore a historical attempt as the current score
 */
const restoreAttemptScore = async (
  recordId: number,
  teacherId: number
) => {
  // First, get the attempt record
  const record = await prisma.attemptRecord.findUnique({
    where: { id: recordId },
    include: {
      attempt: true,
      exam: {
        select: {
          userId: true, // Teacher who created the exam
          id: true,
          questions: true
        }
      }
    }
  });

  if (!record) {
    throw new Error('Attempt record not found');
  }

  // Verify the teacher has permission (either the exam creator or admin)
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { role: true }
  });

  if (record.exam.userId !== teacherId && teacher?.role !== 'admin') {
    throw new Error('You do not have permission to modify this exam record');
  }

  // Parse the answers data stored as JSON in the record
  const answersData = record.answersData as any;
  
  // Start a transaction to ensure atomic operations
  return await prisma.$transaction(async (tx) => {
    // 1. Delete existing answers for this user/exam combination
    await tx.examAnswer.deleteMany({
      where: {
        userId: record.userId,
        examId: record.examId
      }
    });
    
    // 2. Create new exam answers based on the stored data
    const createdAnswers = [];
    if (Array.isArray(answersData)) {
      for (const answerData of answersData) {
        const createdAnswer = await tx.examAnswer.create({
          data: {
            examId: record.examId,
            questionId: answerData.questionId,
            userId: record.userId,
            userAnswer: answerData.userAnswer,
            isCorrect: answerData.isCorrect,
            submittedAt: new Date(),
            attemptId: record.attemptId
          }
        });
        createdAnswers.push(createdAnswer);
      }
    }
    
    // 3. Update or create the score record
    // Find the current score for this user/exam if any
    let score;
    const existingScore = await tx.score.findFirst({
      where: {
        userId: record.userId,
        examId: record.examId
      }
    });

    if (existingScore) {
      // Update the existing score
      score = await tx.score.update({
        where: { id: existingScore.id },
        data: {
          score: record.score,
          total: record.total,
          percentage: record.percentage,
          attemptId: record.attemptId,
          submittedAt: new Date() // Update the timestamp to now
        }
      });
    } else {
      // Create a new score entry
      score = await tx.score.create({
        data: {
          userId: record.userId,
          examId: record.examId,
          score: record.score,
          total: record.total,
          percentage: record.percentage,
          attemptId: record.attemptId
        }
      });
    }

    return {
      score,
      record,
      answersRestored: createdAnswers.length,
      message: `Successfully restored attempt #${record.attemptNumber} as the active score with ${createdAnswers.length} answers`
    };
  });
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
      imageUrl?: string;  // Add optional imageUrl parameter
    }>;
    isDraft?: boolean;
    // Add attempt and scheduling parameters
    durationMinutes?: number;
    startDateTime?: Date;
    endDateTime?: Date;
    maxAttempts?: number;
    attemptSpacing?: number;
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
          correctAnswer: q.correctAnswer,
          imageUrl: q.imageUrl || null  // Include the imageUrl field
        }))
      });
    }
// Clean up updateData: convert empty strings to null for nullable fields
const clean = (val: any) => (val === '' || val === undefined ? null : val);

    // Update the exam details
    return await tx.exam.update({
      where: { id: examId },
      data: {
        testCode: updateData.testCode,
        classCode: updateData.classCode,
        examTitle: updateData.examTitle,
        isDraft: updateData.isDraft,
        status: updateData.isDraft ? 'draft' : 'pending',
        // Add attempt and scheduling updates
        durationMinutes: clean(updateData.durationMinutes),
        startDateTime: clean(updateData.startDateTime),
        endDateTime: clean(updateData.endDateTime),
        maxAttempts: clean(updateData.maxAttempts),
        attemptSpacing: clean(updateData.attemptSpacing)
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
      correctAnswer: true,
      imageUrl: true  // Include imageUrl in the selection
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
      imageUrl: question.imageUrl,  // Include imageUrl in the returned data
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

// Create a new grade and section
const createGradeSection = async (grade: number, section: string) => {
  return await prisma.gradeSection.create({
    data: {
      grade,
      section
    }
  });
};

// Get all grade sections
const getAllGradeSections = async () => {
  return await prisma.gradeSection.findMany({
    orderBy: [
      { grade: 'asc' },
      { section: 'asc' }
    ]
  });
};

// Update a grade section
const updateGradeSection = async (id: number, grade: number, section: string) => {
  return await prisma.gradeSection.update({
    where: { id },
    data: {
      grade,
      section
    }
  });
};

// Delete a grade section
const deleteGradeSection = async (id: number) => {
  return await prisma.gradeSection.delete({
    where: { id }
  });
};

/**
 * Update user information
 */
const updateUser = async (userId: number, updateData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  lrn?: string;
  gradeLevel?: number;
  section?: string;
  department?: string;
  domain?: string;
  password?: string;
}) => {
  // Hash the password if it's being updated
  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.password = hashedPassword;
  }

  return await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
};

/**
 * Delete a user
 */
const deleteUser = async (userId: number) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};

// Add this interface for exam access settings
interface ExamAccess {
  examId: number;
  grade: number;
  section: string;
  isEnabled: boolean;
}

// Add these functions to manage exam access
const setExamAccess = async (examId: number, gradeAccess: ExamAccess[]) => {
  // First delete any existing access settings for this exam
  await prisma.examAccess.deleteMany({
    where: { examId }
  });

  // Then create new access settings
  return await prisma.examAccess.createMany({
    data: gradeAccess.map(access => ({
      examId: access.examId,
      grade: access.grade,
      section: access.section,
      isEnabled: access.isEnabled
    }))
  });
};

const getExamAccess = async (examId: number) => {
  return await prisma.examAccess.findMany({
    where: { examId }
  });
};

const checkExamAccess = async (examId: number, grade: number, section: string) => {
  const access = await prisma.examAccess.findFirst({
    where: {
      examId,
      grade,
      section,
      isEnabled: true
    }
  });

  return !!access; // Returns true if access exists and is enabled
};

/**
 * Fetch detailed exam history for a student
 * Returns all exams taken by the student with detailed information
 */
const fetchStudentExamHistory = async (studentId: number) => {
  // Get all scores for the student
  const scores = await prisma.score.findMany({
    where: {
      userId: studentId
    },
    include: {
      exam: {
        select: {
          id: true,
          testCode: true,
          examTitle: true,
          classCode: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: {
      submittedAt: 'desc'
    }
  });

  // For each exam, fetch the questions and student's answers
  const detailedExamHistory = await Promise.all(scores.map(async (score) => {
    // Get all questions for this exam
    const questions = await prisma.question.findMany({
      where: {
        examId: score.examId
      },
      select: {
        id: true,
        questionText: true,
        questionType: true,
        options: true,
        correctAnswer: true,
        imageUrl: true
      }
    });

    // Get student's answers for this exam
    const answers = await prisma.examAnswer.findMany({
      where: {
        examId: score.examId,
        userId: studentId
      },
      select: {
        questionId: true,
        userAnswer: true,
        isCorrect: true
      }
    });

    // Map answers to questions for easier access
    const answerMap = new Map();
    answers.forEach(answer => {
      answerMap.set(answer.questionId, {
        userAnswer: answer.userAnswer,
        isCorrect: answer.isCorrect
      });
    });

    // Add user's answer to each question
    const questionsWithAnswers = questions.map(question => {
      const answer = answerMap.get(question.id);
      return {
        ...question,
        userAnswer: answer ? answer.userAnswer : null,
        isCorrect: answer ? answer.isCorrect : null
      };
    });

    return {
      score: {
        score: score.score,
        total: score.total,
        percentage: score.percentage,
        submittedAt: score.submittedAt
      },
      exam: score.exam,
      questions: questionsWithAnswers
    };
  }));

  return detailedExamHistory;
};

// Add this function to fetch all exams with detailed information for admin monitoring
const fetchAllExamsForAdmin = async () => {
  // First, get all exams with basic info
  const exams = await prisma.exam.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Then fetch additional data separately to avoid type errors
  const result = await Promise.all(exams.map(async (exam) => {
    // Get teacher info
    const teacher = await prisma.user.findUnique({
      where: { id: exam.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    // Get questions count
    const questionsCount = await prisma.question.count({
      where: { examId: exam.id }
    });

    // Get scores/submissions
    const scores = await prisma.score.findMany({
      where: { examId: exam.id },
      select: {
        id: true,
        score: true,
        percentage: true,
        userId: true,
        submittedAt: true
      }
    });

    // Get access settings
    const access = await prisma.examAccess.findMany({
      where: { examId: exam.id }
    });

    // Calculate average score
    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length
      : null;

    // Return combined data
    return {
      id: exam.id,
      testCode: exam.testCode,
      classCode: exam.classCode,
      examTitle: exam.examTitle,
      status: exam.status,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      isDraft: exam.isDraft,
      teacher,
      totalQuestions: questionsCount,
      totalSubmissions: scores.length,
      accessSettings: access.map(a => ({
        id: a.id,
        grade: a.grade || 0,
        section: a.section || ''
      })),
      averageScore
    };
  }));

  return result;
};

/**
 * Calculate Mean Percentage Score (MPS) for an exam
 */
const calculateExamMPS = async (examId: number, useLatestAttemptOnly: boolean = true) => {
  // Get all scores for this exam
  const scores = await prisma.score.findMany({
    where: { examId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gradeLevel: true,
          section: true
        }
      },
      attempt: {
        select: {
          id: true,
          attemptNumber: true,
          startedAt: true,
          completedAt: true,
          timeSpent: true,
          isCompleted: true
        }
      }
    }
  });

  if (scores.length === 0) {
    return {
      overallMPS: 0,
      sectionMPS: [],
      totalStudents: 0,
      overallStats: {
        highestScore: 0,
        lowestScore: 0,
        highestPercentage: 0,
        lowestPercentage: 0,
        highestScoreRaw: 0,
        lowestScoreRaw: 0,
        totalPossible: 0,
        scoreDistribution: {
          excellent: 0, // 90-100
          good: 0,     // 80-89
          satisfactory: 0, // 70-79
          fair: 0,     // 60-69
          poor: 0      // below 60
        }
      },
      attemptData: []
    };
  }

  // If we want to use latest attempt only, filter scores to keep only the latest attempt for each student
  let filteredScores = scores;
  if (useLatestAttemptOnly) {
    // Group scores by student
    const scoresByStudent = new Map();
    scores.forEach(score => {
      const studentId = score.userId;
      
      // If student doesn't exist in map or this is a later attempt, update
      if (!scoresByStudent.has(studentId) || 
          !scoresByStudent.get(studentId).attempt ||
          !score.attempt ||
          (score.attempt?.attemptNumber > scoresByStudent.get(studentId).attempt?.attemptNumber)) {
        scoresByStudent.set(studentId, score);
      }
    });
    
    // Convert map back to array
    filteredScores = Array.from(scoresByStudent.values());
  }

  // Find the highest and lowest scores
  const highestScoreObj = filteredScores.reduce((prev, current) => 
    (prev.percentage > current.percentage) ? prev : current);
  
  const lowestScoreObj = filteredScores.reduce((prev, current) => 
    (prev.percentage < current.percentage) ? prev : current);

  // Calculate overall MPS and stats
  const overallMPS = filteredScores.reduce((sum, score) => sum + score.percentage, 0) / filteredScores.length;
  const overallHighest = highestScoreObj.percentage;
  const overallLowest = lowestScoreObj.percentage;
  const totalPossible = filteredScores[0].total; // All scores should have the same total

  // Calculate overall score distribution
  const overallDistribution = {
    excellent: filteredScores.filter(s => s.percentage >= 90).length,
    good: filteredScores.filter(s => s.percentage >= 80 && s.percentage < 90).length,
    satisfactory: filteredScores.filter(s => s.percentage >= 70 && s.percentage < 80).length,
    fair: filteredScores.filter(s => s.percentage >= 60 && s.percentage < 70).length,
    poor: filteredScores.filter(s => s.percentage < 60).length
  };

  // Group scores by section
  const sectionScores = new Map<string, Array<{percentage: number, score: number, total: number, attemptNumber?: number}>>();
  
  filteredScores.forEach(score => {
    const gradeLevel = score.user.gradeLevel || 0;
    const section = score.user.section || 'Unknown';
    const sectionKey = `G${gradeLevel}-${section}`;
    
    if (!sectionScores.has(sectionKey)) {
      sectionScores.set(sectionKey, []);
    }
    
    sectionScores.get(sectionKey)!.push({
      percentage: score.percentage,
      score: score.score,
      total: score.total,
      attemptNumber: score.attempt?.attemptNumber
    });
  });

  // Calculate MPS and stats for each section
  const sectionMPS = Array.from(sectionScores.entries()).map(([sectionName, sectionData]) => {
    const sectionPercentages = sectionData.map(d => d.percentage);
    
    // Find highest and lowest scores in this section
    const highestScoreIndex = sectionData.reduce((maxIndex, current, currentIndex, array) => 
      current.percentage > array[maxIndex].percentage ? currentIndex : maxIndex, 0);
      
    const lowestScoreIndex = sectionData.reduce((minIndex, current, currentIndex, array) => 
      current.percentage < array[minIndex].percentage ? currentIndex : minIndex, 0);
    
    const highestData = sectionData[highestScoreIndex];
    const lowestData = sectionData[lowestScoreIndex];

    const sectionScoresList = filteredScores.filter(score => {
      const gradeSection = `G${score.user.gradeLevel}-${score.user.section}`;
      return gradeSection === sectionName;
    });

    // Calculate section score distribution
    const distribution = {
      excellent: sectionScoresList.filter(s => s.percentage >= 90).length,
      good: sectionScoresList.filter(s => s.percentage >= 80 && s.percentage < 90).length,
      satisfactory: sectionScoresList.filter(s => s.percentage >= 70 && s.percentage < 80).length,
      fair: sectionScoresList.filter(s => s.percentage >= 60 && s.percentage < 70).length,
      poor: sectionScoresList.filter(s => s.percentage < 60).length
    };

    return {
      section: sectionName,
      mps: sectionPercentages.reduce((sum, p) => sum + p, 0) / sectionPercentages.length,
      studentCount: sectionPercentages.length,
      highestPercentage: highestData.percentage,
      lowestPercentage: lowestData.percentage,
      highestScoreRaw: highestData.score,
      lowestScoreRaw: lowestData.score,
      totalPossible: highestData.total,
      distribution
    };
  });

  // Sort sections by MPS (highest first)
  sectionMPS.sort((a, b) => b.mps - a.mps);

  // Calculate attempt-specific data
  const attemptData = [];
  
  // Group scores by attempt number
  const scoresByAttempt = new Map();
  for (const score of scores) {
    if (score.attempt) {
      const attemptNum = score.attempt.attemptNumber;
      if (!scoresByAttempt.has(attemptNum)) {
        scoresByAttempt.set(attemptNum, []);
      }
      scoresByAttempt.get(attemptNum).push(score);
    }
  }
  
  // Calculate MPS for each attempt
  for (const [attemptNum, attemptScores] of scoresByAttempt.entries()) {
    if (attemptScores.length > 0) {
      const attemptMPS = attemptScores.reduce((sum: number, s: any) => sum + s.percentage, 0) / attemptScores.length;
      const highestAttemptScore = Math.max(...attemptScores.map((s: any) => s.percentage));
      const lowestAttemptScore = Math.min(...attemptScores.map((s: any) => s.percentage)); 
      
      attemptData.push({
        attemptNumber: attemptNum,
        studentCount: attemptScores.length,
        mps: attemptMPS,
        highestScore: highestAttemptScore,
        lowestScore: lowestAttemptScore,
        avgTimeSpent: attemptScores.reduce((sum: number, s: any) => sum + (s.attempt?.timeSpent || 0), 0) / attemptScores.length
      });
    }
  }
  
  // Sort attempts by number
  attemptData.sort((a, b) => a.attemptNumber - b.attemptNumber);

  return {
    overallMPS,
    sectionMPS,
    totalStudents: filteredScores.length,
    overallStats: {
      highestPercentage: overallHighest,
      lowestPercentage: overallLowest,
      highestScoreRaw: highestScoreObj.score,
      lowestScoreRaw: lowestScoreObj.score,
      totalPossible,
      scoreDistribution: overallDistribution
    },
    attemptData,
    useLatestAttemptOnly
  };
};

/**
 * Create a new subject
 */
const createSubject = async (
  name: string,
  code: string,
  description?: string
) => {
  // Check if code already exists
  const existingSubject = await prisma.subject.findUnique({
    where: { code }
  });

  if (existingSubject) {
    throw new Error('Subject code already exists. Please choose a different code.');
  }

  return await prisma.subject.create({
    data: {
      name,
      code,
      description
    }
  });
};

/**
 * Update an existing subject
 */
const updateSubject = async (
  id: number,
  data: {
    name?: string;
    code?: string;
    description?: string;
  }
) => {
  // If code is being changed, check that it's unique
  if (data.code) {
    const existingSubject = await prisma.subject.findUnique({
      where: { code: data.code }
    });

    if (existingSubject && existingSubject.id !== id) {
      throw new Error('Subject code already exists. Please choose a different code.');
    }
  }

  return await prisma.subject.update({
    where: { id },
    data
  });
};

/**
 * Delete a subject
 */
const deleteSubject = async (id: number) => {
  return await prisma.subject.delete({
    where: { id }
  });
};

/**
 * Get all subjects
 */
const getAllSubjects = async () => {
  return await prisma.subject.findMany({
    include: {
      teachers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      sections: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

/**
 * Get a specific subject
 */
const getSubjectById = async (id: number) => {
  return await prisma.subject.findUnique({
    where: { id },
    include: {
      teachers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      sections: true
    }
  });
};

/**
 * Assign a teacher to a subject
 */
const assignTeacherToSubject = async (teacherId: number, subjectId: number) => {
  // First check if the teacher exists and is actually a teacher
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId }
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  if (teacher.role !== 'teacher') {
    throw new Error('User is not a teacher');
  }

  // Check if the subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  });

  if (!subject) {
    throw new Error('Subject not found');
  }

  // Create the assignment
  return await prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId: {
        teacherId,
        subjectId
      }
    },
    update: {}, // No updates if it already exists
    create: {
      teacherId,
      subjectId
    }
  });
};

/**
 * Remove a teacher from a subject
 */
const removeTeacherFromSubject = async (teacherId: number, subjectId: number) => {
  return await prisma.teacherSubject.delete({
    where: {
      teacherId_subjectId: {
        teacherId,
        subjectId
      }
    }
  });
};

/**
 * Assign a subject to a grade and section
 */
const assignSubjectToSection = async (grade: number, section: string, subjectId: number) => {
  // Check if the subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  });

  if (!subject) {
    throw new Error('Subject not found');
  }

  // Check if the grade-section exists
  const gradeSection = await prisma.gradeSection.findFirst({
    where: {
      grade,
      section
    }
  });

  if (!gradeSection) {
    throw new Error('Grade section not found');
  }

  // Create the assignment
  return await prisma.sectionSubject.upsert({
    where: {
      grade_section_subjectId: {
        grade,
        section,
        subjectId
      }
    },
    update: {}, // No updates if it already exists
    create: {
      grade,
      section,
      subjectId
    }
  });
};

/**
 * Remove a subject from a grade and section
 */
const removeSubjectFromSection = async (grade: number, section: string, subjectId: number) => {
  return await prisma.sectionSubject.delete({
    where: {
      grade_section_subjectId: {
        grade,
        section,
        subjectId
      }
    }
  });
};

/**
 * Get subjects assigned to a teacher
 */
const getTeacherSubjects = async (teacherId: number) => {
  return await prisma.teacherSubject.findMany({
    where: {
      teacherId
    },
    include: {
      subject: true
    }
  });
};

/**
 * Get subjects assigned to a grade and section
 */
const getSectionSubjects = async (grade: number, section: string) => {
  return await prisma.sectionSubject.findMany({
    where: {
      grade,
      section
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
};

/**
 * Get student exam answers with exam and student details
 */
const getStudentExamAnswers = async (examId: number, studentId: number, attemptId?: number) => {
  // First, get the student scores for this exam
  const score = await prisma.score.findFirst({
    where: {
      examId,
      userId: studentId
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          lrn: true,
          gradeLevel: true,
          section: true
        }
      },
      exam: {
        include: {
          questions: true
        }
      },
      attempt: {
        select: {
          id: true,
          attemptNumber: true,
          startedAt: true,
          completedAt: true,
          timeSpent: true,
          isCompleted: true
        }
      }
    },
    orderBy: {
      submittedAt: 'desc'
    }
  });

  // Get all the student's attempts for this exam
  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      userId: studentId
    },
    orderBy: {
      attemptNumber: 'asc'
    },
    include: {
      records: true
    }
  });

  // Determine which attempt ID to use for fetching answers
  // If a specific attemptId is provided, use that; otherwise use the one from the score
  const targetAttemptId = attemptId || score?.attemptId;
  
  // Check if we're looking at a historical record
  const attemptRecord = targetAttemptId ? 
    await prisma.attemptRecord.findFirst({
      where: {
        attemptId: targetAttemptId
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) : undefined;

  let answers: any[] = [];
  const isHistoricalRecord = !!attemptRecord && !!attemptId;
  
  if (isHistoricalRecord && attemptRecord) {
    // We're looking at a historical record
    // Convert the stored answersData from JSON to an array
    const answersData = attemptRecord.answersData as any[];
    
    // Format the answers in the same structure as real-time answers
    answers = answersData.map(answer => ({
      id: `historical-${answer.questionId}`, // Use a special ID for historical answers
      examId: examId,
      userId: studentId,
      questionId: answer.questionId,
      userAnswer: answer.userAnswer,
      isCorrect: answer.isCorrect,
      submittedAt: attemptRecord.completedAt,
      attemptId: attemptRecord.attemptId,
      question: {
        questionText: answer.questionText,
        correctAnswer: answer.correctAnswer
      },
      historical: true
    }));
  } else {
    // Get current answers from the database
    answers = await prisma.examAnswer.findMany({
      where: {
        examId,
        userId: studentId,
        ...(targetAttemptId ? { attemptId: targetAttemptId } : {})
      },
      include: {
        question: true,
        attempt: {
          select: {
            attemptNumber: true,
            startedAt: true,
            completedAt: true,
            timeSpent: true
          }
        }
      }
    });
  }

  // If we don't have a score but have answers, we need to get the exam details separately
  // Use optional chaining to safely handle nulls
  let examData = score?.exam || undefined;
  if (!examData && answers.length > 0) {
    examData = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true
      }
    }) || undefined;
  }

  // Get student info if not already included in score
  let studentData = score?.user || undefined;
  if (!studentData) {
    studentData = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lrn: true,
        gradeLevel: true,
        section: true
      }
    }) || undefined;
  }

  // Prepare attempt information
  const attemptInfo = targetAttemptId ? 
    attempts.find(a => a.id === targetAttemptId) : undefined;
  
  const currentAttempt = attemptInfo ? {
    id: attemptInfo.id,
    attemptNumber: attemptInfo.attemptNumber,
    startedAt: attemptInfo.startedAt,
    completedAt: attemptInfo.completedAt,
    timeSpent: attemptInfo.timeSpent,
    isCompleted: attemptInfo.isCompleted,
    isHistoricalRecord
  } : undefined;

  // Return everything with safer undefined handling
  return {
    score,
    answers,
    attempts,
    examData,
    studentData,
    currentAttempt,
    attemptRecord: isHistoricalRecord ? attemptRecord : undefined
  };
};

/**
 * Update a student's exam answer and recalculate score
 */
const updateStudentExamAnswer = async (
  answerId: number,
  isCorrect: boolean,
  teacherId: number
) => {
  // First verify the answer exists
  const answer = await prisma.examAnswer.findUnique({
    where: { id: answerId },
    include: {
      exam: true
    }
  });

  if (!answer) {
    throw new Error('Answer not found');
  }

  // Verify the teacher owns this exam
  if (answer.exam.userId !== teacherId) {
    throw new Error('You do not have permission to modify this exam');
  }

  // Update the answer
  const updatedAnswer = await prisma.examAnswer.update({
    where: { id: answerId },
    data: { isCorrect }
  });

  // Recalculate and update the score
  const newScore = await calculateAndStoreScore(answer.userId, answer.examId);

  return {
    answer: updatedAnswer,
    score: newScore
  };
};

/**
 * Manually update student's exam score
 */
const updateStudentExamScore = async (
  examId: number,
  studentId: number,
  newScore: number,
  teacherId: number
) => {
  // Verify the exam exists and belongs to the teacher
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      userId: teacherId
    },
    include: {
      questions: true
    }
  });

  if (!exam) {
    throw new Error('Exam not found or you do not have permission to modify it');
  }

  // Verify the score is not greater than total questions
  const totalQuestions = exam.questions.length;
  if (newScore > totalQuestions) {
    throw new Error(`Score cannot be greater than total questions (${totalQuestions})`);
  }

  // Calculate new percentage
  const percentage = totalQuestions > 0 
    ? Math.round((newScore / totalQuestions) * 100 * 10) / 10 
    : 0;

  // Check if the student has an active attempt
  const activeAttempt = await prisma.examAttempt.findFirst({
    where: {
      examId,
      userId: studentId,
      isCompleted: false
    },
    orderBy: {
      startedAt: 'desc'
    }
  });

  const attemptId = activeAttempt?.id;

  // Find existing score or create new one
  const existingScore = await prisma.score.findFirst({
    where: {
      userId: studentId,
      examId
    }
  });

  let updatedScore;
  if (existingScore) {
    // Update existing score
    updatedScore = await prisma.score.update({
      where: {
        id: existingScore.id
      },
      data: {
        score: newScore,
        total: totalQuestions,
        percentage,
        attemptId,
        submittedAt: new Date() // Update submission time
      }
    });
  } else {
    // Create new score if none exists
    updatedScore = await prisma.score.create({
      data: {
        userId: studentId,
        examId,
        score: newScore,
        total: totalQuestions,
        percentage,
        attemptId
      }
    });
  }

  // Create an attempt record to store this manual update
  if (attemptId) {
    await prisma.attemptRecord.create({
      data: {
        attemptId,
        userId: studentId,
        examId,
        attemptNumber: activeAttempt!.attemptNumber,
        score: newScore,
        total: totalQuestions,
        percentage,
        timeSpent: activeAttempt!.timeSpent || 0,
        startedAt: activeAttempt!.startedAt,
        completedAt: new Date(),
        answersData: [] // Empty array since this is a manual update
      }
    });
  }

  return updatedScore;
};

/**
 * Create a new question in the question bank
 */
const createQuestionBankItem = async (
  teacherId: number,
  data: {
    questionText: string;
    questionType: string;
    options: any;
    correctAnswer: string;
    imageUrl?: string;
    subject?: string;
    folderId?: number;
    difficulty: string;
    sourceTestCode?: string;
    sourceClassCode?: string;
    sourceExamTitle?: string;
  }
) => {
  // Verify the user is a teacher
  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: 'teacher'
    }
  });

  if (!teacher) {
    throw new Error('Only teachers can add questions to the question bank');
  }

  // If folderId is provided, verify it exists and belongs to the teacher
  if (data.folderId) {
    const folder = await prisma.questionBankFolder.findFirst({
      where: {
        id: data.folderId,
        createdBy: teacherId
      }
    });

    if (!folder) {
      throw new Error('Folder not found or you do not have permission to use it');
    }
  }

  // Create the question
  const question = await prisma.questionBank.create({
    data: {
      questionText: data.questionText,
      questionType: data.questionType,
      options: data.options,
      correctAnswer: data.correctAnswer,
      imageUrl: data.imageUrl,
      subject: data.subject,
      folderId: data.folderId,
      difficulty: data.difficulty,
      sourceTestCode: data.sourceTestCode,
      sourceClassCode: data.sourceClassCode,
      sourceExamTitle: data.sourceExamTitle,
      createdBy: teacherId
    },
    include: {
      folder: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return question;
};

/**
 * Get questions from the question bank with optional filters
 */
const getQuestionBankItems = async (
  filters?: {
    subject?: string;
    difficulty?: string;
    questionType?: string;
    createdBy?: number;
    folderId?: number;
    searchQuery?: string;
    sourceTestCode?: string;
    sourceClassCode?: string;
  }
) => {
  const where: any = {};

  if (filters?.subject) {
    where.subject = filters.subject;
  }

  if (filters?.difficulty) {
    where.difficulty = filters.difficulty;
  }

  if (filters?.questionType) {
    where.questionType = filters.questionType;
  }

  if (filters?.createdBy) {
    where.createdBy = filters.createdBy;
  }

  if (filters?.folderId) {
    where.folderId = filters.folderId;
  }

  if (filters?.sourceTestCode) {
    where.sourceTestCode = filters.sourceTestCode;
  }

  if (filters?.sourceClassCode) {
    where.sourceClassCode = filters.sourceClassCode;
  }

  if (filters?.searchQuery) {
    where.OR = [
      {
        questionText: {
          contains: filters.searchQuery
        }
      },
      {
        sourceExamTitle: {
          contains: filters.searchQuery
        }
      },
      {
        sourceTestCode: {
          contains: filters.searchQuery
        }
      },
      {
        sourceClassCode: {
          contains: filters.searchQuery
        }
      }
    ];
  }

  const questions = await prisma.questionBank.findMany({
    where,
    include: {
      folder: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return questions;
};

/**
 * Update a question in the question bank
 */
const updateQuestionBankItem = async (
  questionId: number,
  teacherId: number,
  data: {
    questionText?: string;
    questionType?: string;
    options?: any;
    correctAnswer?: string;
    imageUrl?: string;
    subject?: string;
    folderId?: number;
    difficulty?: string;
    sourceTestCode?: string;
    sourceClassCode?: string;
    sourceExamTitle?: string;
  }
) => {
  // Verify the question exists and belongs to the teacher
  const question = await prisma.questionBank.findFirst({
    where: {
      id: questionId,
      createdBy: teacherId
    }
  });

  if (!question) {
    throw new Error('Question not found or you do not have permission to edit it');
  }

  // If folderId is being changed, verify the new folder exists and belongs to the teacher
  if (data.folderId) {
    const folder = await prisma.questionBankFolder.findFirst({
      where: {
        id: data.folderId,
        createdBy: teacherId
      }
    });

    if (!folder) {
      throw new Error('Folder not found or you do not have permission to use it');
    }
  }

  // Update the question
  const updatedQuestion = await prisma.questionBank.update({
    where: { id: questionId },
    data,
    include: {
      folder: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return updatedQuestion;
};

/**
 * Delete a question from the question bank
 */
const deleteQuestionBankItem = async (questionId: number, teacherId: number) => {
  // Verify the question exists and belongs to the teacher
  const question = await prisma.questionBank.findFirst({
    where: {
      id: questionId,
      createdBy: teacherId
    }
  });

  if (!question) {
    throw new Error('Question not found or you do not have permission to delete it');
  }

  // Delete the question
  await prisma.questionBank.delete({
    where: { id: questionId }
  });

  return { success: true, message: 'Question deleted successfully' };
};

/**
 * Create a new question bank folder
 */
const createQuestionBankFolder = async (
  teacherId: number,
  data: {
    name: string;
    description?: string;
  }
) => {
  // Verify the user is a teacher
  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: 'teacher'
    }
  });

  if (!teacher) {
    throw new Error('Only teachers can create question bank folders');
  }

  // Check if folder name already exists for this teacher
  const existingFolder = await prisma.questionBankFolder.findFirst({
    where: {
      name: data.name,
      createdBy: teacherId
    }
  });

  if (existingFolder) {
    throw new Error('A folder with this name already exists');
  }

  // Create the folder
  const folder = await prisma.questionBankFolder.create({
    data: {
      ...data,
      createdBy: teacherId
    }
  });

  return folder;
};

/**
 * Get question bank folders
 */
const getQuestionBankFolders = async (teacherId: number) => {
  const folders = await prisma.questionBankFolder.findMany({
    where: {
      createdBy: teacherId
    },
    include: {
      _count: {
        select: {
          questions: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return folders;
};

/**
 * Update a question bank folder
 */
const updateQuestionBankFolder = async (
  folderId: number,
  teacherId: number,
  data: {
    name?: string;
    description?: string;
  }
) => {
  // Verify the folder exists and belongs to the teacher
  const folder = await prisma.questionBankFolder.findFirst({
    where: {
      id: folderId,
      createdBy: teacherId
    }
  });

  if (!folder) {
    throw new Error('Folder not found or you do not have permission to edit it');
  }

  // If name is being changed, check it doesn't conflict
  if (data.name && data.name !== folder.name) {
    const existingFolder = await prisma.questionBankFolder.findFirst({
      where: {
        name: data.name,
        createdBy: teacherId,
        NOT: {
          id: folderId
        }
      }
    });

    if (existingFolder) {
      throw new Error('A folder with this name already exists');
    }
  }

  // Update the folder
  const updatedFolder = await prisma.questionBankFolder.update({
    where: { id: folderId },
    data,
    include: {
      _count: {
        select: {
          questions: true
        }
      }
    }
  });

  return updatedFolder;
};

/**
 * Delete a question bank folder
 */
const deleteQuestionBankFolder = async (folderId: number, teacherId: number) => {
  // Verify the folder exists and belongs to the teacher
  const folder = await prisma.questionBankFolder.findFirst({
    where: {
      id: folderId,
      createdBy: teacherId
    },
    include: {
      _count: {
        select: {
          questions: true
        }
      }
    }
  });

  if (!folder) {
    throw new Error('Folder not found or you do not have permission to delete it');
  }

  // Check if folder has questions
  if (folder._count.questions > 0) {
    throw new Error('Cannot delete folder that contains questions');
  }

  // Delete the folder
  await prisma.questionBankFolder.delete({
    where: { id: folderId }
  });

  return { success: true, message: 'Folder deleted successfully' };
};

/**
 * Get component settings for a role
 */
const getComponentSettings = async (role: string) => {
  return await prisma.componentSettings.findMany({
    where: { role }
  });
};

/**
 * Update component settings
 */
const updateComponentSettings = async (
  role: string,
  componentPath: string,
  isEnabled: boolean
) => {
  return await prisma.componentSettings.upsert({
    where: {
      role_componentPath: {
        role,
        componentPath
      }
    },
    update: {
      isEnabled
    },
    create: {
      role,
      componentPath,
      componentName: componentPath.split('/').pop() || componentPath,
      isEnabled
    }
  });
};

/**
 * Initialize default component settings
 */
const initializeComponentSettings = async () => {
  const defaultComponents = {
    student: [
      { path: '/student-subjects', name: 'Classes' },
      { path: '/student/tasks', name: 'My Tasks' },
      { path: '/take-exam', name: 'Take Exam' },
      { path: '/student-exams', name: 'Exams' },
      { path: '/exam-history', name: 'Exam History' },
      { path: '/student-profile', name: 'Profile' },
      { path: '/answer-survey', name: 'Survey' },
      { path: '/settings', name: 'Settings' }
    ],
    teacher: [
      { path: '/teacher-subjects', name: 'Classes' },
      { path: '/create-exam', name: 'Create Exam' },
      { path: '/manage-exam', name: 'Monitor Exam' },
      { path: '/manage-exams', name: 'Manage Exams' },
      { path: '/question-bank', name: 'Question Bank' },
      { path: '/create-survey', name: 'Create Survey' },
      { path: '/my-surveys', name: 'Manage Surveys' },
      { path: '/teacher-profile', name: 'Profile' },
      { path: '/settings', name: 'Settings' }
    ],
    admin: [
      { path: '/manage-users', name: 'Manage Users' },
      { path: '/scores', name: 'Student Scores' },
      { path: '/active-users', name: 'Active Users' },
      { path: '/admin-exam-monitor', name: 'Exam Monitor' },
      { path: '/manage-subjects', name: 'Manage Subjects' },
      { path: '/admin-profile', name: 'Profile' },
      { path: '/settings', name: 'Settings' },
      { path: '/admin-component-controller', name: 'Controller' }
    ]
  };

  for (const [role, components] of Object.entries(defaultComponents)) {
    for (const component of components) {
      await prisma.componentSettings.upsert({
        where: {
          role_componentPath: {
            role,
            componentPath: component.path
          }
        },
        update: {},
        create: {
          role,
          componentPath: component.path,
          componentName: component.name,
          isEnabled: true
        }
      });
    }
  }
};

// Profile edit permission functions
const getProfileEditPermissions = async () => {
  // Try to get existing settings
  let lrnSetting = await prisma.systemSettings.findUnique({
    where: { settingKey: 'profile_edit_lrn' }
  });

  let gradeSectionSetting = await prisma.systemSettings.findUnique({
    where: { settingKey: 'profile_edit_grade_section' }
  });

  // If settings don't exist, create them with default values (disabled)
  if (!lrnSetting) {
    lrnSetting = await prisma.systemSettings.create({
      data: {
        settingKey: 'profile_edit_lrn',
        settingValue: 'false',
        description: 'Allow students to edit their LRN'
      }
    });
  }

  if (!gradeSectionSetting) {
    gradeSectionSetting = await prisma.systemSettings.create({
      data: {
        settingKey: 'profile_edit_grade_section',
        settingValue: 'false',
        description: 'Allow students to edit their grade level and section'
      }
    });
  }

  return {
    canEditLRN: lrnSetting.settingValue === 'true',
    canEditGradeSection: gradeSectionSetting.settingValue === 'true'
  };
};

const updateProfileEditPermissions = async (permissions: {
  canEditLRN?: boolean;
  canEditGradeSection?: boolean;
}) => {
  const updates = [];

  if (permissions.canEditLRN !== undefined) {
    updates.push(
      prisma.systemSettings.upsert({
        where: { settingKey: 'profile_edit_lrn' },
        update: { settingValue: permissions.canEditLRN.toString() },
        create: {
          settingKey: 'profile_edit_lrn',
          settingValue: permissions.canEditLRN.toString(),
          description: 'Allow students to edit their LRN'
        }
      })
    );
  }

  if (permissions.canEditGradeSection !== undefined) {
    updates.push(
      prisma.systemSettings.upsert({
        where: { settingKey: 'profile_edit_grade_section' },
        update: { settingValue: permissions.canEditGradeSection.toString() },
        create: {
          settingKey: 'profile_edit_grade_section',
          settingValue: permissions.canEditGradeSection.toString(),
          description: 'Allow students to edit their grade level and section'
        }
      })
    );
  }

  // Execute all updates in parallel
  await Promise.all(updates);

  // Return the updated settings
  return getProfileEditPermissions();
};

/**
 * Update a student's LRN
 * @param userId Student user ID
 * @param lrn New LRN value to set
 * @returns Updated user object
 */
const updateStudentLRN = async (userId: number, lrn: string) => {
  // First verify that the user is a student
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'student') {
    throw new Error('Only students can update their LRN');
  }

  // Validate LRN format - should be numeric and 12 digits
  if (!lrn || !/^\d{12}$/.test(lrn)) {
    throw new Error('Invalid LRN format. LRN must be 12 digits');
  }

  // Check if LRN is already taken by another user
  const existingUser = await prisma.user.findUnique({
    where: { lrn },
    select: { id: true }
  });

  if (existingUser && existingUser.id !== userId) {
    throw new Error('This LRN is already registered to another student');
  }

  // Update the LRN
  return await prisma.user.update({
    where: { id: userId },
    data: { lrn },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      lrn: true,
      gradeLevel: true,
      section: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

/**
 * Create a new exam attempt for a user
 */
const createExamAttempt = async (examId: number, userId: number) => {
  // Find all attempts and records to determine the next attempt number
  const existingAttempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      userId,
    },
    orderBy: {
      attemptNumber: 'desc',
    },
    take: 1,
  });

  // Also check attempt records for historical attempts
  const attemptRecords = await prisma.attemptRecord.findMany({
    where: {
      examId,
      userId,
    },
    orderBy: {
      attemptNumber: 'desc',
    },
    take: 1,
  });

  // Find the highest attempt number from both sources
  let highestAttemptNumber = 0;
  
  if (existingAttempts.length > 0) {
    highestAttemptNumber = Math.max(highestAttemptNumber, existingAttempts[0].attemptNumber);
  }
  
  if (attemptRecords.length > 0) {
    highestAttemptNumber = Math.max(highestAttemptNumber, attemptRecords[0].attemptNumber);
  }

  const nextAttemptNumber = highestAttemptNumber + 1;

  // Check maximum attempts limit from exam settings
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { maxAttempts: true }
  });

  if (exam?.maxAttempts && nextAttemptNumber > exam.maxAttempts) {
    throw new Error(`Maximum number of attempts (${exam.maxAttempts}) reached for this exam`);
  }

  // Create a new attempt record
  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      userId,
      attemptNumber: nextAttemptNumber,
      startedAt: new Date(),
      isCompleted: false,
    },
  });

  console.log(`Created new exam attempt #${attempt.attemptNumber} for user ${userId}, exam ${examId}`);
  return attempt;
};

/**
 * Complete an exam attempt and calculate time spent
 */
const completeExamAttempt = async (attemptId: number, userId: number) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true
    }
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  if (attempt.userId !== userId) {
    throw new Error('Unauthorized: This attempt belongs to another user');
  }

  if (attempt.isCompleted) {
    return attempt; // Already completed, no need to update
  }

  // Calculate time spent in seconds
  const startTime = new Date(attempt.startedAt).getTime();
  const endTime = Date.now();
  const timeSpent = Math.floor((endTime - startTime) / 1000); // seconds

  // Update the attempt
  const updatedAttempt = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      timeSpent,
    },
  });

  console.log(`Completed exam attempt #${attempt.attemptNumber} for user ${userId}, time spent: ${timeSpent} seconds`);
  return updatedAttempt;
};

/**
 * Get all attempts for a user on a specific exam
 */
const getUserExamAttempts = async (examId: number, userId: number) => {
  // Get all attempts from both active attempts and historical records
  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      userId
    },
    orderBy: {
      attemptNumber: 'desc'
    },
    include: {
      exam: {
        select: {
          testCode: true,
          examTitle: true,
          durationMinutes: true,
          maxAttempts: true
        }
      },
      scores: {
        orderBy: {
          submittedAt: 'desc'
        },
        take: 1
      },
      records: true
    }
  });

  // Also get attempt records to ensure we have a complete history
  const attemptRecords = await prisma.attemptRecord.findMany({
    where: {
      examId,
      userId
    },
    orderBy: {
      attemptNumber: 'desc'
    },
    include: {
      attempt: true
    }
  });

  // Create a map to track unique attempt numbers we've seen
  const attemptNumbersMap = new Map();

  // Format the response to include score information
  const formattedAttempts = attempts.map(attempt => {
    // Get score from latest score entry or from records if completed
    const score = attempt.scores.length > 0 
      ? attempt.scores[0] 
      : attempt.records.length > 0 
        ? {
            score: attempt.records[0].score,
            total: attempt.records[0].total,
            percentage: attempt.records[0].percentage,
            submittedAt: attempt.records[0].createdAt
          }
        : null;
    
    // Track this attempt number
    attemptNumbersMap.set(attempt.attemptNumber, true);

    return {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      timeSpent: attempt.timeSpent,
      isCompleted: attempt.isCompleted,
      exam: attempt.exam,
      score
    };
  });

  // Add any attempt records that aren't already included
  const additionalAttempts = attemptRecords
    .filter(record => !attemptNumbersMap.has(record.attemptNumber))
    .map(record => {
      return {
        id: record.attemptId || 0,
        attemptNumber: record.attemptNumber,
        startedAt: record.startedAt,
        completedAt: record.completedAt || new Date(),
        timeSpent: record.timeSpent,
        isCompleted: true,
        isHistorical: true,
        score: {
          score: record.score,
          total: record.total,
          percentage: record.percentage,
          submittedAt: record.completedAt
        }
      };
    });

  // Combine and sort all attempts
  const allAttempts = [...formattedAttempts, ...additionalAttempts].sort((a, b) => 
    b.attemptNumber - a.attemptNumber
  );

  return allAttempts;
};

/**
 * Check if a user is eligible to take an exam
 */
const checkExamEligibility = async (testCode: string, userId: number) => {
  // Get exam details
  const exam = await prisma.exam.findUnique({
    where: { testCode },
    select: {
      id: true,
      status: true,
      startDateTime: true,
      endDateTime: true,
      maxAttempts: true,
      attemptSpacing: true,
      durationMinutes: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!exam) {
    return {
      eligible: false,
      message: 'Exam not found',
      exam: null
    };
  }

  // Check if exam is active
  if (exam.status !== 'started') {
    return {
      eligible: false,
      message: 'Exam is not active',
      exam
    };
  }

  // Check scheduling
  const now = new Date();
  
  if (exam.startDateTime && now < exam.startDateTime) {
    return {
      eligible: false,
      message: `This exam will be available on ${exam.startDateTime.toLocaleString()}`,
      exam,
      availableAt: exam.startDateTime
    };
  }
  
  if (exam.endDateTime && now > exam.endDateTime) {
    return {
      eligible: false,
      message: `This exam is no longer available (ended on ${exam.endDateTime.toLocaleString()})`,
      exam,
      endedAt: exam.endDateTime
    };
  }

  // Get attempts including both active attempts and historical records
  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId: exam.id,
      userId
    },
    orderBy: {
      attemptNumber: 'desc'
    },
    include: {
      records: true
    }
  });
  
  // Also get attempt records to count historical attempts
  const attemptRecords = await prisma.attemptRecord.findMany({
    where: {
      examId: exam.id,
      userId
    },
    orderBy: {
      attemptNumber: 'desc'
    }
  });
  
  // Create a map to track unique attempt numbers
  const attemptNumbersMap = new Map();
  attempts.forEach(attempt => attemptNumbersMap.set(attempt.attemptNumber, true));
  
  // Add any attempt numbers from records that aren't already counted
  attemptRecords.forEach(record => {
    if (!attemptNumbersMap.has(record.attemptNumber)) {
      attemptNumbersMap.set(record.attemptNumber, true);
    }
  });
  
  // Get the total unique attempt count
  const totalAttemptCount = attemptNumbersMap.size;

  // Check max attempts
  if (exam.maxAttempts && totalAttemptCount >= exam.maxAttempts) {
    return {
      eligible: false,
      message: `Maximum number of attempts (${exam.maxAttempts}) reached`,
      exam,
      attempts,
      totalAttempts: totalAttemptCount
    };
  }

  // Check attempt spacing
  if (exam.attemptSpacing && attempts.length > 0) {
    const lastAttempt = attempts[0];
    const timePassedMinutes = (now.getTime() - lastAttempt.startedAt.getTime()) / (1000 * 60);
    
    if (timePassedMinutes < exam.attemptSpacing) {
      const waitTimeRemaining = Math.ceil(exam.attemptSpacing - timePassedMinutes);
      const nextAttemptTime = new Date(lastAttempt.startedAt.getTime() + (exam.attemptSpacing * 60 * 1000));
      
      return {
        eligible: false,
        message: `Please wait ${waitTimeRemaining} more minute(s) before your next attempt`,
        exam,
        attempts,
        totalAttempts: totalAttemptCount,
        nextAttemptAvailableAt: nextAttemptTime
      };
    }
  }

  // Check if there's an incomplete attempt
  const incompleteAttempt = attempts.find(attempt => !attempt.isCompleted);
  if (incompleteAttempt) {
    return {
      eligible: true,
      message: 'You have an incomplete attempt that you can continue',
      exam,
      attempts,
      incompleteAttempt,
      totalAttempts: totalAttemptCount,
      nextAttemptNumber: incompleteAttempt.attemptNumber
    };
  }

  // Calculate next attempt number based on the highest current attempt number
  const nextAttemptNumber = totalAttemptCount > 0 
    ? Math.max(...Array.from(attemptNumbersMap.keys())) + 1 
    : 1;

  return {
    eligible: true,
    message: 'You are eligible to take this exam',
    exam,
    attempts,
    totalAttempts: totalAttemptCount,
    nextAttemptNumber
  };
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
  getStudentExamAnswers,
  updateStudentExamAnswer,
  updateStudentExamScore,
  createQuestionBankItem,
  getQuestionBankItems,
  updateQuestionBankItem,
  deleteQuestionBankItem,
  createQuestionBankFolder,
  getQuestionBankFolders,
  updateQuestionBankFolder,
  deleteQuestionBankFolder,
  getComponentSettings,
  updateComponentSettings,
  initializeComponentSettings,
  getProfileEditPermissions,
  updateProfileEditPermissions,
  updateStudentLRN,
  // Add new functions for exam attempts and scheduling
  createExamAttempt,
  completeExamAttempt,
  getUserExamAttempts,
  checkExamEligibility,
  restoreAttemptScore
};
