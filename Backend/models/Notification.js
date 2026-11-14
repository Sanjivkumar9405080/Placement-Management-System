const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: "Placement Notification",
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["application", "schedule", "general", "interview", "drive"],
      default: "general",
    },

    targetAudience: {
      type: String,
      default: "general",
    },

    targetCriteria: {
      type: String,
      default: "",
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);