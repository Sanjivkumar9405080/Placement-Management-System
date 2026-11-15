const Interview = require("../models/Interview");
const Application = require("../models/Application");
const PlacementDrive = require("../models/PlacementDrive");
const PlacementRound = require("../models/PlacementRound");
const PlacementRoundResult = require("../models/PlacementRoundResult");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Notification = require("../models/Notification");
const User = require("../models/User");
const {
  sendInterviewScheduledEmail,
  sendInterviewRescheduledEmail,
  sendRoundClearedEmail,
  sendRoundRejectedEmail,
  sendFinalSelectionEmail,
} = require("../utils/emailService");

// Default standard round templates for any drive
const DEFAULT_ROUNDS = [
  { roundNumber: 1, roundName: "Aptitude Test", roundDescription: "General aptitude, analytical & reasoning assessment" },
  { roundNumber: 2, roundName: "Coding Round", roundDescription: "Live coding and problem solving on algorithms & data structures" },
  { roundNumber: 3, roundName: "Technical Round", roundDescription: "In-depth core CS, architecture, and project technical discussion" },
  { roundNumber: 4, roundName: "HR Interview", roundDescription: "Cultural fit, communication, behavioral, and leadership discussion" },
  { roundNumber: 5, roundName: "Final Interview", roundDescription: "Leadership review & final hiring confirmation" },
];

/**
 * 1. GET ALL INTERVIEWS (Admin Dashboard Table & Metrics)
 */
const getAdminInterviews = async (req, res) => {
  try {
    const {
      search = "",
      status = "All",
      mode = "All",
      companyId = "All",
      driveId = "All",
      roundName = "All",
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (mode && mode !== "All") {
      query.mode = mode;
    }

    if (companyId && companyId !== "All") {
      query.company = companyId;
    }

    if (driveId && driveId !== "All") {
      query.drive = driveId;
    }

    if (roundName && roundName !== "All") {
      query.roundName = roundName;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    // Compute summary KPI counts across all interviews
    const [
      totalInterviews,
      upcomingInterviews,
      completedInterviews,
      selectedInterviews,
      rejectedInterviews,
      rescheduledInterviews,
      onHoldInterviews,
    ] = await Promise.all([
      Interview.countDocuments(),
      Interview.countDocuments({
        status: { $in: ["Scheduled", "Rescheduled"] },
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Interview.countDocuments({ status: "Completed" }),
      Interview.countDocuments({ status: "Selected" }),
      Interview.countDocuments({ status: "Rejected" }),
      Interview.countDocuments({ status: "Rescheduled" }),
      Interview.countDocuments({ status: "On Hold" }),
    ]);

    // Query records with populate
    let interviewQuery = Interview.find(query)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("company", "name industry contactPerson email phone logo")
      .populate("drive", "role package driveDate applicationDeadline jobType location")
      .populate("round");

    // Sorting
    const sortObj = {};
    if (sortBy === "date") {
      sortObj.date = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "status") {
      sortObj.status = sortOrder === "asc" ? 1 : -1;
    } else {
      sortObj.createdAt = sortOrder === "asc" ? 1 : -1;
    }
    interviewQuery = interviewQuery.sort(sortObj);

    let allMatches = await interviewQuery;

    // Search filter in populated fields (Student name, Roll, Company name, Role, Interviewer)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      allMatches = allMatches.filter((item) => {
        const studentName = (
          item.student?.fullName ||
          item.student?.user?.name ||
          ""
        ).toLowerCase();
        const studentEmail = (
          item.student?.user?.email ||
          item.student?.email ||
          ""
        ).toLowerCase();
        const rollNo = (item.student?.rollNo || item.student?.studentId || "").toLowerCase();
        const compName = (item.company?.name || "").toLowerCase();
        const role = (item.drive?.role || "").toLowerCase();
        const interviewer = (item.interviewerName || "").toLowerCase();
        const rName = (item.roundName || "").toLowerCase();

        return (
          studentName.includes(q) ||
          studentEmail.includes(q) ||
          rollNo.includes(q) ||
          compName.includes(q) ||
          role.includes(q) ||
          interviewer.includes(q) ||
          rName.includes(q)
        );
      });
    }

    const filteredTotal = allMatches.length;
    const paginatedInterviews = allMatches.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      metrics: {
        totalInterviews,
        upcomingInterviews,
        completedInterviews,
        selectedStudents: selectedInterviews,
        rejectedStudents: rejectedInterviews,
        rescheduledInterviews,
        onHoldInterviews,
      },
      pagination: {
        total: filteredTotal,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredTotal / limitNum) || 1,
      },
      interviews: paginatedInterviews,
    });
  } catch (error) {
    console.error("Error in getAdminInterviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve interviews",
      error: error.message,
    });
  }
};

