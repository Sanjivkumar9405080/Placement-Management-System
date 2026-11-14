const Application = require("../models/Application");
const PlacementDrive = require("../models/PlacementDrive");
const Student = require("../models/Student");
const Company = require("../models/Company");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { evaluateStudentEligibility } = require("../utils/eligibilityHelper");

// ==========================================
// STUDENT - APPLY FOR PLACEMENT DRIVE
// ==========================================
const applyForDrive = async (req, res) => {
  try {
    const { driveId } = req.body;

    if (!driveId) {
      return res.status(400).json({
        success: false,
        message: "Drive ID is required.",
      });
    }

    // 1. Resolve student profile from authenticated JWT user
    let student = await Student.findOne({
      $or: [{ userId: req.user._id }, { userId: req.user.userId }],
    }).populate("userId", "name email");

    if (!student) {
      // Self-heal: If authenticated user is a student, create initial profile
      const user = await User.findById(req.user._id || req.user.userId);
      if (user && (user.role === "student" || !user.role)) {
        student = await Student.create({
          userId: user._id,
          phone: "",
          college: "College of Engineering",
          branch: "CSE - AI & ML",
          course: "B.Tech Computer Science",
          cgpa: 7.0,
          graduationYear: 2027,
          skills: ["Full Stack Developer", "React.js", "Node.js", "MongoDB"],
        });
        student = await Student.findById(student._id).populate(
          "userId",
          "name email"
        );
      }
    }

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student profile not found. Please log in as a student to apply.",
      });
    }

    if (!student.resume) {
      return res.status(400).json({
        success: false,
        message:
          "Resume not found. Please upload your resume in your Student Profile before applying.",
      });
    }

    // 2. Find placement drive
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found.",
      });
    }

    // 3. Verify drive is active / approved
    if (drive.status !== "Active" && drive.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "This placement drive is currently not active or is closed.",
      });
    }

    // 4. Verify deadline has not passed
    if (drive.applicationDeadline && new Date(drive.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "The application deadline for this placement drive has passed.",
      });
    }

    // 5. Strict Smart Eligibility Verification
    const eligibilityResult = evaluateStudentEligibility(student, drive);
    if (!eligibilityResult.isEligible) {
      return res.status(400).json({
        success: false,
        message: `Ineligible: ${eligibilityResult.ineligibilityReason}`,
        breakdown: eligibilityResult.breakdown,
      });
    }

    // 6. Check duplicate application
    const existingApplication = await Application.findOne({
      $or: [
        { student: student._id, drive: driveId },
        { student: req.user._id, drive: driveId },
      ],
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this placement drive.",
      });
    }

    // 7. Create application record
    const application = await Application.create({
      student: student._id,
      company: drive.company,
      drive: drive._id,
      role: drive.role,
      status: "Applied",
      appliedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    console.error("Apply Drive Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this placement drive.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error submitting application.",
      error: error.message,
    });
  }
};

// ==========================================
// STUDENT - MY APPLICATIONS
// ==========================================
const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    const query = student
      ? { $or: [{ student: student._id }, { student: req.user._id }] }
      : { student: req.user._id };

    const applications = await Application.find(query)
      .populate("company", "companyName location website")
      .populate("drive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching your applications.",
      error: error.message,
    });
  }
};

// ==========================================
// COMPANY - GET ONLY ITS APPLICANTS
// ==========================================
const getCompanyApplications = async (req, res) => {
  try {
    // Resolve company profile from authenticated JWT user
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    // Strictly filter to drives/applications belonging to this company
    const applications = await Application.find({
      $or: [{ company: company._id }, { company: req.user._id }],
    })
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("drive", "role package eligibility location driveDate status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Company Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching company applications.",
      error: error.message,
    });
  }
};

// ==========================================
// COMPANY - VIEW ONE APPLICANT (Student Profile + Drive)
// ==========================================
const getApplicantDetails = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      $or: [{ company: company._id }, { company: req.user._id }],
    })
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("drive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Applicant profile not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Applicant Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching applicant details.",
      error: error.message,
    });
  }
};

// ==========================================
// COMPANY - UPDATE APPLICATION STATUS
// ==========================================
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Interview",
      "Selected",
      "Rejected",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid application status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ company: company._id }, { company: req.user._id }],
      },
      {
        status,
      },
      {
        new: true,
      }
    )
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("drive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized.",
      });
    }

    // Automatically deliver notification to the student
    try {
      const studentUserId =
        application.student?.userId?._id || application.student?.userId;
      if (studentUserId) {
        const compName = company.companyName || "Recruiter";
        const roleName = application.role || "Placement Drive";
        let notifTitle = `Application Status Update`;
        let notifMsg = `Your application for "${roleName}" at ${compName} has been updated to "${status}".`;

        if (status === "Shortlisted") {
          notifTitle = `Shortlisted: ${roleName}! 🎉`;
          notifMsg = `Congratulations! You have been shortlisted by ${compName} for "${roleName}".`;
        } else if (status === "Selected") {
          notifTitle = `Selected: ${roleName}! 🌟`;
          notifMsg = `Great news! You have been selected for "${roleName}" by ${compName}!`;
        } else if (status === "Interview") {
          notifTitle = `Interview Round: ${roleName}`;
          notifMsg = `You have moved to the interview round for "${roleName}" at ${compName}.`;
        } else if (status === "Rejected") {
          notifTitle = `Application Update: ${roleName}`;
          notifMsg = `Thank you for your interest in "${roleName}" at ${compName}. Your application was not selected at this stage.`;
        }

        await Notification.create({
          userId: studentUserId,
          sender: req.user._id,
          title: notifTitle,
          message: notifMsg,
          type: "application",
          targetAudience: "individual",
        });
      }
    } catch (notifErr) {
      console.warn("Error delivering status notification to student:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to "${status}".`,
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating application status.",
      error: error.message,
    });
  }
};

module.exports = {
  applyForDrive,
  getMyApplications,
  getCompanyApplications,
  getApplicantDetails,
  updateApplicationStatus,
};