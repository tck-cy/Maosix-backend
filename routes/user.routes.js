const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} = require("../controllers/userController");

console.log({
  getAllUsers: typeof getAllUsers, // Should be "function"
  getUserById: typeof getUserById, // Should be "function"
  createUser: typeof createUser, // Should be "function"
  updateUser: typeof updateUser, // Should be "function"
  deactivateUser: typeof deactivateUser, // Should be "function"
});
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

// module.exports = {
//   getAllUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   deactivateUser,
// };

module.exports = router;
