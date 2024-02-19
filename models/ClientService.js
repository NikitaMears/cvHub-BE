const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Client = require('./Client');
const Service = require('./Service');

const ClientService = db.define('ClientService', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.STRING,
   defaultValue: 'Active'
  }
});

Client.belongsToMany(Service, { through: ClientService });
Service.belongsToMany(Client, { through: ClientService });

module.exports = ClientService;
