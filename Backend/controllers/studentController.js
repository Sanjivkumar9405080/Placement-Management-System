const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2;
const Student = require("../models/Student");
const User = require("../models/User");

// Configure Cloudinary if credentials are present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Helper: Upload buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const cleanName = (originalname || "resume")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "placement_resumes",
        resource_type: "auto",
        public_id: `${Date.now()}_${cleanName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || result?.url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// Helper: Save buffer locally as fallback
const saveBufferLocally = (buffer, originalname) => {
  const uploadsDir = path.join(__dirname, "..", "uploads", "resumes");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const cleanName = (originalname || "resume.pdf").replace(
    /[^a-zA-Z0-9.-]/g,
    "_"
  );
  const fileName = `${Date.now()}-${cleanName}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, buffer);
  return `http://localhost:5000/uploads/resumes/${fileName}`;
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
      course: course || "B.Tech Computer Science",
      rollNumber: rollNumber || "",
      cgpa: cgpa !== undefined ? Number(cgpa) : 7.0,
      graduationYear: graduationYear ? Number(graduationYear) : 2027,
      skills: Array.isArray(skills) ? skills : [],
      resume: resume || "",
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
    if (course !== undefined) student.course = course;
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (graduationYear !== undefined)
      student.graduationYear = Number(graduationYear);
    if (skills !== undefined) student.skills = skills;
    if (resume !== undefined) student.resume = resume;
    if (resumeOriginalName !== undefined)
      student.resumeOriginalName = resumeOriginalName;
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

    const currentUserId = req.user.userId || req.user._id;
    const student = await getOrCreateStudent(currentUserId);

    let resumeUrl = "";

    // 1. Try Cloudinary first
    try {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        resumeUrl = await uploadBufferToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed, falling back to local disk:", cloudErr.message);
    }

    // 2. Fall back to local disk storage if Cloudinary not used or failed
    if (!resumeUrl) {
      resumeUrl = saveBufferLocally(req.file.buffer, req.file.originalname);
    }

    // 3. Update student model
    student.resume = resumeUrl;
    student.resumeOriginalName = req.file.originalname;
    await student.save();

    const updatedStudent = await Student.findById(student._id).populate(
      "userId",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully!",
      resume: resumeUrl,
      resumeOriginalName: req.file.originalname,
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

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  uploadResume,
  getOrCreateStudent,
};