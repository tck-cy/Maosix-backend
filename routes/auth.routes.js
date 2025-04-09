const express = require("express");
const router = express.Router();
const { login, getCurrentUser } = require("../controllers/authController");

// POST /api/auth/login - User login
router.post("/login", login);

// GET /api/auth/me - Get current user data
router.get("/me", getCurrentUser);

module.exports = router;
