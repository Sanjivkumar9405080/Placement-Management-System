const mongoose = require("mongoose");

const interviewScheduleSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    roundNumber: {
      type: Number,
      required: true,
    },

    roundName: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    instructions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InterviewSchedule",
  interviewScheduleSchema
);