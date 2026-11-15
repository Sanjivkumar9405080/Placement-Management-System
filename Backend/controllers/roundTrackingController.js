const mongoose = require("mongoose");
const PlacementDrive = require("../models/PlacementDrive");
const Application = require("../models/Application");
const Student = require("../models/Student");
const Company = require("../models/Company");
const User = require("../models/User");
const Notification = require("../models/Notification");
const PlacementRound = require("../models/PlacementRound");
const PlacementRoundResult = require("../models/PlacementRoundResult");
const {
  sendRoundClearedEmail,
  sendRoundRejectedEmail,
  sendRoundScheduledEmail,
  sendFinalSelectionEmail,
} = require("../utils/emailService");

// Helper: resolve logged in company
const resolveCompany = async (reqUser) => {
  if (!reqUser) return null;
  let company = await Company.findOne({ userId: reqUser._id });
  if (!company) {
    company = await Company.findById(reqUser._id);
  }
  return company;
};

// ========================================================
// 1. COMPANY - GET DRIVE ROUNDS & APPLICANTS
// ========================================================
const getDriveRoundsAndApplicants = async (req, res) => {
  try {
    const { driveId } = req.params;

    const drive = await PlacementDrive.findById(driveId).populate(
      "company",
      "companyName logo officialEmail"
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found.",
      });
    }

    // Security check: If not admin, verify ownership
    if (req.user.role !== "admin") {
      const company = await resolveCompany(req.user);
      if (
        !company ||
        drive.company?._id.toString() !== company._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access rounds for this placement drive.",
        });
      }
    }

    // 1. Fetch all configured rounds for this drive
    let rounds = await PlacementRound.find({ placementDrive: driveId })
      .sort({ roundNumber: 1 })
      .lean();

    // If no rounds exist yet, seed default Round 1 (Online Assessment)
    if (rounds.length === 0) {
      const defaultRound = await PlacementRound.create({
        placementDrive: driveId,
        company: drive.company?._id || drive.company,
        roundName: "Online Assessment",
        roundNumber: 1,
        roundDescription: "Preliminary online aptitude & coding assessment.",
        location: "Online Portal",
        status: "In Progress",
        createdBy: req.user._id,
      });
      rounds = [defaultRound.toObject()];
    }

    // 2. Fetch all applications for this drive
    const applications = await Application.find({ drive: driveId })
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: 1 })
      .lean();

    // 3. Fetch all round results for this drive
    const results = await PlacementRoundResult.find({
      placementDrive: driveId,
    }).lean();

    // Group results by studentId -> map of roundId or roundNumber -> resultDoc
    const studentResultsMap = {};
    results.forEach((r) => {
      const sId = r.student.toString();
      if (!studentResultsMap[sId]) {
        studentResultsMap[sId] = {};
      }
      studentResultsMap[sId][r.roundNumber] = r;
      studentResultsMap[sId][r.round.toString()] = r;
    });

    // 4. Format applicants with complete round-wise historical progress
    const formattedApplicants = applications.map((app) => {
      const sId = app.student?._id ? app.student._id.toString() : "";
      const sResults = studentResultsMap[sId] || {};

      // Determine candidate's current round number
      let currRoundNum = app.currentRoundNumber || 1;

      // Build history of each round
      const roundHistory = rounds.map((rd) => {
        const rdRes = sResults[rd.roundNumber] || sResults[rd._id.toString()];
        return {
          roundId: rd._id,
          roundNumber: rd.roundNumber,
          roundName: rd.roundName,
          result: rdRes ? rdRes.result : "Pending",
          feedback: rdRes ? rdRes.feedback : "",
          updatedAt: rdRes ? rdRes.updatedAt : null,
        };
      });

      // Check if student cleared previous round to know if eligible for next
      const currentRoundResult = sResults[currRoundNum];
      const isClearedCurrent =
        currentRoundResult && currentRoundResult.result === "Cleared";
      const isRejected =
        app.status === "Rejected" ||
        Object.values(sResults).some((r) => r.result === "Rejected");
      const isSelected =
        app.status === "Selected" ||
        Object.values(sResults).some((r) => r.result === "Selected");

      return {
        _id: app._id,
        applicationId: app._id,
        studentId: app.student?._id,
        studentName:
          app.student?.userId?.name || app.student?.name || "Student",
        studentEmail: app.student?.userId?.email || "N/A",
        studentPhone: app.student?.phone || "N/A",
        studentBranch: app.student?.branch || "N/A",
        studentCourse: app.student?.course || "N/A",
        studentRoll: app.student?.rollNumber || "N/A",
        studentCgpa:
          app.student?.cgpa !== undefined ? app.student.cgpa : 7.0,
        studentGraduationYear: app.student?.graduationYear || 2027,
        studentSkills: app.student?.skills || [],
        resume: app.student?.resume || "",
        resumeOriginalName: app.student?.resumeOriginalName || "",
        currentRoundNumber: currRoundNum,
        currentRoundName: app.currentRoundName || `Round ${currRoundNum}`,
        currentRoundStatus: app.currentRoundStatus || "Pending",
        overallStatus: isSelected
          ? "Selected"
          : isRejected
          ? "Rejected"
          : app.status,
        isClearedCurrent,
        isRejected,
        isSelected,
        roundHistory,
        appliedAt: app.appliedAt || app.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      drive: {
        _id: drive._id,
        role: drive.role,
        package: drive.package,
        company: drive.company,
        status: drive.status,
      },
      rounds,
      applicants: formattedApplicants,
      totalApplicants: formattedApplicants.length,
    });
  } catch (error) {
    console.error("Get drive rounds error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching drive rounds.",
      error: error.message,
    });
  }
};

