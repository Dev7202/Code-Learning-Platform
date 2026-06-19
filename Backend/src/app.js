import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import roadmapRouter from './routes/roadmapRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));

app.use('/api/auth',    authRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/chat',    chatRouter);
app.use('/api/user',    userRouter);

app.get('/health', (req, res) => res.send('Server is healthy'));

export default app;