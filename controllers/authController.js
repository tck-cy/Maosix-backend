const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.scope("withPassword").findOne({
      where: { username },
    });
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(null, "Invalid credentials", false));
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json(new ApiResponse(null, "Invalid credentials", false));
    }

    // Check if user is active
    if (!user.is_active) {
      return res
        .status(403)
        .json(new ApiResponse(null, "Account is inactive", false));
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Log successful login
    logger.info(`User ${user.username} logged in`);

    // Send response with token
    res.status(200).json(
      new ApiResponse({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          department: user.department,
        },
        token,
      })
    );
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(null, "User not found", false));
    }
    res.status(200).json(new ApiResponse(user));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getCurrentUser,
};
