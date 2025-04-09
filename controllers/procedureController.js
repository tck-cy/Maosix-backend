const { CareProcedure, ProcedureVersion, User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

exports.getAllProcedures = async (req, res, next) => {
  try {
    const procedures = await CareProcedure.findAll({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    res.status(200).json(new ApiResponse(procedures));
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentProcedures = async (req, res, next) => {
  try {
    const procedures = await CareProcedure.findAll({
      where: {
        department: req.params.department,
        is_active: true,
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    res.status(200).json(new ApiResponse(procedures));
  } catch (err) {
    next(err);
  }
};

exports.createProcedure = async (req, res, next) => {
  try {
    const procedure = await CareProcedure.create({
      ...req.body,
      created_by: req.user.id,
    });

    // Create initial version
    await ProcedureVersion.create({
      procedure_id: procedure.id,
      version: 1,
      description: procedure.description,
      status: "approved",
      suggested_by: req.user.id,
      reviewed_by: req.user.id,
    });

    logger.info(`Procedure ${procedure.id} created by ${req.user.id}`);
    res.status(201).json(new ApiResponse(procedure));
  } catch (err) {
    next(err);
  }
};

exports.updateProcedure = async (req, res, next) => {
  try {
    const procedure = await CareProcedure.findByPk(req.params.id);
    if (!procedure) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Procedure not found", false));
    }

    const newVersion = await ProcedureVersion.create({
      procedure_id: procedure.id,
      version: procedure.current_version + 1,
      description: req.body.description,
      status: "pending",
      suggested_by: req.user.id,
      change_reason: req.body.change_reason || "Procedure update",
    });

    logger.info(`Procedure ${procedure.id} update suggested by ${req.user.id}`);
    res.status(200).json(new ApiResponse(newVersion));
  } catch (err) {
    next(err);
  }
};

exports.approveProcedureVersion = async (req, res, next) => {
  try {
    const version = await ProcedureVersion.findByPk(req.params.versionId, {
      include: [{ model: CareProcedure, as: "procedure" }],
    });

    if (!version) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Version not found", false));
    }

    version.status = "approved";
    version.reviewed_by = req.user.id;
    version.review_notes = req.body.notes;
    await version.save();

    await version.procedure.update({
      description: version.description,
      current_version: version.version,
    });

    logger.info(`Version ${version.id} approved by ${req.user.id}`);
    res.status(200).json(new ApiResponse(version));
  } catch (err) {
    next(err);
  }
};
