const express = require("express");

const {
  createDrive,
  getAllDrives,
  getMyDrives,
  updateDrive,
} = require("../controllers/driveController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Company creates a placement drive
router.post(
  "/",
  protect,
  authorizeRoles("company"),
  createDrive
);

// Students can view all open drives
router.get(
  "/",
  protect,
  authorizeRoles("student"),
  getAllDrives
);

// Company views its own drives
router.get(
  "/my-drives",
  protect,
  authorizeRoles("company"),
  getMyDrives
);

// Company updates its own drive
router.put(
  "/:id",
  protect,
  authorizeRoles("company"),
  updateDrive
);

module.exports = router;