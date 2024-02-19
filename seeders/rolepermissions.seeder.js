const RolePermission = require('../models/RolePermission');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the RolePermission table
    await RolePermission.bulkCreate([
      { RoleId: 1, PermissionId: 1 }, 
      { RoleId: 1, PermissionId: 2 },
      { RoleId: 1, PermissionId: 3 }, 
      { RoleId: 1, PermissionId: 4 },
      { RoleId: 1, PermissionId: 5 }, 
      { RoleId: 1, PermissionId: 6 },
      { RoleId: 1, PermissionId: 7 }, 
      { RoleId: 1, PermissionId: 8 },
      { RoleId: 1, PermissionId: 9 }, 
      { RoleId: 1, PermissionId: 10 },
      { RoleId: 1, PermissionId: 11 },
      { RoleId: 1, PermissionId: 12 },
      { RoleId: 1, PermissionId: 13 },
      { RoleId: 1, PermissionId: 14 },
      { RoleId: 1, PermissionId: 15 },
      { RoleId: 1, PermissionId: 16 },
      { RoleId: 1, PermissionId: 17 },
      { RoleId: 1, PermissionId: 18 },
      { RoleId: 1, PermissionId: 19 },
      { RoleId: 1, PermissionId: 20 },
      { RoleId: 1, PermissionId: 21 },            
      { RoleId: 2, PermissionId: 2 },
      { RoleId: 2, PermissionId: 3 },
      { RoleId: 2, PermissionId: 17 },
      { RoleId: 2, PermissionId: 9 },
      { RoleId: 2, PermissionId: 21 },
      // Add more role-permission relationships as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the RolePermission table
    await RolePermission.destroy({ where: {} });
  },
};