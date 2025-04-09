const app = require("./app");
const { port } = require("./config/config").development;

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 15; // Increase from default 10

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
