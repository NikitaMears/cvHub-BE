
const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Client = db.define('Client', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  paymentStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Active',
  },
 
});

module.exports = Client;
