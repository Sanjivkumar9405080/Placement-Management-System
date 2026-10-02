const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Company = require("../models/Company");
const Student = require("../models/Student");

// ==========================================
// 1. SCHEDULE INTERVIEW (Company Only)
// ==========================================
const scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      date,
      time,
      mode,
      meetingLink,
      venue,
      interviewerName,
      remarks,
    } = req.body;

    // 1. Basic validation
    if (!applicationId || !date || !time || !mode || !interviewerName) {
      return res.status(400).json({
        success: false,
        message:
          "Application ID, interview date, time, mode, and interviewer name are required.",
      });
    }

    if (!["Online", "Offline"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be either 'Online' or 'Offline'.",
      });
    }

    if (mode === "Online" && (!meetingLink || !meetingLink.trim())) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online interviews.",
      });
    }

    if (mode === "Offline" && (!venue || !venue.trim())) {
      return res.status(400).json({
        success: false,
        message: "Venue is required for offline interviews.",
      });
    }

    // 2. Resolve company profile from authenticated user
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    // 3. Find Application
    const application = await Application.findById(applicationId).populate(
      "drive"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // 4. Verify application belongs to this company
    const appCompanyId = application.company?.toString();
    const isCompanyMatch =
      appCompanyId === company._id.toString() ||
      appCompanyId === req.user._id.toString();

    if (!isCompanyMatch) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized: You cannot schedule an interview for another company's applicant.",
      });
    }

    // 5. CRITICAL RULE: Student must be SHORTLISTED
    if (application.status !== "Shortlisted") {
      return res.status(400).json({
        success: false,
        message:
          "Only shortlisted students can be scheduled for an interview.",
      });
    }

    // 6. Check for duplicate active interviews for the same application
    const existingActiveInterview = await Interview.findOne({
      application: applicationId,
      status: { $ne: "Cancelled" },
    });

    if (existingActiveInterview) {
      return res.status(400).json({
        success: false,
        message:
          "An active interview is already scheduled for this application. Please cancel or complete it before scheduling a new one.",
      });
    }

    // 7. Create Interview document (derive student, company, drive strictly from application)
    const interview = await Interview.create({
      application: application._id,
      student: application.student,
      company: application.company,
      drive: application.drive?._id || application.drive,
      date: new Date(date),
      time: time.trim(),
      mode,
      meetingLink: mode === "Online" ? meetingLink.trim() : "",
      venue: mode === "Offline" ? venue.trim() : "",
      interviewerName: interviewerName.trim(),
      status: "Scheduled",
      remarks: remarks ? remarks.trim() : "",
    });

    // 8. Update Application status to "Interview" (without marking as Selected)
    application.status = "Interview";
    await application.save();

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview,
    });
  } catch (error) {
    console.error("Schedule Interview Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error scheduling interview.",
      error: error.message,
    });
  }
};

// ==========================================
// 2. GET COMPANY INTERVIEWS (Company Only)
// ==========================================
const getCompanyInterviews = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const companyId = company._id;

    const interviews = await Interview.find({
      $or: [{ company: companyId }, { company: req.user._id }],
    })
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("drive", "role package location")
      .populate("application", "role status")
      .sort({ date: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Company Interviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching company interviews.",
      error: error.message,
    });
  }
};

// ==========================================
// 3. GET COMPANY INTERVIEW BY ID (Company Only)
// ==========================================
const getCompanyInterviewById = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      $or: [{ company: company._id }, { company: req.user._id }],
    })
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "name email phone branch cgpa skills",
        },
      })
      .populate("drive")
      .populate("application");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get Company Interview By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching interview details.",
      error: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE INTERVIEW (Company Only)
// ==========================================
const updateInterview = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      $or: [{ company: company._id }, { company: req.user._id }],
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found or unauthorized.",
      });
    }

    const {
      date,
      time,
      mode,
      meetingLink,
      venue,
      interviewerName,
      status,
      remarks,
    } = req.body;

    if (date) interview.date = new Date(date);
    if (time) interview.time = time.trim();

    if (mode) {
      if (!["Online", "Offline"].includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Mode must be 'Online' or 'Offline'.",
        });
      }
      interview.mode = mode;
      if (mode === "Online") {
        if (meetingLink) interview.meetingLink = meetingLink.trim();
        else if (!interview.meetingLink) {
          return res.status(400).json({
            success: false,
            message: "Meeting link is required for Online mode.",
          });
        }
      } else if (mode === "Offline") {
        if (venue) interview.venue = venue.trim();
        else if (!interview.venue) {
          return res.status(400).json({
            success: false,
            message: "Venue is required for Offline mode.",
          });
        }
      }
    }

    if (meetingLink !== undefined && interview.mode === "Online") {
      interview.meetingLink = meetingLink.trim();
    }
    if (venue !== undefined && interview.mode === "Offline") {
      interview.venue = venue.trim();
    }
    if (interviewerName) interview.interviewerName = interviewerName.trim();
    if (remarks !== undefined) interview.remarks = remarks.trim();

    if (status) {
      const allowed = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${allowed.join(", ")}`,
        });
      }
      interview.status = status;
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview updated successfully.",
      interview,
    });
  } catch (error) {
    console.error("Update Interview Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating interview.",
      error: error.message,
    });
  }
};

// ==========================================
// 5. UPDATE INTERVIEW STATUS (Company Only)
// ==========================================
const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const interview = await Interview.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ company: company._id }, { company: req.user._id }],
      },
      { status },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Interview status updated to "${status}".`,
      interview,
    });
  } catch (error) {
    console.error("Update Interview Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating interview status.",
      error: error.message,
    });
  }
};

// ==========================================
// 6. CANCEL INTERVIEW (Company Only)
// ==========================================
const cancelInterview = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const interview = await Interview.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ company: company._id }, { company: req.user._id }],
      },
      { status: "Cancelled" },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully.",
      interview,
    });
  } catch (error) {
    console.error("Cancel Interview Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error cancelling interview.",
      error: error.message,
    });
  }
};

// ==========================================
// 7. GET MY INTERVIEWS (Student Only)
// ==========================================
const getMyInterviews = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    const query = student
      ? { $or: [{ student: student._id }, { student: req.user._id }] }
      : { student: req.user._id };

    const interviews = await Interview.find(query)
      .populate("company", "companyName location website")
      .populate("drive", "role package location")
      .populate("application", "role status appliedAt")
      .sort({ date: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get My Interviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching your interviews.",
      error: error.message,
    });
  }
};

module.exports = {
  scheduleInterview,
  getCompanyInterviews,
  getCompanyInterviewById,
  updateInterview,
  updateInterviewStatus,
  cancelInterview,
  getMyInterviews,
};
