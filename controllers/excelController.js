const { ExcelImport } = require("../models");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");
const excel = require("exceljs");

exports.importExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(new ApiResponse(null, "No file uploaded", false));
    }

    const workbook = new excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    // Process worksheet data here...

    const importRecord = await ExcelImport.create({
      accountant_id: req.user.id,
      file_name: req.file.originalname,
      import_type: req.body.type,
      records_count: worksheet.rowCount - 1, // Exclude header
      status: "processed",
    });

    logger.info(`Excel import ${importRecord.id} processed by ${req.user.id}`);
    res.status(201).json(new ApiResponse(importRecord));
  } catch (err) {
    next(err);
  }
};

exports.getImportHistory = async (req, res, next) => {
  try {
    const imports = await ExcelImport.findAll({
      where: { accountant_id: req.user.id },
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(new ApiResponse(imports));
  } catch (err) {
    next(err);
  }
};
