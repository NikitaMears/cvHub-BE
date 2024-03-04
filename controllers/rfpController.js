const RFP = require('../models/RFP');
const Cv = require('../models/CV');

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/rfp');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize Multer upload
const upload = multer({ storage: storage });

// Controller for handling CV operations
const rfpController = {
  // Get all CVs
  async getAll(req, res) {
    try {
      const rfps = await RFP.findAll();
      res.json(rfps);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async  createRFP(req, res, data) {
    try {
        // Extract data from the request body
        const { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, sector, file } = data;
console.log("data", data)
        // Create a new RFP record in the database
        const newRFP = await RFP.create({
            title,
            rfpNo,
            client,
            country,
            issuedOn,
            objectives,
            specificObjectives,
            sector,
            file
        });

        // Send the newly created RFP as a JSON response
        res.status(201).json(newRFP);
    } catch (error) {
        // Handle any errors that occur during the creation process
        console.error('Error creating RFP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
},

  // Get a single CV by ID
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const rfp = await RFP.findByPk(id);
      if (rfp) {
        res.json(rfp);
      } else {
        res.status(404).json({ error: 'RFP not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async  getCvsForRFPs(req, res) {
    try {
      const { id } = req.params;
      
      // Find the RFP with the given id
      const rfp = await RFP.findByPk(id);
  
      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }
  
      // Get the country and sector from the RFP
      const { country, sector } = rfp;
  
      // Find all CVs where location matches the country of the RFP and researchInterest matches the sector of the RFP
      const cvs = await Cv.findAll({
        where: {
          country,
          researchInterest: sector
        },
        order: [
          ['averagePoints', 'DESC'], // Sort by averagePoints in descending order
          ['priceAverage', 'ASC']    // Then sort by priceAverage in ascending order
        ]
      });
  
      res.json(cvs);
    } catch (error) {
      console.error('Error fetching CVs for RFPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // Update a CV
  // async update(req, res) {
  //   const { id } = req.params;
  //   const updatedData = req.body;
  //   try {
  //     const [rowsUpdated, [updatedCv]] = await Cv.update(updatedData, {
  //       where: { id },
  //       returning: true,
  //     });
  //     if (rowsUpdated > 0) {
  //       res.json(updatedCv);
  //     } else {
  //       res.status(404).json({ error: 'CV not found' });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // },



  async update (req, res) {
    const { id } = req.params;
    
  
    const { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, file, sector } = req.body;
  
    try {
      const rfp = await RFP.findByPk(id);
      if (!rfp) {
        return res.status(404).json({ error: "RFP not found" });
      }
  
  
      rfp.title = title;
      rfp.rfpNo = rfpNo;
      rfp.client = client;
      rfp.country = country;
      rfp.issuedOn = issuedOn;
      rfp.objectives = objectives;
      rfp.specificObjectives = specificObjectives;
      rfp.sector = sector;
    //  rfp.file = file;
  
      await rfp.save();
  
      res.json(rfp);
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
            { country: { [Op.like]: `%${query}%` } },
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
        const { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, sector } = req.body;
        const file = req.file; // Uploaded file
        console.log("fff", file)
  
        // Create a new RFP record in the database
        const newRFP = await RFP.create({
          title,
          rfpNo,
          client,
          country,
          issuedOn,
          objectives,
          specificObjectives,
          sector,
          file: filePath // Store filename in the database
        });
  
        // Send the newly created RFP as a JSON response
        return res.status(201).json(newRFP);
    
    } catch (error) {
      // Handle any errors that occur during the creation process
      console.error('Error creating RFP with file upload:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = rfpController;
