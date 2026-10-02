const express = require("express");

const {
  createProfile,
  getMyProfile,
  updateProfile,
} = require("../controllers/companyController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("company"),
  createProfile
);

router.get(
  "/profile",
  protect,
  authorizeRoles("company"),
  getMyProfile
);

router.put(
  "/profile",
  protect,
  authorizeRoles("company"),
  updateProfile
);

module.exports = router;