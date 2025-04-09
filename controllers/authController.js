const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Find user
    const user = await User.scope("withPassword").findOne({
      where: { username },
    });
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(null, "Invalid credentials", false));
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json(new ApiResponse(null, "Invalid credentials", false));
    }

    // 3. Check if active
    if (!user.is_active) {
      return res
        .status(403)
        .json(new ApiResponse(null, "Account inactive", false));
    }

    // 4. Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5. Update last login
    user.last_login = new Date();
    await user.save();

    logger.info(`User ${user.username} logged in`);

    // 6. Send response
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

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });
    res.status(200).json(new ApiResponse(user));
  } catch (err) {
    next(err);
  }
};
