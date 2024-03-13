const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CvProject = sequelize.define('CvProject', {
  // No need for attributes in the junction table
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5,
    },
  },
  qualityOfWork: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5,
    },
  },
  meetingDeadline: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5,
    },
  },
  knowledgeOfWork: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5,
    },
  },

  planning: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5,
    },
  },
  decisionMaking: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 1,
      max: 5,
    },
  },
});

module.exports = CvProject;
