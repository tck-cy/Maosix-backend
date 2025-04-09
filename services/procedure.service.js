const { CareProcedure, ProcedureVersion } = require("../models");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class ProcedureService {
  async getAllProcedures() {
    return await CareProcedure.findAll({
      where: { is_active: true },
      include: ["creator"],
    });
  }

  async getDepartmentProcedures(department) {
    return await CareProcedure.findAll({
      where: {
        department,
        is_active: true,
      },
      include: ["creator"],
    });
  }

  async createProcedure(procedureData, userId) {
    const procedure = await CareProcedure.create({
      ...procedureData,
      created_by: userId,
    });

    await ProcedureVersion.create({
      procedure_id: procedure.id,
      version: 1,
      description: procedure.description,
      status: "approved",
      suggested_by: userId,
      reviewed_by: userId,
    });

    logger.info(`Procedure ${procedure.id} created by ${userId}`);
    return procedure;
  }

  async updateProcedure(procedureId, updateData, userId) {
    const procedure = await CareProcedure.findByPk(procedureId);
    if (!procedure) throw new ApiError(404, "Procedure not found");

    const newVersion = await ProcedureVersion.create({
      procedure_id: procedure.id,
      version: procedure.current_version + 1,
      description: updateData.description,
      status: "pending",
      suggested_by: userId,
      change_reason: updateData.change_reason,
    });

    logger.info(`Procedure ${procedureId} update suggested by ${userId}`);
    return newVersion;
  }

  async approveVersion(versionId, userId, notes) {
    const version = await ProcedureVersion.findByPk(versionId, {
      include: ["procedure"],
    });
    if (!version) throw new ApiError(404, "Version not found");

    version.status = "approved";
    version.reviewed_by = userId;
    version.review_notes = notes;
    await version.save();

    await version.procedure.update({
      description: version.description,
      current_version: version.version,
    });

    logger.info(`Version ${versionId} approved by ${userId}`);
    return version;
  }
}

module.exports = new ProcedureService();
