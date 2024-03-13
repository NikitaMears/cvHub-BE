const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cv = sequelize.define('Cv', {
  serialNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expertName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cv: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contactInformation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  researchInterest: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priceAverage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  projectTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cvSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  averagePoints: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true,
    defaultValue: 0
  },
});

Cv.bulkCreateCvs = async function(cvData) {
  
    try {
      const createdCvs = await Cv.bulkCreate(cvData);
      return createdCvs;
    } catch (error) {
      throw new Error('Error creating CVs: ' + error.message);
    }
  };
module.exports = Cv;
