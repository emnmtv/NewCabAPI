import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { authRouter } from './routes/authRoutes';
import cors from "cors";
import { prisma } from './utils/authUtils'; // Import prisma client
import path from 'path';
import { initGameSocket } from './sockets/gameSocket';

const app = express();
const PORT = Number(process.env.PORT) || 3300;  // Ensuring it's a number

// Create HTTP server
const server = createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
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

// Add this configuration to increase the payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/auth', authRouter);

// Update the static file serving to include the full server URL
app.use('/uploads', (req, res, next) => {
  // Set appropriate headers for images
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  express.static(path.join(__dirname, '../uploads'))(req, res, next);
});

// WebSocket connection
const studentsInExam = new Map(); // Map to track students by exam code
const socketToExam = new Map(); // Map to track which exam a socket is in

// Add these maps to track active users
const activeUsers = new Map(); // Map to track active users by userId
const userSockets = new Map(); // Map to track which sockets belong to which user

// At the top of the file, add a helper function
const disconnectUserSockets = (userId: string | number) => {
  // Find all sockets belonging to this user
  const socketsToDisconnect = Array.from(userSockets.entries())
    .filter(([_, uid]) => uid === userId)
    .map(([socketId]) => socketId);
  
  console.log(`Found ${socketsToDisconnect.length} existing sockets for user ${userId}`);
  
  // Disconnect each socket
  socketsToDisconnect.forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      console.log(`Force disconnecting socket ${socketId} for user ${userId}`);
      socket.disconnect(true);
    }
    userSockets.delete(socketId);
  });
};

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // Update the userLogin handler
  socket.on('userLogin', async ({ userId, userRole }) => {
    console.log(`User ${userId} (${userRole}) attempting to login`);
    
    try {
      // Retrieve user information from the database
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          gradeLevel: true,
          section: true,
          department: true,
          domain: true
        },
      });

      if (!user) {
        console.error(`User with ID ${userId} not found`);
        return;
      }

      // Check if user already has an active session
      const existingUserData = activeUsers.get(userId);
      
      // Preserve exam status if user was in an exam
      const inExam = existingUserData?.inExam || false;
      const examCode = existingUserData?.examCode || null;

      // Store user info in the active users map
      activeUsers.set(userId, {
        ...user,
        socketId: socket.id,
        lastActive: new Date(),
        inExam,
        examCode
      });
      
      // Track which user this socket belongs to
      userSockets.set(socket.id, userId);
      
      // Emit updated active users list to all clients
      const activeUsersList = Array.from(activeUsers.values());
      io.emit('activeUsersUpdate', activeUsersList);
      
      console.log(`User ${userId} successfully logged in with socket ${socket.id}`);
      console.log(`Total active users: ${activeUsers.size}`);
      
      // If user was in an exam, make sure they rejoin the room
      if (inExam && examCode) {
        console.log(`Restoring exam session for user ${userId} in exam ${examCode}`);
        socket.join(examCode);
      }
    } catch (error) {
      console.error('Error handling user login:', error);
    }
  });

  // Add this event to request active users list
  socket.on('getActiveUsers', () => {
    const activeUsersList = Array.from(activeUsers.values());
    socket.emit('activeUsersUpdate', activeUsersList);
  });

  // Add this event for user heartbeat/activity
  socket.on('userActivity', ({ userId }) => {
    if (activeUsers.has(userId)) {
      const userData = activeUsers.get(userId);
      userData.lastActive = new Date();
      activeUsers.set(userId, userData);
    }
  });

  // Update the userLogout handler
  socket.on('userLogout', ({ userId }) => {
    console.log(`User ${userId} logged out`);
    
    // Disconnect all sockets for this user
    disconnectUserSockets(userId);
    
    // Remove from active users
    if (activeUsers.has(userId)) {
      const userData = activeUsers.get(userId);
      console.log(`Removing user from active users: ${userData.firstName} ${userData.lastName}`);
      activeUsers.delete(userId);
      
      // Emit updated active users list
      const activeUsersList = Array.from(activeUsers.values());
      io.emit('activeUsersUpdate', activeUsersList);
    }
  });

  socket.on('joinExam', async ({ testCode, userId }) => {
    console.log(`User ${userId} joined exam with test code: ${testCode}`);

    // Retrieve user information from the database
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        firstName: true,
        lastName: true,
        role: true, // Add role to the selection
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
    
    // IMPORTANT: Make sure we don't lose the user's active status when joining an exam
    // If this user is already in the active users list, update their socket ID
    if (!activeUsers.has(userId)) {
      console.log(`User ${userId} not in active users list, adding them`);
      
      // Retrieve full user information if not already in active users
      const fullUser = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          gradeLevel: true,
          section: true,
          department: true,
          domain: true
        },
      });
      
      if (fullUser) {
        activeUsers.set(userId, {
          ...fullUser,
          socketId: socket.id,
          lastActive: new Date(),
          inExam: true,
          examCode: testCode
        });
        
        // Emit updated active users list
        const activeUsersList = Array.from(activeUsers.values());
        io.emit('activeUsersUpdate', activeUsersList);
      }
    } else {
      // Just update the existing user's socket and activity
      const userData = activeUsers.get(userId);
      userData.socketId = socket.id;
      userData.lastActive = new Date();
      userData.inExam = true;
      userData.examCode = testCode;
      activeUsers.set(userId, userData);
      
      // Emit updated active users list
      const activeUsersList = Array.from(activeUsers.values());
      io.emit('activeUsersUpdate', activeUsersList);
    }
    
    // Make sure this socket is associated with the user
    userSockets.set(socket.id, userId);
  });

  socket.on('quitExam', ({ testCode }) => {
    console.log(`User ${socket.id} quit exam with test code: ${testCode}`);
    
    // If no test code provided, use the one associated with this socket
    const examCode = testCode || socketToExam.get(socket.id);
    
    if (examCode && studentsInExam.has(examCode)) {
      // Get the user ID before removing from exam
      const studentData = studentsInExam.get(examCode).get(socket.id);
      const userId = studentData?.userId;
      
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
      
      // IMPORTANT: Make sure the user stays in the active users list
      if (userId && activeUsers.has(userId)) {
        console.log(`Keeping user ${userId} in active users list after quitting exam`);
        const userData = activeUsers.get(userId);
        userData.lastActive = new Date();
        userData.inExam = false;
        userData.examCode = null;
        activeUsers.set(userId, userData);
        
        // Emit updated active users list
        const activeUsersList = Array.from(activeUsers.values());
        io.emit('activeUsersUpdate', activeUsersList);
      }
    }
  });

  // Update the disconnect handler
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    
    // Find which user this socket belonged to
    const userId = userSockets.get(socket.id);
    if (userId) {
      console.log(`Socket ${socket.id} belonged to user ${userId}`);
      
      // Check if user has any other active sockets
      let hasOtherSockets = false;
      for (const [otherSocketId, uid] of userSockets.entries()) {
        if (uid === userId && otherSocketId !== socket.id) {
          hasOtherSockets = true;
          break;
        }
      }
      
      // Only remove from active users if this was their last socket
      if (!hasOtherSockets) {
        console.log(`Removing user ${userId} from active users (no other sockets)`);
        activeUsers.delete(userId);
        
        // Emit updated active users list
        const activeUsersList = Array.from(activeUsers.values());
        io.emit('activeUsersUpdate', activeUsersList);
      } else {
        console.log(`User ${userId} has other active sockets, not removing from active users`);
      }
      
      // Clean up this socket's reference
      userSockets.delete(socket.id);
    }
    
    // Clean up exam-related maps
    if (socketToExam.has(socket.id)) {
      const examCode = socketToExam.get(socket.id);
      if (studentsInExam.has(examCode)) {
        studentsInExam.get(examCode).delete(socket.id);
        const studentsInThisExam = Array.from(studentsInExam.get(examCode).values());
        io.to(examCode).emit('studentLeft', studentsInThisExam);
      }
      socketToExam.delete(socket.id);
    }

    // If this user was in an exam, update their record
    if (userId && activeUsers.has(userId)) {
      const userData = activeUsers.get(userId);
      if (userData.inExam) {
        userData.inExam = false;
        userData.examCode = null;
        activeUsers.set(userId, userData);
        
        // Only emit if we're not removing the user completely
        if ( userSockets) {
          const activeUsersList = Array.from(activeUsers.values());
          io.emit('activeUsersUpdate', activeUsersList);
        }
      }
    }
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

// Find where you initialize Socket.IO and add this line after it
initGameSocket(io);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT} and http://192.168.0.104:${PORT}`);
});
