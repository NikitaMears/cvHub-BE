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



// function readExcelForFirm(filePath) {
//   try {
//     const workbook = xlsx.readFile(filePath, { cellDates: true });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, blankRows: false });
//     const header = data[0];
//     const rows = data.slice(1);
//     const extractedData = [];

  
//     console.log(data)
   
//   for (let i = 0; i < rows.length; i++) {
//     const row = rows[i];

//     if (row.length === 0) {
//       // Skip empty rows
//       continue;
//     }

//     const projectInfo = {
//       number: row[0] !== null && row[0] !== undefined ? row[0] : 'NA',
//       projectTitle: row[1] !== null && row[1] !== undefined ? row[1] : 'NA',
//       client: row[2] !== null && row[2] !== undefined ? row[2] : 'NA',
//       worth: row[3] !== null && row[3] !== undefined ? row[3] : 0.0,
//       projectType: row[4] !== null && row[4] !== undefined ? row[4] : 'NA',
//       durationInMonths: row[5] !== null && row[5] !== undefined ? row[5] : 'NA',
//       projectSummary: row[6] !== null && row[6] !== undefined ? row[6] : 'NA',
//       keyTeamMember: row[7] !== null && row[7] !== undefined ? row[7] : 'NA',
//       position: row[8] !== null && row[8] !== undefined ? row[8] : 'NA',
//       detailSheet: row[9] !== null && row[9] !== undefined ? row[9] : 'NA',
//     };

//     extractedData.push(projectInfo);
//   }

//   return extractedData;
//   } catch (err) {
//     console.error('Error reading Excel file:', err);
//     return [];
//   }
// }



const Project = require('../models/Project'); // Assuming you have a Project model defined

 function readExcelForFirm(filePath) {
  try {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, blankRows: false });
    const header = data[0];
    const rows = data.slice(1);
    const projectsToCreate = [];

    let currentProjectInfo = null;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) {
        // Skip empty rows
        continue;
      }

      const teamMemberParts = row[7] !== null && row[7] !== undefined ? row[7].split('-') : [];
      const teamMember = teamMemberParts.length > 0 ? teamMemberParts[0].trim() : 'NA';
      const internalOrExternal = teamMemberParts.length > 1 ? teamMemberParts[1].trim().replace('int', 'Internal').replace('ext', 'External') : 'NA';
      const position = teamMemberParts.length > 2 ? teamMemberParts[2].trim() : 'NA';

      if (row[0] !== null && row[0] !== undefined) {
        // This row has a number, create a new projectInfo object
        currentProjectInfo = {
          title: row[1] !== null && row[1] !== undefined ? row[1] : 'NA',
          client: row[2] !== null && row[2] !== undefined ? row[2] : 'NA',
          worth: row[3] !== null && row[3] !== undefined ? row[3] : 0.0,
          projectType: row[4] !== null && row[4] !== undefined ? row[4] : 'NA',
          duration: row[5] !== null && row[5] !== undefined ? parseInt(row[5].split(' ')[0]) : 0,
          summary: row[6] !== null && row[6] !== undefined ? row[6] : 'NA',
          teamMembers: [`${teamMember}-${internalOrExternal}-${position}`],
          detailSheet: row[8] !== null && row[8] !== undefined ? row[8] : 'NA',
          sector: row[9] !== null && row[9] !== undefined ? row[9] : 'NA',
        };
        projectsToCreate.push(currentProjectInfo);
      } else {
        // This row doesn't have a number, append the team member to the previous projectInfo object
        if (currentProjectInfo) {
          currentProjectInfo.teamMembers.push(`${teamMember}-${internalOrExternal}-${position}`);
        }
      }
    }

    // Bulk create projects
    Project.bulkCreate(projectsToCreate)
      .then(() => console.log('Projects created successfully'))
      .catch((err) => console.error('Error creating projects:', err));

    return projectsToCreate;
  } catch (err) {
    console.error('Error reading Excel file:', err);
    return [];
  }
}

module.exports = { readExcelForFirm };

module.exports = { readExcel };



// Example usage:
// const filePath = '../uploads/firmExperience/firm5.xlsx';
// const excelData = readExcelForFirm(filePath);
// console.log(excelData);
