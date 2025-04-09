const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} = require("../controllers/userController");
const { auth, restrictTo } = require("../middlewares/authMiddleware");

// Apply auth middleware to all routes
router.use(auth);

// GET /api/users - Get all users (Directors only)
router.get("/", restrictTo("director"), getAllUsers);

// GET /api/users/:id - Get specific user
router.get("/:id", getUserById);

// POST /api/users - Create new user (Directors only)
router.post("/", restrictTo("director"), createUser);

// PUT /api/users/:id - Update user
router.put("/:id", updateUser);

// DELETE /api/users/:id - Deactivate user (Directors only)
router.delete("/:id", restrictTo("director"), deactivateUser);

module.exports = router;
