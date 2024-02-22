const express = require('express');
const db = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const path = require('path');
const docxtemplater = require('docxtemplater');
const fileUpload = require('express-fileupload');

const xlsx = require('xlsx-populate');
const fs = require('fs');
const mammoth = require('mammoth');
const exceljs = require('exceljs');

 const cors = require('cors');
const crone = require('./controllers/password-expiration-cron')
// Require the routes file
const routes = require('./routes/routes');
const multer = require('multer');
const { readExcel } = require('./controllers/fileController'); // Import the readExcel function


const app = express();

//const upload = multer({ dest: 'uploads/' }); // Set the destination directory for uploaded files
app.use(fileUpload());

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

//Route to handle file uploads
// app.post('/upload', upload.single('file'), (req, res) => {
//   // Assuming 'file' is the name attribute of the file input field in your HTML form
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
//   const filePath = req.file.path;
  
//   console.log(filePath)
//   //return
//   // Process the uploaded file
//   const excelData = readExcel(filePath);
  
//   // Send the response back to the client
//   res.json({ success: true, data: excelData });
// });
// app.post('/upload', upload.single('file'), (req, res) => {
//   // Assuming 'file' is the name attribute of the file input field in your HTML form
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
//   console.log(req.file)

//   // Check the file type
//   const fileType = req.file.mimetype;
//   if (fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//     return res.status(400).json({ error: 'Invalid file format. Only .docx files are supported' });
//   }

//   // Extract the file path
//   const docxFilePath = req.file.path;
//   console.log(docxFilePath)

//   // Convert .docx to .xlsx and upload
//   convertDocxToExcelAndUpload(docxFilePath)
//     .then(excelFilePath => {
//       // Read the uploaded Excel file
//       const excelData = readExcel(excelFilePath);
//       console.log(excelData)

//       // Send the response back to the client
//       res.json({ success: true, data: excelData });
//     })
//     .catch(error => {
//       console.error('Error converting .docx to Excel and uploading:', error);
//       res.status(500).json({ error: 'An error occurred while converting and uploading the file' });
//     });
// });
// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//       // Convert docx to HTML
//       const { path } = req.file;
//       const { value } = await mammoth.convertToHtml({ path });
//       const htmlContent = value;

//       // Process HTML content if needed

//       // Convert to Excel
//       const workbook = new exceljs.Workbook();
//       const worksheet = workbook.addWorksheet('Sheet1');
//       // Example: populate Excel with HTML content
//       // This is a very basic example and might need further processing
//       worksheet.addRaport("A1").merge("A3").value(htmlContent);

//       // Send Excel file to client
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', 'attachment; filename=converted.xlsx');
//       await workbook.xlsx.write(res);

//       // Cleanup - remove uploaded file
//       // fs.unlinkSync(path);
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('Error converting file.');
//   }
// });
// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//       // Get the uploaded file details
//       const { originalname, path: filePath } = req.file;
      
//       // Save the uploaded file to a directory
//       const uploadedFilePath = path.join(__dirname, 'uploads', originalname);
//       fs.renameSync(filePath, uploadedFilePath);

//       // Convert docx to HTML
//       const { value } = await mammoth.convertToHtml({ path: uploadedFilePath });
//       const htmlContent = value;
//       console.log(htmlContent)

//       // Convert HTML to Excel
//       const workbook = new exceljs.Workbook();
//       const worksheet = workbook.addWorksheet('Sheet1');
//       const rows = htmlContent.split('\n');
//       console.log("rows")
//       rows.forEach((row) => {
//           worksheet.addRow([row]);
//       });

//       // Save the Excel file to a directory
//       const excelFilePath = path.join(__dirname, 'uploads', 'converted.xlsx');
//       await workbook.xlsx.writeFile(excelFilePath);

//       // Send Excel file to client
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', 'attachment; filename=converted.xlsx');
//       res.sendFile(excelFilePath);

