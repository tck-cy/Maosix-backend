module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("director", "manager", "accountant", "employee"),
        allowNull: false,
      },
      department: {
        type: DataTypes.ENUM("coffee", "dairy", "apiary", "poultry", "admin"),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      defaultScope: {
        attributes: { exclude: ["password_hash"] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ["password_hash"] },
        },
      },
    }
  );

  User.associate = function (models) {
    User.hasMany(models.CareProcedure, {
      foreignKey: "created_by",
      as: "procedures",
    });
    User.hasMany(models.ProcedureVersion, {
      foreignKey: "suggested_by",
      as: "suggested_changes",
    });
    User.hasMany(models.ProcedureVersion, {
      foreignKey: "reviewed_by",
      as: "reviewed_changes",
    });
    User.hasMany(models.Purchase, {
      foreignKey: "requester_id",
      as: "purchase_requests",
    });
    User.hasMany(models.Purchase, {
      foreignKey: "approved_by",
      as: "approved_purchases",
    });
    User.hasMany(models.ExcelImport, {
      foreignKey: "accountant_id",
      as: "imports",
    });
    User.hasMany(models.AuditLog, { foreignKey: "user_id", as: "activities" });
  };

  return User;
};