// ========================================================
// 2. COMPANY - CREATE OR CONFIGURE ROUND
// ========================================================
const createOrConfigureRound = async (req, res) => {
  try {
    const { driveId } = req.params;
    const {
      roundName,
      roundNumber,
      roundDescription,
      scheduledDate,
      scheduledTime,
      location,
      meetingLink,
      instructions,
      status,
    } = req.body;

    if (!roundName || !roundNumber) {
      return res.status(400).json({
        success: false,
        message: "Round Name and Round Number are required.",
      });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found.",
      });
    }

    // Security check
    if (req.user.role !== "admin") {
      const company = await resolveCompany(req.user);
      if (
        !company ||
        drive.company?.toString() !== company._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to configure rounds for this drive.",
        });
      }
    }

    // Upsert round
    let round = await PlacementRound.findOne({
      placementDrive: driveId,
      roundNumber: Number(roundNumber),
    });

    if (round) {
      round.roundName = roundName.trim();
      if (roundDescription !== undefined)
        round.roundDescription = roundDescription;
      if (scheduledDate !== undefined)
        round.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
      if (scheduledTime !== undefined) round.scheduledTime = scheduledTime;
      if (location !== undefined) round.location = location;
      if (meetingLink !== undefined) round.meetingLink = meetingLink;
      if (instructions !== undefined) round.instructions = instructions;
      if (status !== undefined) round.status = status;
      await round.save();
    } else {
      round = await PlacementRound.create({
        placementDrive: driveId,
        company: drive.company,
        roundName: roundName.trim(),
        roundNumber: Number(roundNumber),
        roundDescription: roundDescription || "",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || "",
        location: location || "Campus / Online",
        meetingLink: meetingLink || "",
        instructions: instructions || "",
        status: status || "Scheduled",
        createdBy: req.user._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Round ${round.roundNumber} (${round.roundName}) saved successfully!`,
      round,
    });
  } catch (error) {
    console.error("Create/configure round error:", error);
    res.status(500).json({
      success: false,
      message: "Server error configuring round.",
      error: error.message,
    });
  }
};

// ========================================================
// 3. COMPANY - UPDATE CANDIDATE RESULTS (SINGLE & BULK)
// ========================================================
const updateCandidateRoundResults = async (req, res) => {
  try {
    const { roundId } = req.params;
    // Payload can be:
    // { results: [{ studentId, result: 'Cleared' | 'Rejected', feedback }] }
    // OR bulk: { studentIds: [...], result: 'Cleared' | 'Rejected', feedback }
    const { results, studentIds, result, feedback } = req.body;

    const round = await PlacementRound.findById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Placement round not found.",
      });
    }

    const drive = await PlacementDrive.findById(round.placementDrive).populate(
      "company",
      "companyName"
    );

    // Security check
    if (req.user.role !== "admin") {
      const company = await resolveCompany(req.user);
      if (
        !company ||
        drive.company?._id.toString() !== company._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update results for this round.",
        });
      }
    }

    // Normalize updates list
    let updateList = [];
    if (Array.isArray(results) && results.length > 0) {
      updateList = results;
    } else if (Array.isArray(studentIds) && studentIds.length > 0 && result) {
      updateList = studentIds.map((sId) => ({
        studentId: sId,
        result,
        feedback: feedback || "",
      }));
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Please specify at least one student and a valid result (Cleared / Rejected).",
      });
    }

    const companyName = drive.company?.companyName || "Company Partner";
    const roleName = drive.role || "Placement Drive";
    const processed = [];

    for (const item of updateList) {
      const studentId = item.studentId;
      const resVal = item.result;
      const fbVal = item.feedback || "";

      if (!studentId || !["Cleared", "Rejected", "Pending", "Selected"].includes(resVal)) {
        continue;
      }

      // Find application
      const app = await Application.findOne({
        drive: drive._id,
        $or: [{ student: studentId }, { studentId: studentId }],
      }).populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      });

      if (!app) continue;

      // 1. Permanent record in PlacementRoundResult
      const roundResult = await PlacementRoundResult.findOneAndUpdate(
        {
          placementDrive: drive._id,
          student: studentId,
          round: round._id,
        },
        {
          placementApplication: app._id,
          roundNumber: round.roundNumber,
          roundName: round.roundName,
          result: resVal,
          feedback: fbVal,
          updatedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 2. Update Application current status
      if (resVal === "Cleared") {
        app.currentRoundStatus = "Cleared";
        app.status = "Shortlisted";
      } else if (resVal === "Rejected") {
        app.currentRoundStatus = "Rejected";
        app.status = "Rejected";
      } else if (resVal === "Selected") {
        app.currentRoundStatus = "Selected";
        app.status = "Selected";
      }
      await app.save();

      // 3. Dispatches notifications & emails
      const studentUser = app.student?.userId;
      const studentEmail = studentUser?.email;
      const studentName = studentUser?.name || "Student";

      if (studentUser?._id) {
        // In-app Notification
        const notifTitle =
          resVal === "Cleared"
            ? `Congratulations! Cleared ${round.roundName} 🎉`
            : resVal === "Selected"
            ? `Final Selection Offer: ${roleName} 🌟`
            : `Placement Update: ${round.roundName}`;

        const notifMsg =
          resVal === "Cleared"
            ? `You have cleared ${round.roundName} for ${roleName} at ${companyName}. Next round details will follow soon.`
            : resVal === "Selected"
            ? `Congratulations! You have been selected for ${roleName} at ${companyName}!`
            : `Thank you for your participation in ${round.roundName} for ${roleName} at ${companyName}. Your application was not shortlisted for subsequent rounds.`;

        await Notification.create({
          userId: studentUser._id,
          sender: req.user._id,
          title: notifTitle,
          message: notifMsg,
          type: "round",
          targetAudience: "individual",
        }).catch((err) => console.warn("In-app notif failed:", err.message));
      }

      // Safe Email Notification (Errors logged, never break execution)
      if (studentEmail) {
        if (resVal === "Cleared") {
          sendRoundClearedEmail({
            to: studentEmail,
            studentName,
            companyName,
            role: roleName,
            roundName: round.roundName,
            nextRoundName: `Round ${round.roundNumber + 1}`,
            nextRoundDetails: "Watch your portal dashboard for scheduling details.",
          }).catch((err) => console.warn("Email send failed:", err.message));
        } else if (resVal === "Rejected") {
          sendRoundRejectedEmail({
            to: studentEmail,
            studentName,
            companyName,
            role: roleName,
            roundName: round.roundName,
            feedback: fbVal,
          }).catch((err) => console.warn("Email send failed:", err.message));
        } else if (resVal === "Selected") {
          sendFinalSelectionEmail({
            to: studentEmail,
            studentName,
            companyName,
            role: roleName,
            packageAmount: drive.package,
            additionalInfo: fbVal,
          }).catch((err) => console.warn("Email send failed:", err.message));
        }
      }

      processed.push({
        studentId,
        studentName,
        result: resVal,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated round results for ${processed.length} candidate(s).`,
      count: processed.length,
      processed,
    });
  } catch (error) {
    console.error("Update candidate round results error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating candidate round results.",
      error: error.message,
    });
  }
};

