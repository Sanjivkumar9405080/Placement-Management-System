const express = require("express");
const router = express.Router();

const {
  getDriveRoundsAndApplicants,
  createOrConfigureRound,
  updateCandidateRoundResults,
  promoteCandidatesToNextRound,
  markFinalSelection,
  getStudentPlacementJourney,
  getAdminPlacementTracking,
  getAdminStudentJourney,
  exportAdminPlacementTrackingCSV,
} = require("../controllers/roundTrackingController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ==========================================
// STUDENT ROUTES
// ==========================================
router.get(
  "/student/journey",
  protect,
  authorizeRoles("student"),
  getStudentPlacementJourney
);

// ==========================================
// COMPANY & ADMIN DRIVE ROUND MANAGEMENT
// ==========================================
router.get(
  "/drive/:driveId",
  protect,
  authorizeRoles("company", "admin"),
  getDriveRoundsAndApplicants
);

router.post(
  "/drive/:driveId",
  protect,
  authorizeRoles("company", "admin"),
  createOrConfigureRound
);

router.post(
  "/:roundId/results",
  protect,
  authorizeRoles("company", "admin"),
  updateCandidateRoundResults
);

router.post(
  "/drive/:driveId/promote",
  protect,
  authorizeRoles("company", "admin"),
  promoteCandidatesToNextRound
);

router.post(
  "/drive/:driveId/final-selection",
  protect,
  authorizeRoles("company", "admin"),
  markFinalSelection
);

// ==========================================
// ADMIN TRACKING & ANALYTICS
// ==========================================
router.get(
  "/admin/tracking",
  protect,
  authorizeRoles("admin"),
  getAdminPlacementTracking
);

router.get(
  "/admin/student/:studentId",
  protect,
  authorizeRoles("admin"),
  getAdminStudentJourney
);

router.get(
  "/admin/export",
  protect,
  authorizeRoles("admin"),
  exportAdminPlacementTrackingCSV
);

module.exports = router;
