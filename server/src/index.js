import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { runDueDateNotificationSweep } from './lib/notifications.js';
import projectsRouter from './routes/projects.js';
import accountRouter from './routes/account.js';
import notificationsRouter from './routes/notifications.js';

const app = express();
const port = process.env.PORT || 4000;
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:3000'];
const configuredSweepIntervalMs = Number.parseInt(
  process.env.DUE_NOTIFICATION_SWEEP_MS || '',
  10
);
const dueSweepIntervalMs =
  Number.isInteger(configuredSweepIntervalMs) && configuredSweepIntervalMs > 0
    ? configuredSweepIntervalMs
    : 15 * 60 * 1000;

const runDueSweepSafely = async () => {
  try {
    const result = await runDueDateNotificationSweep();
    if (result?.createdCount) {
      console.log(`Due-date sweep created ${result.createdCount} notifications.`);
    }
  } catch (error) {
    console.error('Due-date notification sweep failed:', error);
  }
};

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.all('/api/auth/*splat', toNodeHandler(auth));
app.use('/api', accountRouter);
app.use('/api', projectsRouter);
app.use('/api', notificationsRouter);

app.get('/', (req, res) => {
  res.type('text').send('Bucket server is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  runDueSweepSafely();
  setInterval(runDueSweepSafely, dueSweepIntervalMs);
});
