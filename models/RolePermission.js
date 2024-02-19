const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Role = require('./Role');
const Permission = require('./Permission');

const RolePermission = db.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });

module.exports = RolePermission;