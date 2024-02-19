const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { hasPermission } = require('../middlewares/permissionChecker');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const {
  createRoleSchema,
  updateRoleSchema,
} = require('../validations/roleValidation');
const RolePermission = require("../models/RolePermission");
// Get all roles
exports.getRoles = async (req, res) => {
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'getRoles');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const roles = await Role.findAll({
      include: Permission,
    });

    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Create a new role
// Create a new role
exports.createRole = async (req, res) => {
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name, permissions } = req.body;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'createRole');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create the role
    const newRole = await Role.create({ name });

    // Associate the permissions with the role
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map(permissionId => ({
        RoleId: newRole.id,
        PermissionId: permissionId,
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    // Fetch the role with associated permissions
    const roleWithPermissions = await Role.findByPk(newRole.id, {
      include: Permission,
    });

    res.status(201).json(roleWithPermissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Update a role
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { error } = updateRoleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name, permissions } = req.body;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'editRole');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    role.name = name;

    await role.save();

    // Remove existing role permissions
    await RolePermission.destroy({ where: { RoleId: role.id } });

    // Associate the permissions with the role
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map(permissionId => ({
        RoleId: role.id,
        PermissionId: permissionId,
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    // Fetch the role with associated permissions
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: Permission,
    });

    res.json(roleWithPermissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Delete a role
exports.deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the user has the required permission
    const hasAccess = await hasPermission(req, 'deleteRole');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Find the role to delete
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Delete associated role permissions
    await RolePermission.destroy({ where: { RoleId: role.id } });

    // Delete the role
    await role.destroy();

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Existing user-related functions...
// getUsers, createUser, login, updateUser, and deleteUser