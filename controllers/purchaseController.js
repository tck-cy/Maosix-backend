const { Purchase, User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

exports.getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.findAll({
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    res.status(200).json(new ApiResponse(purchases));
  } catch (err) {
    next(err);
  }
};

exports.getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    if (!purchase) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Purchase not found", false));
    }
    res.status(200).json(new ApiResponse(purchase));
  } catch (err) {
    next(err);
  }
};

exports.createPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.create({
      ...req.body,
      requester_id: req.user.id,
    });
    logger.info(`Purchase ${purchase.id} created by ${req.user.id}`);
    res.status(201).json(new ApiResponse(purchase));
  } catch (err) {
    next(err);
  }
};

exports.approvePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Purchase not found", false));
    }

    await purchase.update({
      status: "approved",
      approved_by: req.user.id,
      approved_amount: req.body.amount || purchase.amount,
      approved_at: new Date(),
    });

    logger.info(`Purchase ${purchase.id} approved by ${req.user.id}`);
    res.status(200).json(new ApiResponse(purchase));
  } catch (err) {
    next(err);
  }
};

exports.completePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Purchase not found", false));
    }

    await purchase.update({
      status: "completed",
      completion_notes: req.body.notes,
    });

    logger.info(`Purchase ${purchase.id} completed by ${req.user.id}`);
    res.status(200).json(new ApiResponse(purchase));
  } catch (err) {
    next(err);
  }
};
