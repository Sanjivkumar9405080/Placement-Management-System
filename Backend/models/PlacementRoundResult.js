const mongoose = require("mongoose");

const placementRoundResultSchema = new mongoose.Schema(
  {
    placementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
      index: true,
    },

    placementApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementRound",
      required: true,
      index: true,
    },

    roundNumber: {
      type: Number,
      required: true,
    },

    roundName: {
      type: String,
      required: true,
      trim: true,
    },

    result: {
      type: String,
      enum: ["Cleared", "Rejected", "Pending", "Selected"],
      default: "Pending",
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure permanent one result record per student per round
placementRoundResultSchema.index(
  {
    placementDrive: 1,
    student: 1,
    round: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "PlacementRoundResult",
  placementRoundResultSchema
);
