const { User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
    });
    res.status(200).json(new ApiResponse(users));
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });
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

exports.createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      department,
    } = req.body;

    const user = await User.create({
      username,
      email,
      password_hash: bcrypt.hashSync(password, 10),
      first_name,
      last_name,
      role,
      department,
    });

    logger.info(`User ${user.id} created by ${req.user.id}`);
    res.status(201).json(new ApiResponse(user));
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(null, "User not found", false));
    }

    const { first_name, last_name, department } = req.body;
    await user.update({ first_name, last_name, department });

    logger.info(`User ${user.id} updated by ${req.user.id}`);
    res.status(200).json(new ApiResponse(user));
  } catch (err) {
    next(err);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(null, "User not found", false));
    }

    await user.update({ is_active: false });
    logger.info(`User ${user.id} deactivated by ${req.user.id}`);
    res.status(200).json(new ApiResponse(null, "User deactivated"));
  } catch (err) {
    next(err);
  }
};
