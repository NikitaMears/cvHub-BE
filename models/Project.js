const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sector: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  worth: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  projectType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  teamMembers: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  detailSheet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Project;
