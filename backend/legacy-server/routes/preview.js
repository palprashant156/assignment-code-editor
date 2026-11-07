// server/routes/preview.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { STORAGE_DIR, getProject } = require('../services/projectManager');

// Injected bridge script for console capture and error reporting inside student's preview
const PREVIEW_BRIDGE_SCRIPT = `
<script id="__codecraft_bridge__">
(function() {
  // Capture Console Logs and forward to parent IDE
  const levels = ['log', 'info', 'warn', 'error', 'debug'];
  levels.forEach(level => {
    const original = console[level];
    console[level] = function(...args) {
      original.apply(console, args);
      try {
        const formatted = args.map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            try { return JSON.stringify(arg); } catch (e) { return String(arg); }
          }
          return String(arg);
        }).join(' ');

        window.parent.postMessage({
          source: 'codecraft_preview',
          type: 'CONSOLE_MESSAGE',
          level: level,
          message: formatted,
          timestamp: new Date().toLocaleTimeString()
        }, '*');
      } catch (err) {}
    };
  });

  // Catch unhandled runtime errors
  window.addEventListener('error', function(event) {
    window.parent.postMessage({
      source: 'codecraft_preview',
      type: 'CONSOLE_MESSAGE',
      level: 'error',
      message: 'Uncaught Error: ' + event.message + ' (line ' + event.lineno + ', col ' + event.colno + ')',
      timestamp: new Date().toLocaleTimeString()
    }, '*');
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    window.parent.postMessage({
      source: 'codecraft_preview',
      type: 'CONSOLE_MESSAGE',
      level: 'error',
      message: 'Unhandled Promise Rejection: ' + (event.reason ? (event.reason.message || event.reason) : 'Unknown reason'),
      timestamp: new Date().toLocaleTimeString()
    }, '*');
  });

  // Listen for commands from the IDE (e.g. console REPL evaluation)
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'EVAL_CODE') {
      try {
        const res = eval(event.data.code);
        console.log('=> ' + res);
      } catch (e) {
        console.error('Eval Error: ' + e.message);
      }
    }
  });

  // Notify parent IDE that preview has loaded
  window.addEventListener('DOMContentLoaded', function() {
    window.parent.postMessage({
      source: 'codecraft_preview',
      type: 'PREVIEW_LOADED'
    }, '*');
  });
})();
</script>
`;

router.get('/:projectId', (req, res) => {
  res.redirect(`/api/preview/${req.params.projectId}/index.html`);
});

router.get('/:projectId/*path', (req, res) => {
  const { projectId } = req.params;
  let requestedFile = req.params.path;
  if (Array.isArray(requestedFile)) {
    requestedFile = requestedFile.join('/');
  }
  if (!requestedFile || requestedFile === '/') {
    requestedFile = 'index.html';
  }

  const project = getProject(projectId);
  if (!project) {
    return res.status(404).send('<h1>Project not found</h1>');
  }

  const cleanPath = path.normalize(requestedFile).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(STORAGE_DIR, projectId, cleanPath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`<h3>404: File "${requestedFile}" not found in project</h3>`);
  }

  const ext = path.extname(filePath).toLowerCase();

  // Set proper Content-Type
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
  };

  const contentType = mimeTypes[ext] || 'text/plain';
  res.setHeader('Content-Type', contentType);

  // If HTML, inject our console capture bridge
  if (ext === '.html' || ext === '.htm') {
    let htmlContent = fs.readFileSync(filePath, 'utf-8');
    if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', `<head>${PREVIEW_BRIDGE_SCRIPT}`);
    } else if (htmlContent.includes('<body>')) {
      htmlContent = htmlContent.replace('<body>', `<body>${PREVIEW_BRIDGE_SCRIPT}`);
    } else {
      htmlContent = PREVIEW_BRIDGE_SCRIPT + htmlContent;
    }
    return res.send(htmlContent);
  }

  // Otherwise send the file as is
  res.sendFile(filePath);
});

module.exports = router;
