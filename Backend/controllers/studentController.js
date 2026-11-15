const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");
const Student = require("../models/Student");
const User = require("../models/User");
const CompanySuggestion = require("../models/CompanySuggestion");

// Ensure Cloudinary is configured with environment variables
const ensureCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials are not configured. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in environment variables."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
};

// Helper: Upload buffer to Cloudinary using raw resource type for PDF
const uploadBufferToCloudinary = (buffer, originalname) => {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const rawBaseName = (originalname || "resume")
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${Date.now()}_${rawBaseName}.pdf`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "placement_resumes",
        resource_type: "raw",
        public_id: uniqueFileName,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result || (!result.secure_url && !result.url)) {
          return reject(
            new Error("Cloudinary did not return a valid file URL.")
          );
        }
        resolve({
          secure_url: result.secure_url || result.url,
          public_id: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// Helper: Get or create student for user (Self-Healing)
const getOrCreateStudent = async (userId) => {
  let student = await Student.findOne({
    $or: [{ userId }, { userId: userId.toString() }],
  }).populate("userId", "name email role");

  if (!student) {
    const user = await User.findById(userId);
    student = await Student.create({
      userId,
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
      "name email role"
    );
  }

  return student;
};

// Create Student Profile
const createProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user._id;

    const existingProfile = await Student.findOne({
      userId: currentUserId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Student profile already exists",
      });
    }

    const {
      phone,
      college,
      branch,
      course,
      academicYear,
      rollNumber,
      cgpa,
      graduationYear,
      skills,
      resume,
      achievements,
      projects,
      professionalLinks,
    } = req.body;

    const student = await Student.create({
      userId: currentUserId,
      phone: phone || "",
      college: college || "College of Engineering",
      branch: branch || "CSE - AI & ML",
      academicYear: academicYear || "3rd Year",
      course: course || "B.Tech Computer Science",
      rollNumber: rollNumber || "",
      cgpa: cgpa !== undefined ? Number(cgpa) : 7.0,
      graduationYear: graduationYear ? Number(graduationYear) : 2027,
      skills: Array.isArray(skills) ? skills : [],
      resume: resume || "",
      resumeOriginalName: req.body.resumeOriginalName || "",
      resumePublicId: req.body.resumePublicId || "",
      achievements: Array.isArray(achievements) ? achievements : [],
      projects: Array.isArray(projects) ? projects : [],
      professionalLinks: Array.isArray(professionalLinks)
        ? professionalLinks
        : [],
    });

    const populatedStudent = await Student.findById(student._id).populate(
      "userId",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      student: populatedStudent,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Profile (Self-Healing)
const getMyProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user._id;
    const student = await getOrCreateStudent(currentUserId);

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update My Profile
const updateProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user._id;
    const student = await getOrCreateStudent(currentUserId);

    const {
      name,
      phone,
      college,
      branch,
      course,
      academicYear,
      rollNumber,
      cgpa,
      graduationYear,
      skills,
      resume,
      resumeOriginalName,
      achievements,
      projects,
      professionalLinks,
    } = req.body;

    // Update user name in User model if provided
    if (name && student.userId) {
      await User.findByIdAndUpdate(currentUserId, { name });
    }

    if (phone !== undefined) student.phone = phone;
    if (college !== undefined) student.college = college;
    if (branch !== undefined) student.branch = branch;
    if (academicYear !== undefined) student.academicYear = academicYear;
    if (course !== undefined) student.course = course;
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (graduationYear !== undefined)
      student.graduationYear = Number(graduationYear);
    if (skills !== undefined) student.skills = skills;
    if (resume !== undefined) student.resume = resume;
    if (resumeOriginalName !== undefined)
      student.resumeOriginalName = resumeOriginalName;
    if (req.body.resumePublicId !== undefined)
      student.resumePublicId = req.body.resumePublicId;
    if (achievements !== undefined) student.achievements = achievements;
    if (projects !== undefined) student.projects = projects;
    if (professionalLinks !== undefined)
      student.professionalLinks = professionalLinks;

    await student.save();

    const updatedStudent = await Student.findById(student._id).populate(
      "userId",
      "name email role"
    );

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Upload Resume Handler
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded. Please select a PDF file.",
      });
    }

    // Validate PDF mime type and extension
    const isPdfMime = req.file.mimetype === "application/pdf";
    const isPdfExt =
      req.file.originalname &&
      req.file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      return res.status(400).json({
        success: false,
        message:
          "Only PDF files are allowed. Please upload a valid PDF document.",
      });
    }

    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Resume size should be less than 5 MB.",
      });
    }

    const currentUserId = req.user.userId || req.user._id;
    const student = await getOrCreateStudent(currentUserId);

    // Upload from memory buffer to Cloudinary with raw resource type
    let uploadResult;
    try {
      uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
    } catch (cloudErr) {
      console.error("Cloudinary upload failed:", cloudErr);
      return res.status(502).json({
        success: false,
        message: `Failed to upload resume to Cloudinary: ${
          cloudErr.message || "Upload error"
        }`,
      });
    }

    // If student had a previous resume public_id, attempt cleanup in Cloudinary
    if (student.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(student.resumePublicId, {
          resource_type: "raw",
        });
      } catch (delErr) {
        console.warn(
          "Could not remove previous Cloudinary resume:",
          delErr.message
        );
      }
    }

    // Store returned secure_url and public_id in the Student MongoDB document
    student.resume = uploadResult.secure_url;
    student.resumeOriginalName = req.file.originalname;
    student.resumePublicId = uploadResult.public_id;
    await student.save();

    const updatedStudent = await Student.findById(student._id).populate(
      "userId",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully!",
      resume: uploadResult.secure_url,
      resumeOriginalName: req.file.originalname,
      resumePublicId: uploadResult.public_id,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume. " + error.message,
    });
  }
};

// Suggest a Company (Student)
const suggestCompany = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user._id;
    const student = await getOrCreateStudent(currentUserId);

    const {
      companyName,
      website,
      hrName,
      hrEmail,
      contactNumber,
      jobRole,
      jobDescription,
      location,
      salaryPackage,
      additionalInfo,
    } = req.body;

    // Validate required fields
    if (
      !companyName ||
      !website ||
      !hrName ||
      !hrEmail ||
      !jobRole ||
      !jobDescription ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields: Company Name, Website, HR Name, HR Email, Job Role, Job Description, and Location.",
      });
    }

    const suggestion = await CompanySuggestion.create({
      student: student._id,
      studentUser: currentUserId,
      companyName: companyName.trim(),
      website: website.trim(),
      hrName: hrName.trim(),
      hrEmail: hrEmail.trim(),
      contactNumber: contactNumber ? contactNumber.trim() : "",
      jobRole: jobRole.trim(),
      jobDescription: jobDescription.trim(),
      location: location.trim(),
      salaryPackage: salaryPackage ? salaryPackage.trim() : "",
      additionalInfo: additionalInfo ? additionalInfo.trim() : "",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Company recommendation submitted successfully for Admin review!",
      suggestion,
    });
  } catch (error) {
    console.error("Suggest company error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Suggested Companies (Student)
const getMySuggestedCompanies = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user._id;
    const suggestions = await CompanySuggestion.find({
      studentUser: currentUserId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error("Get my suggested companies error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  uploadResume,
  getOrCreateStudent,
  suggestCompany,
  getMySuggestedCompanies,
};