// ========================================================
// 4. COMPANY - PROMOTE SHORTLISTED CANDIDATES TO NEXT ROUND
// ========================================================
const promoteCandidatesToNextRound = async (req, res) => {
  try {
    const { driveId } = req.params;
    const {
      studentIds,
      targetRoundNumber,
      roundName,
      roundDescription,
      scheduledDate,
      scheduledTime,
      location,
      meetingLink,
      instructions,
    } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one student to move to the next round.",
      });
    }

    const nextNum = Number(targetRoundNumber);
    if (!nextNum || nextNum < 2) {
      return res.status(400).json({
        success: false,
        message: "Valid target round number (2 or greater) is required.",
      });
    }

    const drive = await PlacementDrive.findById(driveId).populate(
      "company",
      "companyName"
    );
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found.",
      });
    }

    // Security check
    if (req.user.role !== "admin") {
      const company = await resolveCompany(req.user);
      if (
        !company ||
        drive.company?._id.toString() !== company._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to promote candidates for this drive.",
        });
      }
    }

    // 1. Ensure target round exists or create it
    let targetRound = await PlacementRound.findOne({
      placementDrive: driveId,
      roundNumber: nextNum,
    });

    if (!targetRound) {
      targetRound = await PlacementRound.create({
        placementDrive: driveId,
        company: drive.company?._id || drive.company,
        roundName: roundName ? roundName.trim() : `Round ${nextNum}`,
        roundNumber: nextNum,
        roundDescription: roundDescription || "",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || "",
        location: location || "Campus / Online",
        meetingLink: meetingLink || "",
        instructions: instructions || "",
        status: "Scheduled",
        createdBy: req.user._id,
      });
    } else {
      // Update schedule details if provided
      if (roundName) targetRound.roundName = roundName.trim();
      if (roundDescription !== undefined)
        targetRound.roundDescription = roundDescription;
      if (scheduledDate) targetRound.scheduledDate = new Date(scheduledDate);
      if (scheduledTime !== undefined)
        targetRound.scheduledTime = scheduledTime;
      if (location !== undefined) targetRound.location = location;
      if (meetingLink !== undefined) targetRound.meetingLink = meetingLink;
      if (instructions !== undefined)
        targetRound.instructions = instructions;
      await targetRound.save();
    }

    const prevNum = nextNum - 1;
    const companyName = drive.company?.companyName || "Company Partner";
    const roleName = drive.role || "Placement Drive";
    const promoted = [];
    const ineligible = [];

    for (const studentId of studentIds) {
      // Verify student cleared previous round
      const prevResult = await PlacementRoundResult.findOne({
        placementDrive: driveId,
        student: studentId,
        roundNumber: prevNum,
      });

      if (!prevResult || prevResult.result !== "Cleared") {
        ineligible.push(studentId);
        continue;
      }

      // Find application
      const app = await Application.findOne({
        drive: driveId,
        $or: [{ student: studentId }, { studentId }],
      }).populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      });

      if (!app) continue;

      // 1. Create permanent result placeholder in PlacementRoundResult for target round
      await PlacementRoundResult.findOneAndUpdate(
        {
          placementDrive: driveId,
          student: studentId,
          round: targetRound._id,
        },
        {
          placementApplication: app._id,
          roundNumber: nextNum,
          roundName: targetRound.roundName,
          result: "Pending",
          updatedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 2. Update Application current round
      app.currentRoundNumber = nextNum;
      app.currentRoundName = targetRound.roundName;
      app.currentRoundStatus = "Round Scheduled";
      app.status = "Interview";
      await app.save();

      // 3. Send Notification & Email
      const studentUser = app.student?.userId;
      const studentEmail = studentUser?.email;
      const studentName = studentUser?.name || "Student";

      if (studentUser?._id) {
        await Notification.create({
          userId: studentUser._id,
          sender: req.user._id,
          title: `Next Round Scheduled: ${targetRound.roundName} 📅`,
          message: `Your next round (${targetRound.roundName}) for ${roleName} at ${companyName} has been scheduled. Check your dashboard for instructions.`,
          type: "schedule",
          targetAudience: "individual",
        }).catch((err) => console.warn("Notif failed:", err.message));
      }

      if (studentEmail) {
        sendRoundScheduledEmail({
          to: studentEmail,
          studentName,
          companyName,
          role: roleName,
          roundName: targetRound.roundName,
          scheduledDate: targetRound.scheduledDate,
          scheduledTime: targetRound.scheduledTime,
          location: targetRound.location,
          meetingLink: targetRound.meetingLink,
          instructions: targetRound.instructions,
        }).catch((err) => console.warn("Email failed:", err.message));
      }

      promoted.push({
        studentId,
        studentName,
      });
    }

    res.status(200).json({
      success: true,
      message: `Promoted ${promoted.length} candidate(s) to ${targetRound.roundName}.`,
      targetRound,
      promotedCount: promoted.length,
      ineligibleCount: ineligible.length,
      promoted,
    });
  } catch (error) {
    console.error("Promote candidates error:", error);
    res.status(500).json({
      success: false,
      message: "Server error promoting candidates to next round.",
      error: error.message,
    });
  }
};