/**
 * 2. GET SINGLE INTERVIEW DETAILS
 */
const getAdminInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("company")
      .populate("drive")
      .populate("round")
      .populate("application")
      .populate("feedback.submittedBy", "name email role")
      .populate("feedback.publishedBy", "name email role");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Also fetch all past round results for this student and drive
    let roundHistory = [];
    if (interview.drive && interview.student) {
      roundHistory = await PlacementRoundResult.find({
        placementDrive: interview.drive._id,
        student: interview.student._id,
      })
        .populate("round")
        .sort({ roundNumber: 1 });
    }

    return res.status(200).json({
      success: true,
      interview,
      roundHistory,
    });
  } catch (error) {
    console.error("Error in getAdminInterviewById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load interview details",
      error: error.message,
    });
  }
};

/**
 * 3. GET SCHEDULING FORM OPTIONS (Companies, Drives, Applicants, Rounds)
 */
const getAdminInterviewOptions = async (req, res) => {
  try {
    // 1. All approved companies
    const companies = await Company.find().select("name industry logo contactPerson email").sort({ name: 1 });

    // 2. Active placement drives
    const drives = await PlacementDrive.find({ status: { $ne: "Closed" } })
      .populate("company", "name logo")
      .select("role company package driveDate applicationDeadline selectionProcess status")
      .sort({ createdAt: -1 });

    // 3. Applications grouped by drive (only Shortlisted, Applied, or Interview candidates)
    const applications = await Application.find({
      status: { $in: ["Shortlisted", "Applied", "Interview", "Under Review"] },
    })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("drive", "role company")
      .select("student drive company status currentRoundNumber currentRoundName");

    // 4. Existing rounds configured for drives
    const existingRounds = await PlacementRound.find().sort({ roundNumber: 1 });

    return res.status(200).json({
      success: true,
      companies,
      drives,
      applications,
      existingRounds,
      defaultRounds: DEFAULT_ROUNDS,
    });
  } catch (error) {
    console.error("Error in getAdminInterviewOptions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load scheduling form options",
      error: error.message,
    });
  }
};

/**
 * 4. SCHEDULE NEW INTERVIEW (Admin)
 */
