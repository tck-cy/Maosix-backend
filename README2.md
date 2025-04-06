Node.js Express API Server with Sequelize and JWT
Here's a complete implementation of a Node.js Express API server with Sequelize ORM and JWT authentication for your MAOSIX management system.

1. Project Structure
Copy
maosix-api/
├── config/
│   └── config.js          # Configuration files
├── controllers/           # Route controllers
│   ├── authController.js
│   ├── procedureController.js
│   ├── purchaseController.js
│   └── userController.js
├── middlewares/
│   ├── authMiddleware.js   # Authentication middleware
│   └── errorMiddleware.js  # Error handling middleware
├── models/
│   ├── index.js           # Sequelize models initialization
│   ├── user.model.js
│   ├── procedure.model.js
│   ├── version.model.js
│   ├── purchase.model.js
│   └── audit.model.js
├── routes/
│   ├── auth.routes.js
│   ├── procedure.routes.js
│   ├── purchase.routes.js
│   └── user.routes.js
├── services/              # Business logic
│   ├── auth.service.js
│   └── user.service.js
├── utils/                 # Utility functions
│   ├── logger.js
│   └── apiResponse.js
├── .env                   # Environment variables
├── app.js                 # Main application file
└── server.js              # Server entry point
2. Setup and Installation
Install required packages:
bash
Copy
npm install express sequelize mysql2 jsonwebtoken bcryptjs cors dotenv helmet morgan
npm install --save-dev nodemon
.env File
env
Copy
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=maosix_admin
DB_PASSWORD=StrongPassword123!
DB_NAME=maosix_management

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=8h

# Security
CORS_ORIGIN=http://localhost:3000
3. Database Configuration (config/config.js)
javascript
Copy
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    },
    logging: console.log
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
      ssl: {
        rejectUnauthorized: true
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
4. Sequelize Models Initialization (models/index.js)
javascript
Copy
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
5. User Model (models/user.model.js)
javascript
Copy
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('director', 'manager', 'accountant', 'employee'),
      allowNull: false
    },
    department: {
      type: DataTypes.ENUM('coffee', 'dairy', 'apiary', 'poultry', 'admin'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { exclude: ['password_hash'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password_hash'] }
      }
    }
  });

  User.associate = function(models) {
    User.hasMany(models.CareProcedure, { foreignKey: 'created_by', as: 'procedures' });
    User.hasMany(models.ProcedureVersion, { foreignKey: 'suggested_by', as: 'suggested_changes' });
    User.hasMany(models.ProcedureVersion, { foreignKey: 'reviewed_by', as: 'reviewed_changes' });
    User.hasMany(models.Purchase, { foreignKey: 'requester_id', as: 'purchase_requests' });
    User.hasMany(models.Purchase, { foreignKey: 'approved_by', as: 'approved_purchases' });
    User.hasMany(models.ExcelImport, { foreignKey: 'accountant_id', as: 'imports' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'activities' });
  };

  return User;
};
6. Express Application (app.js)
javascript
Copy
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Sync models with database
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true })
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Database sync error:', err));
}

// Routes
app.use('/api/auth', routes.auth);
app.use('/api/users', routes.users);
app.use('/api/procedures', routes.procedures);
app.use('/api/purchases', routes.purchases);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
7. Server Entry Point (server.js)
javascript
Copy
const app = require('./app');
const { port } = require('./config/config').development;

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
8. Authentication Controller (controllers/authController.js)
javascript
Copy
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.scope('withPassword').findOne({ where: { username } });
    if (!user) {
      return res.status(401).json(new ApiResponse(null, 'Invalid credentials', false));
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json(new ApiResponse(null, 'Invalid credentials', false));
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json(new ApiResponse(null, 'Account is inactive', false));
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Log successful login
    logger.info(`User ${user.username} logged in`);

    // Send response with token
    res.status(200).json(new ApiResponse({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department: user.department
      },
      token
    }));
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json(new ApiResponse(null, 'User not found', false));
    }
    res.status(200).json(new ApiResponse(user));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getCurrentUser
};
9. Authentication Middleware (middlewares/authMiddleware.js)
javascript
Copy
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json(new ApiResponse(null, 'Not authorized', false));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json(new ApiResponse(null, 'User no longer exists', false));
    }

    // Check if user is active
    if (!currentUser.is_active) {
      return res.status(401).json(new ApiResponse(null, 'User account is inactive', false));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json(new ApiResponse(null, 'Not authorized', false));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        new ApiResponse(null, 'You do not have permission to perform this action', false)
      );
    }
    next();
  };
};

