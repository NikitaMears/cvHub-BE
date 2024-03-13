const mammoth = require('mammoth');
const fs = require('fs');
const Cv = require('../models/CV');
const { searchTitle } = require('./rfpController');
const { createTP,createTPFromFile } = require('./tpController');



// async function readDoc(filePath) {
//   try {
//     const { value } = await mammoth.extractRawText({ path: filePath });

//     // Split the extracted text by newline to get lines and filter out empty lines
//     const lines = value.split('\n').filter(line => line.trim() !== '');

//     let title = '';
//     let clientName = '';
//     let value2 = '';
//     let year = '';
//     let fileDetailLink = '';

//     for (const line of lines) {
//       // Extract relevant information from each line
//       if (line.includes(':')) {
//         const [key, ...rest] = line.split(':').map(str => str.trim());
//         const value = rest.join(':').trim();
//         switch (key) {
//           case 'Title':
//             title = value;
//             break;
//           case 'Client Name':
//             clientName = value;
//             break;
//           case 'Value ($)':
//             // Extracting value and parsing as float
//             value2 = parseFloat(value.replace(/[^0-9.-]+/g,""));
//             break;
//           case 'Year':
//             // Extracting year and parsing as integer
//             year = parseInt(value);
//             break;
//           case 'File Detail Link':
//             fileDetailLink = value;
//             break;
//           default:
//             // Ignore unrecognized keys
//             break;
//         }
//       }
//     }

//     // Log the extracted data
//     console.log('Title:', title);
//     console.log('Client Name:', clientName);
//     console.log('Value ($):', value);
//     console.log('Year:', year);
//     console.log('File Detail Link:', fileDetailLink);

//    // return { title, clientName, value, year, fileDetailLink };
//   } catch (error) {
//     console.error('Error reading document:', error);
//     return {};
//   }
// }


async function readDocForTP(req, res, filePath) {
    try {
        const { value } = await mammoth.extractRawText({ path: filePath });
      //  console.log("val", value)

        const outputFilePath = '.2.txt'; // Replace 'output.txt' with the desired output file path
//console.log(value)
        fs.writeFileSync(outputFilePath, value, 'utf8');
        // Define variables to store extracted data
        let title = '';
        let rfpNo = '';
        let client = '';
        let country = '';
        let issuedOn = '';
        let objectives = '';
        let specificObjectives = '';
        const text = "Technical Proposal Institutional capacity needs assessment for SMCRD";

        // Define regular expressions to match the required patterns
        const titleRegex = /Technical Proposal\s*:?[\r\n]*\s*(.*)/;
        // const rfpNoRegex = /RFP\s*No:\s*(.*)/;
        const clientRegex = /for\s+(.*)/;

        const countryRegex = /(Country|Nation|Nationhood|State|Republic|Kingdom|Empire|Territory):\s*(.*)/;
        const issuedOnRegex = /\s(\d{4})$/;
        const objectivesRegex = /Objectives\s*of\s*Borrow\s*Completion\s*Report([\s\S]*?)The\s*specific\s*objectives\s*are\s*to:/;
        // Replace the existing specificObjectivesRegex definition with the updated one
        const specificObjectivesRegex = /The\s*specific\s*objectives\s*are\s*to:(.*?)(?=Procurement\s*of:|\n\n|$)/gs;

        // Extract data using regular expressions
        const match = titleRegex.exec(value);
        const titleMatch = match ? match[1] : null;
       const clientMatch = titleMatch ? clientRegex.exec(titleMatch)[1] : null;

       const rfpNoMatch = await searchTitle(req, res, title)
    

        const countryMatch = value.match(countryRegex);
        const issuedOnMatch = value.match(issuedOnRegex);
        const objectivesMatch = value.match(objectivesRegex);
        const specificObjectivesMatch = value.match(specificObjectivesRegex);
      //  return

        // Assign extracted values to variables if matches are found
        if (titleMatch) {
            title = titleMatch;
        }
        if (rfpNoMatch) {
           rfpNo =  rfpNoMatch[0].dataValues.id
        }
        else{
            rfpNo = 14;
        }
        if (clientMatch) {
            client = clientMatch;
        }
        country = countryMatch ? countryMatch[0] : 'Ethiopia';
        console.log(issuedOnMatch)

        issuedOn = issuedOnMatch ? issuedOnMatch[0] : '2024';

        console.log(clientMatch, "titleMatch")

        if (objectivesMatch && objectivesMatch.length > 1) {
            objectives = objectivesMatch[1].trim();
        }
        if (specificObjectivesMatch && specificObjectivesMatch.length > 1) {
            specificObjectives = specificObjectivesMatch[1].trim();
        }
            let sector = '';

        // You can add your logic here to analyze the content and recommend a sector based on keywords or phrases

        // For example, if the document mentions "agriculture", "farming", or related terms, you can recommend the Agriculture sector
        if (value.toLowerCase().includes('agriculture') || value.toLowerCase().includes('farming')) {
            sector = 'Agriculture';
        } else if (value.toLowerCase().includes('health') || value.toLowerCase().includes('medical')) {
            sector = 'Healthcare';
        } else if (value.toLowerCase().includes('education') || value.toLowerCase().includes('school')) {
            sector = 'Education';
        } else if (value.toLowerCase().includes('finance') || value.toLowerCase().includes('banking')) {
            sector = 'Finance';
        } else if (value.toLowerCase().includes('technology') || value.toLowerCase().includes('software')) {
            sector = 'Technology';
        } else if (value.toLowerCase().includes('construction') || value.toLowerCase().includes('building')) {
            sector = 'Construction';
        } else if (value.toLowerCase().includes('energy') || value.toLowerCase().includes('power')) {
            sector = 'Energy';
        } else if (value.toLowerCase().includes('transportation') || value.toLowerCase().includes('logistics')) {
            sector = 'Transportation';
        } else if (value.toLowerCase().includes('environment') || value.toLowerCase().includes('sustainability')) {
            sector = 'Environment';
        } else if (value.toLowerCase().includes('government') || value.toLowerCase().includes('public service')) {
            sector = 'Government';
        } else {
            // If no specific sector is identified, you can set a default recommendation or leave it blank
            sector = 'Other';
        }
        

        const data = { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, sector , value};
       
        data.file = filePath;
        createTPFromFile(req, res, data)

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

module.exports = { readDocForTP };
