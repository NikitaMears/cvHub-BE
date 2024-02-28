const RFP = require('../models/RFP');
const path = require('path');
const fs = require('fs');
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
    const { error } = updateRFPSchema.validate(req.body); // Assuming you have a schema for validating RFP updates
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, file } = req.body;
  
    try {
      const rfp = await RFP.findByPk(id);
      if (!rfp) {
        return res.status(404).json({ error: "RFP not found" });
      }
  
      // Check if the user has the required permission (if applicable)
      // const hasAccess = await hasPermission(req, "editRFP");
      // if (!hasAccess) {
      //   return res.status(403).json({ error: "Unauthorized" });
      // }
  
      // Update the RFP data
      rfp.title = title;
      rfp.rfpNo = rfpNo;
      rfp.client = client;
      rfp.country = country;
      rfp.issuedOn = issuedOn;
      rfp.objectives = objectives;
      rfp.specificObjectives = specificObjectives;
      rfp.file = file;
  
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
};

module.exports = rfpController;
