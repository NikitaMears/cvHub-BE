const Joi = require('joi');

// Input validation schema for creating a user
const createUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.empty': 'First Name is required.',
    'any.required': 'First Name is required.',
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last Name is required.',
    'any.required': 'Last Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'any.required': 'Email Name is required.',
  }),
  phoneNumber: Joi.string().required().messages({
    'string.empty': 'Phone Number is required.',
    'any.required': 'Phone Number is required.',
  }),
  password: Joi.string()
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
    'any.required': 'Password is required.',
  }),
  RoleId: Joi.number().integer().required().messages({
    'number.base': 'Role must be a number',
    'number.integer': 'Role must be an integer',
    'any.required': 'Role is required',
  }),
});

// Input validation schema for creating public user
const createPublicUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.empty': 'First Name is required.',
    'any.required': 'First Name is required.',
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last Name is required.',
    'any.required': 'Last Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'any.required': 'Email Name is required.',
  }),
  phoneNumber: Joi.string().required().messages({
    'string.empty': 'Phone Number is required.',
    'any.required': 'Phone Number is required.',
  }),
  password: Joi.string()
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
    'any.required': 'Password is required.',
  }),
});

// Input validation schema for updating a user
const updateUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.empty': 'First Name is required.',
    'any.required': 'First Name is required.',
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last Name is required.',
    'any.required': 'Last Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'any.required': 'Email Name is required.',
  }),
  phoneNumber: Joi.string().required().messages({
    'string.empty': 'Phone Number is required.',
    'any.required': 'Phone Number is required.',
  }),
  password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
  // .required(),
  .messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
    'any.required': 'Password is required.',
  }),
  RoleId: Joi.number().integer().required().messages({
    'number.base': 'Role must be a number',
    'number.integer': 'Role must be an integer',
    'any.required': 'Role is required',
  }),
});

const changePasswordSchema = Joi.object({
 
  currentPassword: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')),
  newPassword: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')),
  confirmPassword: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))

});

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  createPublicUserSchema
};