// ========================================================
// 5. COMPANY - MARK FINAL SELECTION
// ========================================================
const markFinalSelection = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { studentIds, additionalInfo } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one student for final selection.",
      });
    }

    const drive = await PlacementDrive.findById(driveId).populate(
      "company",
      "companyName"
    );
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found.",
      });
    }

    // Security check
    if (req.user.role !== "admin") {
      const company = await resolveCompany(req.user);
      if (
        !company ||
        drive.company?._id.toString() !== company._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to select candidates for this drive.",
        });
      }
    }

    // Find latest round
    const highestRound = await PlacementRound.findOne({
      placementDrive: driveId,
    }).sort({ roundNumber: -1 });

    const companyName = drive.company?.companyName || "Company Partner";
    const roleName = drive.role || "Placement Drive";
    const selectedList = [];

    for (const studentId of studentIds) {
      const app = await Application.findOne({
        drive: driveId,
        $or: [{ student: studentId }, { studentId }],
      }).populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      });

      if (!app) continue;

      // Update round result
      if (highestRound) {
        await PlacementRoundResult.findOneAndUpdate(
          {
            placementDrive: driveId,
            student: studentId,
            round: highestRound._id,
          },
          {
            placementApplication: app._id,
            roundNumber: highestRound.roundNumber,
            roundName: highestRound.roundName,
            result: "Selected",
            feedback: additionalInfo || "Selected for offer.",
            updatedBy: req.user._id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      // Update Application status
      app.status = "Selected";
      app.currentRoundStatus = "Selected";
      await app.save();

      const studentUser = app.student?.userId;
      const studentEmail = studentUser?.email;
      const studentName = studentUser?.name || "Student";

      // In-app Notification
      if (studentUser?._id) {
        await Notification.create({
          userId: studentUser._id,
          sender: req.user._id,
          title: `Selected: ${roleName} at ${companyName}! 🌟`,
          message: `Congratulations! You have been officially selected for ${roleName} with ${companyName}!`,
          type: "application",
          targetAudience: "individual",
        }).catch((err) => console.warn("Notif error:", err.message));
      }

      // Email Notification
      if (studentEmail) {
        sendFinalSelectionEmail({
          to: studentEmail,
          studentName,
          companyName,
          role: roleName,
          packageAmount: drive.package,
          additionalInfo,
        }).catch((err) => console.warn("Email error:", err.message));
      }

      selectedList.push({
        studentId,
        studentName,
      });
    }

    res.status(200).json({
      success: true,
      message: `Marked ${selectedList.length} candidate(s) as Finally Selected!`,
      selectedCount: selectedList.length,
      selectedList,
    });
  } catch (error) {
    console.error("Mark final selection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error marking final selection.",
      error: error.message,
    });
  }
};

