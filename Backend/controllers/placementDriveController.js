const PlacementDrive = require("../models/PlacementDrive");
const Company = require("../models/Company");
const Application = require("../models/Application");

// ==========================================
// CREATE PLACEMENT DRIVE (Company Only)
// ==========================================
const createPlacementDrive = async (req, res) => {
  try {
    const {
      role,
      package: salaryPackage,
      description,
      eligibility,
      skills,
      location,
      driveDate,
      applicationDeadline,
      status,
    } = req.body;

    // Validate required fields
    if (!role || !salaryPackage || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Role, salary package, and application deadline are required.",
      });
    }

    // Resolve company profile from authenticated user
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found. Please set up your company profile first.",
      });
    }

    if (!company.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your company account is pending administrative approval.",
      });
    }

    if (company.status === "Disabled") {
      return res.status(403).json({
        success: false,
        message: "Company account is disabled. Please contact the placement administrator.",
      });
    }

    // Parse eligibility
    let parsedEligibility = {
      branches: [],
      minCGPA: 0,
      passingYear: undefined,
    };

    if (eligibility) {
      if (Array.isArray(eligibility.branches)) {
        parsedEligibility.branches = eligibility.branches;
      } else if (typeof eligibility.branches === "string") {
        parsedEligibility.branches = eligibility.branches
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean);
      }

      if (eligibility.minCGPA !== undefined && eligibility.minCGPA !== "") {
        parsedEligibility.minCGPA = Number(eligibility.minCGPA);
      }

      if (eligibility.passingYear !== undefined && eligibility.passingYear !== "") {
        parsedEligibility.passingYear = Number(eligibility.passingYear);
      }
    }

    // Parse skills
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === "string") {
      parsedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const drive = await PlacementDrive.create({
      company: company._id,
      role: role.trim(),
      package: salaryPackage.trim(),
      description: description ? description.trim() : "",
      eligibility: parsedEligibility,
      skills: parsedSkills,
      location: location ? location.trim() : "College Campus",
      driveDate: driveDate ? new Date(driveDate) : undefined,
      applicationDeadline: new Date(applicationDeadline),
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Placement drive created successfully.",
      drive,
    });
  } catch (error) {
    console.error("Create Placement Drive Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating placement drive.",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL ACTIVE PLACEMENT DRIVES (Student / Public)
// ==========================================
const getActivePlacementDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find({ status: "Active" })
      .populate("company", "companyName location website description status")
      .sort({ createdAt: -1 });

    const activeCompanyDrives = drives.filter(
      (drive) => !drive.company || drive.company.status !== "Disabled"
    );

    res.status(200).json({
      success: true,
      count: activeCompanyDrives.length,
      drives: activeCompanyDrives,
    });
  } catch (error) {
    console.error("Get Active Placement Drives Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching active placement drives.",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PLACEMENT DRIVE BY ID
// ==========================================
const getPlacementDriveById = async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate(
      "company",
      "companyName location website description"
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found.",
      });
    }

    res.status(200).json({
      success: true,
      drive,
    });
  } catch (error) {
    console.error("Get Placement Drive By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching placement drive details.",
      error: error.message,
    });
  }
};

// ==========================================
// GET COMPANY'S OWN PLACEMENT DRIVES
// ==========================================
const getCompanyDrives = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const drives = await PlacementDrive.find({ company: company._id }).sort({
      createdAt: -1,
    });

    // Compute application counts per drive
    const drivesWithStats = await Promise.all(
      drives.map(async (drive) => {
        const applications = await Application.find({ drive: drive._id });
        const shortlisted = applications.filter((a) => a.status === "Shortlisted").length;
        const interviews = applications.filter((a) => a.status === "Interview").length;
        const selected = applications.filter((a) => a.status === "Selected").length;

        return {
          ...drive.toObject(),
          stats: {
            totalApplications: applications.length,
            shortlisted,
            interviews,
            selected,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: drivesWithStats.length,
      drives: drivesWithStats,
    });
  } catch (error) {
    console.error("Get Company Drives Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching company drives.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PLACEMENT DRIVE (Company Only)
// ==========================================
const updatePlacementDrive = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    if (company.status === "Disabled") {
      return res.status(403).json({
        success: false,
        message: "Company account is disabled. Please contact the placement administrator.",
      });
    }

    const drive = await PlacementDrive.findOne({
      _id: req.params.id,
      company: company._id,
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found or unauthorized.",
      });
    }

    const {
      role,
      package: salaryPackage,
      description,
      eligibility,
      skills,
      location,
      driveDate,
      applicationDeadline,
      status,
    } = req.body;

    if (role) drive.role = role.trim();
    if (salaryPackage) drive.package = salaryPackage.trim();
    if (description !== undefined) drive.description = description.trim();
    if (location !== undefined) drive.location = location.trim();
    if (driveDate) drive.driveDate = new Date(driveDate);
    if (applicationDeadline) drive.applicationDeadline = new Date(applicationDeadline);
    if (status) drive.status = status;

    if (eligibility) {
      if (Array.isArray(eligibility.branches)) {
        drive.eligibility.branches = eligibility.branches;
      }
      if (eligibility.minCGPA !== undefined) {
        drive.eligibility.minCGPA = Number(eligibility.minCGPA);
      }
      if (eligibility.passingYear !== undefined) {
        drive.eligibility.passingYear = Number(eligibility.passingYear);
      }
    }

    if (skills) {
      if (Array.isArray(skills)) {
        drive.skills = skills;
      } else if (typeof skills === "string") {
        drive.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    await drive.save();

    res.status(200).json({
      success: true,
      message: "Placement drive updated successfully.",
      drive,
    });
  } catch (error) {
    console.error("Update Placement Drive Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating placement drive.",
      error: error.message,
    });
  }
};

// ==========================================
// CLOSE PLACEMENT DRIVE (Company Only)
// ==========================================
const closePlacementDrive = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    if (company.status === "Disabled") {
      return res.status(403).json({
        success: false,
        message: "Company account is disabled. Please contact the placement administrator.",
      });
    }

    const drive = await PlacementDrive.findOneAndUpdate(
      {
        _id: req.params.id,
        company: company._id,
      },
      {
        status: "Closed",
      },
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Placement drive closed successfully.",
      drive,
    });
  } catch (error) {
    console.error("Close Placement Drive Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error closing placement drive.",
      error: error.message,
    });
  }
};

module.exports = {
  createPlacementDrive,
  getActivePlacementDrives,
  getPlacementDriveById,
  getCompanyDrives,
  updatePlacementDrive,
  closePlacementDrive,
};
