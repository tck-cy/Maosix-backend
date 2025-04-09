module.exports = (sequelize, DataTypes) => {
  const ProcedureVersion = sequelize.define(
    "ProcedureVersion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      change_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      review_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "procedure_versions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["procedure_id"],
        },
        {
          fields: ["suggested_by"],
        },
        {
          fields: ["reviewed_by"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  ProcedureVersion.associate = function (models) {
    ProcedureVersion.belongsTo(models.CareProcedure, {
      foreignKey: "procedure_id",
      as: "procedure",
    });
    ProcedureVersion.belongsTo(models.User, {
      foreignKey: "suggested_by",
      as: "suggester",
    });
    ProcedureVersion.belongsTo(models.User, {
      foreignKey: "reviewed_by",
      as: "reviewer",
    });
  };

  return ProcedureVersion;
};
