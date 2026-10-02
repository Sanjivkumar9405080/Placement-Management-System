const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    package: {
      type: Number,
      required: true,
    },

    minCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    eligibleBranches: [
      {
        type: String,
        trim: true,
      },
    ],

    graduationYear: {
      type: Number,
      required: true,
    },

    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const Drive = mongoose.model("Drive", driveSchema);

module.exports = Drive;