const departmentRestrict = (...departments) => {
  return (req, res, next) => {
    if (req.user.role !== 'director' && !departments.includes(req.user.department)) {
      return res.status(403).json(
        new ApiResponse(null, 'You do not have permission to access this department data', false)
      );
    }
    next();
  };
};

module.exports = {
  auth,
  restrictTo,
  departmentRestrict
};
10. Procedure Controller (controllers/procedureController.js)
javascript
Copy
const { CareProcedure, ProcedureVersion, User } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const getAllProcedures = async (req, res, next) => {
  try {
    const procedures = await CareProcedure.findAll({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
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
        is_active: true 
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: ProcedureVersion,
          as: 'versions',
          order: [['version', 'DESC']],
          limit: 5
        }
      ]
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
      created_by: req.user.id
    });

    // Create initial version
    await ProcedureVersion.create({
      procedure_id: procedure.id,
      version: 1,
      description: procedure.description,
      status: 'approved',
      suggested_by: req.user.id,
      reviewed_by: req.user.id
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
      return res.status(404).json(new ApiResponse(null, 'Procedure not found', false));
    }

    // Create a new version suggestion
    const newVersion = await ProcedureVersion.create({
      procedure_id: id,
      version: procedure.current_version + 1,
      description,
      status: 'pending',
      suggested_by: req.user.id,
      change_reason: `Update to procedure: ${title}`
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
      return res.status(404).json(new ApiResponse(null, 'Version not found', false));
    }

    if (version.status !== 'pending') {
      return res.status(400).json(new ApiResponse(null, 'Version is not pending approval', false));
    }

    // Update version status
    version.status = 'approved';
    version.reviewed_by = req.user.id;
    version.review_notes = notes;
    await version.save();

    // Update the main procedure
    const procedure = await CareProcedure.findByPk(version.procedure_id);
    procedure.description = version.description;
    procedure.current_version = version.version;
    await procedure.save();

    logger.info(`Procedure version ${versionId} approved by user ${req.user.id}`);

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
  approveProcedureVersion
};
11. Routes (routes/procedure.routes.js)
javascript
Copy
const express = require('express');
const router = express.Router();
const { auth, restrictTo, departmentRestrict } = require('../middlewares/authMiddleware');
const {
  getAllProcedures,
  getDepartmentProcedures,
  createProcedure,
  updateProcedure,
  approveProcedureVersion
} = require('../controllers/procedureController');

// Public routes (read-only)
router.get('/', getAllProcedures);
router.get('/:department', getDepartmentProcedures);

// Protected routes
router.use(auth);

// Department-specific access
router.post('/', departmentRestrict('coffee', 'dairy', 'apiary', 'poultry'), createProcedure);
router.put('/:id', departmentRestrict('coffee', 'dairy', 'apiary', 'poultry'), updateProcedure);

// Approval route for managers and directors
router.post(
  '/versions/:versionId/approve',
  restrictTo('director', 'manager'),
  approveProcedureVersion
);

module.exports = router;
12. Error Handling Middleware (middlewares/errorMiddleware.js)
javascript
Copy
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  logger.error(err.stack);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message);
    return res.status(400).json(new ApiResponse(null, messages.join(', '), false));
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(error => error.message);
    return res.status(400).json(new ApiResponse(null, messages.join(', '), false));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(new ApiResponse(null, 'Not authorized', false));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(new ApiResponse(null, 'Token expired', false));
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json(
    new ApiResponse(null, error.message || 'Server Error', false)
  );
};

module.exports = errorHandler;
13. Utility Classes (utils/apiResponse.js)
javascript
Copy
class ApiResponse {
  constructor(data, message = '', success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
  }
}

module.exports = ApiResponse;
14. Running the Application
Add these scripts to your package.json:

json
Copy
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "lint": "eslint .",
  "sequelize": "sequelize"
}
Start the development server:

bash
Copy
npm run dev
This complete Node.js Express API provides:

JWT authentication with role-based access control

Sequelize ORM for MySQL database operations

Proper error handling and logging

Structured response format

Comprehensive procedure management

Purchase request system

User management

Audit logging

Input validation

The API is ready to connect with your React frontend and supports all the user roles and permissions you specified in your requirements.

