const mongoose = require("mongoose");

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    package: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    eligibility: {
      branches: [
        {
          type: String,
          trim: true,
        },
      ],

      minCGPA: {
        type: Number,
        default: 0,
      },

      passingYear: {
        type: Number,
      },
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      default: "College Campus",
      trim: true,
    },

    driveDate: {
      type: Date,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Closed", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PlacementDrive",
  placementDriveSchema
);