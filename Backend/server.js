const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const connectDB = require("./config/db");
const driveRoutes = require("./routes/driveRoutes");
const adminRoutes = require("./routes/adminRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const interviewScheduleRoutes = require("./routes/interviewScheduleRoutes");
const placementDriveRoutes = require("./routes/placementDriveRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

dotenv.config();

// Initiate initial MongoDB connection in the background
connectDB().catch((err) => {
  console.error("Initial MongoDB connection attempt failed:", err.message);
});

const app = express();

// CORS configuration - support cross-origin requests
app.use(cors());
app.use(express.json());

// Serve static files (local development fallback for uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection middleware to ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  if (req.path === "/" || req.path === "/api" || req.path === "/health") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed. Please ensure MONGO_URI is set correctly in environment variables.",
      error: error.message,
    });
  }
});

// Health check endpoint
app.get(["/", "/api", "/health"], (req, res) => {
  const mongoose = require("mongoose");
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = states[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    message: "Placement Management System API is running",
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Primary routes mounted with /api prefix
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/placement-drives", placementDriveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/schedules", interviewScheduleRoutes);
app.use("/api/interviews", interviewRoutes);

// Fallback: also mount routes without /api prefix
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/company", companyRoutes);
app.use("/drives", driveRoutes);
app.use("/placement-drives", placementDriveRoutes);
app.use("/admin", adminRoutes);
app.use("/applications", applicationRoutes);
app.use("/notifications", notificationRoutes);
app.use("/schedules", interviewScheduleRoutes);
app.use("/interviews", interviewRoutes);

// Global 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// Only listen when running outside Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;