// ========================================================
// 6. STUDENT - MY PLACEMENT JOURNEY
// ========================================================
const getStudentPlacementJourney = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // 1. Fetch all student applications
    const applications = await Application.find({
      $or: [{ student: student._id }, { student: req.user._id }],
    })
      .populate({
        path: "drive",
        populate: {
          path: "company",
          select: "companyName logo location website officialEmail",
        },
      })
      .populate("company", "companyName logo location website")
      .sort({ createdAt: -1 })
      .lean();

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        journeys: [],
        total: 0,
      });
    }

    const driveIds = applications.map((a) => a.drive?._id).filter(Boolean);

    // 2. Fetch all rounds for these drives
    const allRounds = await PlacementRound.find({
      placementDrive: { $in: driveIds },
    })
      .sort({ roundNumber: 1 })
      .lean();

    // 3. Fetch all round results for this student
    const allResults = await PlacementRoundResult.find({
      student: student._id,
      placementDrive: { $in: driveIds },
    }).lean();

    const resultsByDriveAndNum = {};
    allResults.forEach((r) => {
      const dKey = r.placementDrive.toString();
      if (!resultsByDriveAndNum[dKey]) resultsByDriveAndNum[dKey] = {};
      resultsByDriveAndNum[dKey][r.roundNumber] = r;
      resultsByDriveAndNum[dKey][r.round.toString()] = r;
    });

    // 4. Construct complete visual journey for each application
    const journeys = applications.map((app) => {
      const drive = app.drive;
      if (!drive) return null;

      const driveRounds = allRounds
        .filter((rd) => rd.placementDrive.toString() === drive._id.toString())
        .sort((a, b) => a.roundNumber - b.roundNumber);

      const dResults = resultsByDriveAndNum[drive._id.toString()] || {};
      const currentRoundNum = app.currentRoundNumber || 1;
      let hasBeenRejected = app.status === "Rejected";

      // Visual Timeline Stages
      const timeline = [
        {
          step: 0,
          title: "Application Submitted",
          status: "Cleared",
          date: app.appliedAt || app.createdAt,
          description: "Your application was submitted successfully.",
        },
      ];

      driveRounds.forEach((rd) => {
        const rdRes = dResults[rd.roundNumber] || dResults[rd._id.toString()];
        let roundStatus = "Upcoming";

        if (rdRes) {
          if (rdRes.result === "Cleared") {
            roundStatus = "Cleared";
          } else if (rdRes.result === "Rejected") {
            roundStatus = "Rejected";
            hasBeenRejected = true;
          } else if (rdRes.result === "Selected") {
            roundStatus = "Selected";
          } else if (rdRes.result === "Pending") {
            roundStatus = rd.status === "Scheduled" ? "Round Scheduled" : "In Progress";
          }
        } else if (hasBeenRejected) {
          roundStatus = "Not Reached";
        } else if (rd.roundNumber === currentRoundNum) {
          roundStatus = app.currentRoundStatus || "Round Scheduled";
        } else if (rd.roundNumber > currentRoundNum) {
          roundStatus = "Upcoming";
        }

        timeline.push({
          step: rd.roundNumber,
          roundId: rd._id,
          roundNumber: rd.roundNumber,
          title: rd.roundName,
          roundDescription: rd.roundDescription,
          status: roundStatus,
          scheduledDate: rd.scheduledDate,
          scheduledTime: rd.scheduledTime,
          location: rd.location,
          meetingLink: rd.meetingLink,
          instructions: rd.instructions,
          feedback: rdRes ? rdRes.feedback : "",
          updatedAt: rdRes ? rdRes.updatedAt : null,
        });
      });

      // Add Final Selection node
      timeline.push({
        step: driveRounds.length + 1,
        title: "Final Selection",
        status:
          app.status === "Selected"
            ? "Selected"
            : hasBeenRejected
            ? "Not Selected"
            : "Upcoming",
        description:
          app.status === "Selected"
            ? "Congratulations! You have received an offer for this position."
            : hasBeenRejected
            ? "Process concluded."
            : "Awaiting final decision.",
      });

      return {
        applicationId: app._id,
        driveId: drive._id,
        companyName:
          drive.company?.companyName || app.company?.companyName || "Company",
        companyLogo: drive.company?.logo || app.company?.logo || "",
        companyLocation:
          drive.company?.location || drive.location || "Campus",
        role: drive.role,
        package: drive.package,
        jobType: drive.jobType || "Full-Time",
        currentRoundNumber: app.currentRoundNumber || 1,
        currentRoundName: app.currentRoundName || "Round 1",
        currentRoundStatus: app.currentRoundStatus || "Pending",
        overallStatus: app.status,
        timeline,
        appliedAt: app.appliedAt || app.createdAt,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      journeys,
      total: journeys.length,
    });
  } catch (error) {
    console.error("Get student placement journey error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching placement journey.",
      error: error.message,
    });
  }
};

