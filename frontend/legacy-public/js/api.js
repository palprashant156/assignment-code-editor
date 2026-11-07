// public/js/api.js - Client API Service & Real-Time WebSocket Client

const API = {
  baseUrl: '',

  // Projects
  async getProjects() {
    const res = await fetch(`${this.baseUrl}/api/projects`);
    return await res.json();
  },

  async getProject(id) {
    const res = await fetch(`${this.baseUrl}/api/projects/${id}`);
    return await res.json();
  },

  async createProject(data) {
    const res = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async forkProject(id, name) {
    const res = await fetch(`${this.baseUrl}/api/projects/${id}/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return await res.json();
  },

  async deleteProject(id) {
    const res = await fetch(`${this.baseUrl}/api/projects/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  async getTemplates() {
    const res = await fetch(`${this.baseUrl}/api/projects/templates/list`);
    return await res.json();
  },

  // Files
  async getFile(projectId, filePath) {
    const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/file?path=${encodeURIComponent(filePath)}`);
    return await res.json();
  },

  async saveFile(projectId, filePath, content) {
    const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content })
    });
    return await res.json();
  },

  async createFolder(projectId, folderPath) {
    const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath })
    });
    return await res.json();
  },

  async deleteItem(projectId, targetPath) {
    const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/file?path=${encodeURIComponent(targetPath)}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async renameItem(projectId, oldPath, newPath) {
    const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath, newPath })
    });
    return await res.json();
  },

  async uploadAsset(projectId, fileObj) {
    const formData = new FormData();
    formData.append('file', fileObj);
    const res = await fetch(`${this.baseUrl}/api/projects/${projectId}/upload`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  // AI Assistant
  async askAi(payload) {
    const res = await fetch(`${this.baseUrl}/api/ai/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Lessons
  async getLessons() {
    const res = await fetch(`${this.baseUrl}/api/lessons`);
    return await res.json();
  },

  async verifyLesson(payload) {
    const res = await fetch(`${this.baseUrl}/api/lessons/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Real-time WebSocket connection
  initWebSocket(onMessage) {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('📡 Connected to CodeCraft Live Sync');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (e) {}
      };

      ws.onerror = (err) => {
        console.warn('WebSocket warning:', err);
      };

      return ws;
    } catch (e) {
      console.warn('WebSocket not supported', e);
      return null;
    }
  }
};
