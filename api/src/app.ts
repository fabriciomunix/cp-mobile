import express from 'express';
import { groupsRouter } from './routes/groups';
import { notificationsRouter } from './routes/notifications';

export const app = express();
app.use(express.json());

app.use('/groups', groupsRouter);
app.use('/notifications', notificationsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
