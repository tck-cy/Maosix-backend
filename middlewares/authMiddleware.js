const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/apiResponse");
const { User } = require("../models");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(null, "Not authorized", false));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res
        .status(401)
        .json(new ApiResponse(null, "User no longer exists", false));
    }

    // Check if user is active
    if (!currentUser.is_active) {
      return res
        .status(401)
        .json(new ApiResponse(null, "User account is inactive", false));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json(new ApiResponse(null, "Not authorized", false));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            null,
            "You do not have permission to perform this action",
            false
          )
        );
    }
    next();
  };
};

const departmentRestrict = (...departments) => {
  return (req, res, next) => {
    if (
      req.user.role !== "director" &&
      !departments.includes(req.user.department)
    ) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            null,
            "You do not have permission to access this department data",
            false
          )
        );
    }
    next();
  };
};

exports.auth = (req, res, next) => {
  /*...*/
};
exports.restrictTo = (...roles) => {
  /*...*/
};

module.exports = {
  auth,
  restrictTo,
  departmentRestrict,
};
