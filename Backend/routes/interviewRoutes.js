const express = require("express");
const router = express.Router();

const {
  scheduleInterview,
  getCompanyInterviews,
  getCompanyInterviewById,
  updateInterview,
  updateInterviewStatus,
  cancelInterview,
  getMyInterviews,
} = require("../controllers/interviewController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Company schedules interview
router.post(
  "/",
  protect,
  authorizeRoles("company"),
  scheduleInterview
);

// Company gets all its interviews
router.get(
  "/company",
  protect,
  authorizeRoles("company"),
  getCompanyInterviews
);

// Company gets single interview details
router.get(
  "/company/:id",
  protect,
  authorizeRoles("company"),
  getCompanyInterviewById
);

// Company updates interview details
router.put(
  "/:id",
  protect,
  authorizeRoles("company"),
  updateInterview
);

// Company updates interview status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("company"),
  updateInterviewStatus
);

// Company cancels/deletes interview
router.delete(
  "/:id",
  protect,
  authorizeRoles("company"),
  cancelInterview
);

// Student gets own scheduled interviews
router.get(
  "/my-interviews",
  protect,
  authorizeRoles("student"),
  getMyInterviews
);

module.exports = router;
