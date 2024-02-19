const { Sequelize, DataTypes } = require('sequelize');

const db = require('../config/db');

const Role = db.define('Role', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Role;