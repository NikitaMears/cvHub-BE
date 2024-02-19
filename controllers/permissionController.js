const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Role = require('../models/Role');
const { hasPermission } = require('../middlewares/permissionChecker');
const Permission = require('../models/Permission');
const {
  createPermissionSchema,
  updatePermissionSchema,
} = require('../validations/permissionValidation');
// Get all permissions
exports.getPermissions = async (req, res) => {
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'getPermissions');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const permissions = await Permission.findAll({
      include:Role,
    });
    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new permission
exports.createPermission = async (req, res) => {
  const { error } = createPermissionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name } = req.body;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'createPermission');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newPermission = await Permission.create({ name });
    res.status(201).json(newPermission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update a permission
exports.updatePermission = async (req, res) => {
  const { error } = updatePermissionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { id } = req.params;
  const { name } = req.body;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'editPermission');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    permission.name = name;

    await permission.save();

    res.json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a permission
exports.deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'deletePermission');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    await permission.destroy();

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
