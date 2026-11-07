// server/routes/files.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const path = require('path');
const multer = require('multer');
const projectManager = require('../services/projectManager');

// Configure multer storage for asset uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(projectManager.STORAGE_DIR, req.params.id);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Get file content
router.get('/file', (req, res) => {
  try {
    const { path: filePath } = req.query;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    const content = projectManager.readFile(req.params.id, filePath);
    res.json({ success: true, path: filePath, content });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Save or create file
router.post('/file', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    const result = projectManager.writeFile(req.params.id, filePath, content ?? '');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create folder
router.post('/folder', (req, res) => {
  try {
    const { path: folderPath } = req.body;
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }
    const result = projectManager.createFolder(req.params.id, folderPath);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file or folder
router.delete('/file', (req, res) => {
  try {
    const { path: targetPath } = req.query;
    if (!targetPath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    const result = projectManager.deleteItem(req.params.id, targetPath);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Rename file or folder
router.post('/rename', (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'oldPath and newPath are required' });
    }
    const result = projectManager.renameItem(req.params.id, oldPath, newPath);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload asset file
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
