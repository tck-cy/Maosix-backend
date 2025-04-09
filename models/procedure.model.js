module.exports = (sequelize, DataTypes) => {
  const CareProcedure = sequelize.define(
    "CareProcedure",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      department: {
        type: DataTypes.ENUM("coffee", "dairy", "apiary", "poultry"),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      current_version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "care_procedures",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["department"],
        },
        {
          fields: ["created_by"],
        },
      ],
    }
  );

  CareProcedure.associate = function (models) {
    CareProcedure.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    CareProcedure.hasMany(models.ProcedureVersion, {
      foreignKey: "procedure_id",
      as: "versions",
    });
  };

  return CareProcedure;
};
