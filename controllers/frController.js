const FR = require('../models/FR');
const Cv = require('../models/CV');
const { Op } = require('sequelize');

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { json } = require('sequelize');
const RFP = require('../models/RFP');
const { compareSync } = require('bcrypt');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/fr');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize Multer upload
const upload = multer({ storage: storage });

// Controller for handling CV operations
const frController = {
  // Get all CVs
  async getAll(req, res) {
    console.log("here")
    try {
      const frs = await FR.findAll();
      res.json(frs);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createFRFromFile(req, res, data, filePath) {
    try {
      console.log(data.rfpNo)
      // Extract data from the request body
      const { title, rfpNo, file, value } = data;
      // Create a new FR record in the database

      const newFR = await FR.create({
        title,
        rfpId: rfpNo,

        file: file,
        content: value,

      });

      // Send the newly created FR as a JSON response
      res.status(201).json(newFR);
    } catch (error) {
      // Handle any errors that occur during the creation process
      console.error('Error creating FR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async createFR(data) {
     console.log("data", data.filePath);
    try {
      // Extract data from the request body
      const { title, rfpNo, filePath, value } = data;
      let rfpId;

      // Find the RFP based on the rfpNo
      const rfp = await RFP.findOne({ where: { rfpNo: rfpNo } });
      if (rfp) {
        rfpId = rfp.id;
      } else {
        rfpId = 'N/A';
      }
      let rfpCleaned;
    let   titleCleaned;
      if(title){
         titleCleaned = title.replace(/\n/g, "");

      }
      else{
        titleCleaned = 'N/A'
      }
      if(rfpNo){
        rfpCleaned = rfpNo.replace(/:/g, "");

      }
      else{
        rfpCleaned = 'N/A'
      }
      const valueCleaned = value.replace(/\n/g, "");


      const randomNumber = Math.floor(Math.random() * (10000000 - 10 + 1)) + 10;


      // Create a new FR record in the database
      const newFR = await FR.create({
        id : randomNumber,

        title: titleCleaned,
        rfpId,
        rfpNo: rfpCleaned,
        content: valueCleaned,
        file: filePath
      });
// console.log(newFR);
   //   console.log(newFR.id)
      // Send the newly created FR as a JSON response
      // res.status(201).json(newFR);
    } catch (error) {
      // Handle any errors that occur during the creation process
      console.error('Error creating FR:', error);
      // res.status(500).json({ error: 'Internal server error' });
    }
  }
  ,

  // Get a single CV by ID
  async getOne(req, res) {
    const { id } = req.params;

    try {
      let fr;


      const fr1 = await FR.findByPk(id);
      if (fr1) {
        fr = fr1
      }
      else {
        const fr2 = await FR.findOne({ where: { rfpId: id } });
        fr = fr2

      }

      if (fr) {
        if (fr.members) {

          const membersString = fr.members;
          console.log("*****", membersString)

          //  const membersArray = membersString.replace(/[{}"]/g, '').split(',').map(Number);

          // Initialize an array to store the results
          const members = [];
          console.log(membersString)

          // Use map instead of forEach
          const promises = membersString.map(async mem => {
            const cv = await Cv.findByPk(mem.id);
            // console.log(cv);
            if (cv) {
              // Assign the position value to the cv object
              cv.cv = mem.position;
              members.push(cv); // Push the result to the members array
            }
          });


          // Wait for all asynchronous operations to complete
          await Promise.all(promises);


          // Add the members array to the fr object before sending the response
          fr.members = members;
        }

        res.json(fr);
      }




      else {
        res.status(404).json({ error: 'FR not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  ,
  async getOneForRFP(req, res) {
    const { id } = req.params;

    try {
      const fr = await FR.findOne({ where: { rfpId: id } });

      if (fr) {
        res.json(fr);

      }

      else {
        res.status(404).json({ error: 'FR not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateFR(data) {

console.log("adasdasd",data);
    const { id, title, rfpId, rfpNo, value, filePath } = data;
    console.log("rfpId", rfpId)
    let rfpKey = rfpId;
    if (rfpKey == null) {
      let rfp = await RFP.findOne({ where: { rfpNo: rfpNo } });
      if (rfp) {
        rfpKey = rfp.id;
      } else {
        rfpKey = 'N/A';
      }
    }

    try {
      const fr = await FR.findByPk(id);
      if (!fr) {
        return res.status(404).json({ error: "FR not found" });
      }

     
      const valueCleaned = value.replace(/\n/g, "");
      fr.title = title;
      fr.rfpId = rfpKey;
      fr.rfpNo = rfpNo;
      fr.file = filePath;

      fr.content = valueCleaned;

      await fr.save();

      // res.json(fr);
    } catch (error) {
      console.error(error);
      // res.status(500).json({ error: "Internal Server Error" });
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
      const frs = await FR.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } },
            { client: { [Op.iLike]: `%${query}%` } },
            { objectives: { [Op.iLike]: `%${query}%` } },
            { sector: { [Op.iLike]: `%${query}%` } },
            { specificObjectives: { [Op.iLike]: `%${query}%` } },
            { content: { [Op.iLike]: `%${query}%` } },
          ],
        },
      });
      res.json(frs);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  // async  createFR(req, res) {
  //   try {


  //       // Extract data from the request body
  //       const { title, rfpNo, filePath, value } = data;


  //       // Create a new FR record in the database
  //       const newFR = await FR.create({
  //         title,
  //         rfpNo,

  //         content: value,

  //         file: filePath // Store filename in the database
  //       });

  //       // Send the newly created FR as a JSON response
  //       return res.status(201).json(newFR);

  //   } catch (error) {
  //     // Handle any errors that occur during the creation process
  //     console.error('Error creating FR with file upload:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // },
};

module.exports = frController;
