// server/index.js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const projectManager = require('./services/projectManager');
const projectsRouter = require('./routes/projects');
const filesRouter = require('./routes/files');
const previewRouter = require('./routes/preview');
const aiRouter = require('./routes/ai');
const lessonsRouter = require('./routes/lessons');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static frontend IDE
const legacyFrontend = path.join(__dirname, '..', '..', 'frontend', 'legacy-public');
app.use(express.static(legacyFrontend));

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:id', filesRouter);
app.use('/api/preview', previewRouter);
app.use('/api/ai', aiRouter);
app.use('/api/lessons', lessonsRouter);

// WebSocket real-time connections (multiplayer/live-sync, terminal output)
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Connected to CodeCraft Studio Live Server',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      // Broadcast to other peers if needed
      if (data.type === 'FILE_UPDATED') {
        broadcast({
          type: 'PEER_FILE_UPDATE',
          projectId: data.projectId,
          path: data.path,
          timestamp: new Date().toISOString()
        }, ws);
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(data, excludeWs = null) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client !== excludeWs && client.readyState === 1) { // 1 = OPEN
      client.send(payload);
    }
  }
}

// Fallback to index.html for client side navigation if needed
app.get('{/*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(legacyFrontend, 'index.html'));
});

// Initialize seed data & start listening
projectManager.initSeedProjects();

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeCraft Studio Server running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`💻 Replit-style Side-by-Side Web IDE ready for students`);
  console.log(`====================================================`);
});
