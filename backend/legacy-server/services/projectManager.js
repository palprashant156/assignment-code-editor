// server/services/projectManager.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const { templates } = require('./templates');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const DB_FILE = path.join(__dirname, '..', 'data', 'projects.json');

// Ensure directories exist
function ensureDirs() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getProjectsDb() {
  ensureDirs();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects.json:', err);
    return [];
  }
}

function saveProjectsDb(projects) {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

// Get all projects with metadata
function listProjects() {
  return getProjectsDb();
}

// Get single project metadata
function getProject(projectId) {
  const db = getProjectsDb();
  return db.find(p => p.id === projectId) || null;
}

// Build file tree recursively
function getFileTree(dirPath, relativeRoot = '') {
  const items = [];
  if (!fs.existsSync(dirPath)) return items;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    // Ignore hidden files and node_modules
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const relPath = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      items.push({
        name: entry.name,
        path: relPath,
        type: 'directory',
        children: getFileTree(fullPath, relPath)
      });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      let language = 'plaintext';
      if (ext === '.html' || ext === '.htm') language = 'html';
      else if (ext === '.css') language = 'css';
      else if (ext === '.js' || ext === '.mjs') language = 'javascript';
      else if (ext === '.json') language = 'json';
      else if (ext === '.md') language = 'markdown';
      else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) language = 'image';

      items.push({
        name: entry.name,
        path: relPath,
        type: 'file',
        language,
        size: fs.statSync(fullPath).size
      });
    }
  }

  // Sort: directories first, then files alphabetically
  return items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

// Create new project
function createProject({ name, description, templateId }) {
  ensureDirs();
  const id = uuidv4().substring(0, 8);
  const now = new Date().toISOString();

  const projectDir = path.join(STORAGE_DIR, id);
  fs.mkdirSync(projectDir, { recursive: true });

  const chosenTemplate = templates.find(t => t.id === templateId) || templates[0];
  const finalName = name || (chosenTemplate ? `${chosenTemplate.name}` : 'New Project');

  // Write template files
  for (const [filePath, content] of Object.entries(chosenTemplate.files)) {
    const fullFilePath = path.join(projectDir, filePath);
    const parent = path.dirname(fullFilePath);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(fullFilePath, content, 'utf-8');
  }

  const projectMeta = {
    id,
    name: finalName,
    description: description || chosenTemplate.description || 'Interactive web design project',
    template: chosenTemplate.id,
    createdAt: now,
    updatedAt: now
  };

  const db = getProjectsDb();
  db.unshift(projectMeta);
  saveProjectsDb(db);

  return { ...projectMeta, files: getFileTree(projectDir) };
}

// Read file content
function readFile(projectId, relativePath) {
  const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(STORAGE_DIR, projectId, cleanPath);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    throw new Error('File not found');
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

// Write / update file content
function writeFile(projectId, relativePath, content) {
  const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(STORAGE_DIR, projectId, cleanPath);
  const parent = path.dirname(fullPath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf-8');

  // Touch project updated time
  touchProject(projectId);
  return { success: true, path: cleanPath };
}

// Create new folder
function createFolder(projectId, relativePath) {
  const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(STORAGE_DIR, projectId, cleanPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  touchProject(projectId);
  return { success: true, path: cleanPath };
}

// Delete file or folder
function deleteItem(projectId, relativePath) {
  const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(STORAGE_DIR, projectId, cleanPath);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    touchProject(projectId);
    return { success: true };
  }
  throw new Error('Target not found');
}

// Rename file or folder
function renameItem(projectId, oldPath, newPath) {
  const cleanOld = path.normalize(oldPath).replace(/^(\.\.[\/\\])+/, '');
  const cleanNew = path.normalize(newPath).replace(/^(\.\.[\/\\])+/, '');
  const fullOld = path.join(STORAGE_DIR, projectId, cleanOld);
  const fullNew = path.join(STORAGE_DIR, projectId, cleanNew);

  if (!fs.existsSync(fullOld)) {
    throw new Error('Source file does not exist');
  }

  const parent = path.dirname(fullNew);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }

  fs.renameSync(fullOld, fullNew);
  touchProject(projectId);
  return { success: true, oldPath: cleanOld, newPath: cleanNew };
}

// Delete whole project
function deleteProject(projectId) {
  const projectDir = path.join(STORAGE_DIR, projectId);
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
  let db = getProjectsDb();
  db = db.filter(p => p.id !== projectId);
  saveProjectsDb(db);
  return { success: true };
}

// Duplicate / Fork project
function forkProject(projectId, newName) {
  const source = getProject(projectId);
  if (!source) throw new Error('Source project not found');

  const newId = uuidv4().substring(0, 8);
  const now = new Date().toISOString();
  const sourceDir = path.join(STORAGE_DIR, projectId);
  const targetDir = path.join(STORAGE_DIR, newId);

  // Copy recursive
  fs.cpSync(sourceDir, targetDir, { recursive: true });

  const newMeta = {
    id: newId,
    name: newName || `${source.name} (Fork)`,
    description: source.description,
    template: source.template,
    createdAt: now,
    updatedAt: now
  };

  const db = getProjectsDb();
  db.unshift(newMeta);
  saveProjectsDb(db);
  return newMeta;
}

// Export as Zip archive
function exportProjectZip(projectId, res) {
  const project = getProject(projectId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const projectDir = path.join(STORAGE_DIR, projectId);
  if (!fs.existsSync(projectDir)) {
    res.status(404).json({ error: 'Project files not found' });
    return;
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const zipFileName = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;

  res.attachment(zipFileName);
  archive.pipe(res);
  archive.directory(projectDir, false);
  archive.finalize();
}

function touchProject(projectId) {
  const db = getProjectsDb();
  const item = db.find(p => p.id === projectId);
  if (item) {
    item.updatedAt = new Date().toISOString();
    saveProjectsDb(db);
  }
}

// Initialize seed projects if none exist
function initSeedProjects() {
  ensureDirs();
  const db = getProjectsDb();
  if (db.length === 0) {
    console.log('Seeding initial starter projects for students...');
    for (const t of templates) {
      createProject({
        name: t.name,
        description: t.description,
        templateId: t.id
      });
    }
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  deleteProject,
  forkProject,
  getFileTree,
  readFile,
  writeFile,
  createFolder,
  deleteItem,
  renameItem,
  exportProjectZip,
  initSeedProjects,
  STORAGE_DIR
};
