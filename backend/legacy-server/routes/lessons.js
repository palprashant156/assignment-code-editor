// server/routes/lessons.js
const express = require('express');
const router = express.Router();
const { lessons, verifyLesson } = require('../services/lessons');

// Get all curriculum lessons
router.get('/', (req, res) => {
  const list = lessons.map(l => ({
    id: l.id,
    title: l.title,
    description: l.description,
    difficulty: l.difficulty,
    tasksCount: l.tasks.length,
    tasks: l.tasks.map(t => ({
      id: t.id,
      title: t.title,
      instruction: t.instruction,
      hint: t.hint
    }))
  }));
  res.json({ success: true, lessons: list });
});

// Verify lesson code
router.post('/verify', (req, res) => {
  try {
    const { lessonId, html, css, js } = req.body;
    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }
    const report = verifyLesson(lessonId, html || '', css || '', js || '');
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
