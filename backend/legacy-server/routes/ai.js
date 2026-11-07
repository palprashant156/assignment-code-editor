// server/routes/ai.js
const express = require('express');
const router = express.Router();
const { processAiRequest } = require('../services/aiAssistant');

router.post('/assist', (req, res) => {
  try {
    const { mode, prompt, currentFile, code, fileType } = req.body;
    const response = processAiRequest({ mode, prompt, currentFile, code, fileType });
    res.json({ success: true, ...response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
