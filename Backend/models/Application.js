const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
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

    role: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
      ],
      default: "Applied",
    },

    currentRoundNumber: {
      type: Number,
      default: 1,
    },

    currentRoundName: {
      type: String,
      default: "Round 1",
      trim: true,
    },

    currentRoundStatus: {
      type: String,
      enum: [
        "Applied",
        "Pending",
        "Round Scheduled",
        "In Progress",
        "Cleared",
        "Rejected",
        "Upcoming",
        "Selected",
        "Not Selected",
      ],
      default: "Pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/*
  Same student should not be able to apply
  twice for the same placement drive.
*/
applicationSchema.index(
  {
    student: 1,
    drive: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Application",
  applicationSchema
);