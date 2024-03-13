const mammoth = require('mammoth');
const fs = require('fs');
const Cv = require('../models/CV');
const { createRFP } = require('./rfpController');

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


async function readDoc(req, res, filePath) {
    try {
        const { value } = await mammoth.extractRawText({ path: filePath });
      //  console.log("val", value)

        const outputFilePath = '.2.txt'; // Replace 'output.txt' with the desired output file path

        fs.writeFileSync(outputFilePath, value, 'utf8');
        console.log('Text saved to', outputFilePath);
        // Define variables to store extracted data
        let title = '';
        let rfpNo = '';
        let client = '';
        let country = '';
        let issuedOn = '';
        let objectives = '';
        let specificObjectives = '';

        // Define regular expressions to match the required patterns
        const titleRegex = /Procurement\s*of:\s*(.*)/;
        const rfpNoRegex = /RFP\s*No:\s*(.*)/;
        const clientRegex = /Client:\s*(.*)/;
        const countryRegex = /Country:\s*(.*)/;
        const issuedOnRegex = /Issued\s*on:\s*(.*)/; // Define regular expressions to match the objectives and specific objectives
        const objectivesRegex = /Objectives\s*of\s*Borrow\s*Completion\s*Report([\s\S]*?)The\s*specific\s*objectives\s*are\s*to:/;
        // Replace the existing specificObjectivesRegex definition with the updated one
        const specificObjectivesRegex = /The\s*specific\s*objectives\s*are\s*to:(.*?)(?=Procurement\s*of:|\n\n|$)/gs;

        // Extract data using regular expressions
        const titleMatch = value.match(titleRegex);
        const rfpNoMatch = value.match(rfpNoRegex);
        const clientMatch = value.match(clientRegex);
        const countryMatch = value.match(countryRegex);
        const issuedOnMatch = value.match(issuedOnRegex);
        const objectivesMatch = value.match(objectivesRegex);
        const specificObjectivesMatch = value.match(specificObjectivesRegex);

        // Assign extracted values to variables if matches are found
        if (titleMatch) {
            title = titleMatch[1];
        }
        if (rfpNoMatch) {
            rfpNo = rfpNoMatch[1];
        }
        if (clientMatch) {
            client = clientMatch[1];
        }
        if (countryMatch) {
            country = countryMatch[1];
        }
        if (issuedOnMatch) {
            issuedOn = issuedOnMatch[1];
        }
        if (objectivesMatch && objectivesMatch.length > 1) {
            objectives = objectivesMatch[1].trim();
        }
        if (specificObjectivesMatch && specificObjectivesMatch.length > 1) {
            specificObjectives = specificObjectivesMatch[1].trim();
        }

        // Log the extracted data
        console.log('Title:', title);
        console.log('RFP No:', rfpNo);
        console.log('Client:', client);
        console.log('Country:', country);
        console.log('Issued on:', issuedOn);
        console.log('Objectives:', objectives);
        console.log('Specific Objectives:', specificObjectives);

        // Analyze the content and recommend the best-suited sector
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
        

        console.log('Recommended Sector:', sector);
        const data = { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, sector, value };
        data.file = filePath;
        createRFP(req, res, data)
        // const savedRFP = await RFP.create({
        //     title,
        //     rfpNo,
        //     client,
        //     country,
        //     issuedOn,
        //     objectives,
        //     specificObjectives,
        //     file: filePath, // Set the file path here
        //     sector, // Add the recommended sector here
        // });

        // console.log('RFP data saved:', savedRFP);


        // Return the extracted data along with the recommended sector
        return { title, rfpNo, client, country, issuedOn, objectives, specificObjectives, sector };
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

module.exports = { readDoc };
