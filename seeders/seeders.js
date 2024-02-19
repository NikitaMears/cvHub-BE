const sequelize = require('../config/db');
const UserSeeder = require('./user.seeder');
const RoleSeeder = require('./role.seeder');
const PermissionSeeder = require('./permission.seeder');
const RolePermissionSeeder = require('./rolepermissions.seeder');
const ServiceSeeder = require('./service.seeder');
const ClientSeeder = require('./client.seeder');
const ClientServiceSeeder = require('./clientservice.seeder');
// Import other seeders as needed

const runSeeders = async () => {
  try {
    await sequelize.transaction(async (transaction) => {
      // Execute your seeders within the transaction
    // await RoleSeeder.up(null, sequelize, transaction); 
    //  await PermissionSeeder.up(null, sequelize, transaction);
    // await RolePermissionSeeder.up(null, sequelize, transaction);
    // await UserSeeder.up(null, sequelize, transaction);
      
      
    // await ServiceSeeder.up(null, sequelize, transaction);
    //  await ClientSeeder.up(null, sequelize, transaction);
      
      // Run other seeders as needed
    await ClientServiceSeeder.up(null, sequelize, transaction);
    });

    console.log('Seeders executed successfully.');
  } catch (error) {
    console.error('Error while executing seeders:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

runSeeders();
