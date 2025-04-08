const { CareProcedure, ProcedureVersion, User } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

const getAllProcedures = async (req, res, next) => {
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

const getDepartmentProcedures = async (req, res, next) => {
  try {
    const { department } = req.params;
    const procedures = await CareProcedure.findAll({
      where: {
        department,
        is_active: true,
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: ProcedureVersion,
          as: "versions",
          order: [["version", "DESC"]],
          limit: 5,
        },
      ],
    });
    res.status(200).json(new ApiResponse(procedures));
  } catch (err) {
    next(err);
  }
};

const createProcedure = async (req, res, next) => {
  try {
    const { title, description, department } = req.body;

    const procedure = await CareProcedure.create({
      title,
      description,
      department,
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

    logger.info(`Procedure ${procedure.id} created by user ${req.user.id}`);

    res.status(201).json(new ApiResponse(procedure));
  } catch (err) {
    next(err);
  }
};

const updateProcedure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const procedure = await CareProcedure.findByPk(id);
    if (!procedure) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Procedure not found", false));
    }

    // Create a new version suggestion
    const newVersion = await ProcedureVersion.create({
      procedure_id: id,
      version: procedure.current_version + 1,
      description,
      status: "pending",
      suggested_by: req.user.id,
      change_reason: `Update to procedure: ${title}`,
    });

    logger.info(`Procedure ${id} update suggested by user ${req.user.id}`);

    res.status(200).json(new ApiResponse(newVersion));
  } catch (err) {
    next(err);
  }
};

const approveProcedureVersion = async (req, res, next) => {
  try {
    const { versionId } = req.params;
    const { notes } = req.body;

    const version = await ProcedureVersion.findByPk(versionId);
    if (!version) {
      return res
        .status(404)
        .json(new ApiResponse(null, "Version not found", false));
    }

    if (version.status !== "pending") {
      return res
        .status(400)
        .json(new ApiResponse(null, "Version is not pending approval", false));
    }

    // Update version status
    version.status = "approved";
    version.reviewed_by = req.user.id;
    version.review_notes = notes;
    await version.save();

    // Update the main procedure
    const procedure = await CareProcedure.findByPk(version.procedure_id);
    procedure.description = version.description;
    procedure.current_version = version.version;
    await procedure.save();

    logger.info(
      `Procedure version ${versionId} approved by user ${req.user.id}`
    );

    res.status(200).json(new ApiResponse(procedure));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProcedures,
  getDepartmentProcedures,
  createProcedure,
  updateProcedure,
  approveProcedureVersion,
};
