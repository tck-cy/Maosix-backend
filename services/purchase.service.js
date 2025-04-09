const { Purchase } = require("../models");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class PurchaseService {
  async getAllPurchases() {
    return await Purchase.findAll({
      include: ["requester", "approver"],
    });
  }

  async getPurchaseById(id) {
    const purchase = await Purchase.findByPk(id, {
      include: ["requester", "approver"],
    });
    if (!purchase) throw new ApiError(404, "Purchase not found");
    return purchase;
  }

  async createPurchase(purchaseData, userId) {
    const purchase = await Purchase.create({
      ...purchaseData,
      requester_id: userId,
    });
    logger.info(`Purchase ${purchase.id} created by ${userId}`);
    return purchase;
  }

  async approvePurchase(purchaseId, userId, approvedAmount) {
    const purchase = await Purchase.findByPk(purchaseId);
    if (!purchase) throw new ApiError(404, "Purchase not found");

    await purchase.update({
      status: "approved",
      approved_by: userId,
      approved_amount: approvedAmount || purchase.amount,
      approved_at: new Date(),
    });

    logger.info(`Purchase ${purchaseId} approved by ${userId}`);
    return purchase;
  }

  async completePurchase(purchaseId, notes) {
    const purchase = await Purchase.findByPk(purchaseId);
    if (!purchase) throw new ApiError(404, "Purchase not found");

    await purchase.update({
      status: "completed",
      completion_notes: notes,
    });

    logger.info(`Purchase ${purchaseId} completed`);
    return purchase;
  }
}

module.exports = new PurchaseService();