const scheduleInterviewByAdmin = async (req, res) => {
  try {
    const {
      studentId,
      companyId,
      driveId,
      applicationId,
      roundNumber = 1,
      roundName,
      date,
      time,
      mode,
      meetingLink = "",
      venue = "",
      interviewerName,
      interviewerEmail = "",
      interviewerPhone = "",
      interviewerDesignation = "",
      instructions = "",
      remarks = "",
    } = req.body;

    // Field validation
    if (!studentId || !companyId || !driveId || !date || !time || !mode || !interviewerName) {
      return res.status(400).json({
        success: false,
        message: "Student, company, drive, date, time, mode, and interviewer name are required.",
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
        message: "Location/venue is required for offline interviews.",
      });
    }

    // Prevent scheduling in the past
    const interviewDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    if (compareDate < today) {
      return res.status(400).json({
        success: false,
        message: "Interview date cannot be in the past.",
      });
    }

    // Resolve entities
    const student = await Student.findById(studentId).populate("user");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company record not found." });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: "Placement drive record not found." });
    }

    // Find or link Application
    let application = null;
    if (applicationId) {
      application = await Application.findById(applicationId);
    }
    if (!application) {
      application = await Application.findOne({ student: studentId, drive: driveId });
    }

    // If student didn't formally have an Application record, create one so everything remains synchronized
    if (!application) {
      application = await Application.create({
        student: student._id,
        drive: drive._id,
        company: company._id,
        status: "Interview",
        currentRoundNumber: roundNumber,
        currentRoundName: roundName || "Technical Round",
        currentRoundStatus: "Scheduled",
      });
    } else {
      application.status = "Interview";
      application.currentRoundNumber = roundNumber;
      application.currentRoundName = roundName || application.currentRoundName || "Technical Round";
      application.currentRoundStatus = "Scheduled";
      await application.save();
    }

    const assignedRoundName = roundName || `Round ${roundNumber}`;

    // Ensure PlacementRound exists or create it
    let placementRound = await PlacementRound.findOne({
      placementDrive: drive._id,
      roundNumber: Number(roundNumber),
    });

    if (!placementRound) {
      placementRound = await PlacementRound.create({
        placementDrive: drive._id,
        company: company._id,
        roundName: assignedRoundName,
        roundNumber: Number(roundNumber),
        roundDescription: `Round ${roundNumber}: ${assignedRoundName}`,
        scheduledDate: interviewDate,
        scheduledTime: time,
        location: mode === "Online" ? "Online" : venue,
        meetingLink: mode === "Online" ? meetingLink : "",
        instructions,
        status: "Scheduled",
        createdBy: req.user._id,
      });
    } else {
      // Keep PlacementRound updated with schedule details
      placementRound.scheduledDate = interviewDate;
      placementRound.scheduledTime = time;
      if (mode === "Online" && meetingLink) placementRound.meetingLink = meetingLink;
      if (mode === "Offline" && venue) placementRound.location = venue;
      if (instructions) placementRound.instructions = instructions;
      await placementRound.save();
    }

    // Create or update PlacementRoundResult for permanent round-wise history
    await PlacementRoundResult.findOneAndUpdate(
      {
        placementDrive: drive._id,
        student: student._id,
        round: placementRound._id,
      },
      {
        placementApplication: application._id,
        roundNumber: Number(roundNumber),
        roundName: assignedRoundName,
        result: "Pending",
        feedback: remarks || "Interview scheduled",
        updatedBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    // Create the Interview record
    const newInterview = await Interview.create({
      application: application._id,
      student: student._id,
      company: company._id,
      drive: drive._id,
      round: placementRound._id,
      roundNumber: Number(roundNumber),
      roundName: assignedRoundName,
      date: interviewDate,
      time,
      mode,
      meetingLink: mode === "Online" ? meetingLink.trim() : "",
      venue: mode === "Offline" ? venue.trim() : "",
      interviewerName: interviewerName.trim(),
      interviewerEmail: interviewerEmail.trim(),
      interviewerPhone: interviewerPhone.trim(),
      interviewerDesignation: interviewerDesignation.trim(),
      instructions: instructions.trim(),
      remarks: remarks.trim(),
      status: "Scheduled",
      scheduledBy: req.user._id,
    });

    // Send In-App Notification to Student
    const studentUser = student.user?._id || student.user;
    if (studentUser) {
      await Notification.create({
        userId: studentUser,
        title: `Interview Scheduled: ${company.name}`,
        message: `Your ${assignedRoundName} for ${drive.role} at ${company.name} is scheduled on ${new Date(date).toLocaleDateString()} at ${time} (${mode}).`,
        type: "interview",
        sender: req.user._id,
      });
    }

    // Send Automated Email via emailService (failsafe)
    const targetEmail = student.user?.email || student.email;
    if (targetEmail) {
      sendInterviewScheduledEmail({
        to: targetEmail,
        studentName: student.fullName || student.user?.name || "Student",
        companyName: company.name,
        role: drive.role,
        roundName: assignedRoundName,
        date: interviewDate,
        time,
        mode,
        meetingLink,
        venue,
        interviewerName,
        instructions,
      });
    }

    const populatedInterview = await Interview.findById(newInterview._id)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("company", "name industry logo")
      .populate("drive", "role package");

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully and student notified.",
      interview: populatedInterview,
    });
  } catch (error) {
    console.error("Error in scheduleInterviewByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule interview.",
      error: error.message,
    });
  }
};

/**
 * 5. UPDATE INTERVIEW DETAILS (Admin)
 */
const updateInterviewByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roundName,
      date,
      time,
      mode,
      meetingLink,
      venue,
      interviewerName,
      interviewerEmail,
      interviewerPhone,
      interviewerDesignation,
      instructions,
      remarks,
      status,
    } = req.body;

    const interview = await Interview.findById(id)
      .populate("student")
      .populate("company")
      .populate("drive");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    if (date) interview.date = new Date(date);
    if (time) interview.time = time;
    if (mode) interview.mode = mode;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (venue !== undefined) interview.venue = venue;
    if (interviewerName) interview.interviewerName = interviewerName;
    if (interviewerEmail !== undefined) interview.interviewerEmail = interviewerEmail;
    if (interviewerPhone !== undefined) interview.interviewerPhone = interviewerPhone;
    if (interviewerDesignation !== undefined) interview.interviewerDesignation = interviewerDesignation;
    if (instructions !== undefined) interview.instructions = instructions;
    if (remarks !== undefined) interview.remarks = remarks;
    if (roundName) interview.roundName = roundName;
    if (status) interview.status = status;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview details updated successfully.",
      interview,
    });
  } catch (error) {
    console.error("Error in updateInterviewByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update interview details.",
      error: error.message,
    });
  }
};

/**
 * 6. RESCHEDULE INTERVIEW (Admin)
 */
const rescheduleInterviewByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newDate,
      newTime,
      mode,
      meetingLink = "",
      venue = "",
      reason = "",
    } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: "New date and new time are required to reschedule.",
      });
    }

    // Validate future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDate = new Date(newDate);
    const checkDate = new Date(newDate);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return res.status(400).json({
        success: false,
        message: "Rescheduled date cannot be in the past.",
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate("company", "name")
      .populate("drive", "role");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    interview.date = parsedDate;
    interview.time = newTime;
    if (mode) interview.mode = mode;
    if (meetingLink) interview.meetingLink = meetingLink;
    if (venue) interview.venue = venue;
    interview.status = "Rescheduled";
    interview.remarks = reason
      ? `Rescheduled: ${reason} (previously ${new Date(interview.date).toLocaleDateString()})`
      : interview.remarks;

    await interview.save();

    // Notify student in-app
    const studentUser = interview.student?.user?._id || interview.student?.user;
    if (studentUser) {
      await Notification.create({
        userId: studentUser,
        title: `Interview Rescheduled: ${interview.company?.name}`,
        message: `Your ${interview.roundName} with ${interview.company?.name} has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
        type: "interview",
        sender: req.user._id,
      });
    }

    // Send email alert
    const targetEmail = interview.student?.user?.email || interview.student?.email;
    if (targetEmail) {
      sendInterviewRescheduledEmail({
        to: targetEmail,
        studentName: interview.student?.fullName || interview.student?.user?.name || "Student",
        companyName: interview.company?.name || "Company",
        role: interview.drive?.role || "Position",
        roundName: interview.roundName,
        newDate: parsedDate,
        newTime,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        venue: interview.venue,
        reason,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview rescheduled successfully.",
      interview,
    });
  } catch (error) {
    console.error("Error in rescheduleInterviewByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reschedule interview.",
      error: error.message,
    });
  }
};

/**
 * 7. UPDATE INTERVIEW STATUS (Scheduled, Completed, Rescheduled, On Hold, Cancelled)
 */
const updateInterviewStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks = "" } = req.body;

    const validStatuses = [
      "Scheduled",
      "Completed",
      "Cancelled",
      "Rescheduled",
      "Selected",
      "Rejected",
      "On Hold",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    interview.status = status;
    if (remarks) interview.remarks = remarks;
    await interview.save();

    // If cancelled, update application current status
    if (status === "Cancelled" && interview.application) {
      await Application.findByIdAndUpdate(interview.application, {
        currentRoundStatus: "Cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Interview status updated to ${status}.`,
      interview,
    });
  } catch (error) {
    console.error("Error in updateInterviewStatusByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update interview status.",
      error: error.message,
    });
  }
};

/**
 * 8. SUBMIT INTERVIEW FEEDBACK & EVALUATION (Admin / Authorized Interviewer)
 */
const submitInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      technicalRating = 0,
      communicationRating = 0,
      problemSolvingRating = 0,
      overallRating = 0,
      comments = "",
      remarks = "",
      recommendation = "Pending",
    } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    // Save feedback
    interview.feedback = {
      technicalRating: Math.min(10, Math.max(0, Number(technicalRating) || 0)),
      communicationRating: Math.min(10, Math.max(0, Number(communicationRating) || 0)),
      problemSolvingRating: Math.min(10, Math.max(0, Number(problemSolvingRating) || 0)),
      overallRating: Math.min(10, Math.max(0, Number(overallRating) || 0)),
      comments: comments.trim(),
      remarks: remarks.trim(),
      recommendation,
      submittedAt: new Date(),
      submittedBy: req.user._id,
      isPublished: interview.feedback?.isPublished || false,
      publishedAt: interview.feedback?.publishedAt,
      publishedBy: interview.feedback?.publishedBy,
    };

    // If currently Scheduled, transition to Completed when feedback is logged
    if (interview.status === "Scheduled" || interview.status === "Rescheduled") {
      interview.status = "Completed";
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview evaluation and feedback submitted successfully.",
      feedback: interview.feedback,
      interview,
    });
  } catch (error) {
    console.error("Error in submitInterviewFeedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit interview feedback.",
      error: error.message,
    });
  }
};

/**
 * 9. PUBLISH INTERVIEW RESULT (Admin Action Only)
 * Synchronizes with PlacementRoundResult and Student Placement Journey
 */
const publishInterviewResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      decision, // "Selected", "Cleared", "Rejected", "On Hold"
      adminNotes = "",
      packageAmount = "",
    } = req.body;

    const validDecisions = ["Selected", "Cleared", "Rejected", "On Hold"];
    if (!decision || !validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `Decision must be one of: ${validDecisions.join(", ")}`,
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate("company", "name")
      .populate("drive", "role package");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    // Update Interview
    interview.resultPublished = true;
    interview.feedback.isPublished = true;
    interview.feedback.publishedAt = new Date();
    interview.feedback.publishedBy = req.user._id;

    if (decision === "Selected") {
      interview.status = "Selected";
    } else if (decision === "Rejected") {
      interview.status = "Rejected";
    } else if (decision === "On Hold") {
      interview.status = "On Hold";
    } else if (decision === "Cleared") {
      interview.status = "Completed";
    }

    await interview.save();

    // 1. Synchronize with PlacementRoundResult
    let roundResultStatus = "Pending";
    if (decision === "Cleared") roundResultStatus = "Cleared";
    else if (decision === "Selected") roundResultStatus = "Selected";
    else if (decision === "Rejected") roundResultStatus = "Rejected";

    if (interview.drive && interview.student) {
      await PlacementRoundResult.findOneAndUpdate(
        {
          placementDrive: interview.drive._id,
          student: interview.student._id,
          roundNumber: interview.roundNumber || 1,
        },
        {
          round: interview.round,
          roundName: interview.roundName,
          result: roundResultStatus,
          feedback: adminNotes || interview.feedback?.comments || `Result published: ${decision}`,
          updatedBy: req.user._id,
        },
        { upsert: true, new: true }
      );
    }

    // 2. Synchronize with Application
    if (interview.application) {
      const appUpdate = {
        currentRoundStatus: decision,
      };

      if (decision === "Selected") {
        appUpdate.status = "Selected";
        appUpdate.offerLetter = {
          issueDate: new Date(),
          packageOffered: packageAmount || interview.drive?.package || "As per drive",
          status: "Accepted",
        };
      } else if (decision === "Rejected") {
        appUpdate.status = "Rejected";
      }

      await Application.findByIdAndUpdate(interview.application, appUpdate);
    }

    // 3. Dispatch In-App Notification to Student
    const studentUser = interview.student?.user?._id || interview.student?.user;
    if (studentUser) {
      let notifTitle = `Interview Result Published: ${interview.company?.name}`;
      let notifMsg = `Result for your ${interview.roundName} with ${interview.company?.name}: ${decision}.`;

      if (decision === "Selected") {
        notifTitle = `🎉 Congratulations! Selected by ${interview.company?.name}`;
        notifMsg = `You have been officially selected for ${interview.drive?.role} at ${interview.company?.name}!`;
      } else if (decision === "Cleared") {
        notifTitle = `Round Cleared: ${interview.roundName} at ${interview.company?.name}`;
        notifMsg = `You have successfully cleared ${interview.roundName} at ${interview.company?.name}!`;
      }

      await Notification.create({
        userId: studentUser,
        title: notifTitle,
        message: notifMsg,
        type: "round",
        sender: req.user._id,
      });
    }

    // 4. Send Email Notification
    const targetEmail = interview.student?.user?.email || interview.student?.email;
    if (targetEmail) {
      if (decision === "Selected") {
        sendFinalSelectionEmail({
          to: targetEmail,
          studentName: interview.student?.fullName || interview.student?.user?.name || "Student",
          companyName: interview.company?.name || "Company",
          role: interview.drive?.role || "Position",
          packageAmount: packageAmount || interview.drive?.package,
          additionalInfo: adminNotes,
        });
      } else if (decision === "Cleared") {
        sendRoundClearedEmail({
          to: targetEmail,
          studentName: interview.student?.fullName || interview.student?.user?.name || "Student",
          companyName: interview.company?.name || "Company",
          role: interview.drive?.role || "Position",
          roundName: interview.roundName,
          nextRoundName: "Next Scheduled Stage",
        });
      } else if (decision === "Rejected") {
        sendRoundRejectedEmail({
          to: targetEmail,
          studentName: interview.student?.fullName || interview.student?.user?.name || "Student",
          companyName: interview.company?.name || "Company",
          role: interview.drive?.role || "Position",
          roundName: interview.roundName,
          feedback: adminNotes || "Thank you for your enthusiastic participation.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Interview result published as '${decision}' and synchronized across systems.`,
      interview,
    });
  } catch (error) {
    console.error("Error in publishInterviewResult:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to publish interview result.",
      error: error.message,
    });
  }
};

