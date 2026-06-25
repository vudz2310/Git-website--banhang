import express from "express";
import authRouter from "./routes/auth.route.js";
import settingRouter from "./routes/setting.route.js";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./docs/swagger.js";

const app = express();

// Custom CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/settings", settingRouter);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

export default app;
