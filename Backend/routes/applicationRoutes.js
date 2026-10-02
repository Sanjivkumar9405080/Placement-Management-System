const express = require("express");

const router = express.Router();

const {
  applyForDrive,
  getMyApplications,
  getCompanyApplications,
  getApplicantDetails,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");


// Student
router.post(
  "/apply",
  protect,
  applyForDrive
);

router.get(
  "/my-applications",
  protect,
  getMyApplications
);


// Company
router.get(
  "/company",
  protect,
  getCompanyApplications
);

router.get(
  "/company/:id",
  protect,
  getApplicantDetails
);

router.put(
  "/company/:id/status",
  protect,
  updateApplicationStatus
);


module.exports = router;