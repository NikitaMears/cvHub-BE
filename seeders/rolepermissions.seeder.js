const RolePermission = require('../models/RolePermission');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the RolePermission table
    await RolePermission.bulkCreate([
      { roleId: 1, permissionId: 1 }, 
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 }, 
      { roleId: 1, permissionId: 4 },
      { roleId: 1, permissionId: 5 }, 
      { roleId: 1, permissionId: 6 },
      { roleId: 1, permissionId: 7 }, 
      { roleId: 1, permissionId: 8 },
      { roleId: 1, permissionId: 9 }, 
      { roleId: 1, permissionId: 10 },
      { roleId: 1, permissionId: 11 },
      { roleId: 1, permissionId: 12 },
      { roleId: 1, permissionId: 13 },
      { roleId: 1, permissionId: 14 },
      { roleId: 1, permissionId: 15 },
      { roleId: 1, permissionId: 16 },
      { roleId: 1, permissionId: 17 },
      { roleId: 1, permissionId: 18 },
      { roleId: 1, permissionId: 19 },
      { roleId: 1, permissionId: 20 },
      { roleId: 1, permissionId: 21 },            
      { roleId: 2, permissionId: 2 },
      { roleId: 2, permissionId: 3 },
      { roleId: 2, permissionId: 17 },
      { roleId: 2, permissionId: 9 },
      { roleId: 2, permissionId: 21 },
      // Add more role-permission relationships as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the RolePermission table
    await RolePermission.destroy({ where: {} });
  },
};