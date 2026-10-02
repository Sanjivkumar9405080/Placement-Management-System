const Notification = require("../models/Notification");

// Get student's notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  getMyNotifications,
  markAsRead,
};