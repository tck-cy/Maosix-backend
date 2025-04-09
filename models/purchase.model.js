module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define(
    "Purchase",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("requested", "approved", "rejected", "completed"),
        allowNull: false,
        defaultValue: "requested",
      },
      approved_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completion_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "purchases",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["requester_id"],
        },
        {
          fields: ["approved_by"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  Purchase.associate = function (models) {
    Purchase.belongsTo(models.User, {
      foreignKey: "requester_id",
      as: "requester",
    });
    Purchase.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approver",
    });
  };

  return Purchase;
};
