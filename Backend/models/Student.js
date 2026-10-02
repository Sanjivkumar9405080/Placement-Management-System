const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    college: {
      type: String,
      trim: true,
      default: "College of Engineering",
    },

    rollNumber: {
      type: String,
      trim: true,
      default: "",
    },

    course: {
      type: String,
      trim: true,
      default: "B.Tech Computer Science",
    },

    branch: {
      type: String,
      default: "CSE - AI & ML",
      trim: true,
    },

    cgpa: {
      type: Number,
      default: 7.0,
      min: 0,
      max: 10,
    },

    graduationYear: {
      type: Number,
      default: 2027,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    resume: {
      type: String,
      default: "",
    },

    resumeOriginalName: {
      type: String,
      default: "",
    },

    achievements: [
      {
        id: Number,
        title: String,
        organization: String,
        year: String,
      },
    ],

    projects: [
      {
        id: Number,
        name: String,
        description: String,
        technologies: String,
        link: String,
      },
    ],

    professionalLinks: [
      {
        id: Number,
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;