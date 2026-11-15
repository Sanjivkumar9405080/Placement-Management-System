const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: {
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

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
      index: true,
    },

    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementRound",
    },

    roundNumber: {
      type: Number,
      default: 1,
    },

    roundName: {
      type: String,
      trim: true,
      default: "Technical Round",
    },

    date: {
      type: Date,
      required: true,
      index: true,
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

    interviewerEmail: {
      type: String,
      trim: true,
      default: "",
    },

    interviewerPhone: {
      type: String,
      trim: true,
      default: "",
    },

    interviewerDesignation: {
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
      enum: [
        "Scheduled",
        "Completed",
        "Cancelled",
        "Rescheduled",
        "Selected",
        "Rejected",
        "On Hold",
      ],
      default: "Scheduled",
      index: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // Interview Feedback & Evaluation
    feedback: {
      technicalRating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      communicationRating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      problemSolvingRating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      overallRating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      comments: {
        type: String,
        trim: true,
        default: "",
      },
      remarks: {
        type: String,
        trim: true,
        default: "",
      },
      recommendation: {
        type: String,
        enum: [
          "Pending",
          "Selected",
          "Rejected",
          "On Hold",
          "Cleared",
          "Needs Second Review",
        ],
        default: "Pending",
      },
      submittedAt: {
        type: Date,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      isPublished: {
        type: Boolean,
        default: false,
      },
      publishedAt: {
        type: Date,
      },
      publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resultPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes for query efficiency
interviewSchema.index({ drive: 1, student: 1, roundNumber: 1 });
interviewSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
