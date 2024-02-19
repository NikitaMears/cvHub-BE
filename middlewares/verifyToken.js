const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = (req, res, next) => {
  // const token = req.headers.authorization;
  // console.log(token)
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authorizationHeader.split(' ')[1];


  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      // console.error('Error verifying token:', err);
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken };