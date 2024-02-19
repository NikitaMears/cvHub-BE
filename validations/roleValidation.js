const Joi = require('joi');

// Input validation schema for creating a role
const createRoleSchema = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array().items(Joi.number()).required(),
});

// Input validation schema for updating a role
const updateRoleSchema = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
};