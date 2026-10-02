const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    officialEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    hrName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: "College Campus",
    },

    website: {
      type: String,
      trim: true,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
      trim: true,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["Active", "Disabled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;