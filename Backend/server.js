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

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/placement-drives", placementDriveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/schedules",interviewScheduleRoutes);
app.use("/api/interviews", interviewRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Placement Management System API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});