const mongoose = require("mongoose");

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    invitedCompanyEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    createdSource: {
      type: String,
      enum: ["admin", "company"],
      default: "company",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    jobType: {
      type: String,
      enum: ["Full-Time", "Internship", "Internship + PPO", "Contract"],
      default: "Full-Time",
    },

    vacancies: {
      type: String,
      default: "Open",
      trim: true,
    },

    experience: {
      type: String,
      default: "Fresher",
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    additionalInstructions: {
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

      academicYears: [
        {
          type: String,
          trim: true,
        },
      ],

      backlogCriteria: {
        type: String,
        default: "No active backlogs",
        trim: true,
      },

      maxBacklogs: {
        type: Number,
        default: 0,
      },
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    selectionProcess: [
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
      enum: [
        "Pending Approval",
        "Active",
        "Approved",
        "Rejected",
        "Closed",
        "Completed",
      ],
      default: "Pending Approval",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    changeRequests: {
      type: String,
      default: "",
      trim: true,
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