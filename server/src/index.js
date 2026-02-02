import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.type('text').send('Bucket server is running');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
