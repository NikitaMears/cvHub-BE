const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RFP = sequelize.define('RFP', {
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rfpNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  issuedOn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sector: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specificObjectives: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = RFP;
