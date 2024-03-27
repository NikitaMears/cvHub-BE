// const xlsx = require('xlsx');
// const fs = require('fs');

// const Project = require('../models/Project'); // Assuming you have a Project model defined

//  function readExcelForFirm(filePath) {
//   try {
//     const workbook = xlsx.readFile(filePath, { cellDates: true });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, blankRows: false });
//     const header = data[0];
//     const rows = data.slice(1);
//     const projectsToCreate = [];

//     let currentProjectInfo = null;

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];
//       if (row.length === 0) {
//         // Skip empty rows
//         continue;
//       }

//       const teamMemberParts = row[7] !== null && row[7] !== undefined ? row[7].split('-') : [];
//       const teamMember = teamMemberParts.length > 0 ? teamMemberParts[0].trim() : 'NA';
//       const internalOrExternal = teamMemberParts.length > 1 ? teamMemberParts[1].trim().replace('int', 'Internal').replace('ext', 'External') : 'NA';
//       const position = teamMemberParts.length > 2 ? teamMemberParts[2].trim() : 'NA';

//       if (row[0] !== null && row[0] !== undefined) {
//         // This row has a number, create a new projectInfo object
//         currentProjectInfo = {
//           title: row[1] !== null && row[1] !== undefined ? row[1] : 'NA',
//           client: row[2] !== null && row[2] !== undefined ? row[2] : 'NA',
//           worth: row[3] !== null && row[3] !== undefined ? row[3] : 0.0,
//           projectType: row[4] !== null && row[4] !== undefined ? row[4] : 'NA',
//           duration: row[5] !== null && row[5] !== undefined ? parseInt(row[5].split(' ')[0]) : 0,
//           summary: row[6] !== null && row[6] !== undefined ? row[6] : 'NA',
//           teamMembers: [`${teamMember}-${internalOrExternal}-${position}`],
//           detailSheet: row[8] !== null && row[8] !== undefined ? row[8] : 'NA',
//           sector: row[9] !== null && row[9] !== undefined ? row[9] : 'NA',
//         };
//         projectsToCreate.push(currentProjectInfo);
//       } else {
//         // This row doesn't have a number, append the team member to the previous projectInfo object
//         if (currentProjectInfo) {
//           currentProjectInfo.teamMembers.push(`${teamMember}-${internalOrExternal}-${position}`);
//         }
//       }
//     }

//     // Bulk create projects
//     Project.bulkCreate(projectsToCreate)
//       .then(() => console.log('Projects created successfully'))
//       .catch((err) => console.error('Error creating projects:', err));

//     return projectsToCreate;
//   } catch (err) {
//     console.error('Error reading Excel file:', err);
//     return [];
//   }
// }

// module.exports = { readExcelForFirm };


// // Example usage:
// // const filePath = '../uploads/firmExperience/firm5.xlsx';
// // const excelData = readExcelForFirm(filePath);
// // console.log(excelData);

const xlsx = require('xlsx');
const fs = require('fs');
const { Op } = require('sequelize');
const Project = require('../models/Project');
const Cv = require('../models/CV');
const CvProject = require('../models/CvProject');

async function readExcelForFirm(filePath) {
  try {
    console.log('Reading Excel file...');
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, blankRows: false });
    const header = data[0];
    const rows = data.slice(1);
    const projectsToCreate = [];

    console.log('Processing Excel data...');
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) {
        // Skip empty rows
        continue;
      }

      console.log('Processing row:', row);

      const teamMemberParts = row[7] !== null && row[7] !== undefined ? row[7].split('-') : [];
      const teamMember = teamMemberParts.length > 0 ? teamMemberParts[0].trim() : 'NA';
      const internalOrExternal = teamMemberParts.length > 1 ? teamMemberParts[1].trim().replace('int', 'Internal').replace('ext', 'External') : 'NA';
      const position = teamMemberParts.length > 2 ? teamMemberParts[2].trim() : 'NA';

      if (row[0] !== null && row[0] !== undefined) {
        // This row has a number, create a new project
        console.log('Creating project from row:', row);
        const projectInfo = {
          title: row[1] !== null && row[1] !== undefined ? row[1] : 'NA',
          client: row[2] !== null && row[2] !== undefined ? row[2] : 'NA',
          worth: row[3] !== null && row[3] !== undefined ? row[3] : 0.0,
          projectType: row[4] !== null && row[4] !== undefined ? row[4] : 'NA',
          duration: row[5] !== null && row[5] !== undefined ? parseInt(row[5].split(' ')[0]) : 0,
          summary: row[6] !== null && row[6] !== undefined ? row[6] : 'NA',
          teamMembers: `${teamMember}-${internalOrExternal}-${position}`, // Storing team member info as a formatted string
          detailSheet: row[8] !== null && row[8] !== undefined ? row[8] : 'NA',
          sector: row[9] !== null && row[9] !== undefined ? row[9] : 'NA',
        };
        projectsToCreate.push(projectInfo);
      } else {
        // This row doesn't have a number, append the team member to the previous project
        if (projectsToCreate.length > 0) {
          console.log('Appending team member to previous project:', row);
          const lastProject = projectsToCreate[projectsToCreate.length - 1];
          lastProject.teamMembers += `,${teamMember}-${internalOrExternal}-${position}`;
        }
      }
    }

    console.log('Bulk creating projects...');
    // Bulk create projects
    const createdProjects = await Project.bulkCreate(projectsToCreate, { returning: true });

    console.log('Creating CvProjects...');
    // Process team members and create CvProject entries
    for (const project of createdProjects) {
      const teamMembers = project.teamMembers.split(',');
      for (const teamMember of teamMembers) {
        const [name] = teamMember.split('-');
        const cvEntry = await Cv.findOne({ where: { expertName: name } });
        if (cvEntry) {
          await CvProject.create({
            ProjectId: project.id,
            CvId: cvEntry.id,
            position: teamMember.split('-')[2], // Extract position from teamMember string
            qualityOfWork: 0.0,
            meetingDeadline: 0.0,
            knowledgeOfWork: 0.0,
            planning: 0.0,
            decisionMaking: 0.0




            // Add other attributes for CvProject as needed
          });
        } else {
          console.log(`No CV entry found for team member: ${name}. Skipping CvProject creation.`);
        }
      }
    }

    console.log('Projects and associated CvProjects created successfully');
    return projectsToCreate;
  } catch (err) {
    console.error('Error reading Excel file:', err);
    return [];
  }
}



module.exports = { readExcelForFirm };