// ========================================================
// 7. ADMIN - COMPLETE PLACEMENT TRACKING & ANALYTICS
// ========================================================
const getAdminPlacementTracking = async (req, res) => {
  try {
    const {
      graduationYear,
      academicYear,
      branch,
      companyId,
      role,
      driveId,
      currentRound,
      status,
      search,
    } = req.query;

    // 1. Build Student filter
    const studentQuery = {};
    if (graduationYear && graduationYear !== "All") {
      studentQuery.graduationYear = Number(graduationYear);
    }
    if (academicYear && academicYear !== "All") {
      studentQuery.academicYear = academicYear;
    }
    if (branch && branch !== "All") {
      studentQuery.branch = branch;
    }

    // 2. Fetch all matching students
    const students = await Student.find(studentQuery)
      .populate("userId", "name email")
      .sort({ graduationYear: 1, name: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    // 3. Build Application filter
    const appQuery = {
      $or: [
        { student: { $in: studentIds } },
        { studentId: { $in: studentIds } },
      ],
    };
    if (driveId && driveId !== "All") {
      appQuery.drive = driveId;
    }
    if (companyId && companyId !== "All") {
      appQuery.company = companyId;
    }
    if (status && status !== "All") {
      appQuery.status = status;
    }

    const applications = await Application.find(appQuery)
      .populate({
        path: "drive",
        populate: { path: "company", select: "companyName logo" },
      })
      .populate("company", "companyName logo")
      .lean();

    // 4. Fetch all Round Results
    const allResults = await PlacementRoundResult.find({
      student: { $in: studentIds },
    }).lean();

    const studentResultsMap = {};
    allResults.forEach((r) => {
      const sId = r.student.toString();
      if (!studentResultsMap[sId]) studentResultsMap[sId] = [];
      studentResultsMap[sId].push(r);
    });

    // 5. Group applications by student
    const studentAppMap = {};
    applications.forEach((app) => {
      const sId = app.student?._id ? app.student._id.toString() : (app.studentId ? app.studentId.toString() : "");
      if (!sId) return;
      if (!studentAppMap[sId]) studentAppMap[sId] = [];
      studentAppMap[sId].push(app);
    });

    // 6. Map students with applied companies & current round status
    let trackingRows = students.map((s) => {
      const sId = s._id.toString();
      const sApps = studentAppMap[sId] || [];
      const sResults = studentResultsMap[sId] || [];

      // Derive overall student status across all applications
      let overallStatus = "Not Applied";
      if (sApps.some((a) => a.status === "Selected")) {
        overallStatus = "Placed / Selected";
      } else if (sApps.some((a) => a.status === "Interview" || a.status === "Shortlisted")) {
        overallStatus = "In Progress";
      } else if (sApps.length > 0 && sApps.every((a) => a.status === "Rejected")) {
        overallStatus = "Rejected";
      } else if (sApps.length > 0) {
        overallStatus = "Applied";
      }

      // Format applications summary for this student
      const appliedDrives = sApps.map((a) => {
        const dResults = sResults.filter(
          (r) => r.placementDrive?.toString() === a.drive?._id?.toString()
        );
        const latestResult = dResults.sort((x, y) => y.roundNumber - x.roundNumber)[0];

        return {
          applicationId: a._id,
          driveId: a.drive?._id,
          companyName: a.drive?.company?.companyName || a.company?.companyName || "Company",
          role: a.drive?.role || a.role || "N/A",
          package: a.drive?.package || "N/A",
          currentRoundNumber: a.currentRoundNumber || 1,
          currentRoundName: a.currentRoundName || "Round 1",
          currentRoundStatus: a.currentRoundStatus || "Pending",
          latestResult: latestResult ? latestResult.result : "Pending",
          latestFeedback: latestResult ? latestResult.feedback : "",
          applicationStatus: a.status,
          appliedAt: a.appliedAt || a.createdAt,
        };
      });

      return {
        _id: s._id,
        studentId: s._id,
        name: s.userId?.name || s.name || "Student",
        email: s.userId?.email || "N/A",
        phone: s.phone || "N/A",
        rollNumber: s.rollNumber || "N/A",
        branch: s.branch || "General",
        course: s.course || "B.Tech",
        academicYear: s.academicYear || "3rd Year",
        graduationYear: s.graduationYear || 2027,
        cgpa: s.cgpa !== undefined ? Number(s.cgpa) : 7.0,
        resume: s.resume || "",
        resumeOriginalName: s.resumeOriginalName || "",
        appliedCompaniesCount: appliedDrives.length,
        appliedDrives,
        overallStatus,
      };
    });

    // Search filter across student name, rollNumber, email
    if (search) {
      const q = search.trim().toLowerCase();
      trackingRows = trackingRows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.rollNumber.toLowerCase().includes(q) ||
          r.appliedDrives.some((d) =>
            d.companyName.toLowerCase().includes(q) ||
            d.role.toLowerCase().includes(q)
          )
      );
    }

    // Role filter
    if (role && role !== "All") {
      trackingRows = trackingRows.filter((r) =>
        r.appliedDrives.some((d) => d.role.toLowerCase() === role.toLowerCase())
      );
    }

    // Current Round filter
    if (currentRound && currentRound !== "All") {
      trackingRows = trackingRows.filter((r) =>
        r.appliedDrives.some((d) =>
          d.currentRoundName.toLowerCase().includes(currentRound.toLowerCase())
        )
      );
    }

    // 7. Calculate real-time analytics based on ACTUAL database records
    const allAppsInDb = await Application.find().lean();
    const allResultsInDb = await PlacementRoundResult.find().lean();

    const totalStudentsInDb = await Student.countDocuments(studentQuery);
    const totalAppliedStudentsCount = trackingRows.filter(
      (r) => r.appliedCompaniesCount > 0
    ).length;
    const totalSelectedStudents = trackingRows.filter(
      (r) => r.overallStatus === "Placed / Selected"
    ).length;
    const totalRejectedStudents = trackingRows.filter(
      (r) => r.overallStatus === "Rejected"
    ).length;

    // Count students by current rounds
    let inRound1 = 0;
    let inRound2 = 0;
    let inRound3 = 0;
    let inHrInterview = 0;
    let awaitingResults = 0;

    trackingRows.forEach((r) => {
      r.appliedDrives.forEach((d) => {
        if (d.currentRoundNumber === 1) inRound1++;
        if (d.currentRoundNumber === 2) inRound2++;
        if (d.currentRoundNumber === 3) inRound3++;
        if (d.currentRoundName.toLowerCase().includes("hr")) inHrInterview++;
        if (d.latestResult === "Pending") awaitingResults++;
      });
    });

    // Available dynamic dropdown lists
    const allGraduationYears = [2025, 2026, 2027, 2028, 2029];
    const allBranches = Array.from(
      new Set(students.map((s) => s.branch).filter(Boolean))
    ).sort();

    const companies = await Company.find().select("companyName _id").lean();
    const drives = await PlacementDrive.find()
      .select("role company _id package")
      .populate("company", "companyName")
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalStudents: totalStudentsInDb,
        totalApplied: totalAppliedStudentsCount,
        totalShortlisted: trackingRows.filter((r) => r.overallStatus === "In Progress" || r.overallStatus === "Placed / Selected").length,
        inRound1,
        inRound2,
        inRound3,
        inHrInterview,
        selected: totalSelectedStudents,
        rejected: totalRejectedStudents,
        awaitingResults,
      },
      tracking: trackingRows,
      total: trackingRows.length,
      availableGraduationYears: allGraduationYears,
      availableBranches: allBranches,
      availableCompanies: companies,
      availableDrives: drives,
    });
  } catch (error) {
    console.error("Get admin placement tracking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching admin placement tracking.",
      error: error.message,
    });
  }
};

