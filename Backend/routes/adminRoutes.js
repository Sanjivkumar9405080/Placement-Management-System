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
  getAllApplications,
  getAdminApplicationDetails,
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

// Get single placement drive details
router.get(
  "/drives/:id",
  protect,
  authorizeRoles("admin"),
  getAdminPlacementDriveDetails
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

module.exports = router;