const express = require("express");

const {
  getAdminDashboardStats,
  getAdminProfile,
  getAllStudents,
  getStudentDetails,
  getAllCompanies,
  getCompanyDetails,
  getCompanyStatistics,
  updateCompanyStatus,
  approveCompany,
  rejectCompany,
  getAllPlacementDrives,
  getAdminPlacementDriveDetails,
  getAdminDriveApplicants,
  closePlacementDriveByAdmin,
  adminCreatePlacementDrive,
  approvePlacementDrive,
  rejectPlacementDrive,
  requestDriveChanges,
  updatePlacementDriveByAdmin,
  deletePlacementDriveByAdmin,
  getDriveEligibleStudents,
  getAllApplications,
  getAdminApplicationDetails,
  shareStudentsWithCompany,
  getSharedProfilesHistory,
  sendAdminNotification,
  getAdminNotificationHistory,
  deleteAdminNotificationHistory,
  getCompanySuggestions,
  updateCompanySuggestionStatus,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin Dashboard statistics
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboardStats
);

// Admin Profile
router.get(
  "/profile",
  protect,
  authorizeRoles("admin"),
  getAdminProfile
);

// Admin Students list
router.get(
  "/students",
  protect,
  authorizeRoles("admin"),
  getAllStudents
);

// Admin Student Details
router.get(
  "/students/:id",
  protect,
  authorizeRoles("admin"),
  getStudentDetails
);

// Get all companies
router.get(
  "/companies",
  protect,
  authorizeRoles("admin"),
  getAllCompanies
);

// Get company statistics
router.get(
  "/companies/:id/statistics",
  protect,
  authorizeRoles("admin"),
  getCompanyStatistics
);

// Get single company details
router.get(
  "/companies/:id",
  protect,
  authorizeRoles("admin"),
  getCompanyDetails
);

// Update company status (Active / Disabled)
router.put(
  "/companies/:id/status",
  protect,
  authorizeRoles("admin"),
  updateCompanyStatus
);

// Approve company
router.put(
  "/companies/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveCompany
);

// Reject company
router.put(
  "/companies/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectCompany
);

// Get all placement drives
router.get(
  "/drives",
  protect,
  authorizeRoles("admin"),
  getAllPlacementDrives
);

// Admin creates placement drive on behalf of company
router.post(
  "/drives",
  protect,
  authorizeRoles("admin"),
  adminCreatePlacementDrive
);

// Get single placement drive details
router.get(
  "/drives/:id",
  protect,
  authorizeRoles("admin"),
  getAdminPlacementDriveDetails
);

// Admin updates placement drive
router.put(
  "/drives/:id",
  protect,
  authorizeRoles("admin"),
  updatePlacementDriveByAdmin
);

// Admin deletes placement drive
router.delete(
  "/drives/:id",
  protect,
  authorizeRoles("admin"),
  deletePlacementDriveByAdmin
);

// Admin approves placement drive
router.put(
  "/drives/:id/approve",
  protect,
  authorizeRoles("admin"),
  approvePlacementDrive
);

// Admin rejects placement drive with reason
router.put(
  "/drives/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectPlacementDrive
);

// Admin requests changes from company
router.put(
  "/drives/:id/request-changes",
  protect,
  authorizeRoles("admin"),
  requestDriveChanges
);

// Get eligible students preview for a specific drive
router.get(
  "/drives/:id/eligible-students",
  protect,
  authorizeRoles("admin"),
  getDriveEligibleStudents
);

// Get applicants for specific drive
router.get(
  "/drives/:id/applicants",
  protect,
  authorizeRoles("admin"),
  getAdminDriveApplicants
);

// Close placement drive by admin
router.put(
  "/drives/:id/close",
  protect,
  authorizeRoles("admin"),
  closePlacementDriveByAdmin
);

// Get all placement applications
router.get(
  "/applications",
  protect,
  authorizeRoles("admin"),
  getAllApplications
);

// Get single placement application details
router.get(
  "/applications/:id",
  protect,
  authorizeRoles("admin"),
  getAdminApplicationDetails
);

// Share student profiles and resumes with a company
router.post(
  "/share-students",
  protect,
  authorizeRoles("admin"),
  shareStudentsWithCompany
);

// Get shared student profiles history
router.get(
  "/shared-profiles",
  protect,
  authorizeRoles("admin"),
  getSharedProfilesHistory
);

// Send admin notifications (to all, selected, single student, year, or skill)
router.post(
  "/notifications",
  protect,
  authorizeRoles("admin"),
  sendAdminNotification
);

// Get admin notification history
router.get(
  "/notifications/history",
  protect,
  authorizeRoles("admin"),
  getAdminNotificationHistory
);

// Delete notification history log
router.delete(
  "/notifications/history/:id",
  protect,
  authorizeRoles("admin"),
  deleteAdminNotificationHistory
);

// Get all student-submitted company suggestions
router.get(
  "/company-suggestions",
  protect,
  authorizeRoles("admin"),
  getCompanySuggestions
);

// Update company suggestion status (Approve / Reject / Pending)
router.put(
  "/company-suggestions/:id/status",
  protect,
  authorizeRoles("admin"),
  updateCompanySuggestionStatus
);

module.exports = router;