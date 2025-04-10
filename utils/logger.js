const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logToFile = (level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;

  fs.appendFileSync(path.join(logDir, "app.log"), logMessage);

  // Also log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log(logMessage.trim());
  }
};

module.exports = {
  info: (message) => logToFile("info", message),
  error: (message) => logToFile("error", message),
  warn: (message) => logToFile("warn", message),
};
