const express = require("express");
const router = express.Router();

const {
  createPlacementDrive,
  getActivePlacementDrives,
  getPlacementDriveById,
  getCompanyDrives,
  updatePlacementDrive,
  closePlacementDrive,
} = require("../controllers/placementDriveController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Company creates placement drive
router.post(
  "/",
  protect,
  authorizeRoles("company"),
  createPlacementDrive
);

// Company gets its own drives
router.get(
  "/company",
  protect,
  authorizeRoles("company"),
  getCompanyDrives
);

// Public / Student get all active drives
router.get("/active", getActivePlacementDrives);
router.get("/", getActivePlacementDrives);

// Get single drive details
router.get("/:id", getPlacementDriveById);

// Company updates drive
router.put(
  "/:id",
  protect,
  authorizeRoles("company"),
  updatePlacementDrive
);

// Company closes drive
router.put(
  "/:id/close",
  protect,
  authorizeRoles("company"),
  closePlacementDrive
);

module.exports = router;
