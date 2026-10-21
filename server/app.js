import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import skillRoutes from "./routes/skillRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IROPS API is running successfully!",
  });
});

// Server health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "Running",
  });
});

// Database health check
app.get("/api/health/db", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    database: isConnected ? "Connected" : "Disconnected",
  });
});

export default app;