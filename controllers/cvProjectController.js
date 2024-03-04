const CvProject = require('../models/CvProject');
const Project = require('../models/Project')

const Cv = require('../models/CV')

const cvProjectController = {
    // Create a CvProject
    async create(req, res) {
        console.log("2")
      const { cvId, projectId, points } = req.body;
      console.log(points)
      try {
        const createdCvProject = await CvProject.create({ CvId: cvId,ProjectId: projectId, points:points });

        const cvProjects = await CvProject.findAll({ where: { CvId: cvId } });
        const totalPoints = cvProjects.reduce((acc, cvProject) => acc + cvProject.points, 0);
        const averagePoints = totalPoints / cvProjects.length;
    
        // Update the averagePoints field of the CV model
        await Cv.update({ averagePoints: averagePoints }, { where: { id: cvId } });
    
        res.json(createdCvProject);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  
    // Get all CvProjects
    async getAll(req, res) {
      try {
        const cvProjects = await CvProject.findAll();
        res.json(cvProjects);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  
    // Get a single CvProject by ID
    async getOne(req, res) {
        const { id } = req.params;
        try {
          const cvProject = await CvProject.findAll({
            where: { CvId: id },
          });
      
          // Check if any CV projects are found
          if (cvProject.length > 0) {
            console.log(cvProject)
            const projectIds = cvProject.map((project) => project.ProjectId);
      
            // Fetch projects using the projectIds array
            const projects = await Project.findAll({
              where: { id: projectIds }, // Query projects using the projectIds array
            });
      
            const cvProjectsWithProjects = cvProject.map((cvProj) => {
                const associatedProject = projects.find((proj) => proj.id === cvProj.ProjectId);
                return {
                  cvProjectInfo: cvProj,
                  associatedProjectInfo: associatedProject,
                };
              });
        
              // Return the custom response object
              res.json(cvProjectsWithProjects);
            // Return the associated projects
        //    res.json(projects);
          } else {
            // Return error if no CV projects are found
            res.status(404).json({ error: 'CvProject not found' });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
,      
  
    // Update a CvProject
    async update(req, res) {
      const { id } = req.params;
      const updatedData = req.body;
      try {
        const [rowsUpdated, [updatedCvProject]] = await CvProject.update(updatedData, {
          where: { id },
          returning: true,
        });
        if (rowsUpdated > 0) {
          res.json(updatedCvProject);
        } else {
          res.status(404).json({ error: 'CvProject not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  
    // Delete a CvProject
    async delete(req, res) {
      const { id } = req.params;
      try {
        const deletedRows = await CvProject.destroy({ where: { id } });
        if (deletedRows > 0) {
          res.json({ message: 'CvProject deleted successfully' });
        } else {
          res.status(404).json({ error: 'CvProject not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  };
  
  module.exports =   cvProjectController ;