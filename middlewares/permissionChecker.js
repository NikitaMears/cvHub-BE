const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const hasPermission = async (req, requiredPermission) => {
  // Retrieve the token from the request headers
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return false;
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    // Verify the token and extract the user ID
  
    const { id } = jwt.verify(token, config.jwtSecret);

    // Fetch the user from the database using the ID
    const user = await User.findByPk(id, {
      include: {
        model: Role,
        include: Permission,
      },
    });
  
    if (!user || !user.Role) {
      return false; // User not found or does not have a role
    }

    // Get the permissions associated with the user's role
    const rolePermissions = user.Role.Permissions;

  

    // Check if any of the role's permissions match the required permission
    const hasAccess = rolePermissions.some((permission) => permission.name === requiredPermission);

    req.user = user; // Attach the user to the request object for later use

    return hasAccess;
  } catch (error) {
    console.error(error);
    return false; // Token verification failed
  }
};

module.exports = { hasPermission };