/**
 * 10. DELETE INTERVIEW (Admin)
 */
const deleteInterviewByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    // Remove round result or mark cancelled
    if (interview.drive && interview.student && interview.round) {
      await PlacementRoundResult.deleteOne({
        placementDrive: interview.drive,
        student: interview.student,
        round: interview.round,
      });
    }

    await Interview.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Interview schedule deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteInterviewByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete interview schedule.",
      error: error.message,
    });
  }
};

/**
 * 11. CALENDAR VIEW DATA
 */
const getAdminInterviewCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;

    const targetYear = parseInt(year, 10) || new Date().getFullYear();
    const targetMonth = month !== undefined ? parseInt(month, 10) : new Date().getMonth(); // 0-indexed

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const interviews = await Interview.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("company", "name logo")
      .populate("drive", "role package")
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      month: targetMonth,
      year: targetYear,
      totalEvents: interviews.length,
      events: interviews,
    });
  } catch (error) {
    console.error("Error in getAdminInterviewCalendar:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load calendar events",
      error: error.message,
    });
  }
};

/**
 * 12. ADVANCED INTERVIEW ANALYTICS & REPORTS
 */
const getAdminInterviewAnalytics = async (req, res) => {
  try {
    const allInterviews = await Interview.find()
      .populate("company", "name industry")
      .populate("drive", "role package passingYear")
      .populate({
        path: "student",
        select: "passingYear branch course",
      });

    const total = allInterviews.length;
    const completed = allInterviews.filter((i) => i.status === "Completed").length;
    const selected = allInterviews.filter((i) => i.status === "Selected").length;
    const rejected = allInterviews.filter((i) => i.status === "Rejected").length;
    const scheduled = allInterviews.filter((i) => i.status === "Scheduled").length;
    const rescheduled = allInterviews.filter((i) => i.status === "Rescheduled").length;
    const onHold = allInterviews.filter((i) => i.status === "On Hold").length;

    const completionRate = total > 0 ? Math.round(((completed + selected + rejected) / total) * 100) : 0;
    const selectionRate = total > 0 ? Math.round((selected / total) * 100) : 0;

    // Company-wise distribution
    const companyStatsMap = {};
    allInterviews.forEach((item) => {
      const compName = item.company?.name || "Unassigned Company";
      if (!companyStatsMap[compName]) {
        companyStatsMap[compName] = { name: compName, total: 0, completed: 0, selected: 0, rejected: 0 };
      }
      companyStatsMap[compName].total += 1;
      if (item.status === "Completed") companyStatsMap[compName].completed += 1;
      if (item.status === "Selected") companyStatsMap[compName].selected += 1;
      if (item.status === "Rejected") companyStatsMap[compName].rejected += 1;
    });
    const companyStats = Object.values(companyStatsMap).sort((a, b) => b.total - a.total).slice(0, 10);

    // Round-wise distribution
    const roundStatsMap = {};
    allInterviews.forEach((item) => {
      const rName = item.roundName || `Round ${item.roundNumber || 1}`;
      if (!roundStatsMap[rName]) {
        roundStatsMap[rName] = { roundName: rName, total: 0, selected: 0, rejected: 0 };
      }
      roundStatsMap[rName].total += 1;
      if (item.status === "Selected") roundStatsMap[rName].selected += 1;
      if (item.status === "Rejected") roundStatsMap[rName].rejected += 1;
    });
    const roundStats = Object.values(roundStatsMap);

    // Year-wise / Batch distribution
    const yearStatsMap = {};
    allInterviews.forEach((item) => {
      const yr = item.student?.passingYear || item.drive?.passingYear || "2027";
      if (!yearStatsMap[yr]) {
        yearStatsMap[yr] = { year: yr, total: 0, selected: 0, completed: 0 };
      }
      yearStatsMap[yr].total += 1;
      if (item.status === "Selected") yearStatsMap[yr].selected += 1;
      if (item.status === "Completed") yearStatsMap[yr].completed += 1;
    });
    const yearStats = Object.values(yearStatsMap).sort((a, b) => b.year - a.year);

    return res.status(200).json({
      success: true,
      analytics: {
        total,
        completed,
        selected,
        rejected,
        scheduled,
        rescheduled,
        onHold,
        completionRate,
        selectionRate,
        companyStats,
        roundStats,
        yearStats,
      },
    });
  } catch (error) {
    console.error("Error in getAdminInterviewAnalytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate interview analytics",
      error: error.message,
    });
  }
};

