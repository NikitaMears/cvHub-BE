const ClientService = require('../models/ClientService');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the RolePermission table
    await ClientService.bulkCreate([
      { ClientId: 1, ServiceId: 1 }, 
      { ClientId: 2, ServiceId: 2 }, 
  
      // Add more role-permission relationships as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the RolePermission table
    await ClientService.destroy({ where: {} });
  },
};