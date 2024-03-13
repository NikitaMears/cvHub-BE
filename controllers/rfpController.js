const RFP = require('../models/RFP');
const Cv = require('../models/CV');
const { Op } = require('sequelize');

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
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async  searchContent(req, res) {
    const searchText = req.params.searchText; // Assuming the search text is provided in the request parameters
    try {
        // Using Sequelize to find all records where the text_data column contains the search text
        const rfps = await RFP.findAll({
            where: {
                content: {
                    [Op.iLike]: `%${searchText}%` // Case-insensitive search with wildcard %
                }
            }
        });

        res.json(rfps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
,
  async  createRFP(req, res, data) {
    try {
        // Extract data from the request body
        const { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, sector, file, value } = data;
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
            file,
            content : value
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
  
      console.log("rr", rfp)
      const { country, sector } = rfp;
  
      const cvs = await Cv.findAll({
        where: {
          country,
          researchInterest: sector
        },
        order: [
          ['averagePoints', 'DESC'],
          ['priceAverage', 'ASC']    
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
    const { query } = req.body;
    console.log("query", query)
    try {
      const cvs = await RFP.findAll({
        where: {
          [Op.or]: [
            { title: {[Op.iLike]: `%${query}%`   } },
            { rfpNo: { [Op.iLike]: `%${query}%` } },
            { client: { [Op.iLike]: `%${query}%` } },
            { country: { [Op.iLike]: `%${query}%` } },
            { issuedOn: { [Op.iLike]: `%${query}%` } },
            { objectives: { [Op.iLike]: `%${query}%` } },
            { sector: { [Op.iLike]: `%${query}%` } },
            { specificObjectives: { [Op.iLike]: `%${query}%` } },
            { content: { [Op.iLike]: `%${query}%` } },
          ],
        },
      });
      res.json(cvs);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async searchTitle(req, res, query) {
    console.log("Query:", query);
    try {
      const rfp = await RFP.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
          ],
        },
      });
    //  console.log("Matching RFPs:", rfp);
return rfp    } catch (error) {
      console.error("Error:", error);
return false    }
  }
,  
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
