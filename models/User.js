const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Role = require('./Role');

const User = db.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Candidate'
  },
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

User.belongsTo(Role);

module.exports = User;