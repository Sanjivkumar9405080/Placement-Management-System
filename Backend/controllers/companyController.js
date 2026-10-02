const Company = require("../models/Company");
const User = require("../models/User");

// ==========================================
// CREATE COMPANY PROFILE
// ==========================================
const createProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const {
      companyName,
      officialEmail,
      hrName,
      phone,
      industry,
      location,
      website,
      linkedin,
      description,
      logo,
    } = req.body;

    const existingProfile = await Company.findOne({
      $or: [{ userId: userId }, { userId: req.user.userId }],
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Company profile already exists",
      });
    }

    const company = await Company.create({
      userId,
      companyName,
      officialEmail,
      hrName,
      phone,
      industry,
      location: location || "College Campus",
      website,
      linkedin,
      description,
      logo,
      isApproved: true,
    });

    res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      company,
    });
  } catch (error) {
    console.error("Create Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating profile",
      error: error.message,
    });
  }
};

// ==========================================
// GET COMPANY PROFILE (Self-healing if missing)
// ==========================================
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;

    let company = await Company.findOne({
      $or: [{ userId: userId }, { userId: req.user.userId }],
    }).populate("userId", "name email role");

    // Self-healing: If user has role="company" but Company doc doesn't exist yet, auto-create it
    if (!company) {
      const user = await User.findById(userId);
      if (user && user.role === "company") {
        company = await Company.create({
          userId: user._id,
          companyName: user.name || "Company",
          officialEmail: user.email,
          hrName: user.name,
          location: "College Campus",
          isApproved: true,
        });

        company = await Company.findById(company._id).populate(
          "userId",
          "name email role"
        );
      } else {
        return res.status(404).json({
          success: false,
          message: "Company profile not found",
        });
      }
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get Company Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching company profile",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE COMPANY PROFILE
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;

    let company = await Company.findOne({
      $or: [{ userId: userId }, { userId: req.user.userId }],
    });

    // If company doesn't exist, create it
    if (!company) {
      const user = await User.findById(userId);
      company = await Company.create({
        userId: user ? user._id : userId,
        companyName: req.body.companyName || user?.name || "Company",
        officialEmail: req.body.officialEmail || user?.email,
        hrName: req.body.hrName || user?.name,
        location: req.body.location || "College Campus",
        isApproved: true,
      });
    }

    const {
      companyName,
      officialEmail,
      hrName,
      phone,
      industry,
      location,
      website,
      linkedin,
      description,
      logo,
    } = req.body;

    if (companyName !== undefined) company.companyName = companyName.trim();
    if (officialEmail !== undefined) company.officialEmail = officialEmail.trim();
    if (hrName !== undefined) company.hrName = hrName.trim();
    if (phone !== undefined) company.phone = phone.trim();
    if (industry !== undefined) company.industry = industry.trim();
    if (location !== undefined) company.location = location.trim();
    if (website !== undefined) company.website = website.trim();
    if (linkedin !== undefined) company.linkedin = linkedin.trim();
    if (description !== undefined) company.description = description.trim();
    if (logo !== undefined) company.logo = logo.trim();

    await company.save();

    const populatedCompany = await Company.findById(company._id).populate(
      "userId",
      "name email role"
    );

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      company: populatedCompany,
    });
  } catch (error) {
    console.error("Update Company Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating company profile",
      error: error.message,
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
};