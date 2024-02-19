const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Permission = db.define('Permission', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Permission;