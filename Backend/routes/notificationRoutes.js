const express = require("express");

const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();


// Student gets notifications
router.get(
  "/",
  protect,
  authorizeRoles("student"),
  getMyNotifications
);


// Student marks notification as read
router.put(
  "/:id/read",
  protect,
  authorizeRoles("student"),
  markAsRead
);


module.exports = router;