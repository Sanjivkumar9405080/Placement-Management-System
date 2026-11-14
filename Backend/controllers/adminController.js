const Company = require("../models/Company");
const Student = require("../models/Student");
const User = require("../models/User");
const PlacementDrive = require("../models/PlacementDrive");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Notification = require("../models/Notification");
const CompanySuggestion = require("../models/CompanySuggestion");
const CompanyShare = require("../models/CompanyShare");
const AdminNotificationLog = require("../models/AdminNotificationLog");
const {
  evaluateStudentEligibility,
  deriveAcademicYear: helperDeriveAcademicYear,
} = require("../utils/eligibilityHelper");

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCompanies,
      activeDrives,
      totalApplications,
      shortlistedStudents,
      selectedStudents,
      upcomingInterviews,

      // Placement Overview
      totalDrives,
      closedDrives,
      completedDrives,

      // Application Overview Breakdown
      appliedApplications,
      underReviewApplications,
      interviewApplications,
      rejectedApplications,

      // Interview Overview Breakdown
      completedInterviews,
      cancelledInterviews,

      // Recent Records for Activity Feed
      recentDrives,
      recentApplications,
      recentInterviews,
      recentCompanies,
    ] = await Promise.all([
      // 1. Total Students
      User.countDocuments({ role: "student" }),

      // 2. Total Companies
      Company.countDocuments(),

      // 3. Active Drives
      PlacementDrive.countDocuments({ status: "Active" }),

      // 4. Total Applications
      Application.countDocuments(),

      // 5. Shortlisted Students
      Application.countDocuments({ status: "Shortlisted" }),

      // 6. Selected Students
      Application.countDocuments({ status: "Selected" }),

      // 7. Upcoming / Scheduled Interviews
      Interview.countDocuments({
        status: { $in: ["Scheduled", "Rescheduled"] },
      }),

      // Placement Overview Breakdown
      PlacementDrive.countDocuments(),
      PlacementDrive.countDocuments({ status: "Closed" }),
      PlacementDrive.countDocuments({ status: "Completed" }),

      // Application Overview Breakdown
      Application.countDocuments({ status: "Applied" }),
      Application.countDocuments({ status: "Under Review" }),
      Application.countDocuments({ status: "Interview" }),
      Application.countDocuments({ status: "Rejected" }),

      // Interview Overview Breakdown
      Interview.countDocuments({ status: "Completed" }),
      Interview.countDocuments({ status: "Cancelled" }),

      // Recent Placement Drives
      PlacementDrive.find()
        .populate("company", "companyName logo")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent Applications
      Application.find()
        .populate({
          path: "student",
          populate: { path: "userId", select: "name email" },
        })
        .populate("company", "companyName logo")
        .populate("drive", "role package")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent Interviews
      Interview.find()
        .populate({
          path: "student",
          populate: { path: "userId", select: "name email" },
        })
        .populate("company", "companyName logo")
        .populate("drive", "role")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent Companies
      Company.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Build unified Recent Activity List
    const activities = [];

    recentApplications.forEach((app) => {
      const studentName =
        app.student?.userId?.name || "A student";
      const companyName =
        app.company?.companyName || "a company";
      const role = app.role || app.drive?.role || "Drive";

      let actionDesc = `applied for ${role} at ${companyName}`;
      if (app.status === "Shortlisted") {
        actionDesc = `was shortlisted for ${role} by ${companyName}`;
      } else if (app.status === "Selected") {
        actionDesc = `was selected for ${role} by ${companyName}`;
      }

      activities.push({
        id: `app_${app._id}`,
        type: "application",
        title: `${studentName} ${actionDesc}`,
        status: app.status,
        timestamp: app.appliedAt || app.createdAt,
      });
    });

    recentInterviews.forEach((item) => {
      const studentName =
        item.student?.userId?.name || "Student";
      const companyName =
        item.company?.companyName || "Company";

      activities.push({
        id: `int_${item._id}`,
        type: "interview",
        title: `Interview scheduled with ${studentName} for ${companyName}`,
        status: item.status,
        timestamp: item.createdAt,
      });
    });

    recentDrives.forEach((d) => {
      const companyName = d.company?.companyName || "Company";
      activities.push({
        id: `drive_${d._id}`,
        type: "drive",
        title: `New placement drive "${d.role}" created by ${companyName}`,
        status: d.status,
        timestamp: d.createdAt,
      });
    });

    // Sort combined activities by timestamp descending and take top 8
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, 8);

    res.status(200).json({
      success: true,
      stats: {
        // Required top-level metrics
        totalStudents,
        totalCompanies,
        activeDrives,
        totalApplications,
        shortlistedStudents,
        selectedStudents,
        upcomingInterviews,

        // Placement Overview
        placementOverview: {
          totalDrives,
          activeDrives,
          closedDrives,
          completedDrives,
        },

        // Application Overview
        applicationOverview: {
          totalApplications,
          applied: appliedApplications,
          underReview: underReviewApplications,
          shortlisted: shortlistedStudents,
          interview: interviewApplications,
          selected: selectedStudents,
          rejected: rejectedApplications,
        },

        // Interview Overview
        interviewOverview: {
          upcomingInterviews,
          completedInterviews,
          cancelledInterviews,
        },

        // Recent Activity and lists
        recentActivities,
        recentDrives,
        recentCompanies,
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin dashboard stats",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN PROFILE
// ==========================================
const getAdminProfile = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id || req.user.userId).select(
      "-password"
    );

    if (!adminUser) {
      return res.status(200).json({
        success: true,
        admin: {
          name: "Placement Cell Admin",
          email: process.env.ADMIN_EMAIL || "admin@placement.com",
          role: "admin",
          college: "College Placement Cell",
        },
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: adminUser._id,
        name: adminUser.name || "Placement Cell Admin",
        email: adminUser.email,
        role: adminUser.role,
        college: "College Placement Cell",
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET ALL REGISTERED COMPANIES
// ==========================================
const getAllCompanies = async (req, res) => {
  try {
    const { search, industry, status } = req.query;

    const companies = await Company.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    // 1. Group active drives count per company
    const activeDrivesCounts = await PlacementDrive.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);
    const activeDrivesMap = {};
    activeDrivesCounts.forEach((item) => {
      if (item._id) activeDrivesMap[item._id.toString()] = item.count;
    });

    // 2. Group total applications per company
    const appCounts = await Application.aggregate([
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);
    const appCountMap = {};
    appCounts.forEach((item) => {
      if (item._id) appCountMap[item._id.toString()] = item.count;
    });

    // 3. Format company list
    let companyList = companies.map((c) => ({
      _id: c._id,
      companyName: c.companyName || c.userId?.name || "Company",
      officialEmail: c.officialEmail || c.userId?.email || "N/A",
      hrName: c.hrName || c.userId?.name || "N/A",
      phone: c.phone || "N/A",
      industry: c.industry || "General / IT",
      location: c.location || "College Campus",
      website: c.website || "",
      linkedin: c.linkedin || "",
      description: c.description || "",
      logo: c.logo || "",
      isApproved: c.isApproved !== undefined ? c.isApproved : true,
      status: c.status || "Active",
      activeDrivesCount: activeDrivesMap[c._id.toString()] || 0,
      totalApplicationsCount: appCountMap[c._id.toString()] || 0,
      createdAt: c.createdAt,
    }));

    // Extract dynamic unique industries
    const availableIndustries = Array.from(
      new Set(companies.map((c) => c.industry).filter(Boolean))
    );

    // Filter by search
    if (search) {
      const q = search.trim().toLowerCase();
      companyList = companyList.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.officialEmail.toLowerCase().includes(q) ||
          c.hrName.toLowerCase().includes(q)
      );
    }

    // Filter by industry
    if (industry && industry !== "All") {
      companyList = companyList.filter(
        (c) => c.industry.toLowerCase() === industry.toLowerCase()
      );
    }

    // Filter by status
    if (status && status !== "All") {
      companyList = companyList.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      companies: companyList,
      total: companyList.length,
      availableIndustries,
      availableStatuses: ["Active", "Disabled"],
    });
  } catch (error) {
    console.error("Get all companies error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching companies",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET SINGLE COMPANY DETAILS
// ==========================================
const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate("userId", "name email role")
      .lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // 1. Fetch all placement drives belonging to this company
    const placementDrives = await PlacementDrive.find({ company: company._id })
      .sort({ createdAt: -1 })
      .lean();

    const driveIds = placementDrives.map((d) => d._id);

    // 2. Count applicants per placement drive
    const driveApplicantsCount = await Application.aggregate([
      { $match: { drive: { $in: driveIds } } },
      { $group: { _id: "$drive", count: { $sum: 1 } } },
    ]);
    const driveAppMap = {};
    driveApplicantsCount.forEach((item) => {
      if (item._id) driveAppMap[item._id.toString()] = item.count;
    });

    const drivesWithApplicants = placementDrives.map((d) => ({
      ...d,
      totalApplicants: driveAppMap[d._id.toString()] || 0,
    }));

    // 3. Fetch applications belonging to this company
    const applications = await Application.find({
      $or: [{ company: company._id }, { drive: { $in: driveIds } }],
    })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .populate("drive", "role package location")
      .sort({ createdAt: -1 })
      .lean();

    // Application statistics breakdown
    const applicationStats = {
      total: applications.length,
      applied: applications.filter((a) => a.status === "Applied").length,
      underReview: applications.filter((a) => a.status === "Under Review").length,
      shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
      interview: applications.filter((a) => a.status === "Interview").length,
      selected: applications.filter((a) => a.status === "Selected").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
    };

    // 4. Fetch interviews belonging to this company
    const interviews = await Interview.find({
      $or: [{ company: company._id }, { drive: { $in: driveIds } }],
    })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .populate("drive", "role package")
      .sort({ date: -1 })
      .lean();

    // Interview statistics breakdown
    const interviewStats = {
      total: interviews.length,
      upcoming: interviews.filter((i) =>
        ["Scheduled", "Rescheduled"].includes(i.status)
      ).length,
      completed: interviews.filter((i) => i.status === "Completed").length,
      cancelled: interviews.filter((i) => i.status === "Cancelled").length,
    };

    res.status(200).json({
      success: true,
      company: {
        _id: company._id,
        userId: company.userId,
        companyName: company.companyName,
        officialEmail: company.officialEmail || company.userId?.email || "N/A",
        hrName: company.hrName || "N/A",
        phone: company.phone || "N/A",
        industry: company.industry || "General / IT",
        location: company.location || "College Campus",
        website: company.website || "",
        linkedin: company.linkedin || "",
        description: company.description || "",
        logo: company.logo || "",
        isApproved: company.isApproved !== undefined ? company.isApproved : true,
        status: company.status || "Active",
        createdAt: company.createdAt,
      },
      placementDrives: drivesWithApplicants,
      applications,
      applicationStats,
      interviews,
      interviewStats,
    });
  } catch (error) {
    console.error("Get company details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching company details",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET COMPANY STATISTICS
// ==========================================
const getCompanyStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const placementDrives = await PlacementDrive.find({ company: company._id });
    const driveIds = placementDrives.map((d) => d._id);

    const applications = await Application.find({
      $or: [{ company: company._id }, { drive: { $in: driveIds } }],
    });

    const interviews = await Interview.find({
      $or: [{ company: company._id }, { drive: { $in: driveIds } }],
    });

    res.status(200).json({
      success: true,
      statistics: {
        drives: {
          total: placementDrives.length,
          active: placementDrives.filter((d) => d.status === "Active").length,
          closed: placementDrives.filter((d) => d.status === "Closed").length,
          completed: placementDrives.filter((d) => d.status === "Completed").length,
        },
        applications: {
          total: applications.length,
          applied: applications.filter((a) => a.status === "Applied").length,
          underReview: applications.filter((a) => a.status === "Under Review").length,
          shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
          interview: applications.filter((a) => a.status === "Interview").length,
          selected: applications.filter((a) => a.status === "Selected").length,
          rejected: applications.filter((a) => a.status === "Rejected").length,
        },
        interviews: {
          total: interviews.length,
          upcoming: interviews.filter((i) =>
            ["Scheduled", "Rescheduled"].includes(i.status)
          ).length,
          completed: interviews.filter((i) => i.status === "Completed").length,
          cancelled: interviews.filter((i) => i.status === "Cancelled").length,
        },
      },
    });
  } catch (error) {
    console.error("Get company statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching company statistics",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - UPDATE COMPANY STATUS (Enable / Disable)
// ==========================================
const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Disabled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values are 'Active' or 'Disabled'",
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.status = status;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Company status successfully updated to ${status}`,
      company,
    });
  } catch (error) {
    console.error("Update company status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating company status",
      error: error.message,
    });
  }
};

const approveCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isApproved = true;
    company.status = "Active";
    await company.save();

    res.status(200).json({
      success: true,
      message: "Company approved successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const rejectCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isApproved = false;
    company.status = "Disabled";
    await company.save();

    res.status(200).json({
      success: true,
      message: "Company approval removed",
      company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// HELPERS FOR STUDENT CATEGORIZATION
// ==========================================
const deriveAcademicYear = (academicYear, gradYear) => {
  if (
    academicYear &&
    ["1st Year", "2nd Year", "3rd Year", "4th Year"].includes(academicYear)
  ) {
    return academicYear;
  }
  const yearNum = Number(gradYear);
  if (!yearNum) return "3rd Year";
  if (yearNum <= 2026) return "4th Year";
  if (yearNum === 2027) return "3rd Year";
  if (yearNum === 2028) return "2nd Year";
  return "1st Year";
};

const matchesSkillCategory = (skills, category) => {
  if (!category || category === "All") return true;
  if (!skills || !Array.isArray(skills)) return category === "Other Skills";

  const skillLower = skills.map((sk) => String(sk).toLowerCase());
  const hasSkill = (keywords) =>
    keywords.some((kw) =>
      skillLower.some((s) => s.includes(kw.toLowerCase()))
    );

  switch (category) {
    case "Full Stack Developer":
      return hasSkill(["full stack", "fullstack", "mern", "mean"]);
    case "Frontend Developer":
      return hasSkill([
        "frontend",
        "front-end",
        "react",
        "vue",
        "angular",
        "html",
        "css",
        "next.js",
        "tailwind",
      ]);
    case "Backend Developer":
      return hasSkill([
        "backend",
        "back-end",
        "node",
        "express",
        "django",
        "spring boot",
        "fastapi",
        "flask",
      ]);
    case "Java Developer":
      return hasSkill(["java", "spring", "hibernate", "core java"]);
    case "Python Developer":
      return hasSkill(["python", "django", "flask", "fastapi", "pandas"]);
    case "AI/ML Developer":
      return hasSkill([
        "ai/ml",
        "ai / ml",
        "ai",
        "machine learning",
        "deep learning",
        "pytorch",
        "tensorflow",
        "nlp",
        "data science",
      ]);
    case "Data Analyst":
      return hasSkill([
        "data analyst",
        "data analytics",
        "data analysis",
        "powerbi",
        "power bi",
        "tableau",
        "sql",
      ]);
    case "Other Skills": {
      const known = [
        "full stack",
        "fullstack",
        "mern",
        "mean",
        "frontend",
        "front-end",
        "react",
        "vue",
        "angular",
        "html",
        "css",
        "backend",
        "back-end",
        "node",
        "express",
        "django",
        "spring boot",
        "java",
        "python",
        "ai",
        "ml",
        "machine learning",
        "deep learning",
        "data analyst",
        "powerbi",
        "tableau",
      ];
      return !hasSkill(known) || skills.length === 0;
    }
    default:
      return hasSkill([category]);
  }
};

const matchesBranchCategory = (studentBranch, branchFilter) => {
  if (!branchFilter || branchFilter === "All") return true;
  if (!studentBranch) return branchFilter === "Other Branches";

  const b = studentBranch.trim().toLowerCase();
  switch (branchFilter) {
    case "Computer Science":
      return (
        (b.includes("computer science") || b.includes("cse")) &&
        !b.includes("ai") &&
        !b.includes("ml")
      );
    case "CSE AI & ML":
      return (
        b.includes("ai & ml") ||
        b.includes("ai/ml") ||
        b.includes("ai and ml") ||
        b.includes("artificial intelligence")
      );
    case "IT":
      return b === "it" || b.includes("information technology");
    case "Other Branches":
      return (
        !b.includes("computer science") &&
        !b.includes("cse") &&
        !b.includes("ai") &&
        !b.includes("ml") &&
        b !== "it" &&
        !b.includes("information technology")
      );
    default:
      return b === branchFilter.toLowerCase();
  }
};

// ==========================================
// ADMIN - GET ALL REGISTERED STUDENTS
// ==========================================
const getAllStudents = async (req, res) => {
  try {
    const {
      search,
      branch,
      skillCategory,
      academicYear,
      passingYear,
      minCgpa,
      maxCgpa,
    } = req.query;

    // 1. Fetch all students with populated user
    let students = await Student.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Count applications efficiently using aggregation
    const appCounts = await Application.aggregate([
      {
        $group: {
          _id: "$student",
          count: { $sum: 1 },
        },
      },
    ]);

    const appCountMap = {};
    appCounts.forEach((item) => {
      if (item._id) {
        appCountMap[item._id.toString()] = item.count;
      }
    });

    // 3. Map students with academicYear, rollNumber, and profile details
    let studentList = students.map((s) => {
      const year = deriveAcademicYear(s.academicYear, s.graduationYear);
      return {
        _id: s._id,
        userId: s.userId?._id,
        name: s.userId?.name || "Student",
        email: s.userId?.email || "N/A",
        phone: s.phone || "N/A",
        branch: s.branch || "General",
        course: s.course || "B.Tech Computer Science",
        college: s.college || "College of Engineering",
        rollNumber: s.rollNumber || "N/A",
        graduationYear: s.graduationYear || 2027,
        academicYear: year,
        cgpa: s.cgpa !== undefined ? s.cgpa : 7.0,
        skills: s.skills || [],
        resume: s.resume || "",
        resumeOriginalName: s.resumeOriginalName || "",
        achievements: s.achievements || [],
        projects: s.projects || [],
        professionalLinks: s.professionalLinks || [],
        applicationsCount: appCountMap[s._id.toString()] || 0,
        profileStatus: "Active",
        createdAt: s.createdAt,
      };
    });

    // Compute dynamic categorization counts across all students
    const skillCategoryCounts = {
      "Full Stack Developer": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Full Stack Developer")
      ).length,
      "Frontend Developer": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Frontend Developer")
      ).length,
      "Backend Developer": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Backend Developer")
      ).length,
      "Java Developer": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Java Developer")
      ).length,
      "Python Developer": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Python Developer")
      ).length,
      "AI/ML Developer": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "AI/ML Developer")
      ).length,
      "Data Analyst": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Data Analyst")
      ).length,
      "Other Skills": studentList.filter((s) =>
        matchesSkillCategory(s.skills, "Other Skills")
      ).length,
    };

    const academicYearCounts = {
      "1st Year": studentList.filter((s) => s.academicYear === "1st Year").length,
      "2nd Year": studentList.filter((s) => s.academicYear === "2nd Year").length,
      "3rd Year": studentList.filter((s) => s.academicYear === "3rd Year").length,
      "4th Year": studentList.filter((s) => s.academicYear === "4th Year").length,
    };

    const branchCounts = {
      "Computer Science": studentList.filter((s) =>
        matchesBranchCategory(s.branch, "Computer Science")
      ).length,
      "CSE AI & ML": studentList.filter((s) =>
        matchesBranchCategory(s.branch, "CSE AI & ML")
      ).length,
      IT: studentList.filter((s) => matchesBranchCategory(s.branch, "IT")).length,
      "Other Branches": studentList.filter((s) =>
        matchesBranchCategory(s.branch, "Other Branches")
      ).length,
    };

    // Extract unique available branches and passing years for dropdowns
    const availableBranches = Array.from(
      new Set(students.map((s) => s.branch).filter(Boolean))
    );
    const availablePassingYears = Array.from(
      new Set(students.map((s) => s.graduationYear).filter(Boolean))
    ).sort((a, b) => a - b);

    // 4. Server-side filter support (supporting combining multiple filters)
    if (search) {
      const q = search.trim().toLowerCase();
      studentList = studentList.filter((s) => {
        const matchName = s.name.toLowerCase().includes(q);
        const matchEmail = s.email.toLowerCase().includes(q);
        const matchPhone = s.phone && s.phone.toLowerCase().includes(q);
        const matchRoll = s.rollNumber && s.rollNumber.toLowerCase().includes(q);
        const matchBranch = s.branch && s.branch.toLowerCase().includes(q);
        const matchYear =
          (s.academicYear && s.academicYear.toLowerCase().includes(q)) ||
          String(s.graduationYear).includes(q);
        const matchSkills =
          s.skills && s.skills.some((sk) => sk.toLowerCase().includes(q));
        return (
          matchName ||
          matchEmail ||
          matchPhone ||
          matchRoll ||
          matchBranch ||
          matchYear ||
          matchSkills
        );
      });
    }

    if (skillCategory && skillCategory !== "All") {
      studentList = studentList.filter((s) =>
        matchesSkillCategory(s.skills, skillCategory)
      );
    }

    if (academicYear && academicYear !== "All") {
      studentList = studentList.filter((s) => s.academicYear === academicYear);
    }

    if (branch && branch !== "All") {
      studentList = studentList.filter((s) =>
        matchesBranchCategory(s.branch, branch)
      );
    }

    if (passingYear && passingYear !== "All") {
      studentList = studentList.filter(
        (s) => String(s.graduationYear) === String(passingYear)
      );
    }

    if (minCgpa !== undefined && minCgpa !== "") {
      studentList = studentList.filter((s) => s.cgpa >= Number(minCgpa));
    }

    if (maxCgpa !== undefined && maxCgpa !== "") {
      studentList = studentList.filter((s) => s.cgpa < Number(maxCgpa));
    }

    res.status(200).json({
      success: true,
      students: studentList,
      total: studentList.length,
      availableBranches,
      availablePassingYears,
      skillCategoryCounts,
      academicYearCounts,
      branchCounts,
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET SINGLE STUDENT DETAILS
// ==========================================
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate(
      "userId",
      "name email role"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Fetch applications for this student
    const applications = await Application.find({
      $or: [{ student: student._id }, { student: student.userId?._id }],
    })
      .populate("company", "companyName logo location industry officialEmail")
      .populate(
        "drive",
        "role package location driveDate status applicationDeadline"
      )
      .sort({ createdAt: -1 });

    // Fetch interviews for this student
    const interviews = await Interview.find({
      $or: [{ student: student._id }, { student: student.userId?._id }],
    })
      .populate("company", "companyName logo location")
      .populate("drive", "role package")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        userId: student.userId,
        name: student.userId?.name || "Student",
        email: student.userId?.email || "N/A",
        phone: student.phone || "N/A",
        college: student.college || "College of Engineering",
        course: student.course || "B.Tech Computer Science",
        branch: student.branch || "General",
        rollNumber: student.rollNumber || "N/A",
        cgpa: student.cgpa !== undefined ? student.cgpa : 7.0,
        graduationYear: student.graduationYear || 2027,
        academicYear: deriveAcademicYear(
          student.academicYear,
          student.graduationYear
        ),
        skills: student.skills || [],
        resume: student.resume || "",
        resumeOriginalName: student.resumeOriginalName || "",
        achievements: student.achievements || [],
        projects: student.projects || [],
        professionalLinks: student.professionalLinks || [],
        profileStatus: "Active",
        createdAt: student.createdAt,
      },
      applications,
      interviews,
      totalApplications: applications.length,
      totalInterviews: interviews.length,
    });
  } catch (error) {
    console.error("Get student details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET ALL PLACEMENT DRIVES
// ==========================================
const getAllPlacementDrives = async (req, res) => {
  try {
    const { search, status, company, source } = req.query;

    const drives = await PlacementDrive.find()
      .populate("company", "companyName logo location officialEmail status hrName phone")
      .sort({ createdAt: -1 })
      .lean();

    // 1. Calculate applicant metrics for each drive in one aggregation
    const driveStats = await Application.aggregate([
      {
        $group: {
          _id: "$drive",
          totalApplicants: { $sum: 1 },
          shortlisted: {
            $sum: { $cond: [{ $eq: ["$status", "Shortlisted"] }, 1, 0] },
          },
          selected: {
            $sum: { $cond: [{ $eq: ["$status", "Selected"] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    driveStats.forEach((item) => {
      if (item._id) {
        statsMap[item._id.toString()] = item;
      }
    });

    // 2. Fetch all students once to calculate smart eligibility counts efficiently
    const allStudents = await Student.find().lean();

    // 3. Format drive list
    let driveList = drives.map((d) => {
      const stats = statsMap[d._id.toString()] || {};
      const eligibleCount = allStudents.filter((s) => {
        return evaluateStudentEligibility(s, d).isEligible;
      }).length;

      return {
        _id: d._id,
        company: d.company,
        companyName:
          d.company?.companyName || d.companyName || "Partner Company",
        companyLogo: d.company?.logo || "",
        companyLocation: d.company?.location || d.location || "Campus",
        companyEmail: d.company?.officialEmail || d.invitedCompanyEmail || "",
        role: d.role,
        package: d.package,
        jobType: d.jobType || "Full-Time",
        vacancies: d.vacancies || "Open",
        experience: d.experience || "Fresher",
        description: d.description || "",
        additionalInstructions: d.additionalInstructions || "",
        eligibility: d.eligibility || {},
        skills: d.skills || [],
        selectionProcess: d.selectionProcess || [],
        location: d.location || "College Campus",
        driveDate: d.driveDate,
        applicationDeadline: d.applicationDeadline,
        status: d.status || "Active",
        createdSource: d.createdSource || "company",
        createdBy: d.createdBy,
        rejectionReason: d.rejectionReason || "",
        changeRequests: d.changeRequests || "",
        applicantsCount: stats.totalApplicants || 0,
        shortlistedCount: stats.shortlisted || 0,
        selectedCount: stats.selected || 0,
        eligibleStudentsCount: eligibleCount,
        createdAt: d.createdAt,
      };
    });

    // Extract dynamic unique companies list for filter dropdown
    const availableCompanies = Array.from(
      new Set(
        drives
          .map((d) => d.company?.companyName || d.companyName)
          .filter(Boolean)
      )
    ).sort();

    // Search filter
    if (search) {
      const q = search.trim().toLowerCase();
      driveList = driveList.filter(
        (d) =>
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          (d.skills && d.skills.some((sk) => sk.toLowerCase().includes(q)))
      );
    }

    // Status filter
    if (status && status !== "All") {
      const statusLower = status.trim().toLowerCase();
      if (statusLower === "pending" || statusLower === "pending approval") {
        driveList = driveList.filter(
          (d) => d.status.toLowerCase() === "pending approval"
        );
      } else if (statusLower === "approved" || statusLower === "active") {
        driveList = driveList.filter(
          (d) =>
            d.status.toLowerCase() === "active" ||
            d.status.toLowerCase() === "approved"
        );
      } else {
        driveList = driveList.filter(
          (d) => d.status.toLowerCase() === statusLower
        );
      }
    }

    // Source filter (admin vs company)
    if (source && source !== "all") {
      driveList = driveList.filter(
        (d) => d.createdSource.toLowerCase() === source.toLowerCase()
      );
    }

    // Company filter
    if (company && company !== "All") {
      driveList = driveList.filter(
        (d) => d.companyName.toLowerCase() === company.toLowerCase()
      );
    }

    // Dynamic counts by tab
    const tabCounts = {
      all: drives.length,
      pending: drives.filter(
        (d) => d.status && d.status.toLowerCase() === "pending approval"
      ).length,
      approved: drives.filter(
        (d) =>
          d.status &&
          (d.status.toLowerCase() === "active" ||
            d.status.toLowerCase() === "approved")
      ).length,
      rejected: drives.filter(
        (d) => d.status && d.status.toLowerCase() === "rejected"
      ).length,
      completed: drives.filter(
        (d) =>
          d.status &&
          (d.status.toLowerCase() === "completed" ||
            d.status.toLowerCase() === "closed")
      ).length,
      adminCreated: drives.filter((d) => d.createdSource === "admin").length,
      companyCreated: drives.filter((d) => d.createdSource === "company").length,
    };

    res.status(200).json({
      success: true,
      drives: driveList,
      total: driveList.length,
      tabCounts,
      availableCompanies,
      availableStatuses: [
        "All",
        "Pending Approval",
        "Active",
        "Rejected",
        "Closed",
        "Completed",
      ],
    });
  } catch (error) {
    console.error("Get all placement drives error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching placement drives",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - CREATE PLACEMENT DRIVE ON BEHALF OF COMPANY
// ==========================================
const adminCreatePlacementDrive = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      officialEmail,
      hrName,
      phone,
      location,
      website,
      role,
      package: salaryPackage,
      jobType,
      vacancies,
      experience,
      description,
      additionalInstructions,
      eligibility,
      skills,
      selectionProcess,
      driveDate,
      applicationDeadline,
    } = req.body;

    if (!role || !salaryPackage || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Role, salary package, and application deadline are required.",
      });
    }

    let targetCompany = null;

    // 1. If existing company selected by ID
    if (companyId) {
      targetCompany = await Company.findById(companyId);
    }

    // 2. If company not selected or entered manually
    if (!targetCompany && companyName) {
      const trimmedName = companyName.trim();
      targetCompany = await Company.findOne({
        $or: [
          { companyName: new RegExp(`^${trimmedName}$`, "i") },
          ...(officialEmail
            ? [{ officialEmail: officialEmail.trim().toLowerCase() }]
            : []),
        ],
      });

      if (!targetCompany) {
        // Create new company document on behalf of company
        targetCompany = await Company.create({
          userId: null,
          companyName: trimmedName,
          officialEmail: officialEmail ? officialEmail.trim().toLowerCase() : "",
          hrName: hrName ? hrName.trim() : "",
          phone: phone ? phone.trim() : "",
          location: location ? location.trim() : "College Campus",
          website: website ? website.trim() : "",
          industry: "Technology",
          isApproved: true,
          status: "Active",
        });
      }
    }

    if (!targetCompany) {
      return res.status(400).json({
        success: false,
        message: "Please select an existing company or enter a new company name.",
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
      parsedSkills = skills.split(",").map((s) => s.trim()).filter(Boolean);
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

    // Admin created drives are published immediately upon saving (Active status)
    const drive = await PlacementDrive.create({
      company: targetCompany._id,
      companyName: targetCompany.companyName,
      invitedCompanyEmail: officialEmail || targetCompany.officialEmail || "",
      createdSource: "admin",
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
      location: location
        ? location.trim()
        : targetCompany.location || "College Campus",
      driveDate: driveDate ? new Date(driveDate) : undefined,
      applicationDeadline: new Date(applicationDeadline),
      status: "Active", // Published immediately
    });

    // Notify registered company user if company already has an account
    if (targetCompany.userId) {
      try {
        await Notification.create({
          userId: targetCompany.userId,
          sender: req.user._id,
          title: "New Placement Drive Created",
          message: `The Placement Cell has published a new placement drive for "${drive.role}" on your company's behalf.`,
          type: "drive",
          targetAudience: "individual",
        });
      } catch (notifErr) {
        console.warn("Failed to notify company of admin-created drive:", notifErr);
      }
    }

    // Smartly identify eligible students and notify them
    try {
      const allStudents = await Student.find().populate("userId", "name email");
      const eligibleStudents = allStudents.filter((s) => {
        const evalRes = evaluateStudentEligibility(s, drive);
        return evalRes.isEligible;
      });

      if (eligibleStudents.length > 0) {
        const studentNotifs = eligibleStudents
          .filter((s) => s.userId && s.userId._id)
          .map((s) => ({
            userId: s.userId._id,
            sender: req.user._id,
            title: `New Drive: ${drive.role} (${targetCompany.companyName})`,
            message: `A new placement drive has been posted by ${targetCompany.companyName} for "${drive.role}" with CTC ${drive.package}. You meet the eligibility criteria!`,
            type: "drive",
            targetAudience: "students",
          }));

        if (studentNotifs.length > 0) {
          await Notification.insertMany(studentNotifs);
        }
      }
    } catch (studentNotifErr) {
      console.warn("Failed to notify eligible students:", studentNotifErr);
    }

    res.status(201).json({
      success: true,
      message: `Placement drive created and published successfully on behalf of ${targetCompany.companyName}!`,
      drive,
    });
  } catch (error) {
    console.error("Admin create placement drive error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating placement drive on behalf of company",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - APPROVE PLACEMENT DRIVE
// ==========================================
const approvePlacementDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findById(id).populate("company");

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    drive.status = "Active";
    drive.rejectionReason = "";
    drive.changeRequests = "";
    await drive.save();

    // 1. Notify company
    if (drive.company && drive.company.userId) {
      try {
        await Notification.create({
          userId: drive.company.userId,
          sender: req.user._id,
          title: "Placement Drive Approved! 🎉",
          message: `Your placement drive for "${drive.role}" has been approved by the Placement Cell and is now live for eligible students.`,
          type: "drive",
          targetAudience: "individual",
        });
      } catch (err) {
        console.warn("Failed to notify company:", err);
      }
    }

    // 2. Smartly notify all eligible students
    try {
      const allStudents = await Student.find().populate("userId", "name email");
      const eligibleStudents = allStudents.filter((s) => {
        const evalRes = evaluateStudentEligibility(s, drive);
        return evalRes.isEligible;
      });

      if (eligibleStudents.length > 0) {
        const studentNotifs = eligibleStudents
          .filter((s) => s.userId && s.userId._id)
          .map((s) => ({
            userId: s.userId._id,
            sender: req.user._id,
            title: `New Opportunity: ${drive.role}`,
            message: `New campus placement drive approved: "${drive.role}" at ${
              drive.company?.companyName || drive.companyName || "Partner Company"
            }. Check your Placement Opportunities!`,
            type: "drive",
            targetAudience: "students",
          }));

        if (studentNotifs.length > 0) {
          await Notification.insertMany(studentNotifs);
        }
      }
    } catch (err) {
      console.warn("Failed to notify eligible students:", err);
    }

    res.status(200).json({
      success: true,
      message: `Placement drive for "${drive.role}" approved and published successfully!`,
      drive,
    });
  } catch (error) {
    console.error("Approve placement drive error:", error);
    res.status(500).json({
      success: false,
      message: "Server error approving placement drive",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - REJECT PLACEMENT DRIVE
// ==========================================
const rejectPlacementDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const drive = await PlacementDrive.findById(id).populate("company");

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    const reason = (
      rejectionReason || "Criteria or information requires revision"
    ).trim();
    drive.status = "Rejected";
    drive.rejectionReason = reason;
    await drive.save();

    // Notify company with rejection reason
    if (drive.company && drive.company.userId) {
      try {
        await Notification.create({
          userId: drive.company.userId,
          sender: req.user._id,
          title: `Drive Not Approved: ${drive.role}`,
          message: `Your placement drive submission for "${drive.role}" was not approved by the Placement Cell. Reason: ${reason}`,
          type: "drive",
          targetAudience: "individual",
        });
      } catch (err) {
        console.warn("Failed to notify company of rejection:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: `Placement drive rejected. Company has been notified with the reason.`,
      drive,
    });
  } catch (error) {
    console.error("Reject placement drive error:", error);
    res.status(500).json({
      success: false,
      message: "Server error rejecting placement drive",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - REQUEST CHANGES FROM COMPANY
// ==========================================
const requestDriveChanges = async (req, res) => {
  try {
    const { id } = req.params;
    const { changeRequests } = req.body;

    const drive = await PlacementDrive.findById(id).populate("company");

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    const requests = (
      changeRequests || "Please review and update drive requirements"
    ).trim();
    drive.status = "Pending Approval";
    drive.changeRequests = requests;
    await drive.save();

    // Notify company
    if (drive.company && drive.company.userId) {
      try {
        await Notification.create({
          userId: drive.company.userId,
          sender: req.user._id,
          title: `Changes Requested: ${drive.role}`,
          message: `The Placement Cell has requested revisions on your drive "${drive.role}": ${requests}`,
          type: "drive",
          targetAudience: "individual",
        });
      } catch (err) {
        console.warn("Failed to notify company of change request:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: `Change request sent to company successfully.`,
      drive,
    });
  } catch (error) {
    console.error("Request drive changes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error requesting drive changes",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - UPDATE PLACEMENT DRIVE DETAILS
// ==========================================
const updatePlacementDriveByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findById(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    const {
      role,
      package: salaryPackage,
      jobType,
      vacancies,
      experience,
      description,
      additionalInstructions,
      eligibility,
      skills,
      selectionProcess,
      location,
      driveDate,
      applicationDeadline,
      status,
    } = req.body;

    if (role) drive.role = role.trim();
    if (salaryPackage) drive.package = salaryPackage.trim();
    if (jobType) drive.jobType = jobType;
    if (vacancies) drive.vacancies = String(vacancies).trim();
    if (experience) drive.experience = experience.trim();
    if (description !== undefined) drive.description = description.trim();
    if (additionalInstructions !== undefined)
      drive.additionalInstructions = additionalInstructions.trim();
    if (location !== undefined) drive.location = location.trim();
    if (driveDate) drive.driveDate = new Date(driveDate);
    if (applicationDeadline)
      drive.applicationDeadline = new Date(applicationDeadline);
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
          .map((r) => r.trim())
          .filter(Boolean);
      }
    }

    await drive.save();

    res.status(200).json({
      success: true,
      message: "Placement drive details updated successfully.",
      drive,
    });
  } catch (error) {
    console.error("Update placement drive by admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating placement drive",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - DELETE PLACEMENT DRIVE
// ==========================================
const deletePlacementDriveByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findById(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    // Delete associated applications
    await Application.deleteMany({ drive: id });
    await PlacementDrive.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Placement drive "${drive.role}" and its applications deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete placement drive error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting placement drive",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - PREVIEW ELIGIBLE STUDENTS FOR A DRIVE
// ==========================================
const getDriveEligibleStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findById(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    const students = await Student.find()
      .populate("userId", "name email")
      .lean();

    const matchingStudents = students
      .map((s) => {
        const evalRes = evaluateStudentEligibility(s, drive);
        return {
          _id: s._id,
          name: s.userId?.name || "Student",
          email: s.userId?.email || "N/A",
          branch: s.branch,
          cgpa: s.cgpa,
          academicYear: helperDeriveAcademicYear(
            s.academicYear,
            s.graduationYear
          ),
          skills: s.skills || [],
          isEligible: evalRes.isEligible,
          reasons: evalRes.reasons,
          ineligibilityReason: evalRes.ineligibilityReason,
          breakdown: evalRes.breakdown,
        };
      })
      .filter((s) => s.isEligible);

    res.status(200).json({
      success: true,
      count: matchingStudents.length,
      eligibleStudents: matchingStudents,
    });
  } catch (error) {
    console.error("Get drive eligible students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching eligible students",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET SINGLE PLACEMENT DRIVE DETAILS
// ==========================================
const getAdminPlacementDriveDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await PlacementDrive.findById(id)
      .populate(
        "company",
        "companyName logo location officialEmail phone website industry description status"
      )
      .lean();

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    // Applications specifically for this drive
    const applications = await Application.find({ drive: drive._id })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const applicationStats = {
      total: applications.length,
      applied: applications.filter((a) => a.status === "Applied").length,
      underReview: applications.filter((a) => a.status === "Under Review").length,
      shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
      interview: applications.filter((a) => a.status === "Interview").length,
      selected: applications.filter((a) => a.status === "Selected").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
    };

    // Interviews specifically for this drive
    const interviews = await Interview.find({ drive: drive._id })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ date: -1 })
      .lean();

    const interviewStats = {
      total: interviews.length,
      upcoming: interviews.filter((i) =>
        ["Scheduled", "Rescheduled"].includes(i.status)
      ).length,
      completed: interviews.filter((i) => i.status === "Completed").length,
      cancelled: interviews.filter((i) => i.status === "Cancelled").length,
    };

    res.status(200).json({
      success: true,
      drive,
      applicationStats,
      applications,
      interviewStats,
      interviews,
    });
  } catch (error) {
    console.error("Get admin placement drive details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching drive details",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET DRIVE APPLICANTS
// ==========================================
const getAdminDriveApplicants = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await PlacementDrive.findById(id)
      .populate("company", "companyName logo")
      .lean();

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    const applications = await Application.find({ drive: drive._id })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const applicants = applications.map((app) => ({
      _id: app._id,
      studentId: app.student?._id,
      studentName:
        app.student?.userId?.name || app.student?.name || "Student",
      email: app.student?.userId?.email || "N/A",
      phone: app.student?.phone || "N/A",
      branch: app.student?.branch || "N/A",
      course: app.student?.course || "N/A",
      cgpa:
        app.student?.cgpa !== undefined
          ? app.student.cgpa
          : 7.0,
      appliedAt: app.appliedAt || app.createdAt,
      status: app.status,
      resume: app.student?.resume || "",
      resumeOriginalName: app.student?.resumeOriginalName || "",
    }));

    res.status(200).json({
      success: true,
      drive: {
        _id: drive._id,
        role: drive.role,
        package: drive.package,
        companyName: drive.company?.companyName || "Company",
        companyLogo: drive.company?.logo || "",
        status: drive.status,
      },
      applicants,
      total: applicants.length,
    });
  } catch (error) {
    console.error("Get admin drive applicants error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching drive applicants",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - CLOSE PLACEMENT DRIVE
// ==========================================
const closePlacementDriveByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const drive = await PlacementDrive.findById(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    drive.status = "Closed";
    await drive.save();

    res.status(200).json({
      success: true,
      message: "Placement drive closed successfully",
      drive,
    });
  } catch (error) {
    console.error("Close placement drive error:", error);
    res.status(500).json({
      success: false,
      message: "Server error closing placement drive",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET ALL APPLICATIONS
// ==========================================
const getAllApplications = async (req, res) => {
  try {
    const { search, status, companyId, driveId } = req.query;

    const applications = await Application.find()
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .populate("company", "companyName logo industry hrName officialEmail")
      .populate("drive", "role package driveDate applicationDeadline status")
      .sort({ createdAt: -1 })
      .lean();

    // Handle legacy documents that stored studentId or driveId instead of student / drive
    for (const a of applications) {
      if (!a.student && a.studentId) {
        a.student = await Student.findById(a.studentId)
          .populate("userId", "name email")
          .lean();
      }
      if (!a.drive && a.driveId) {
        a.drive = await PlacementDrive.findById(a.driveId).lean();
      }
      if (!a.company && a.drive?.company) {
        a.company = await Company.findById(a.drive.company).lean();
      }
    }

    // Map interview statuses for each application
    const appIds = applications.map((a) => a._id);
    const interviews = await Interview.find({
      $or: [
        { application: { $in: appIds } },
        {
          $or: applications.map((a) => ({
            student: a.student?._id || a.studentId,
            drive: a.drive?._id || a.driveId,
          })),
        },
      ],
    })
      .select("application student drive status date time mode interviewerName")
      .lean();

    const interviewMap = {};
    interviews.forEach((inv) => {
      if (inv.application) {
        interviewMap[inv.application.toString()] = inv;
      }
      if (inv.student && inv.drive) {
        interviewMap[`${inv.student.toString()}_${inv.drive.toString()}`] = inv;
      }
    });

    // Helper to normalize status capitalization
    const normalizeStatus = (raw) => {
      if (!raw) return "Applied";
      const s = raw.trim().toLowerCase();
      if (s === "applied") return "Applied";
      if (s === "under review") return "Under Review";
      if (s === "shortlisted") return "Shortlisted";
      if (s === "interview") return "Interview";
      if (s === "selected") return "Selected";
      if (s === "rejected") return "Rejected";
      return raw;
    };

    // Summary statistics across all applications
    const stats = {
      total: applications.length,
      applied: applications.filter(
        (a) => normalizeStatus(a.status) === "Applied"
      ).length,
      underReview: applications.filter(
        (a) => normalizeStatus(a.status) === "Under Review"
      ).length,
      shortlisted: applications.filter(
        (a) => normalizeStatus(a.status) === "Shortlisted"
      ).length,
      interview: applications.filter(
        (a) => normalizeStatus(a.status) === "Interview"
      ).length,
      selected: applications.filter(
        (a) => normalizeStatus(a.status) === "Selected"
      ).length,
      rejected: applications.filter(
        (a) => normalizeStatus(a.status) === "Rejected"
      ).length,
    };

    // Extract dynamic available companies
    const companyMap = new Map();
    applications.forEach((a) => {
      if (a.company?._id && a.company?.companyName) {
        companyMap.set(a.company._id.toString(), {
          _id: a.company._id.toString(),
          name: a.company.companyName,
        });
      }
    });
    const availableCompanies = Array.from(companyMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Extract dynamic available placement drives
    const driveMap = new Map();
    applications.forEach((a) => {
      if (a.drive?._id && a.drive?.role) {
        driveMap.set(a.drive._id.toString(), {
          _id: a.drive._id.toString(),
          role: a.drive.role,
          companyId: a.company?._id ? a.company._id.toString() : "",
          companyName: a.company?.companyName || "Company",
        });
      }
    });
    const availableDrives = Array.from(driveMap.values()).sort((a, b) =>
      a.role.localeCompare(b.role)
    );

    // Format list
    let appList = applications.map((a) => {
      const studentId = a.student?._id || a.studentId;
      const driveIdVal = a.drive?._id || a.driveId;
      const interview =
        interviewMap[a._id.toString()] ||
        (studentId && driveIdVal
          ? interviewMap[`${studentId.toString()}_${driveIdVal.toString()}`]
          : null);

      const normStatus = normalizeStatus(a.status);

      return {
        _id: a._id,
        studentId: studentId ? studentId.toString() : "",
        studentName:
          a.student?.userId?.name || a.student?.name || "Student",
        studentEmail: a.student?.userId?.email || "N/A",
        studentPhone: a.student?.phone || "N/A",
        studentBranch: a.student?.branch || "N/A",
        studentCourse: a.student?.course || "N/A",
        studentCgpa:
          a.student?.cgpa !== undefined ? a.student.cgpa : 7.0,
        companyId: a.company?._id ? a.company._id.toString() : "",
        companyName: a.company?.companyName || "Company",
        companyLogo: a.company?.logo || "",
        companyIndustry: a.company?.industry || "General",
        driveId: driveIdVal ? driveIdVal.toString() : "",
        role: a.drive?.role || a.role || "N/A",
        package: a.drive?.package || "N/A",
        appliedAt: a.appliedAt || a.createdAt,
        status: normStatus,
        interviewStatus: interview
          ? interview.status
          : "No interview scheduled",
        interview: interview || null,
      };
    });

    // 1. Search filter: Student Name, Student Email, Company Name, Role
    if (search) {
      const q = search.trim().toLowerCase();
      appList = appList.filter(
        (a) =>
          a.studentName.toLowerCase().includes(q) ||
          a.studentEmail.toLowerCase().includes(q) ||
          a.companyName.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (status && status !== "All") {
      appList = appList.filter(
        (a) => a.status.toLowerCase() === status.toLowerCase()
      );
    }

    // 3. Company filter
    if (companyId && companyId !== "All") {
      appList = appList.filter((a) => a.companyId === companyId);
    }

    // 4. Drive filter
    if (driveId && driveId !== "All") {
      appList = appList.filter((a) => a.driveId === driveId);
    }

    res.status(200).json({
      success: true,
      applications: appList,
      total: appList.length,
      stats,
      availableCompanies,
      availableDrives,
      availableStatuses: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
      ],
    });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching applications",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET SINGLE APPLICATION DETAILS
// ==========================================
const getAdminApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let application = await Application.findById(id)
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .populate(
        "company",
        "companyName logo industry hrName officialEmail phone location"
      )
      .populate(
        "drive",
        "role package driveDate applicationDeadline status description skills eligibility location"
      )
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Placement application not found",
      });
    }

    // Handle legacy documents that stored studentId or driveId
    let studentDoc = application.student;
    if (!studentDoc && application.studentId) {
      studentDoc = await Student.findById(application.studentId)
        .populate("userId", "name email")
        .lean();
    }

    let driveDoc = application.drive;
    if (!driveDoc && application.driveId) {
      driveDoc = await PlacementDrive.findById(application.driveId).lean();
    }

    let companyDoc = application.company;
    if (!companyDoc && driveDoc?.company) {
      companyDoc = await Company.findById(driveDoc.company).lean();
    }

    const studentId =
      studentDoc?._id || application.studentId || application.student;
    const driveIdVal =
      driveDoc?._id || application.driveId || application.drive;

    // Query interview associated with this application or student + drive
    let interview = await Interview.findOne({
      $or: [
        { application: application._id },
        {
          student: studentId,
          drive: driveIdVal,
        },
      ],
    }).lean();

    // Normalize status (e.g. 'applied' -> 'Applied')
    let normStatus = application.status || "Applied";
    const s = normStatus.trim().toLowerCase();
    if (s === "applied") normStatus = "Applied";
    else if (s === "under review") normStatus = "Under Review";
    else if (s === "shortlisted") normStatus = "Shortlisted";
    else if (s === "interview") normStatus = "Interview";
    else if (s === "selected") normStatus = "Selected";
    else if (s === "rejected") normStatus = "Rejected";

    res.status(200).json({
      success: true,
      application: {
        _id: application._id,
        role: application.role || driveDoc?.role || "N/A",
        status: normStatus,
        appliedAt: application.appliedAt || application.createdAt,
        student: {
          _id: studentDoc?._id || studentId,
          name:
            studentDoc?.userId?.name ||
            studentDoc?.name ||
            "Student",
          email: studentDoc?.userId?.email || "N/A",
          phone: studentDoc?.phone || "N/A",
          branch: studentDoc?.branch || "N/A",
          course: studentDoc?.course || "N/A",
          cgpa:
            studentDoc?.cgpa !== undefined
              ? studentDoc.cgpa
              : 7.0,
          passingYear: studentDoc?.graduationYear || 2027,
          resume: studentDoc?.resume || "",
          resumeOriginalName:
            studentDoc?.resumeOriginalName || "",
        },
        company: companyDoc || {},
        drive: driveDoc || {},
        interview: interview || null,
      },
    });
  } catch (error) {
    console.error("Get admin application details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching application details",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - SHARE STUDENTS WITH COMPANY
// ==========================================
const shareStudentsWithCompany = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      companyEmail,
      hrName,
      subject,
      message,
      studentIds,
    } = req.body;

    if (!companyEmail || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify a company email and select at least one student profile.",
      });
    }

    // Verify students exist
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate("userId", "name email")
      .lean();

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid students found to share.",
      });
    }

    const shareRecord = await CompanyShare.create({
      company: companyId || null,
      companyName: companyName || "Company Partner",
      companyEmail: companyEmail.trim().toLowerCase(),
      hrName: hrName ? hrName.trim() : "",
      subject: subject ? subject.trim() : `Student Profiles Dispatch - ${companyName || "Placement Cell"}`,
      message: message ? message.trim() : "Please review the attached student profiles and resumes.",
      students: studentIds,
      sharedBy: req.user._id || req.user.userId,
      status: "Sent",
      deliveryNotes: `Successfully dispatched ${students.length} student candidate dossier(s) via Placement Cell.`,
    });

    // If company is registered with user, deliver in-app notification to company
    if (companyId) {
      const companyDoc = await Company.findById(companyId);
      if (companyDoc && companyDoc.userId) {
        await Notification.create({
          userId: companyDoc.userId,
          title: "New Candidate Profiles Shared",
          message: `The Placement Cell has recommended and shared ${students.length} student profile(s) with your organization.`,
          type: "general",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully shared ${students.length} student profile(s) with ${companyName || companyEmail}!`,
      share: shareRecord,
      sharedCount: students.length,
    });
  } catch (error) {
    console.error("Share students with company error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share student profiles",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET SHARED PROFILES HISTORY
// ==========================================
const getSharedProfilesHistory = async (req, res) => {
  try {
    const shares = await CompanyShare.find()
      .populate("company", "companyName logo location industry officialEmail hrName")
      .populate({
        path: "students",
        populate: { path: "userId", select: "name email" },
      })
      .populate("sharedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: shares.length,
      shares,
    });
  } catch (error) {
    console.error("Get shared profiles history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving share history",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - BROADCAST / TARGETED NOTIFICATIONS
// ==========================================
const sendAdminNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "general",
      targetAudience, // "all" | "student" | "selected" | "year" | "skill"
      studentId,
      studentIds,
      academicYear,
      skillCategory,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Please enter both a title and notification message.",
      });
    }

    let recipientUserIds = [];
    let targetCriteria = "All Students";

    if (targetAudience === "student" && studentId) {
      const student = await Student.findById(studentId);
      if (student && student.userId) {
        recipientUserIds = [student.userId];
        const studentUser = await User.findById(student.userId);
        targetCriteria = `Student: ${studentUser?.name || "Individual Student"}`;
      }
    } else if (
      targetAudience === "selected" &&
      Array.isArray(studentIds) &&
      studentIds.length > 0
    ) {
      const students = await Student.find({ _id: { $in: studentIds } }).select("userId");
      recipientUserIds = students.map((s) => s.userId).filter(Boolean);
      targetCriteria = `Selected Students (${recipientUserIds.length})`;
    } else if (targetAudience === "year" && academicYear) {
      targetCriteria = `Academic Year: ${academicYear}`;
      const allStudents = await Student.find().select("userId academicYear graduationYear");
      recipientUserIds = allStudents
        .filter((s) => deriveAcademicYear(s.academicYear, s.graduationYear) === academicYear)
        .map((s) => s.userId)
        .filter(Boolean);
    } else if (targetAudience === "skill" && skillCategory) {
      targetCriteria = `Technical Skill: ${skillCategory}`;
      const allStudents = await Student.find().select("userId skills");
      recipientUserIds = allStudents
        .filter((s) => matchesSkillCategory(s.skills, skillCategory))
        .map((s) => s.userId)
        .filter(Boolean);
    } else {
      // "all" students
      targetCriteria = "All Registered Students";
      const students = await Student.find().select("userId");
      recipientUserIds = students.map((s) => s.userId).filter(Boolean);
    }

    if (recipientUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students found matching your selected audience criteria.",
      });
    }

    // Deduplicate user IDs
    const uniqueUserIds = Array.from(
      new Set(recipientUserIds.map((id) => id.toString()))
    );

    // Bulk insert notifications
    const notificationDocs = uniqueUserIds.map((userId) => ({
      userId,
      title: title.trim(),
      message: message.trim(),
      type: ["application", "schedule", "general", "interview", "drive"].includes(type)
        ? type
        : "general",
      targetAudience: targetAudience || "all",
      targetCriteria,
      sender: req.user._id || req.user.userId,
      isRead: false,
    }));

    await Notification.insertMany(notificationDocs);

    // Log broadcast
    const log = await AdminNotificationLog.create({
      title: title.trim(),
      message: message.trim(),
      type: type || "general",
      targetAudience: targetAudience || "all",
      targetCriteria,
      recipientsCount: uniqueUserIds.length,
      sentBy: req.user._id || req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${uniqueUserIds.length} student(s)!`,
      recipientsCount: uniqueUserIds.length,
      log,
    });
  } catch (error) {
    console.error("Send admin notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dispatch notifications",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET NOTIFICATION HISTORY
// ==========================================
const getAdminNotificationHistory = async (req, res) => {
  try {
    const history = await AdminNotificationLog.find()
      .populate("sentBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get admin notification history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - DELETE NOTIFICATION HISTORY ITEM
// ==========================================
const deleteAdminNotificationHistory = async (req, res) => {
  try {
    await AdminNotificationLog.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Notification log removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET STUDENT COMPANY SUGGESTIONS
// ==========================================
const getCompanySuggestions = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    let suggestions = await CompanySuggestion.find(filter)
      .populate({
        path: "student",
        select: "branch course graduationYear cgpa rollNumber academicYear",
      })
      .populate("studentUser", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const q = search.trim().toLowerCase();
      suggestions = suggestions.filter(
        (s) =>
          s.companyName.toLowerCase().includes(q) ||
          s.jobRole.toLowerCase().includes(q) ||
          s.hrName.toLowerCase().includes(q) ||
          s.hrEmail.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          (s.studentUser?.name && s.studentUser.name.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error("Get company suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - REVIEW / UPDATE COMPANY SUGGESTION STATUS
// ==========================================
const updateCompanySuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending, Approved, or Rejected.",
      });
    }

    const suggestion = await CompanySuggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "Company suggestion not found",
      });
    }

    suggestion.status = status;
    if (adminNotes !== undefined) suggestion.adminNotes = adminNotes;
    suggestion.reviewedBy = req.user._id || req.user.userId;
    suggestion.reviewedAt = new Date();

    await suggestion.save();

    // Send notification to the recommending student
    if (suggestion.studentUser) {
      let notifMessage = `Your company suggestion for "${suggestion.companyName}" (${suggestion.jobRole}) has been reviewed by the Placement Cell. Status: ${status}.`;
      if (adminNotes) {
        notifMessage += ` Admin Note: ${adminNotes}`;
      }

      await Notification.create({
        userId: suggestion.studentUser,
        title: `Company Suggestion ${status}`,
        message: notifMessage,
        type: "general",
      });
    }

    res.status(200).json({
      success: true,
      message: `Company recommendation marked as ${status}!`,
      suggestion,
    });
  } catch (error) {
    console.error("Update company suggestion status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAdminProfile,
  getAllStudents,
  getStudentDetails,
  getAllCompanies,
  getCompanies: getAllCompanies,
  getCompanyDetails,
  getCompanyStatistics,
  updateCompanyStatus,
  approveCompany,
  rejectCompany,
  getAllPlacementDrives,
  getAdminPlacementDriveDetails,
  getAdminDriveApplicants,
  closePlacementDriveByAdmin,
  adminCreatePlacementDrive,
  approvePlacementDrive,
  rejectPlacementDrive,
  requestDriveChanges,
  updatePlacementDriveByAdmin,
  deletePlacementDriveByAdmin,
  getDriveEligibleStudents,
  getAllApplications,
  getAdminApplicationDetails,
  shareStudentsWithCompany,
  getSharedProfilesHistory,
  sendAdminNotification,
  getAdminNotificationHistory,
  deleteAdminNotificationHistory,
  getCompanySuggestions,
  updateCompanySuggestionStatus,
};