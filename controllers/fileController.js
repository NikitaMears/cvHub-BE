const xlsx = require('xlsx');
const fs = require('fs');
const Cv = require('../models/CV');

function readExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Assuming your Excel file has a header row
  const header = data[0];
  const rows = data.slice(1);

  const extractedData = [];
  let foundEmptyRow = false; // Flag to track if any empty row is found

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let isEmptyRow = true; // Flag to track if the row is empty

    for (let j = 0; j < row.length; j++) {
      if (row[j] !== null && row[j] !== undefined) {
        isEmptyRow = false;
        break; // Exit the loop if a non-empty cell is found
      }
    }

    if (isEmptyRow) {
      foundEmptyRow = true; // Update the flag if an empty row is found
      break; // Exit the loop if an empty row is found
    }

    // const cvInfo = {
    //   'S/N': row[0] !== null && row[0] !== undefined ? row[0] : 'NA',
    //   'Expert Name': row[1] !== null && row[1] !== undefined ? row[1] : 'NA',
    //   'Country': row[2] !== null && row[2] !== undefined ? row[2] : 'NA',
    //   'CV': row[3] !== null && row[3] !== undefined ? row[3] : 'NA',
    //   'Contact Information': row[4] !== null && row[4] !== undefined ? row[4] : 'NA',
    //   'Research Interest': row[5] !== null && row[5] !== undefined ? row[5] : 'NA',
    //   'Price Average': row[6] !== null && row[6] !== undefined ? row[6] : 'NA',
    //   'Project Title Work with Frontieri': row[7] !== null && row[7] !== undefined ? row[7] : 'NA',
    //   'CV Summary': row[8] !== null && row[8] !== undefined ? row[8] : 'NA',
    // };
    const cvInfo = {
      serialNumber: row[0] !== null && row[0] !== undefined ? row[0] : 'NA',
      expertName: row[1] !== null && row[1] !== undefined ? row[1] : 'NA',
      country: row[2] !== null && row[2] !== undefined ? row[2] : 'NA',
      cv: row[3] !== null && row[3] !== undefined ? row[3] : 'NA',
      contactInformation: row[4] !== null && row[4] !== undefined ? row[4] : 'NA',
      researchInterest: row[5] !== null && row[5] !== undefined ? row[5] : 'NA',
      priceAverage: row[6] !== null && row[6] !== undefined ? row[6] : 0.0,
      projectTitle: row[7] !== null && row[7] !== undefined ? row[7] : 'NA',
      cvSummary: row[8] !== null && row[8] !== undefined ? row[8] : 'NA',
    };
    extractedData.push(cvInfo);
  }

  // If an empty row is encountered, stop processing and return the extracted data
  if (foundEmptyRow) {
    Cv.bulkCreateCvs(extractedData);
    return extractedData;
  }

  // If no empty row is encountered, process all rows and return the extracted data
  Cv.bulkCreateCvs(extractedData);
  return extractedData;
}

module.exports = { readExcel };


// Example usage:
// const filePath = '../uploads/cv/2.xlsx';
// const excelData = readExcel(filePath);
// console.log(excelData);
