const Joi = require('joi');

// Input validation schema for creating a role
const createServiceSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().optional(),

});

// Input validation schema for updating a role
const updateServiceSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().optional(),

 
});

module.exports = {
    createServiceSchema,
    updateServiceSchema,
};