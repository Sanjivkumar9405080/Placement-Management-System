const mongoose = require("mongoose");

const placementRoundSchema = new mongoose.Schema(
  {
    placementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
      index: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    roundName: {
      type: String,
      required: true,
      trim: true,
    },

    roundNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    roundDescription: {
      type: String,
      trim: true,
      default: "",
    },

    scheduledDate: {
      type: Date,
    },

    scheduledTime: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "Campus / Online",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed"],
      default: "Scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate round numbers for the same placement drive
placementRoundSchema.index(
  {
    placementDrive: 1,
    roundNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("PlacementRound", placementRoundSchema);
