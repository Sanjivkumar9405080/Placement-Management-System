const mongoose = require("mongoose");

const adminNotificationLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["general", "interview", "application", "schedule", "drive"],
      default: "general",
    },
    targetAudience: {
      type: String,
      enum: ["all", "student", "selected", "year", "skill"],
      required: true,
    },
    targetCriteria: {
      type: String,
      default: "All Students",
    },
    recipientsCount: {
      type: Number,
      default: 0,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AdminNotificationLog = mongoose.model(
  "AdminNotificationLog",
  adminNotificationLogSchema
);

module.exports = AdminNotificationLog;
