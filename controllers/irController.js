const IR = require('../models/IR');
const Cv = require('../models/CV');
const { Op } = require('sequelize');

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { json } = require('sequelize');
const RFP = require('../models/RFP');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/ir');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize Multer upload
const upload = multer({ storage: storage });

// Controller for handling CV operations
const irController = {
  // Get all CVs
  async getAll(req, res) {
    console.log("here")
    try {
      const irs = await IR.findAll();
      res.json(irs);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createIRFromFile(req, res, data, filePath) {
    try {
      console.log(data.rfpNo)
      // Extract data from the request body
      const { title, rfpNo, file, value } = data;
      // Create a new IR record in the database

      const newIR = await IR.create({
        title,
        rfpId: rfpNo,

        file: file,
        content: value,

      });

      // Send the newly created IR as a JSON response
      res.status(201).json(newIR);
    } catch (error) {
      // Handle any errors that occur during the creation process
      console.error('Error creating IR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  async createIR(data) {
    // console.log("data", data);
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
      const rfpCleaned = rfpNo.replace(/:/g, "");
      const titleCleaned = title.replace(/\n/g, "");
      const valueCleaned = value.replace(/\n/g, "");




      // Create a new IR record in the database
      const newIR = await IR.create({
        title: titleCleaned,
        rfpId,
        rfpNo: rfpCleaned,
        content: valueCleaned,
        file: filePath
      });

      console.log(newIR.id)
      // Send the newly created IR as a JSON response
      // res.status(201).json(newIR);
    } catch (error) {
      // Handle any errors that occur during the creation process
      console.error('Error creating IR:', error);
      // res.status(500).json({ error: 'Internal server error' });
    }
  }
  ,

  // Get a single CV by ID
  async getOne(req, res) {
    const { id } = req.params;

    try {
      let ir;


      const ir1 = await IR.findByPk(id);
      if (ir1) {
        ir = ir1
      }
      else {
        const ir2 = await IR.findOne({ where: { rfpId: id } });
        ir = ir2

      }

      if (ir) {
        if (ir.members) {

          const membersString = ir.members;
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


          // Add the members array to the ir object before sending the response
          ir.members = members;
        }

        res.json(ir);
      }




      else {
        res.status(404).json({ error: 'IR not found' });
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
      const ir = await IR.findOne({ where: { rfpId: id } });

      if (ir) {
      

        res.json(ir);
      }




      else {
        res.status(404).json({ error: 'IR not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateIR(data) {


    const { id, title, rfpId, rfpNo, value, filePath } = data;
    console.log("rfpId", title)
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
      const ir = await IR.findByPk(id);
      if (!ir) {
        return res.status(404).json({ error: "IR not found" });
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
      ir.title = titleCleaned;
      ir.rfpId = rfpKey;
      ir.rfpNo = rfpCleaned;
      ir.file = filePath;

      ir.content = valueCleaned;

      await ir.save();

      // res.json(ir);
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
    try {
      const irs = await IR.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } },
            { rfpNo: { [Op.iLike]: `%${query}%` } },
            { content: { [Op.iLike]: `%${query}%` } },
         
          ],
        },
      });
      res.json(irs);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  // async  createIR(req, res) {
  //   try {


  //       // Extract data from the request body
  //       const { title, rfpNo, filePath, value } = data;


  //       // Create a new IR record in the database
  //       const newIR = await IR.create({
  //         title,
  //         rfpNo,

  //         content: value,

  //         file: filePath // Store filename in the database
  //       });

  //       // Send the newly created IR as a JSON response
  //       return res.status(201).json(newIR);

  //   } catch (error) {
  //     // Handle any errors that occur during the creation process
  //     console.error('Error creating IR with file upload:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // },
};

module.exports = irController;
