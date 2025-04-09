const express = require("express");
const router = express.Router();
const {
  auth,
  restrictTo,
  departmentRestrict,
} = require("../middlewares/authMiddleware");
const {
  getAllProcedures,
  getDepartmentProcedures,
  createProcedure,
  updateProcedure,
  approveProcedureVersion,
} = require("../controllers/procedureController");

// Public routes (read-only)
router.get("/", getAllProcedures);
router.get("/:department", getDepartmentProcedures);

// Protected routes
router.use(auth);

// Department-specific access
router.post(
  "/",
  departmentRestrict("coffee", "dairy", "apiary", "poultry"),
  createProcedure
);

router.put(
  "/:id",
  departmentRestrict("coffee", "dairy", "apiary", "poultry"),
  updateProcedure
);

// Approval route for managers and directors
router.post(
  "/versions/:versionId/approve",
  restrictTo("director", "manager"),
  approveProcedureVersion
);

module.exports = router;
