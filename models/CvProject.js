const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CvProject = sequelize.define('CvProject', {
  // No need for attributes in the junction table
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  },
});

module.exports = CvProject;
