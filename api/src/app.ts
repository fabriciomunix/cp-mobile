import express from 'express';
import { groupsRouter } from './routes/groups';

export const app = express();
app.use(express.json());

app.use('/groups', groupsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
