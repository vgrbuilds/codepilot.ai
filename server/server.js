import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './src/services/mongodb.service.js';
import authRouter from './src/routers/auth.router.js';
import projectRouter from './src/routers/project.router.js';
import chatRouter from './src/routers/chat.router.js';
import errorHandler from './src/middleware/error.middleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'CodePilot.ai Server is running.' });
});

// Mount modular API routers under /api prefix
app.use('/api', authRouter);
app.use('/api', projectRouter);
app.use('/api', chatRouter);

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
