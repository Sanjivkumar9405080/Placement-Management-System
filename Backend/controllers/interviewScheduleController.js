const InterviewSchedule = require("../models/InterviewSchedule");
const Application = require("../models/Application");
const Company = require("../models/Company");
const Notification = require("../models/Notification");
const Student = require("../models/Student");

// Company creates interview schedule
const createSchedule = async (req, res) => {
  try {
    const {
      applicationId,
      roundNumber,
      roundName,
      date,
      time,
      mode,
      meetingLink,
      location,
      instructions,
    } = req.body;

    // Find company
    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    // Find application
    const application = await Application.findById(
      applicationId
    ).populate("driveId");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Only shortlisted students can get schedule
    if (application.status !== "shortlisted") {
      return res.status(400).json({
        message:
          "Interview schedule can only be created for shortlisted students",
      });
    }

    // Make sure application belongs to this company
    if (
      application.driveId.companyId.toString() !==
      company._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot create schedule for this application",
      });
    }

    // Validate online mode
    if (mode === "online" && !meetingLink) {
      return res.status(400).json({
        message: "Meeting link is required for online interview",
      });
    }

    // Validate offline mode
    if (mode === "offline" && !location) {
      return res.status(400).json({
        message: "Location is required for offline interview",
      });
    }

    // Create schedule
    const schedule = await InterviewSchedule.create({
      applicationId,
      roundNumber,
      roundName,
      date,
      time,
      mode,
      meetingLink: mode === "online" ? meetingLink : "",
      location: mode === "offline" ? location : "",
      instructions,
    });

    // Create notification for student
    await Notification.create({
      userId: application.studentId.userId,
      message: `Your ${roundName} is scheduled on ${date} at ${time}.`,
      type: "schedule",
    });

    res.status(201).json({
      message: "Interview schedule created successfully",
      schedule,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
// Student views own interview schedules
 const getMySchedules = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      studentId: student._id,
      status: "shortlisted",
    }).select("_id");

    const applicationIds = applications.map(
      (application) => application._id
    );

    const schedules = await InterviewSchedule.find({
      applicationId: { $in: applicationIds },
    })
      .populate({
        path: "applicationId",
        populate: {
          path: "driveId",
          select: "jobTitle package",
          populate: {
            path: "companyId",
            select: "companyName location",
          },
        },
      })
      .sort({
        date: 1,
        roundNumber: 1,
      });

    res.status(200).json({
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getCompanySchedules = async (req, res) => {
  try {
    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    // Find company's drives
    const drives = await Drive.find({
      companyId: company._id,
    }).select("_id");

    const driveIds = drives.map((drive) => drive._id);

    // Find applications belonging to those drives
    const applications = await Application.find({
      driveId: { $in: driveIds },
    }).select("_id");

    const applicationIds = applications.map(
      (application) => application._id
    );

    // Find schedules
    const schedules = await InterviewSchedule.find({
      applicationId: { $in: applicationIds },
    })
      .populate({
        path: "applicationId",
        populate: [
          {
            path: "studentId",
            select: "phone college branch cgpa skills",
          },
          {
            path: "driveId",
            select: "jobTitle package",
          },
        ],
      })
      .sort({
        date: 1,
        roundNumber: 1,
      });

    res.status(200).json({
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const {
      roundName,
      roundNumber,
      date,
      time,
      mode,
      meetingLink,
      location,
      instructions,
    } = req.body;

    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const schedule = await InterviewSchedule.findById(
      req.params.id
    ).populate({
      path: "applicationId",
      populate: {
        path: "driveId",
      },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    // Check schedule belongs to this company
    if (
      schedule.applicationId.driveId.companyId.toString() !==
      company._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot update this schedule",
      });
    }

    schedule.roundName = roundName || schedule.roundName;
    schedule.roundNumber =
      roundNumber || schedule.roundNumber;
    schedule.date = date || schedule.date;
    schedule.time = time || schedule.time;
    schedule.mode = mode || schedule.mode;
    schedule.meetingLink =
      mode === "online"
        ? meetingLink || schedule.meetingLink
        : "";
    schedule.location =
      mode === "offline"
        ? location || schedule.location
        : "";
    schedule.instructions =
      instructions || schedule.instructions;

    await schedule.save();

    res.status(200).json({
      message: "Interview schedule updated successfully",
      schedule,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const company = await Company.findOne({
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const schedule = await InterviewSchedule.findById(
      req.params.id
    ).populate({
      path: "applicationId",
      populate: {
        path: "driveId",
      },
    });

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    // Check schedule belongs to this company
    if (
      schedule.applicationId.driveId.companyId.toString() !==
      company._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot delete this schedule",
      });
    }

    await InterviewSchedule.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Interview schedule deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  createSchedule,
  getMySchedules,
  getCompanySchedules,
  updateSchedule,
  deleteSchedule 
  
};