const Role = require('../models/Role');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the Role table
    await Role.bulkCreate([
      { name: 'Admin' },
      { name: 'User' },
      { name: 'Public User' },
      // Add more role objects as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the Role table
    await Role.destroy({ where: {} });
  },
};