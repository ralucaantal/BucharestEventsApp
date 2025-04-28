import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Hello World endpoint
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});