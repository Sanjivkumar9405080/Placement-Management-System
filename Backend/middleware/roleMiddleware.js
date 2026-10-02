const Company = require("../models/Company");

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      if (req.user.role === "company") {
        const company = await Company.findOne({
          userId: req.user._id || req.user.userId,
        });
        if (company && company.status === "Disabled") {
          return res.status(403).json({
            success: false,
            message:
              "Company account is disabled. Please contact the placement administrator.",
          });
        }
      }

      next();
    } catch (error) {
      console.error("authorizeRoles middleware error:", error);
      return res.status(500).json({
        message: "Server authorization error",
        error: error.message,
      });
    }
  };
};

module.exports = { authorizeRoles };