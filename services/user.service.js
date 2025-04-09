const { User } = require("../models");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class UserService {
  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ["password_hash"] },
    });
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) throw new ApiError(404, "User not found");
    return user;
  }

  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return await User.create({
      ...userData,
      password_hash: hashedPassword,
    });
  }

  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) throw new ApiError(404, "User not found");

    await user.update(updateData);
    logger.info(`User ${id} updated`);
    return user;
  }

  async deactivateUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new ApiError(404, "User not found");

    await user.update({ is_active: false });
    logger.info(`User ${id} deactivated`);
    return user;
  }
}

module.exports = new UserService();
