const Joi = require('joi');

// Input validation schema for creating a permission
const createPermissionSchema = Joi.object({
  name: Joi.string().required(),
});

// Input validation schema for updating a permission
const updatePermissionSchema = Joi.object({
  name: Joi.string().required(),
});

module.exports = {
  createPermissionSchema,
  updatePermissionSchema,
};