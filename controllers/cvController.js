const Cv = require('../models/CV');
const path = require('path');
const fs = require('fs');
// Controller for handling CV operations
const cvController = {
  // Get all CVs
  async getAll(req, res) {
    try {
      const cvs = await Cv.findAll();
      res.json(cvs);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a single CV by ID
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const cv = await Cv.findByPk(id);
      if (cv) {
        res.json(cv);
      } else {
        res.status(404).json({ error: 'CV not found' });
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



  async update(id, filePath) {
    console.log("id", id)
    console.log("filePath", filePath)
   
    try {
      const cv = await Cv.findByPk(id);
      if (!cv) {
        return res.status(404).json({ error: 'cv not found' });
      }
  
      cv.cv = filePath; // Now filePath is accessible here
  
      await cv.save();
      return true;

    } catch (error) {
      console.log(error)
      return false;
      // res.status(500).json({ error: 'Internal server error' });
    }
  }
  
,
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

module.exports = cvController;
