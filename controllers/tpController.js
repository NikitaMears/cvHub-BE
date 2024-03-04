const TP = require('../models/TP');
const Cv = require('../models/CV');

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/tp');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize Multer upload
const upload = multer({ storage: storage });

// Controller for handling CV operations
const tpController = {
  // Get all CVs
  async getAll(req, res) {
    try {
      const tps = await TP.findAll();
      res.json(tps);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async  createTP(req, res, data) {
    try {
        // Extract data from the request body
        const { title, rfpId, client, tin, year, members, participants, sector, file } = data;
console.log("data", data)
        // Create a new TP record in the database
        const newTP = await TP.create({
            title,
            rfpId,
            client,
            tin,
            year,
            members,
            participants,
            file
        });

        // Send the newly created TP as a JSON response
        res.status(201).json(newTP);
    } catch (error) {
        // Handle any errors that occur during the creation process
        console.error('Error creating TP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
},

  // Get a single CV by ID
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const tp = await TP.findByPk(id);
      if (tp) {
        res.json(tp);
      } else {
        res.status(404).json({ error: 'TP not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

//   async  getCvsForTPs(req, res) {
//     try {
//       const { id } = req.params;
      
//       // Find the TP with the given id
//       const tp = await TP.findByPk(id);
  
//       if (!tp) {
//         return res.status(404).json({ error: 'TP not found' });
//       }
  
//       // Get the tin and sector from the TP
//       const { tin, sector } = tp;
  
//       // Find all CVs where location matches the tin of the TP and researchInterest matches the sector of the TP
//       const cvs = await Cv.findAll({
//         where: {
//           tin,
//           researchInterest: sector
//         },
//         order: [
//           ['averagePoints', 'DESC'], // Sort by averagePoints in descending order
//           ['priceAverage', 'ASC']    // Then sort by priceAverage in ascending order
//         ]
//       });
  
//       res.json(cvs);
//     } catch (error) {
//       console.error('Error fetching CVs for TPs:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },


  async update (req, res) {
    const { id } = req.params;
    
  
    const { title, rfpId, client, tin, year, members, participants, file, sector } = req.body;
  
    try {
      const tp = await TP.findByPk(id);
      if (!tp) {
        return res.status(404).json({ error: "TP not found" });
      }
  
  
      tp.title = title;
      tp.rfpId = rfpId;
      tp.client = client;
      tp.tin = tin;
      tp.year = year;
      tp.members = members;
      tp.participants = participants;
    //  tp.file = file;
  
      await tp.save();
  
      res.json(tp);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  
  

  // Delete a CV
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedRows = await Cv.destroy({ where: { id } });
      if (deletedRows > 0) {
        res.json({ message: 'CV deleted successfully' });
      } else {
        res.status(404).json({ error: 'CV not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Search for CVs based on criteria
  async search(req, res) {
    const { query } = req.query;
    try {
      const cvs = await Cv.findAll({
        where: {
          [Op.or]: [
            { serialNumber: { [Op.like]: `%${query}%` } },
            { expertName: { [Op.like]: `%${query}%` } },
            { tin: { [Op.like]: `%${query}%` } },
            { cv: { [Op.like]: `%${query}%` } },
            { contactInformation: { [Op.like]: `%${query}%` } },
            { researchInterest: { [Op.like]: `%${query}%` } },
            { priceAverage: { [Op.like]: `%${query}%` } },
            { projectTitle: { [Op.like]: `%${query}%` } },
            { cvSummary: { [Op.like]: `%${query}%` } },
          ],
        },
      });
      res.json(cvs);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  async  create(req, res, filePath) {
    try {
     
  
        // Extract data from the request body
        const { title, rfpId, client, tin, year, members, participants, sector } = req.body;
        const file = req.file; // Uploaded file
        console.log("fff", file)
  
        // Create a new TP record in the database
        const newTP = await TP.create({
          title,
          rfpId,
          client,
          tin,
          year,
          members,
          participants,
          file: filePath // Store filename in the database
        });
  
        // Send the newly created TP as a JSON response
        return res.status(201).json(newTP);
    
    } catch (error) {
      // Handle any errors that occur during the creation process
      console.error('Error creating TP with file upload:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = tpController;
