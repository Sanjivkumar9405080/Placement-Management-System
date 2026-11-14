const express = require("express");

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
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

// Student marks all notifications as read
router.put(
  "/read-all",
  protect,
  authorizeRoles("student"),
  markAllAsRead
);

// Student marks notification as read
router.put(
  "/:id/read",
  protect,
  authorizeRoles("student"),
  markAsRead
);

// Student deletes notification
router.delete(
  "/:id",
  protect,
  authorizeRoles("student"),
  deleteNotification
);

module.exports = router;