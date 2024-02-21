const express = require('express');
const db = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');

 const cors = require('cors');
const crone = require('./controllers/password-expiration-cron')
// Require the routes file
const routes = require('./routes/routes');

const app = express();

// Associations
Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });
User.belongsTo(Role);

const port = 3001;

// Sync db models with the database
db.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Enable CORS
const corsOptions = {
  origin: ['http://localhost:3000'],
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));


// Express middleware
app.use(express.json());

// Use the routes middleware
app.use(routes);

// Start the server
app.listen(port, () => {
  console.log(`User management service started on port ${port}`);
});