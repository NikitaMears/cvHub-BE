const mammoth = require('mammoth');
const fs = require('fs');
const Cv = require('../models/CV');
const { createIR, updateIR} = require('./irController');




async function readDocForIR( filePath) {
    
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // console.log(filePath);


    try {
        const { value } = await mammoth.extractRawText({ path: filePath });


        // Define variables to store extracted data
        let title = '';
        let rfpNo = '';
       

        // Define regular expressions to match the required patterns
        const titleRegex = /Draft\s*Inception\s*Report([\s\S]*?)(?=Legal\s*Name\s*of\s*Proposing\s*Organization\/Firm:)/is;
        const rfpNoRegex = /RFP\s*NO\.\s*(.*)/i;
      
      
        // Extract data using regular expressions
        const titleMatch = value.match(titleRegex);
        const rfpNoMatch = value.match(rfpNoRegex);
 

        // Assign extracted values to variables if matches are found
        if (titleMatch) {
            title = titleMatch[1];
        }
        if (rfpNoMatch) {
            rfpNo = rfpNoMatch[1];
        }
      

        // Log the extracted data
        // console.log('Title:', title);
        // console.log('RFP No:', rfpNo);
   



        const data = { title, rfpNo,  value, filePath };
      createIR(data)
 return { title, rfpNo };
    } catch (error) {
        console.error('Error reading document:', error);
        return {};
    }
}

async function updateDocForIR(req, filePath) {
    
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // console.log(filePath);
const id = req.params.id;
let rfpId;
if (req.body.rfpId){
rfpId = req.body.rfpId
}
else{
    rfpId = null;
}

    try {
        const { value } = await mammoth.extractRawText({ path: filePath });


        // Define variables to store extracted data
        // let title = '';
        // let rfpNo = '';
       

        // // Define regular expressions to match the required patterns
        // const titleRegex = /Draft\s*Inception\s*Report([\s\S]*?)(?=Legal\s*Name\s*of\s*Proposing\s*Organization\/Firm:)/is;
        // const rfpNoRegex = /RFP\s*NO\.\s*(.*)/i;
      
      
        // // Extract data using regular expressions
        // const titleMatch = value.match(titleRegex);
        // const rfpNoMatch = value.match(rfpNoRegex);
 

        // // Assign extracted values to variables if matches are found
        // if (titleMatch) {
        //     title = titleMatch[1];
        // }
        // if (rfpNoMatch) {
        //     rfpNo = rfpNoMatch[1];
        // }
      
        const title = req.body.title;
        const rfpNo = req.body.rfpNo;
       
        // Log the extracted data
        // console.log('Title:', title);
        // console.log('RFP No:', rfpNo);
   



        const data = { id,title,rfpId, rfpNo,  value, filePath };
      updateIR(data)
 return { title, rfpNo };
    } catch (error) {
        console.error('Error reading document:', error);
        return {};
    }
}

// Example usage


  
// Example usage
// const filePath = '../uploads/rfp/2.docx'; // Change this to your document's path
// readDoc(filePath)
//   .then(extractedData => {
//  //  console.log('Extracted data:', extractedData);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

module.exports = { readDocForIR, updateDocForIR };
