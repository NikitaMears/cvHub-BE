const Permission = require('../models/Permission');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the Permission table
    await Permission.bulkCreate([
      { name: 'createUser' },
      { name: 'editUser' },
      { name: 'deleteUser' },
      { name: 'getUsers' },
      { name: 'getRoles' },
      { name: 'createRole' },
      { name: 'editRole' },
      { name: 'deleteRole' },
      { name: 'getPermissions' },
      { name: 'Permission' },
      { name: 'createPermission' },
      { name: 'editPermission' },
      { name: 'deletePermission' },
      { name: 'createService' },
      { name: 'editService' },
      { name: 'deleteService' },
      { name: 'getServices' },
      { name: 'createClient' },
      { name: 'editClient' },
      { name: 'deleteClient' },
      { name: 'getClients' },
      // Add more permission objects as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the Permission table
    await Permission.destroy({ where: {} });
  },
};