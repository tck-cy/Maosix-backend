const express = require("express");
const router = express.Router();
const { auth, restrictTo } = require("../middlewares/authMiddleware");
const {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  approvePurchase,
  completePurchase,
} = require("../controllers/purchaseController");

// Apply auth middleware to all purchase routes
router.use(auth);

// GET /api/purchases - Get all purchases
router.get("/", getAllPurchases);

// GET /api/purchases/:id - Get specific purchase
router.get("/:id", getPurchaseById);

// POST /api/purchases - Create new purchase (Managers and Directors)
router.post("/", restrictTo("director", "manager"), createPurchase);

// PUT /api/purchases/:id/approve - Approve purchase (Directors only)
router.put("/:id/approve", restrictTo("director"), approvePurchase);

// PUT /api/purchases/:id/complete - Mark purchase as completed
router.put("/:id/complete", completePurchase);

module.exports = router;
