const Company = require("../models/Company");
const Student = require("../models/Student");
const User = require("../models/User");
const PlacementDrive = require("../models/PlacementDrive");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

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
// ADMIN - GET ALL REGISTERED STUDENTS
// ==========================================
const getAllStudents = async (req, res) => {
  try {
    const { search, branch, passingYear, minCgpa, maxCgpa } = req.query;

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

    // 3. Attach applicationCount and profileStatus ("Active")
    let studentList = students.map((s) => ({
      _id: s._id,
      name: s.userId?.name || "Student",
      email: s.userId?.email || "N/A",
      phone: s.phone || "N/A",
      branch: s.branch || "General",
      course: s.course || "B.Tech Computer Science",
      college: s.college || "College of Engineering",
      rollNumber: s.rollNumber || "N/A",
      graduationYear: s.graduationYear || 2027,
      cgpa: s.cgpa !== undefined ? s.cgpa : 7.0,
      skills: s.skills || [],
      resume: s.resume || "",
      resumeOriginalName: s.resumeOriginalName || "",
      applicationsCount: appCountMap[s._id.toString()] || 0,
      profileStatus: "Active",
      createdAt: s.createdAt,
    }));

    // Extract unique available branches and passing years from all students for dynamic filter dropdowns
    const availableBranches = Array.from(
      new Set(students.map((s) => s.branch).filter(Boolean))
    );
    const availablePassingYears = Array.from(
      new Set(students.map((s) => s.graduationYear).filter(Boolean))
    ).sort((a, b) => a - b);

    // 4. Server-side filter support if query params provided
    if (search) {
      const q = search.trim().toLowerCase();
      studentList = studentList.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.phone && s.phone.toLowerCase().includes(q))
      );
    }

    if (branch && branch !== "All") {
      studentList = studentList.filter(
        (s) => s.branch.toLowerCase() === branch.toLowerCase()
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
    const { search, status, company } = req.query;

    const drives = await PlacementDrive.find()
      .populate("company", "companyName logo location officialEmail status")
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

    // 2. Format drive list
    let driveList = drives.map((d) => {
      const stats = statsMap[d._id.toString()] || {};
      return {
        _id: d._id,
        company: d.company,
        companyName: d.company?.companyName || "Unknown Company",
        companyLogo: d.company?.logo || "",
        companyLocation: d.company?.location || "Campus",
        role: d.role,
        package: d.package,
        description: d.description || "",
        eligibility: d.eligibility || {},
        skills: d.skills || [],
        location: d.location || "College Campus",
        driveDate: d.driveDate,
        applicationDeadline: d.applicationDeadline,
        status: d.status || "Active",
        applicantsCount: stats.totalApplicants || 0,
        shortlistedCount: stats.shortlisted || 0,
        selectedCount: stats.selected || 0,
        createdAt: d.createdAt,
      };
    });

    // Extract dynamic unique companies list for filter dropdown
    const availableCompanies = Array.from(
      new Set(drives.map((d) => d.company?.companyName).filter(Boolean))
    ).sort();

    // Search filter
    if (search) {
      const q = search.trim().toLowerCase();
      driveList = driveList.filter(
        (d) =>
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (status && status !== "All") {
      driveList = driveList.filter(
        (d) => d.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Company filter
    if (company && company !== "All") {
      driveList = driveList.filter(
        (d) => d.companyName.toLowerCase() === company.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      drives: driveList,
      total: driveList.length,
      availableCompanies,
      availableStatuses: ["Active", "Closed", "Completed"],
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
  getAllApplications,
  getAdminApplicationDetails,
};