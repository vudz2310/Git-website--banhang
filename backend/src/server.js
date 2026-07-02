import app from "./app.js";

import { port } from "./config/env.js";

import { connectDB } from "./config/database.js";
import "./config/seed.js";


const PORT = port || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);

  console.log(
    `Swagger:
http://localhost:${PORT}/swagger`,
  );
});
