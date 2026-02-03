import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import projectsRouter from './routes/projects.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.all('/api/auth/*splat', toNodeHandler(auth));
app.use('/api', projectsRouter);

app.get('/', (req, res) => {
  res.type('text').send('Bucket server is running');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
