const express = require('express');
const db = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const path = require('path');

 const cors = require('cors');
const crone = require('./controllers/password-expiration-cron')
// Require the routes file
const routes = require('./routes/routes');
const multer = require('multer');
const { readExcel } = require('./controllers/fileController'); // Import the readExcel function


const app = express();

//const upload = multer({ dest: 'uploads/' }); // Set the destination directory for uploaded files

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get the original file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique filename
    cb(null, uniqueSuffix + ext); // Append the original file extension to the filename
  }
});

const upload = multer({ storage: storage });

// Route to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  // Assuming 'file' is the name attribute of the file input field in your HTML form
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = req.file.path;
  
  console.log(filePath)
  return
  // Process the uploaded file
  const excelData = readExcel(filePath);
  
  // Send the response back to the client
  res.json({ success: true, data: excelData });
});
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