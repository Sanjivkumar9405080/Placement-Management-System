const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    venue: {
      type: String,
      trim: true,
      default: "",
    },

    interviewerName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
      default: "Scheduled",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