/**
 * 13. CSV EXPORT FOR INTERVIEWS
 */
const exportAdminInterviewsCSV = async (req, res) => {
  try {
    const { status, mode, companyId, driveId } = req.query;

    const query = {};
    if (status && status !== "All") query.status = status;
    if (mode && mode !== "All") query.mode = mode;
    if (companyId && companyId !== "All") query.company = companyId;
    if (driveId && driveId !== "All") query.drive = driveId;

    const interviews = await Interview.find(query)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("company", "name industry")
      .populate("drive", "role package")
      .sort({ date: -1 });

    const headers = [
      "Interview ID",
      "Student Name",
      "Roll No",
      "Student Email",
      "Student Phone",
      "Branch",
      "Passing Year",
      "Company Name",
      "Job Role",
      "Interview Round",
      "Interview Date",
      "Interview Time",
      "Mode",
      "Meeting Link / Venue",
      "Interviewer Name",
      "Interviewer Email",
      "Status",
      "Result Published",
      "Technical Rating (0-10)",
      "Communication Rating (0-10)",
      "Problem Solving Rating (0-10)",
      "Overall Rating (0-10)",
      "Feedback Recommendation",
      "Created At",
    ];

    const rows = interviews.map((inv) => {
      const studentName = inv.student?.fullName || inv.student?.user?.name || "N/A";
      const rollNo = inv.student?.rollNo || inv.student?.studentId || "N/A";
      const studentEmail = inv.student?.user?.email || inv.student?.email || "N/A";
      const phone = inv.student?.user?.phone || inv.student?.phone || "N/A";
      const branch = inv.student?.branch || "N/A";
      const passingYear = inv.student?.passingYear || "N/A";
      const compName = inv.company?.name || "N/A";
      const role = inv.drive?.role || "N/A";
      const roundName = inv.roundName || `Round ${inv.roundNumber || 1}`;
      const dateStr = inv.date ? new Date(inv.date).toISOString().split("T")[0] : "N/A";
      const location = inv.mode === "Online" ? inv.meetingLink || "Online" : inv.venue || "Campus";
      const feedback = inv.feedback || {};

      return [
        `"${inv._id}"`,
        `"${studentName.replace(/"/g, '""')}"`,
        `"${rollNo.replace(/"/g, '""')}"`,
        `"${studentEmail.replace(/"/g, '""')}"`,
        `"${phone}"`,
        `"${branch}"`,
        `"${passingYear}"`,
        `"${compName.replace(/"/g, '""')}"`,
        `"${role.replace(/"/g, '""')}"`,
        `"${roundName.replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        `"${inv.time}"`,
        `"${inv.mode}"`,
        `"${location.replace(/"/g, '""')}"`,
        `"${(inv.interviewerName || "").replace(/"/g, '""')}"`,
        `"${(inv.interviewerEmail || "").replace(/"/g, '""')}"`,
        `"${inv.status}"`,
        `"${inv.resultPublished ? "Yes" : "No"}"`,
        feedback.technicalRating || 0,
        feedback.communicationRating || 0,
        feedback.problemSolvingRating || 0,
        feedback.overallRating || 0,
        `"${feedback.recommendation || "Pending"}"`,
        `"${new Date(inv.createdAt).toISOString()}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Placement_Interviews_Report_${Date.now()}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error in exportAdminInterviewsCSV:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export interview report CSV",
      error: error.message,
    });
  }
};

/**
 * 14. GET & SAVE ROUNDS FOR A PLACEMENT DRIVE (Round Management by Admin)
 */
const getDriveRoundsByAdmin = async (req, res) => {
  try {
    const { driveId } = req.params;

    const drive = await PlacementDrive.findById(driveId).populate("company", "name logo");
    if (!drive) {
      return res.status(404).json({ success: false, message: "Drive not found." });
    }

    let rounds = await PlacementRound.find({ placementDrive: driveId }).sort({ roundNumber: 1 });

    // If no rounds exist yet, initialize standard rounds
    if (rounds.length === 0) {
      const initialRounds = DEFAULT_ROUNDS.map((r) => ({
        placementDrive: drive._id,
        company: drive.company?._id || drive.company,
        roundName: r.roundName,
        roundNumber: r.roundNumber,
        roundDescription: r.roundDescription,
        status: "Scheduled",
        createdBy: req.user._id,
      }));
      rounds = await PlacementRound.insertMany(initialRounds);
    }

    return res.status(200).json({
      success: true,
      drive,
      rounds,
    });
  } catch (error) {
    console.error("Error in getDriveRoundsByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve drive rounds",
      error: error.message,
    });
  }
};

const saveDriveRoundsByAdmin = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { rounds } = req.body; // array of { roundNumber, roundName, roundDescription, scheduledDate, scheduledTime, location, meetingLink, instructions }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: "Drive not found." });
    }

    if (!Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({ success: false, message: "Rounds array is required." });
    }

    const savedRounds = [];
    for (const r of rounds) {
      const updated = await PlacementRound.findOneAndUpdate(
        {
          placementDrive: drive._id,
          roundNumber: Number(r.roundNumber),
        },
        {
          company: drive.company,
          roundName: r.roundName.trim(),
          roundDescription: r.roundDescription || "",
          scheduledDate: r.scheduledDate ? new Date(r.scheduledDate) : undefined,
          scheduledTime: r.scheduledTime || "",
          location: r.location || "Campus / Online",
          meetingLink: r.meetingLink || "",
          instructions: r.instructions || "",
          status: r.status || "Scheduled",
          createdBy: req.user._id,
        },
        { upsert: true, new: true }
      );
      savedRounds.push(updated);
    }

    return res.status(200).json({
      success: true,
      message: "Drive rounds updated successfully.",
      rounds: savedRounds,
    });
  } catch (error) {
    console.error("Error in saveDriveRoundsByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save drive rounds",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminInterviews,
  getAdminInterviewById,
  getAdminInterviewOptions,
  scheduleInterviewByAdmin,
  updateInterviewByAdmin,
  rescheduleInterviewByAdmin,
  updateInterviewStatusByAdmin,
  submitInterviewFeedback,
  publishInterviewResult,
  deleteInterviewByAdmin,
  getAdminInterviewCalendar,
  getAdminInterviewAnalytics,
  exportAdminInterviewsCSV,
  getDriveRoundsByAdmin,
  saveDriveRoundsByAdmin,
};
