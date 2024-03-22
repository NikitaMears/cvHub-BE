const express = require('express');
const db = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const Cv = require('./models/CV');
const Project = require('./models/Project');
const CvProject = require('./models/CvProject');


const multer  = require('multer'); // Middleware for handling file uploads
const upload = multer({ dest: 'uploads/' }); // Destination folder for file uploads
const uploadCv = multer({ dest: 'uploads/cv' }); // Destination folder for file uploads
const uploadRFP = multer({ dest: 'uploads/rfp' }); // Destination folder for file uploads

const uploadTP = multer({ dest: 'uploads/tp' }); // Destination folder for file uploads
const uploadFirmExperience = multer({ dest: 'uploads/firmExperience' }); // Destination folder for file uploads

const uploadTPFull = multer({ dest: 'uploads/tp' }); // Destination folder for file uploads

const {readExcel} = require("./controllers/fileController")
const {readExcelForFirm} = require("./controllers/firmFileController")

const path = require('path');
const fs = require('fs')

 const cors = require('cors');
const crone = require('./controllers/password-expiration-cron')
// Require the routes file
const routes = require('./routes/routes');
const cvController = require('./controllers/cvController');
const { readDoc } = require('./controllers/rfpFileController');
const { readDocForTP } = require('./controllers/tpFileController');

const { create } = require('./controllers/rfpController');
const { createTP, updateTP, createTPFromFile } = require('./controllers/tpController');
const { createFirmExperience } = require('./controllers/projectController');




const app = express();
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests only from http://localhost:3000
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Enable CORS with specified options
app.use(cors(corsOptions));



// Associations
Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });
User.belongsTo(Role);
Cv.belongsToMany(Project, { through: CvProject });
Project.belongsToMany(Cv, { through: CvProject });

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
app.get("/uploads/rfp/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", "rfp", filename);

  // Send the file with the correct MIME type
  res.sendFile(filePath);
});
app.get("/uploads/tp/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", "tp", filename);

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

app.post('/uploadCompleteRFP', uploadRFP.single('file'), (req, res) => {
  console.log("Re", req.file)
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
    const reqData = create(req, res,filePath);

  });
});

app.post('/uploadTP', uploadTP.single('file'), (req, res) => {
  console.log("Re", req.file)
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
    const reqData = createTP(req, res,filePath);

  });
});


app.post('/uploadTPFull', uploadTPFull.single('file'), (req, res) => {
  console.log("Re", req.file)
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
    const reqData = readDocForTP(req, res,filePath);

  });
});

app.post('/uploadFirmExperience', uploadFirmExperience.single('file'), (req, res) => {
  console.log("Re", req.file)
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
readExcelForFirm(filePath);

  });
});
app.put('/uploadTP/:id', uploadTP.single('file'), (req, res) => {
  console.log("Re", req.file)
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
    const reqData = updateTP(req, res,filePath);

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


// Express middleware
app.use(express.json());

// Use the routes middleware
app.use(routes);

// Start the server
app.listen(port, () => {
  console.log(`User management service started on port ${port}`);
});