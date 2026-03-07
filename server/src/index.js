import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import projectsRouter from './routes/projects.js';
import accountRouter from './routes/account.js';

const app = express();
const port = process.env.PORT || 4000;
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins =
  configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:3000'];

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

app.get('/', (req, res) => {
  res.type('text').send('Bucket server is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
