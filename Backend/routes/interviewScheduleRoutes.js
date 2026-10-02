const express = require("express");

const {
  createSchedule,
  getMySchedules,
  getCompanySchedules,
  updateSchedule,
  deleteSchedule 

} = require("../controllers/interviewScheduleController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Company creates interview schedule
router.post(
  "/",
  protect,
  authorizeRoles("company"),
  createSchedule
);

// Student views own interview schedules
router.get(
  "/my-schedules",
  protect,
  authorizeRoles("student"),
  getMySchedules
);

router.get(
  "/company",
  protect,
  authorizeRoles("company"),
  getCompanySchedules
);

router.put(
  "/:id",
  protect,
  authorizeRoles("company"),
  updateSchedule
);


router.delete(
  "/:id",
  protect,
  authorizeRoles("company"),
  deleteSchedule
);
module.exports = router;