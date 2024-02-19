const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the User table
    await User.bulkCreate([
      {
        firstName: 'Admin',
        lastName: 'Admin',
        email: 'Admin@yehatech.com',
        phoneNumber: '0978954555',
        password: await bcrypt.hash('Password@123', 10), // Hash the password
        RoleId: 1, // Provide the appropriate RoleId
        status: 'Candidate',
        lastPasswordChange:null
      },
      {
        firstName: 'Melaku',
        lastName: 'Minas',
        email: 'melaku@yehatech.com',
        phoneNumber: '0978998546',
        password: await bcrypt.hash('Password@123', 10), // Hash the password
        RoleId: 1, // Provide the appropriate RoleId
        status: 'Candidate',
        lastPasswordChange:null
      },
      {
        firstName: 'Abigya',
        lastName: 'Smith',
        email: 'abigya@yehatech.com',
        phoneNumber: '0978998534',
        password: await bcrypt.hash('Password@456', 10), // Hash the password
        RoleId: 2, // Provide the appropriate RoleId
        status: 'Candidate',
        lastPasswordChange:null
      },
      // Add more user objects as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the User table
    await User.destroy({ where: {} });
  },
};

