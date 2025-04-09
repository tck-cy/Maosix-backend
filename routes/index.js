const express = require("express");
const router = express.Router();

// Import route files
const authRouter = require("./auth.routes");
const userRouter = require("./user.routes");
const procedureRouter = require("./procedure.routes");
const purchaseRouter = require("./purchase.routes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Mount routers
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/procedures", procedureRouter);
router.use("/purchases", purchaseRouter);

module.exports = router;
