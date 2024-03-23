const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const RFP = require('./RFP'); // Import the RFP model

const FR = sequelize.define('IR', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  rfpId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  // Add timestamps
  timestamps: true,
});

// Define association between Tp and RFP
// Tp.hasOne(RFP); // Tp will have one RFP

module.exports = FR;
