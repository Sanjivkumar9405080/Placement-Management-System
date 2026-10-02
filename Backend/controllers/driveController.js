const Drive = require("../models/Drive");
const Company = require("../models/Company");
const Student = require("../models/Student");

// Create Placement Drive
const createDrive = async (req, res) => {
  try {
    const {
      jobTitle,
      description,
      package: salaryPackage,
      minCGPA,
      eligibleBranches,
      graduationYear,
      requiredSkills,
      deadline,
    } = req.body;

    // Find company profile
    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    // Check company approval
    if (!company.isApproved) {
      return res.status(403).json({
        message: "Company is not approved by admin",
      });
    }

    // Create drive
    const drive = await Drive.create({
      companyId: company._id,
      jobTitle,
      description,
      package: salaryPackage,
      minCGPA,
      eligibleBranches,
      graduationYear,
      requiredSkills,
      deadline,
    });

    res.status(201).json({
      message: "Placement drive created successfully",
      drive,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get All Open Drives
const getAllDrives = async (req, res) => {
  try {
    const drives = await Drive.find({
      status: "open",
    }).populate(
      "companyId",
      "companyName location website"
    );

    res.status(200).json({
      drives,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get Company's Drives
const getMyDrives = async (req, res) => {
  try {
    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const drives = await Drive.find({
      companyId: company._id,
    });

    res.status(200).json({
      drives,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Update Drive
const updateDrive = async (req, res) => {
  try {
    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const drive = await Drive.findOne({
      _id: req.params.id,
      companyId: company._id,
    });

    if (!drive) {
      return res.status(404).json({
        message: "Placement drive not found",
      });
    }

    const {
      jobTitle,
      description,
      package: salaryPackage,
      minCGPA,
      eligibleBranches,
      graduationYear,
      requiredSkills,
      deadline,
      status,
    } = req.body;

    drive.jobTitle = jobTitle ?? drive.jobTitle;
    drive.description = description ?? drive.description;
    drive.package = salaryPackage ?? drive.package;
    drive.minCGPA = minCGPA ?? drive.minCGPA;
    drive.eligibleBranches =
      eligibleBranches ?? drive.eligibleBranches;
    drive.graduationYear =
      graduationYear ?? drive.graduationYear;
    drive.requiredSkills =
      requiredSkills ?? drive.requiredSkills;
    drive.deadline = deadline ?? drive.deadline;
    drive.status = status ?? drive.status;

    await drive.save();

    res.status(200).json({
      message: "Placement drive updated successfully",
      drive,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getEligibleDrives = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const drives = await Drive.find({
      status: "open",
      minCGPA: { $lte: student.cgpa },
      eligibleBranches: student.branch,
      graduationYear: student.graduationYear,
    }).populate(
      "companyId",
      "companyName location website"
    );

    const studentSkills = student.skills.map((skill) =>
      skill.toLowerCase().trim()
    );

    const eligibleDrives = drives.filter((drive) => {
      if (
        !drive.requiredSkills ||
        drive.requiredSkills.length === 0
      ) {
        return true;
      }

      const matchedSkills = drive.requiredSkills.filter((skill) =>
        studentSkills.includes(skill.toLowerCase().trim())
      );

      const matchPercentage =
        (matchedSkills.length / drive.requiredSkills.length) * 100;

      return matchPercentage >= 50;
    });

    res.status(200).json({
      count: eligibleDrives.length,
      drives: eligibleDrives,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createDrive,
  getAllDrives,
  getMyDrives,
  updateDrive,
  getEligibleDrives 

};