// ========================================================
// 8. ADMIN - GET SINGLE STUDENT'S COMPLETE MULTI-COMPANY JOURNEY
// ========================================================
const getAdminStudentJourney = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate(
      "userId",
      "name email"
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const applications = await Application.find({
      $or: [{ student: student._id }, { studentId: student._id }],
    })
      .populate({
        path: "drive",
        populate: { path: "company", select: "companyName logo location" },
      })
      .populate("company", "companyName logo location")
      .sort({ createdAt: -1 })
      .lean();

    const driveIds = applications.map((a) => a.drive?._id).filter(Boolean);

    const allRounds = await PlacementRound.find({
      placementDrive: { $in: driveIds },
    })
      .sort({ roundNumber: 1 })
      .lean();

    const allResults = await PlacementRoundResult.find({
      student: student._id,
      placementDrive: { $in: driveIds },
    }).lean();

    const resultsByDriveAndNum = {};
    allResults.forEach((r) => {
      const dKey = r.placementDrive.toString();
      if (!resultsByDriveAndNum[dKey]) resultsByDriveAndNum[dKey] = {};
      resultsByDriveAndNum[dKey][r.roundNumber] = r;
      resultsByDriveAndNum[dKey][r.round.toString()] = r;
    });

    const companyJourneys = applications.map((app) => {
      const drive = app.drive;
      if (!drive) return null;

      const driveRounds = allRounds
        .filter((rd) => rd.placementDrive.toString() === drive._id.toString())
        .sort((a, b) => a.roundNumber - b.roundNumber);

      const dResults = resultsByDriveAndNum[drive._id.toString()] || {};
      const currentRoundNum = app.currentRoundNumber || 1;
      let hasBeenRejected = app.status === "Rejected";

      const timeline = [
        {
          step: 0,
          title: "Application Submitted",
          status: "Cleared",
          date: app.appliedAt || app.createdAt,
          description: "Candidate applied via college placement portal.",
        },
      ];

      driveRounds.forEach((rd) => {
        const rdRes = dResults[rd.roundNumber] || dResults[rd._id.toString()];
        let roundStatus = "Upcoming";

        if (rdRes) {
          if (rdRes.result === "Cleared") roundStatus = "Cleared";
          else if (rdRes.result === "Rejected") {
            roundStatus = "Rejected";
            hasBeenRejected = true;
          } else if (rdRes.result === "Selected") roundStatus = "Selected";
          else if (rdRes.result === "Pending") roundStatus = rd.status === "Scheduled" ? "Round Scheduled" : "In Progress";
        } else if (hasBeenRejected) {
          roundStatus = "Not Reached";
        } else if (rd.roundNumber === currentRoundNum) {
          roundStatus = app.currentRoundStatus || "Round Scheduled";
        } else if (rd.roundNumber > currentRoundNum) {
          roundStatus = "Upcoming";
        }

        timeline.push({
          step: rd.roundNumber,
          roundId: rd._id,
          roundNumber: rd.roundNumber,
          title: rd.roundName,
          roundDescription: rd.roundDescription,
          status: roundStatus,
          scheduledDate: rd.scheduledDate,
          scheduledTime: rd.scheduledTime,
          location: rd.location,
          meetingLink: rd.meetingLink,
          instructions: rd.instructions,
          feedback: rdRes ? rdRes.feedback : "",
          updatedAt: rdRes ? rdRes.updatedAt : null,
        });
      });

      timeline.push({
        step: driveRounds.length + 1,
        title: "Final Selection",
        status:
          app.status === "Selected"
            ? "Selected"
            : hasBeenRejected
            ? "Not Selected"
            : "Upcoming",
        description:
          app.status === "Selected"
            ? "Offer extended to candidate."
            : hasBeenRejected
            ? "Application not selected."
            : "Awaiting final decision.",
      });

      return {
        applicationId: app._id,
        driveId: drive._id,
        companyName: drive.company?.companyName || app.company?.companyName || "Company",
        companyLogo: drive.company?.logo || "",
        role: drive.role,
        package: drive.package,
        overallStatus: app.status,
        currentRoundNumber: app.currentRoundNumber || 1,
        currentRoundName: app.currentRoundName || "Round 1",
        timeline,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.userId?.name || student.name || "Student",
        email: student.userId?.email || "N/A",
        phone: student.phone || "N/A",
        rollNumber: student.rollNumber || "N/A",
        branch: student.branch || "General",
        graduationYear: student.graduationYear || 2027,
        cgpa: student.cgpa,
        resume: student.resume || "",
      },
      journeys: companyJourneys,
    });
  } catch (error) {
    console.error("Get admin student journey error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching student placement journey.",
      error: error.message,
    });
  }
};

