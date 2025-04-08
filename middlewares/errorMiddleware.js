const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  logger.error(err.stack);

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((error) => error.message);
    return res
      .status(400)
      .json(new ApiResponse(null, messages.join(", "), false));
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const messages = err.errors.map((error) => error.message);
    return res
      .status(400)
      .json(new ApiResponse(null, messages.join(", "), false));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(new ApiResponse(null, "Not authorized", false));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(new ApiResponse(null, "Token expired", false));
  }

  // Default to 500 server error
  res
    .status(error.statusCode || 500)
    .json(new ApiResponse(null, error.message || "Server Error", false));
};

module.exports = errorHandler;
