import app from './app.js';
import { port } from './config/env.js';
import { connectDB } from './config/database.js';

const PORT = port;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});