// ========================================================
// 9. ADMIN - EXPORT PLACEMENT TRACKING CSV
// ========================================================
const exportAdminPlacementTrackingCSV = async (req, res) => {
  try {
    const { graduationYear, branch, status } = req.query;

    const studentQuery = {};
    if (graduationYear && graduationYear !== "All") {
      studentQuery.graduationYear = Number(graduationYear);
    }
    if (branch && branch !== "All") {
      studentQuery.branch = branch;
    }

    const students = await Student.find(studentQuery)
      .populate("userId", "name email")
      .lean();

    const studentIds = students.map((s) => s._id);

    const applications = await Application.find({
      student: { $in: studentIds },
    })
      .populate({
        path: "drive",
        populate: { path: "company", select: "companyName" },
      })
      .populate("company", "companyName")
      .lean();

    const allResults = await PlacementRoundResult.find({
      student: { $in: studentIds },
    }).lean();

    // CSV Headers
    const headers = [
      "Student Name",
      "Email",
      "Enrollment / Roll Number",
      "Branch",
      "Course",
      "Graduation Year",
      "CGPA",
      "Company",
      "Job Role",
      "Package",
      "Current Round",
      "Current Round Status",
      "Overall Application Status",
      "Applied Date",
    ];

    const rows = [];

    students.forEach((s) => {
      const sApps = applications.filter(
        (a) => a.student?.toString() === s._id.toString()
      );

      if (sApps.length === 0) {
        rows.push([
          `"${s.userId?.name || s.name || "Student"}"`,
          `"${s.userId?.email || ""}"`,
          `"${s.rollNumber || ""}"`,
          `"${s.branch || ""}"`,
          `"${s.course || ""}"`,
          s.graduationYear || "",
          s.cgpa || "",
          '"Not Applied"',
          '""',
          '""',
          '""',
          '""',
          '"Not Applied"',
          '""',
        ]);
      } else {
        sApps.forEach((a) => {
          rows.push([
            `"${s.userId?.name || s.name || "Student"}"`,
            `"${s.userId?.email || ""}"`,
            `"${s.rollNumber || ""}"`,
            `"${s.branch || ""}"`,
            `"${s.course || ""}"`,
            s.graduationYear || "",
            s.cgpa || "",
            `"${a.drive?.company?.companyName || a.company?.companyName || ""}"`,
            `"${a.drive?.role || a.role || ""}"`,
            `"${a.drive?.package || ""}"`,
            `"${a.currentRoundName || "Round 1"}"`,
            `"${a.currentRoundStatus || "Pending"}"`,
            `"${a.status || "Applied"}"`,
            `"${a.appliedAt ? new Date(a.appliedAt).toISOString().split("T")[0] : ""}"`,
          ]);
        });
      }
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Placement_Tracking_${graduationYear || "All"}_Export.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating CSV export.",
      error: error.message,
    });
  }
};

module.exports = {
  getDriveRoundsAndApplicants,
  createOrConfigureRound,
  updateCandidateRoundResults,
  promoteCandidatesToNextRound,
  markFinalSelection,
  getStudentPlacementJourney,
  getAdminPlacementTracking,
  getAdminStudentJourney,
  exportAdminPlacementTrackingCSV,
};
