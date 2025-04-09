const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class AuthService {
  async login(username, password) {
    const user = await User.scope("withPassword").findOne({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.is_active) {
      throw new ApiError(403, "Account inactive");
    }

    const token = this.generateToken(user);
    await this.updateLastLogin(user.id);

    logger.info(`User ${user.id} logged in`);
    return { user, token };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  async updateLastLogin(userId) {
    await User.update({ last_login: new Date() }, { where: { id: userId } });
  }

  async getCurrentUser(userId) {
    return await User.findByPk(userId, {
      attributes: { exclude: ["password_hash"] },
    });
  }
}

module.exports = new AuthService();
