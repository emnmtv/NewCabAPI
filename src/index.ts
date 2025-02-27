import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { authRouter } from './routes/authRoutes';
import cors from "cors";
import { prisma } from './utils/authUtils'; // Import prisma client

const app = express();
const PORT = Number(process.env.PORT) || 3300;  // Ensuring it's a number

// Create HTTP server
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from this origin
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enable CORS
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
    credentials: true, // Allow cookies and authorization headers
  })
);

app.use(express.json());
app.use('/auth', authRouter);

// WebSocket connection
const studentsInExam = new Map(); // Map to track students by exam code
const socketToExam = new Map(); // Map to track which exam a socket is in

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinExam', async ({ testCode, userId }) => {
    console.log(`User ${userId} joined exam with test code: ${testCode}`);

    // Retrieve user information from the database
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    const userName = `${user.firstName} ${user.lastName}`;
    
    // Track which exam this socket is in
    socketToExam.set(socket.id, testCode);
    
    // Initialize the exam's student list if it doesn't exist
    if (!studentsInExam.has(testCode)) {
      studentsInExam.set(testCode, new Map());
    }
    
    // Add the student to the exam
    studentsInExam.get(testCode).set(socket.id, { userId, userName });
    
    // Join the socket room
    socket.join(testCode);
    
    // Get all students in this exam
    const studentsInThisExam = Array.from(studentsInExam.get(testCode).values());
    
    // Emit the updated list to all clients in the room
    io.to(testCode).emit('studentJoined', studentsInThisExam);
    console.log(`Current students in exam ${testCode}:`, studentsInThisExam);
  });

  socket.on('quitExam', ({ testCode }) => {
    console.log(`User ${socket.id} quit exam with test code: ${testCode}`);
    
    // If no test code provided, use the one associated with this socket
    const examCode = testCode || socketToExam.get(socket.id);
    
    if (examCode && studentsInExam.has(examCode)) {
      // Remove the student from the exam
      studentsInExam.get(examCode).delete(socket.id);
      
      // Get updated student list
      const studentsInThisExam = Array.from(studentsInExam.get(examCode).values());
      
      // Emit the updated list to all clients in the room
      io.to(examCode).emit('studentLeft', studentsInThisExam);
      console.log(`Current students in exam ${examCode}:`, studentsInThisExam);
      
      // Clean up socket-to-exam mapping
      socketToExam.delete(socket.id);
      
      // Leave the room
      socket.leave(examCode);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find which exam this socket was in
    const examCode = socketToExam.get(socket.id);
    
    if (examCode && studentsInExam.has(examCode)) {
      // Remove the student from the exam
      studentsInExam.get(examCode).delete(socket.id);
      
      // Get updated student list
      const studentsInThisExam = Array.from(studentsInExam.get(examCode).values());
      
      // Emit the updated list to all clients in the room
      io.to(examCode).emit('studentLeft', studentsInThisExam);
      console.log(`Current students in exam ${examCode} after disconnect:`, studentsInThisExam);
    }
    
    // Clean up socket-to-exam mapping
    socketToExam.delete(socket.id);
  });

  // Add this new event handler for exam progress
  socket.on('updateExamProgress', async ({ testCode, userId, progress }) => {
    try {
      // Get the exam details
      const exam = await prisma.exam.findUnique({
        where: { testCode },
        include: {
          questions: true
        }
      });

      if (!exam) return;

      const totalQuestions = exam.questions.length;
      const answeredQuestions = progress.answeredCount || 0;
      const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          firstName: true,
          lastName: true,
        }
      });

      if (!user) return;

      const progressData = {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        answeredQuestions,
        totalQuestions,
        progressPercentage,
        currentQuestion: progress.currentQuestion
      };

      // Emit progress to all users in the exam room (especially teachers)
      io.to(testCode).emit('examProgressUpdate', progressData);
    } catch (error) {
      console.error('Error updating exam progress:', error);
    }
  });

  // Add new event for exam status changes
  socket.on('examStatusChanged', async ({ testCode, status }) => {
    try {
      console.log(`Exam status change received: ${testCode} - ${status}`);
      
      // Get the exam details
      const exam = await prisma.exam.findUnique({
        where: { testCode }
      });

      if (!exam) {
        console.log('Exam not found:', testCode);
        return;
      }

      // Update exam status in database
      await prisma.exam.update({
        where: { testCode },
        data: { status }
      });

      // Important: Make sure socket is in the room before emitting
      socket.join(testCode);

      // Emit both events to ensure delivery
      io.to(testCode).emit('examStatusUpdate', { status });
      if (status === 'stopped') {
        io.to(testCode).emit('examStopped');
        // Also broadcast to make sure all clients receive it
        socket.broadcast.to(testCode).emit('examStopped');
      }
      
      console.log(`Status update and stop signals sent to room ${testCode}`);
    } catch (error) {
      console.error('Error updating exam status:', error);
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT} and http://192.168.0.104:${PORT}`);
});
