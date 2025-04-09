const { ExcelImport } = require("../models");
const excel = require("exceljs");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class ExcelService {
  async processImport(file, importType, userId) {
    const workbook = new excel.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    const records = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        records.push(row.values);
      }
    });

    const importRecord = await ExcelImport.create({
      accountant_id: userId,
      file_name: file.originalname,
      import_type: importType,
      records_count: records.length,
      status: "processed",
    });

    logger.info(`Excel import ${importRecord.id} processed by ${userId}`);
    return { importRecord, records };
  }

  async getImportHistory(userId) {
    return await ExcelImport.findAll({
      where: { accountant_id: userId },
      order: [["created_at", "DESC"]],
    });
  }
}

module.exports = new ExcelService();
