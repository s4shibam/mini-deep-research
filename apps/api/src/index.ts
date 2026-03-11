import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { CORS_ORIGIN, PORT } from './constants';
import { conversationRouter } from './routes/conversation';

const app = express();

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());

app.use('/api/conversations', conversationRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