//       // Cleanup - remove uploaded file
//       fs.unlinkSync(uploadedFilePath);
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('Error converting file.');
//   }
// });
// function convertDocxToExcelAndUpload(docxFilePath) {
//   return new Promise((resolve, reject) => {
//     try {
//       // Read the .docx file
//       const content = fs.readFileSync(docxFilePath);
//       console.log(content)
      
//       // Parse the .docx file
//       const doc = new docxtemplater();
//       doc.loadZip(content);
      
//       // Remaining code...
//     } catch (error) {
//       console.error('Error loading .docx file:', error);
//       reject(error);
//     }
    
    
//     try {
//       // Read the .docx file
//       const content = fs.readFileSync(docxFilePath, 'binary');

//       // Parse the .docx file
//       const doc = new docxtemplater();

//       try {
//         // Attempt to load the .docx file
//         console.log(doc)
//         doc.loadZip(content);

//         // Extract text content from the .docx file
//         const text = doc.getFullText();
//         console.log(text)

//         // Split the text content into rows and columns
//         const rows = text.split('\n').map(row => row.split('\t'));

//         // Create a new Excel workbook
//         xlsx.fromBlankAsync()
//           .then(workbook => {
//             const sheet = workbook.sheet(0);

//             // Populate the Excel sheet with the content
//             rows.forEach((row, rowIndex) => {
//               row.forEach((cell, columnIndex) => {
//                 sheet.cell(rowIndex + 1, columnIndex + 1).value(cell);
//               });
//             });

//             // Generate a unique filename for the Excel file
//             const excelFileName = `${Date.now()}_converted.xlsx`;
//             const excelFilePath = `uploads/${excelFileName}`;

//             // Save the Excel workbook to a file
//             return workbook.toFileAsync(excelFilePath)
//               .then(() => {
//                 console.log('Conversion complete. Excel file saved:', excelFilePath);
//                 resolve(excelFilePath); // Resolve with the path to the uploaded Excel file
//               });
//           })
//           .catch(error => {
//             console.error('Error converting .docx to Excel:', error);
//             reject(error);
//           });
//       } catch (loadError) {
//         console.error('Error loading .docx file:', loadError);
//         reject(loadError);
//       }
//     } catch (readError) {
//       console.error('Error reading .docx file:', readError);
//       reject(readError);
//     }
//   });
// }
// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const fileType = req.file.mimetype;
//     if (fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//       return res.status(400).json({ error: 'Invalid file format. Only .docx files are supported' });
//     }

//     const docxFilePath = req.file.path;
//     const excelFilePath = await convertDocxToExcelAndUpload(docxFilePath);

//     const excelData = readExcel(excelFilePath);
//     res.json({ success: true, data: excelData });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'An error occurred while processing the file' });
//   }
// });

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;

    // Check file type
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return res.status(400).json({ error: 'Invalid file format. Only .docx files are supported' });
    }

    const docxFilePath = `uploads/${file.name}`;
    // Use mv() to save the file
    await file.mv(docxFilePath);

    const excelFilePath = await convertDocxToExcelAndUpload(docxFilePath);

    const excelData = readExcel(excelFilePath);
    res.json({ success: true, data: excelData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the file' });
  }
});
function convertDocxToExcelAndUpload(docxFilePath) {
  return new Promise((resolve, reject) => {
    try {
      const content = fs.readFileSync(docxFilePath, 'binary');
      console.log(content)
      const doc = new docxtemplater();
      doc.loadZip(content);
      const text = doc.getFullText();
      const rows = text.split('\n').map(row => row.split('\t'));

      xlsx.fromBlankAsync()
        .then(workbook => {
          const sheet = workbook.sheet(0);
          rows.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
              sheet.cell(rowIndex + 1, columnIndex + 1).value(cell);
            });
          });

          const excelFileName = `${Date.now()}_converted.xlsx`;
          const excelFilePath = `uploads/${excelFileName}`;

          workbook.toFileAsync(excelFilePath)
            .then(() => {
              console.log('Conversion complete. Excel file saved:', excelFilePath);
              resolve(excelFilePath);
            })
            .catch(reject);
        })
        .catch(reject);
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
}

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