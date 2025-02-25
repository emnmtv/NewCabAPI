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
const studentsInExam = new Map(); // Use a Map to store userId and socketId

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

    const userName = `${user.firstName} ${user.lastName}`; // Combine first and last name

    // Update or add the user in the studentsInExam map
    studentsInExam.set(socket.id, { userId, userName }); // Store userId and userName with socketId
    socket.join(testCode);
    
    // Emit the updated list of students to all clients in the room
    const currentStudents = Array.from(studentsInExam.values());
    io.to(testCode).emit('studentJoined', currentStudents);
    console.log(`Current students in exam ${testCode}:`, currentStudents);
  });

  socket.on('quitExam', ({ testCode }) => {
    console.log(`User ${socket.id} quit exam with test code: ${testCode}`);
    
    // Remove the user from the map
    const userInfo = studentsInExam.get(socket.id);
    if (userInfo) {
      studentsInExam.delete(socket.id); // Remove the user from the map on disconnect

      // Emit the updated list of students to all clients in the room
      const currentStudents = Array.from(studentsInExam.values());
      io.to(testCode).emit('studentLeft', currentStudents); // Notify others that a student left
      console.log(`Current students in exam ${testCode}:`, currentStudents);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    studentsInExam.delete(socket.id); // Remove the user from the map on disconnect
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT} and http://192.168.0.104:${PORT}`);
});
