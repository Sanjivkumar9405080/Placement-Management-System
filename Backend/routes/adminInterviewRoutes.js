const express = require("express");
const router = express.Router();

const {
  getAdminInterviews,
  getAdminInterviewById,
  getAdminInterviewOptions,
  scheduleInterviewByAdmin,
  updateInterviewByAdmin,
  rescheduleInterviewByAdmin,
  updateInterviewStatusByAdmin,
  submitInterviewFeedback,
  publishInterviewResult,
  deleteInterviewByAdmin,
  getAdminInterviewCalendar,
  getAdminInterviewAnalytics,
  exportAdminInterviewsCSV,
  getDriveRoundsByAdmin,
  saveDriveRoundsByAdmin,
} = require("../controllers/adminInterviewController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All routes are strictly protected for Admin role
router.use(protect);
router.use(authorizeRoles("admin"));

// 1. Core Interview List & KPI Metrics
router.get("/", getAdminInterviews);

// 2. Options for scheduling modal (Companies, Drives, Applicants, Rounds)
router.get("/options", getAdminInterviewOptions);

// 3. Calendar View data
router.get("/calendar", getAdminInterviewCalendar);

// 4. Analytics & Reports
router.get("/analytics", getAdminInterviewAnalytics);

// 5. CSV Export
router.get("/export-csv", exportAdminInterviewsCSV);

// 6. Round Management for a specific drive
router.get("/rounds/:driveId", getDriveRoundsByAdmin);
router.post("/rounds/:driveId", saveDriveRoundsByAdmin);

// 7. Single Interview Details
router.get("/:id", getAdminInterviewById);

// 8. Schedule New Interview
router.post("/", scheduleInterviewByAdmin);

// 9. Update Interview details
router.put("/:id", updateInterviewByAdmin);

// 10. Reschedule Interview
router.put("/:id/reschedule", rescheduleInterviewByAdmin);

// 11. Update Status
router.put("/:id/status", updateInterviewStatusByAdmin);

// 12. Submit Feedback & Ratings
router.put("/:id/feedback", submitInterviewFeedback);

// 13. Publish Result (Selection / Rejection / Round Cleared)
router.put("/:id/publish-result", publishInterviewResult);

// 14. Delete / Cancel Interview
router.delete("/:id", deleteInterviewByAdmin);

module.exports = router;
