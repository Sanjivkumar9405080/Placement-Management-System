const express = require("express");

const {
  createProfile,
  getMyProfile,
  updateProfile,
  uploadResume,
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

module.exports = router;