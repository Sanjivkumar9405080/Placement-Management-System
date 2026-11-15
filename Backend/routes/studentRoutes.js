const express = require("express");
const multer = require("multer");

const {
  createProfile,
  getMyProfile,
  updateProfile,
  uploadResume,
  suggestCompany,
  getMySuggestedCompanies,
} = require("../controllers/studentController");

const {
  getStudentPlacementOpportunities,
} = require("../controllers/placementDriveController");

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
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: "Resume size should be less than 5 MB.",
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "Invalid file upload.",
        });
      }
      next();
    });
  },
  uploadResume
);

router.get(
  "/eligible-drives",
  protect,
  authorizeRoles("student"),
  getStudentPlacementOpportunities
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