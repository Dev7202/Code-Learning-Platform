// create a server

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRouter from './routes/authRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));

app.use('/api/auth', authRouter);

app.get('/health', (req, res) => res.send('Server is healthy'));

export default app;