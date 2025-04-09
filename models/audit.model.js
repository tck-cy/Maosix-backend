module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      old_values: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      new_values: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "audit_log",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // We don't need updated_at for audit logs
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["entity_type", "entity_id"],
        },
        {
          fields: ["action"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );

  AuditLog.associate = function (models) {
    AuditLog.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return AuditLog;
};
