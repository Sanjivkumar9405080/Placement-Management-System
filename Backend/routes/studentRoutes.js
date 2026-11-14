const express = require("express");

const {
  createProfile,
  getMyProfile,
  updateProfile,
  uploadResume,
  suggestCompany,
  getMySuggestedCompanies,
} = require("../controllers/studentController");

const {
  getEligibleDrives,
} = require("../controllers/driveController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("student"),
  createProfile
);

router.get(
  "/profile",
  protect,
  authorizeRoles("student"),
  getMyProfile
);

router.put(
  "/profile",
  protect,
  authorizeRoles("student"),
  updateProfile
);

router.post(
  "/upload-resume",
  protect,
  authorizeRoles("student"),
  upload.single("resume"),
  uploadResume
);

router.get(
  "/eligible-drives",
  protect,
  authorizeRoles("student"),
  getEligibleDrives
);

// Suggest a company
router.post(
  "/suggest-company",
  protect,
  authorizeRoles("student"),
  suggestCompany
);

// Get my suggested companies
router.get(
  "/suggested-companies",
  protect,
  authorizeRoles("student"),
  getMySuggestedCompanies
);

module.exports = router;