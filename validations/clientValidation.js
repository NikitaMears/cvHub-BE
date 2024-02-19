const Joi = require('joi');

// Validation schema for creating a client
const createClientSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  paymentStatus: Joi.boolean().required(),
  serviceIds: Joi.array().required(),
//  status: Joi.string().required(),
});

// Validation schema for updating a client
const updateClientSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  paymentStatus: Joi.boolean().required(),
  serviceIds: Joi.array().required(),
 // status: Joi.string().required(),
});

module.exports = {
  createClientSchema,
  updateClientSchema,
};
