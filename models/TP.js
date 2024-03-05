const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const RFP = require('./RFP'); // Import the RFP model

const Tp = sequelize.define('Tp', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: true,
  },
 
  members: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
  rfpId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  // Add timestamps
  timestamps: true,
});

// Define association between Tp and RFP
// Tp.hasOne(RFP); // Tp will have one RFP

module.exports = Tp;
