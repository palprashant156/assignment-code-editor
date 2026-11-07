// server/routes/projects.js
const express = require('express');
const router = express.Router();
const path = require('path');
const projectManager = require('../services/projectManager');
const { templates } = require('../services/templates');

// List all projects
router.get('/', (req, res) => {
  try {
    const list = projectManager.listProjects();
    res.json({ success: true, projects: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List starter templates
router.get('/templates/list', (req, res) => {
  const tplList = templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    icon: t.icon,
    fileNames: Object.keys(t.files)
  }));
  res.json({ success: true, templates: tplList });
});

// Get single project details & file tree
router.get('/:id', (req, res) => {
  try {
    const project = projectManager.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const projectDir = path.join(projectManager.STORAGE_DIR, project.id);
    const files = projectManager.getFileTree(projectDir);
    res.json({ success: true, project: { ...project, files } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/', (req, res) => {
  try {
    const { name, description, templateId } = req.body;
    const project = projectManager.createProject({ name, description, templateId });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fork project
router.post('/:id/fork', (req, res) => {
  try {
    const forked = projectManager.forkProject(req.params.id, req.body.name);
    res.json({ success: true, project: forked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export as Zip
router.get('/:id/export', (req, res) => {
  projectManager.exportProjectZip(req.params.id, res);
});

// Delete project
router.delete('/:id', (req, res) => {
  try {
    projectManager.deleteProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
