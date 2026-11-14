const mongoose = require("mongoose");

const companyShareSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    hrName: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Sent", "Delivered", "Failed"],
      default: "Sent",
    },
    deliveryNotes: {
      type: String,
      default: "Shared via Placement Portal dispatch",
    },
  },
  {
    timestamps: true,
  }
);

const CompanyShare = mongoose.model("CompanyShare", companyShareSchema);

module.exports = CompanyShare;
