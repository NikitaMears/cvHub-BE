const express = require('express');
const db = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const Cv = require('./models/CV');

const multer  = require('multer'); // Middleware for handling file uploads
const upload = multer({ dest: 'uploads/' }); // Destination folder for file uploads
const uploadCv = multer({ dest: 'uploads/cv' }); // Destination folder for file uploads
const uploadRFP = multer({ dest: 'uploads/rfp' }); // Destination folder for file uploads

const {readExcel} = require("./controllers/fileController")
const path = require('path');
const fs = require('fs')

 const cors = require('cors');
const crone = require('./controllers/password-expiration-cron')
// Require the routes file
const routes = require('./routes/routes');
const cvController = require('./controllers/cvController');
const { readDoc } = require('./controllers/rfpFileController');

const app = express();

// Associations
Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });
User.belongsTo(Role);


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const fileExtension = path.extname(req.file.originalname); // Get the original file extension
  const newFilename = `${req.file.filename}${fileExtension}`; // Add the original extension to the filename

  // Rename the uploaded file to include the extension
  fs.rename(req.file.path, `${req.file.path}${fileExtension}`, err => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).send('Error renaming file.');
    }

    // Construct the new file path with the extension
    const filePath = `${req.file.path}${fileExtension}`;

    // Process the Excel file with the correct file path
    const excelData = readExcel(filePath);

    res.send(excelData);
  });
});
app.use(express.static("public"));

// Route to serve CV files
app.get("/uploads/cv/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", "cv", filename);

  // Send the file with the correct MIME type
  res.sendFile(filePath);
});
app.post('/uploadCV/:id', uploadCv.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No files were uploaded.');
    }

    const id = req.params.id;
    const fileExtension = path.extname(req.file.originalname); // Get the original file extension
    const newFilename = `${req.file.filename}${fileExtension}`; // Add the original extension to the filename

    // Rename the uploaded file to include the extension
    fs.rename(req.file.path, `${req.file.path}${fileExtension}`, async err => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).send('Error renaming file.');
      }

      // Construct the new file path with the extension
      const filePath = `${req.file.path}${fileExtension}`;

      // Process the Excel file with the correct file path
      const cv = await Cv.findByPk(id);
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }

      cv.cv = filePath; // Now filePath is accessible here

      await cv.save();
      return res.status(200).send('File uploaded successfully.');
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).send('Internal server error.');
  }
});

app.post('/uploadRFP', uploadRFP.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const fileExtension = path.extname(req.file.originalname); // Get the original file extension
  const newFilename = `${req.file.filename}${fileExtension}`; // Add the original extension to the filename

  // Rename the uploaded file to include the extension
  fs.rename(req.file.path, `${req.file.path}${fileExtension}`, err => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).send('Error renaming file.');
    }

    // Construct the new file path with the extension
    const filePath = `${req.file.path}${fileExtension}`;

    // Process the Excel file with the correct file path
    const docData = readDoc(req, res,filePath);

  });
});
const port = 3001;


// Sync db models with the database
db.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

//Enable CORS
const corsOptions = {
  origin: true, // Allow requests from all origins
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