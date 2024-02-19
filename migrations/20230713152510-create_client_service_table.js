'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClientServices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clientId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      serviceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add foreign key constraints if necessary
    await queryInterface.addConstraint('ClientServices', {
      fields: ['clientId'],
      type: 'foreign key',
      references: {
        table: 'Clients',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('ClientServices', {
      fields: ['serviceId'],
      type: 'foreign key',
      references: {
        table: 'Services',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraints first
    await queryInterface.removeConstraint('ClientServices', 'ClientServices_clientId_fkey');
    await queryInterface.removeConstraint('ClientServices', 'ClientServices_serviceId_fkey');

    // Then drop the table
    await queryInterface.dropTable('ClientServices');
  }
};
