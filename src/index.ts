import express from 'express';
import { authRouter } from './routes/authRoutes';
import cors from "cors";



const app = express();
const PORT = Number(process.env.PORT) || 3200;  // Ensuring it's a number

app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "Content-Type,Authorization", credentials: true }));
app.use(express.json());

app.use('/auth', authRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
