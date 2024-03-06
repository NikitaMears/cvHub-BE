const Project = require('../models/Project');
const { Op } = require('sequelize');

// Controller for handling Project operations
const projectController = {
  // Get all Projects
  async getAll(req, res) {
    try {
      const projects = await Project.findAll();
      res.json(projects);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a single Project by ID
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const project = await Project.findByPk(id);
      if (project) {
        res.json(project);
      } else {
        res.status(404).json({ error: 'Project not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create a Project
  async createFirmExperience(req, res, filePath) {
    console.log("he")
    const { title, client, worth, projectType, duration,summary } = req.body;
    try {
      const newProject = await Project.create({ title, client, worth, projectType, duration,summary, file:filePath });
      res.json(newProject);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: error });
    }
  },

  // Update a Project
  async update(req, res) {
    const { id } = req.params;
    const updatedData = req.body;
    try {
      const [rowsUpdated, [updatedProject]] = await Project.update(updatedData, {
        where: { id },
        returning: true,
      });
      if (rowsUpdated > 0) {
        res.json(updatedProject);
      } else {
        res.status(404).json({ error: 'Project not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a Project
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedRows = await Project.destroy({ where: { id } });
      if (deletedRows > 0) {
        res.json({ message: 'Project deleted successfully' });
      } else {
        res.status(404).json({ error: 'Project not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Search for Projects based on criteria
  async search(req, res) {
    const { query } = req.query;
    try {
      const projects = await Project.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
          ],
        },
      });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = projectController;
