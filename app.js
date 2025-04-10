const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

// Sync models with database
if (process.env.NODE_ENV === "development") {
  sequelize
    .sync({ alter: true })
    .then(() => console.log("Database synced"))
    .catch((err) => console.error("Database sync error:", err));
}

// Routes
// app.use("/api/auth", routes.auth);
// app.use("/api/users", routes.users);
// app.use("/api/procedures", routes.procedures);
// app.use("/api/purchases", routes.purchases);
app.use("/api", routes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
