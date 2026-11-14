const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Company = require("../models/Company");
const Student = require("../models/Student");


// Register User
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      companyName,
      officialEmail,
      hrName,
      phone,
      website,
      location,
      description,
      logo,
      industry,
    } = req.body;

    // Check required fields
    if ((!name && !companyName) || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    const effectiveName = (companyName || name).trim();
    const effectiveEmail = (officialEmail || email).trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({ email: effectiveEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email address",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: effectiveName,
      email: effectiveEmail,
      password: hashedPassword,
      role: role || "student",
    });

    // If company user, link or create matching Company profile
    if (user.role === "company") {
      // Check if Admin already created a placeholder Company with this email or name
      let company = await Company.findOne({
        $or: [
          { officialEmail: effectiveEmail },
          { companyName: effectiveName },
        ],
      });

      if (company) {
        // Link user to existing company record created by Admin
        company.userId = user._id;
        if (hrName) company.hrName = hrName.trim();
        if (phone) company.phone = phone.trim();
        if (website) company.website = website.trim();
        if (location) company.location = location.trim();
        if (description) company.description = description.trim();
        if (logo) company.logo = logo.trim();
        if (industry) company.industry = industry.trim();
        company.isApproved = true; // Was initiated by Admin, so mark approved
        await company.save();
      } else {
        // Create new company profile - self registered, requires admin approval
        company = await Company.create({
          userId: user._id,
          companyName: effectiveName,
          officialEmail: effectiveEmail,
          hrName: (hrName || name || effectiveName).trim(),
          phone: phone ? phone.trim() : "",
          website: website ? website.trim() : "",
          location: location ? location.trim() : "College Campus",
          description: description ? description.trim() : "",
          logo: logo ? logo.trim() : "",
          industry: industry ? industry.trim() : "Technology",
          isApproved: false, // Pending admin approval
          status: "Active",
        });
      }
    }

    // If student user, automatically create initial Student profile
    if (user.role === "student") {
      await Student.create({
        userId: user._id,
        phone: phone ? phone.trim() : "",
        college: "College of Engineering",
        branch: "CSE - AI & ML",
        course: "B.Tech Computer Science",
        academicYear: "3rd Year",
        cgpa: 7.0,
        graduationYear: 2027,
        backlogs: 0,
        skills: ["Full Stack Developer", "React.js", "Node.js", "MongoDB"],
      });
    }

    res.status(201).json({
      message:
        user.role === "company"
          ? "Company registered successfully! Your account has been submitted for placement cell approval."
          : "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check company status & approval
    let companyInfo = null;
    if (user.role === "company") {
      const company = await Company.findOne({ userId: user._id });
      if (company && company.status === "Disabled") {
        return res.status(403).json({
          message:
            "Company account is disabled. Please contact the placement administrator.",
        });
      }
      companyInfo = company;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: companyInfo ? companyInfo.isApproved : true,
        companyName: companyInfo ? companyInfo.companyName : user.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      adminUser = await User.create({
        name: "Placement Cell Admin",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });
    }

    const token = jwt.sign(
      {
        userId: adminUser._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  adminLogin,
};