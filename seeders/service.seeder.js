const Service = require('../models/Service');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the Role table
    await Service.bulkCreate([
      { name: 'service' },
      { name: 'servicetwo' },
      // Add more Service objects as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the Service table
    await Service.destroy({ where: {} });
  },
};