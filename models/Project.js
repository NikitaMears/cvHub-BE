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
  worth: {
    type: DataTypes.FLOAT,
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
  file: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Project;
