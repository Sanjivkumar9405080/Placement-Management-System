const PlacementDrive = require("../models/PlacementDrive");
const Company = require("../models/Company");
const Application = require("../models/Application");
const Student = require("../models/Student");
const Notification = require("../models/Notification");
const User = require("../models/User");
const {
  evaluateStudentEligibility,
  deriveAcademicYear,
} = require("../utils/eligibilityHelper");

// ==========================================
// CREATE PLACEMENT DRIVE (Company Only)
// Status defaults to "Pending Approval"
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
      jobType,
      vacancies,
      experience,
      selectionProcess,
      additionalInstructions,
    } = req.body;

    // Validate required fields
    if (!role || !salaryPackage || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Role, salary package, and application deadline are required.",
      });
    }

    // Resolve company profile from authenticated user
    const company = await Company.findOne({
      $or: [{ userId: req.user._id }, { userId: req.user.userId }],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message:
          "Company profile not found. Please set up your company profile first.",
      });
    }

    if (!company.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          "Your company account is pending administrative approval before you can create placement drives.",
      });
    }

    if (company.status === "Disabled") {
      return res.status(403).json({
        success: false,
        message:
          "Company account is disabled. Please contact the placement administrator.",
      });
    }

    // Parse eligibility
    let parsedEligibility = {
      branches: [],
      minCGPA: 0,
      passingYear: undefined,
      academicYears: [],
      backlogCriteria: "No active backlogs",
      maxBacklogs: 0,
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

      if (
        eligibility.passingYear !== undefined &&
        eligibility.passingYear !== ""
      ) {
        parsedEligibility.passingYear = Number(eligibility.passingYear);
      }

      if (Array.isArray(eligibility.academicYears)) {
        parsedEligibility.academicYears = eligibility.academicYears;
      } else if (typeof eligibility.academicYears === "string") {
        parsedEligibility.academicYears = eligibility.academicYears
          .split(",")
          .map((y) => y.trim())
          .filter(Boolean);
      }

      if (eligibility.backlogCriteria) {
        parsedEligibility.backlogCriteria = eligibility.backlogCriteria.trim();
        if (
          eligibility.backlogCriteria.toLowerCase().includes("no active") ||
          eligibility.backlogCriteria.toLowerCase().includes("0")
        ) {
          parsedEligibility.maxBacklogs = 0;
        } else if (eligibility.backlogCriteria.match(/\d+/)) {
          parsedEligibility.maxBacklogs = Number(
            eligibility.backlogCriteria.match(/\d+/)[0]
          );
        }
      }

      if (eligibility.maxBacklogs !== undefined) {
        parsedEligibility.maxBacklogs = Number(eligibility.maxBacklogs);
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

    // Parse selection process
    let parsedRounds = [];
    if (Array.isArray(selectionProcess)) {
      parsedRounds = selectionProcess;
    } else if (typeof selectionProcess === "string") {
      parsedRounds = selectionProcess
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
    }
    if (parsedRounds.length === 0) {
      parsedRounds = [
        "Online Assessment",
        "Technical Interview",
        "HR Interview",
      ];
    }

    // Company submitted drives always default to Pending Approval
    const drive = await PlacementDrive.create({
      company: company._id,
      companyName: company.companyName,
      createdSource: "company",
      createdBy: req.user._id,
      role: role.trim(),
      package: salaryPackage.trim(),
      jobType: jobType || "Full-Time",
      vacancies: vacancies ? String(vacancies).trim() : "Open",
      experience: experience ? experience.trim() : "Fresher",
      description: description ? description.trim() : "",
      additionalInstructions: additionalInstructions
        ? additionalInstructions.trim()
        : "",
      eligibility: parsedEligibility,
      skills: parsedSkills,
      selectionProcess: parsedRounds,
      location: location ? location.trim() : "College Campus",
      driveDate: driveDate ? new Date(driveDate) : undefined,
      applicationDeadline: new Date(applicationDeadline),
      status: "Pending Approval",
    });

    // Notify administrators about the pending drive
    try {
      const adminUsers = await User.find({ role: "admin" }).select("_id");
      if (adminUsers.length > 0) {
        const notifDocs = adminUsers.map((admin) => ({
          userId: admin._id,
          sender: req.user._id,
          title: "New Placement Drive Pending Approval",
          message: `${company.companyName} submitted a new placement drive for "${role}". Please review and approve it.`,
          type: "drive",
          targetAudience: "admin",
        }));
        await Notification.insertMany(notifDocs);
      }
    } catch (notifErr) {
      console.warn("Failed to deliver admin notification for new drive:", notifErr);
    }

    res.status(201).json({
      success: true,
      message:
        "Placement drive submitted successfully and is currently Pending Approval from the placement cell.",
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
// GET ALL ACTIVE / APPROVED PLACEMENT DRIVES
// ==========================================
const getActivePlacementDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.find({
      status: { $in: ["Active", "Approved"] },
    })
      .populate(
        "company",
        "companyName logo location website description officialEmail hrName status"
      )
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
      "companyName logo location website description officialEmail hrName"
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
// (Includes both Company-created and Admin-created drives for this company)
// ==========================================
const getCompanyDrives = async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [{ userId: req.user._id }, { userId: req.user.userId }],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    // Find drives associated with this company (created by company or by admin for this company)
    const drives = await PlacementDrive.find({
      $or: [
        { company: company._id },
        { companyName: new RegExp(`^${company.companyName.trim()}$`, "i") },
      ],
    }).sort({
      createdAt: -1,
    });

    // Compute application counts per drive
    const drivesWithStats = await Promise.all(
      drives.map(async (drive) => {
        const applications = await Application.find({ drive: drive._id });
        const applied = applications.filter((a) => a.status === "Applied").length;
        const shortlisted = applications.filter(
          (a) => a.status === "Shortlisted"
        ).length;
        const interviews = applications.filter(
          (a) => a.status === "Interview"
        ).length;
        const selected = applications.filter(
          (a) => a.status === "Selected"
        ).length;
        const rejected = applications.filter(
          (a) => a.status === "Rejected"
        ).length;

        return {
          ...drive.toObject(),
          companyName: company.companyName,
          companyLogo: company.logo,
          stats: {
            totalApplications: applications.length,
            applied,
            shortlisted,
            interviews,
            selected,
            rejected,
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
// STUDENT - GET PLACEMENT OPPORTUNITIES WITH SMART ELIGIBILITY
// ==========================================
const getStudentPlacementOpportunities = async (req, res) => {
  try {
    const student = await Student.findOne({
      $or: [{ userId: req.user._id }, { userId: req.user.userId }],
    }).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please log in as a student.",
      });
    }

    // Fetch approved active drives
    const drives = await PlacementDrive.find({
      status: { $in: ["Active", "Approved"] },
    })
      .populate(
        "company",
        "companyName logo location website description status"
      )
      .sort({ createdAt: -1 });

    const activeDrives = drives.filter(
      (d) => !d.company || d.company.status !== "Disabled"
    );

    // Fetch student's existing applications
    const applications = await Application.find({
      $or: [{ student: student._id }, { student: req.user._id }],
    }).select("drive status appliedAt");

    const appMap = {};
    applications.forEach((a) => {
      if (a.drive) {
        appMap[a.drive.toString()] = {
          status: a.status,
          appliedAt: a.appliedAt,
        };
      }
    });

    // Evaluate smart eligibility for each drive
    const opportunities = activeDrives.map((drive) => {
      const eligibilityResult = evaluateStudentEligibility(student, drive);
      const app = appMap[drive._id.toString()];

      return {
        _id: drive._id,
        company: drive.company,
        companyName:
          drive.company?.companyName || drive.companyName || "Partner Company",
        companyLogo: drive.company?.logo || "",
        companyLocation: drive.company?.location || drive.location,
        companyWebsite: drive.company?.website || "",
        role: drive.role,
        package: drive.package,
        jobType: drive.jobType || "Full-Time",
        vacancies: drive.vacancies || "Open",
        experience: drive.experience || "Fresher",
        description: drive.description || "",
        additionalInstructions: drive.additionalInstructions || "",
        eligibility: drive.eligibility || {},
        skills: drive.skills || [],
        selectionProcess: drive.selectionProcess || [],
        location: drive.location || "College Campus",
        driveDate: driveDateFormatted(drive.driveDate),
        applicationDeadline: drive.applicationDeadline,
        isDeadlinePassed:
          drive.applicationDeadline &&
          new Date(drive.applicationDeadline) < new Date(),
        status: drive.status,
        createdSource: drive.createdSource || "company",
        // Smart Eligibility outputs
        isEligible: eligibilityResult.isEligible,
        reasons: eligibilityResult.reasons,
        ineligibilityReason: eligibilityResult.ineligibilityReason,
        eligibilityBreakdown: eligibilityResult.breakdown,
        // Application status
        hasApplied: Boolean(app),
        applicationStatus: app ? app.status : null,
        appliedAt: app ? app.appliedAt : null,
      };
    });

    const eligibleOpportunities = opportunities.filter((o) => o.isEligible);

    res.status(200).json({
      success: true,
      studentAcademicYear: deriveAcademicYear(
        student.academicYear,
        student.graduationYear
      ),
      studentBranch: student.branch,
      studentCGPA: student.cgpa,
      studentSkills: student.skills,
      studentBacklogs: student.backlogs || 0,
      totalActiveDrives: opportunities.length,
      eligibleCount: eligibleOpportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error("Get Student Placement Opportunities Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching placement opportunities.",
      error: error.message,
    });
  }
};

const driveDateFormatted = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

// ==========================================
// UPDATE PLACEMENT DRIVE (Company Only)
// ==========================================
const updatePlacementDrive = async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [{ userId: req.user._id }, { userId: req.user.userId }],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    if (company.status === "Disabled") {
      return res.status(403).json({
        success: false,
        message:
          "Company account is disabled. Please contact the placement administrator.",
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
      jobType,
      vacancies,
      experience,
      selectionProcess,
      additionalInstructions,
    } = req.body;

    if (role) drive.role = role.trim();
    if (salaryPackage) drive.package = salaryPackage.trim();
    if (description !== undefined) drive.description = description.trim();
    if (location !== undefined) drive.location = location.trim();
    if (jobType) drive.jobType = jobType;
    if (vacancies) drive.vacancies = String(vacancies).trim();
    if (experience) drive.experience = experience.trim();
    if (additionalInstructions !== undefined)
      drive.additionalInstructions = additionalInstructions.trim();
    if (driveDate) drive.driveDate = new Date(driveDate);
    if (applicationDeadline)
      drive.applicationDeadline = new Date(applicationDeadline);

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
      if (Array.isArray(eligibility.academicYears)) {
        drive.eligibility.academicYears = eligibility.academicYears;
      }
      if (eligibility.backlogCriteria) {
        drive.eligibility.backlogCriteria = eligibility.backlogCriteria;
      }
      if (eligibility.maxBacklogs !== undefined) {
        drive.eligibility.maxBacklogs = Number(eligibility.maxBacklogs);
      }
    }

    if (skills) {
      if (Array.isArray(skills)) {
        drive.skills = skills;
      } else if (typeof skills === "string") {
        drive.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (selectionProcess) {
      if (Array.isArray(selectionProcess)) {
        drive.selectionProcess = selectionProcess;
      } else if (typeof selectionProcess === "string") {
        drive.selectionProcess = selectionProcess
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // If drive was rejected or has changes requested, reset to Pending Approval
    if (drive.status === "Rejected" || drive.changeRequests) {
      drive.status = "Pending Approval";
      drive.changeRequests = "";
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
    const company = await Company.findOne({
      $or: [{ userId: req.user._id }, { userId: req.user.userId }],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
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
  getStudentPlacementOpportunities,
  updatePlacementDrive,
  closePlacementDrive,
};
