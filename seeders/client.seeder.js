const bcrypt = require('bcrypt');
const Client = require('../models/Client');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seed data to the User table
    await Client.bulkCreate([
      {
        name: 'Abebe',
        email: 'Abebe@yehatech.com',
        apiKey: 'apikey1234',
        paymentStatus: true,
        password: 'Password@123' // Hash the password
         // Provide the appropriate RoleId
      },
      {
        name: 'Kebede',
        email: 'Kebede@yehatech.com',
        apiKey: 'apikey4321',
        paymentStatus: false, 
        password: 'Password@123'
      },
      {
        name: 'Alemu',
        email: 'Alemu@yehatech.com',
        apiKey: 'apikey3456',
        paymentStatus: true, 
        password: 'Password@123'
      },
      // Add more user objects as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seed data from the User table
    await Client.destroy({ where: {} });
  },
};