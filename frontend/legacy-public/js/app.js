// public/js/app.js - Main Application Orchestrator

const App = {
  currentProject: null,
  projectsList: [],
  templatesList: [],
  autoSaveTimeout: null,
  autoRunEnabled: true,
  newItemType: 'file', // 'file' or 'folder'

  async init() {
    console.log('🚀 Initializing CodeCraft Studio...');

    // Initialize submodules
    ConsoleManager.init();
    PreviewManager.init();
    CdnManager.init();

    await EditorManager.init({
      onSave: (path, content) => this.saveCurrentFile(path, content, true),
      onChange: (path, content) => this.handleEditorChange(path, content)
    });

    FileTreeManager.init({
      onFileSelect: (filePath) => this.loadFileIntoEditor(filePath)
    });

    AiTutorManager.init();
    await LessonsManager.init();

    // Setup UI event listeners
    this.setupEventListeners();
    this.setupSplitResizer();
    this.setupDrawerResizer();
    this.setupWebSocket();

    // Load initial projects
    await this.loadInitialProject();
  },

  setupEventListeners() {
    // Run Button
    const runBtn = document.getElementById('btn-run');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.runCode());
    }

    // Global Keyboard Shortcuts (Ctrl+Enter to Run, Ctrl+S to Save)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.runCode();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.saveCurrentFile(EditorManager.activeTabPath, EditorManager.getCurrentContent(), true);
      }
    });

    // Activity Bar Tab Switching
    document.querySelectorAll('.activity-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchActivityTab(tab);
      });
    });

    // Bottom Drawer Tabs
    document.querySelectorAll('.drawer-tab[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.drawer-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Project Name Inline Editing
    const titleInput = document.getElementById('project-title-input');
    if (titleInput) {
      titleInput.addEventListener('change', () => {
        if (this.currentProject) {
          this.currentProject.name = titleInput.value.trim() || 'Untitled Project';
          this.showToast('Project renamed', 'info');
        }
      });
    }

    // Project Selector Click (Open Project Switcher Modal)
    const projSelector = document.getElementById('project-selector-dropdown');
    if (projSelector) {
      projSelector.addEventListener('click', (e) => {
        if (e.target !== titleInput) {
          this.openSwitchProjectModal();
        }
      });
    }

    // New Repl Button
    const newReplBtn = document.getElementById('btn-new-repl');
    if (newReplBtn) {
      newReplBtn.addEventListener('click', () => this.openNewProjectModal());
    }

    // Templates Button
    const templatesBtn = document.getElementById('btn-templates');
    if (templatesBtn) {
      templatesBtn.addEventListener('click', () => this.openNewProjectModal());
    }

    // Export ZIP Button
    const exportBtn = document.getElementById('btn-export-zip');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportCurrentProject());
    }

    // Theme Switcher
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        document.body.setAttribute('data-theme', e.target.value);
        this.showToast(`Switched theme: ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.closeModal;
        this.closeModal(modalId);
      });
    });

    // Close Modals on Overlay Click or Escape
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal.id);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => this.closeModal(m.id));
      }
    });

    // Confirm Create New Project Button
    const confirmCreateBtn = document.getElementById('btn-confirm-create-project');
    if (confirmCreateBtn) {
      confirmCreateBtn.addEventListener('click', () => this.handleCreateProject());
    }

    // Confirm New Item (File/Folder) Button
    const confirmNewItemBtn = document.getElementById('btn-confirm-new-item');
    if (confirmNewItemBtn) {
      confirmNewItemBtn.addEventListener('click', () => this.handleCreateNewItem());
    }

    // Switch Project Modal "New Project" button
    const modalOpenNewBtn = document.getElementById('btn-modal-open-new');
    if (modalOpenNewBtn) {
      modalOpenNewBtn.addEventListener('click', () => {
        this.closeModal('modal-switch-project');
        this.openNewProjectModal();
      });
    }

    // Settings Listeners
    const fontSlider = document.getElementById('setting-font-size');
    const fontVal = document.getElementById('font-size-val');
    if (fontSlider && fontVal) {
      fontSlider.addEventListener('input', (e) => {
        fontVal.textContent = `${e.target.value}px`;
        EditorManager.setFontSize(e.target.value);
      });
    }

    const tabSizeSelect = document.getElementById('setting-tab-size');
    if (tabSizeSelect) {
      tabSizeSelect.addEventListener('change', (e) => {
        EditorManager.setTabSize(e.target.value);
      });
    }

    const wordWrapSelect = document.getElementById('setting-word-wrap');
    if (wordWrapSelect) {
      wordWrapSelect.addEventListener('change', (e) => {
        EditorManager.setWordWrap(e.target.value);
      });
    }

    const autorunSelect = document.getElementById('setting-autorun');
    if (autorunSelect) {
      autorunSelect.addEventListener('change', (e) => {
        this.autoRunEnabled = e.target.value === 'on';
        this.showToast(`Auto-run: ${this.autoRunEnabled ? 'Enabled' : 'Manual'}`, 'info');
      });
    }
  },

  switchActivityTab(tabName) {
    // Update active icon
    document.querySelectorAll('.activity-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update active sidebar pane
    document.querySelectorAll('.sidebar-pane').forEach(pane => {
      pane.classList.add('hidden');
    });

    const activePane = document.getElementById(`pane-${tabName}`);
    if (activePane) {
      activePane.classList.remove('hidden');
    }
  },

  async loadInitialProject() {
    try {
      const data = await API.getProjects();
      if (data && data.projects && data.projects.length > 0) {
        this.projectsList = data.projects;
        await this.loadProject(data.projects[0].id);
      } else {
        // Create initial default project
        const created = await API.createProject({
          name: 'Personal Developer Portfolio',
          templateId: 'portfolio'
        });
        if (created && created.project) {
          await this.loadProject(created.project.id);
        }
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      this.showToast('Could not load project', 'error');
    }
  },

  async loadProject(projectId) {
    try {
      const res = await API.getProject(projectId);
      if (!res || !res.project) throw new Error('Project not found');

      this.currentProject = res.project;

      // Update UI title
      const titleInput = document.getElementById('project-title-input');
      if (titleInput) titleInput.value = this.currentProject.name;

      const bcProject = document.getElementById('breadcrumb-project');
      if (bcProject) bcProject.textContent = this.currentProject.name;

      // Render file tree
      FileTreeManager.render(this.currentProject.files);

      // Set preview project
      PreviewManager.setProject(this.currentProject.id, this.currentProject.name);

      // Automatically open index.html if it exists, or first file
      let targetFile = 'index.html';
      const hasIndex = this.findFileInTree(this.currentProject.files, 'index.html');
      if (!hasIndex && this.currentProject.files.length > 0) {
        targetFile = this.currentProject.files[0].path;
      }

      await this.loadFileIntoEditor(targetFile);
      this.showToast(`Loaded ${this.currentProject.name}`, 'success');
      ConsoleManager.addLog('info', `Opened project: "${this.currentProject.name}"`);
    } catch (err) {
      this.showToast(`Error loading project: ${err.message}`, 'error');
    }
  },

  findFileInTree(items, fileName) {
    for (const item of items) {
      if (item.type === 'file' && item.path === fileName) return item;
      if (item.type === 'directory' && item.children) {
        const found = this.findFileInTree(item.children, fileName);
        if (found) return found;
      }
    }
    return null;
  },

  async loadFileIntoEditor(filePath) {
    if (!this.currentProject) return;

    try {
      const res = await API.getFile(this.currentProject.id, filePath);
      if (res && res.success) {
        EditorManager.openFile(filePath, res.content);
      }
    } catch (err) {
      this.showToast(`Failed to open file: ${err.message}`, 'error');
    }
  },

  handleEditorChange(filePath, content) {
    // Show saving status
    this.setSaveStatus('saving');

    // Debounce auto-save (1.2 seconds)
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveCurrentFile(filePath, content, false);
    }, 1200);
  },

  async saveCurrentFile(filePath, content, isManual = false) {
    if (!this.currentProject || !filePath) return;

    try {
      this.setSaveStatus('saving');
      await API.saveFile(this.currentProject.id, filePath, content);
      EditorManager.markTabDirty(filePath, false);
      this.setSaveStatus('saved');

      if (isManual) {
        this.showToast(`Saved ${filePath}`, 'success');
      }

      // If auto-run is on, trigger preview update
      if (this.autoRunEnabled) {
        PreviewManager.reload();
      }
    } catch (err) {
      this.setSaveStatus('error');
      this.showToast(`Error saving ${filePath}: ${err.message}`, 'error');
      return false;
    }
  },

  async runCode() {
    if (!this.currentProject) return;

    try {
      clearTimeout(this.autoSaveTimeout);
      const pendingFiles = EditorManager.openTabs.filter(tab => tab.dirty);
      if (EditorManager.activeTabPath && !pendingFiles.some(tab => tab.path === EditorManager.activeTabPath)) {
        pendingFiles.push({ path: EditorManager.activeTabPath });
      }

      const saved = await Promise.all(pendingFiles.map(tab => {
        const content = tab.path === EditorManager.activeTabPath
          ? EditorManager.getCurrentContent()
          : EditorManager.fileContents[tab.path];
        return this.saveCurrentFile(tab.path, content, false);
      }));
      if (saved.includes(false)) return;

      PreviewManager.reload();
      this.showToast('Latest changes are running in the preview', 'success');
      ConsoleManager.addLog('info', '▶ Saved open files and refreshed the live preview.');
    } catch (err) {
      this.showToast(`Could not run project: ${err.message}`, 'error');
    }
  },

  setSaveStatus(status) {
    const dot = document.getElementById('save-dot');
    const text = document.getElementById('save-text');
    if (!dot || !text) return;

    if (status === 'saving') {
      dot.className = 'status-dot saving';
      text.textContent = 'Saving...';
    } else if (status === 'saved') {
      dot.className = 'status-dot';
      text.textContent = 'Saved';
    } else {
      dot.className = 'status-dot';
      dot.style.background = 'var(--accent-rose)';
      text.textContent = 'Error';
    }
  },

  // Modal handlers
  async openNewProjectModal() {
    const modal = document.getElementById('modal-new-project');
    const tplListEl = document.getElementById('modal-template-list');
    const nameInput = document.getElementById('new-project-name');

    nameInput.value = '';

    // Fetch starter templates
    try {
      const res = await API.getTemplates();
      this.templatesList = res.templates || [];
      tplListEl.innerHTML = '';

      this.templatesList.forEach((tpl, index) => {
        const card = document.createElement('div');
        card.className = `template-card ${index === 0 ? 'selected' : ''}`;
        card.dataset.tplId = tpl.id;

        card.innerHTML = `
          <div class="tpl-header">
            <span class="tpl-icon">${tpl.icon}</span>
            <span class="tpl-badge">${tpl.category}</span>
          </div>
          <div class="tpl-title">${tpl.name}</div>
          <div class="tpl-desc">${tpl.description}</div>
        `;

        card.addEventListener('click', () => {
          document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });

        tplListEl.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }

    modal.classList.add('active');
  },

  async handleCreateProject() {
    const nameInput = document.getElementById('new-project-name');
    const selectedTpl = document.querySelector('.template-card.selected');
    const templateId = selectedTpl ? selectedTpl.dataset.tplId : 'portfolio';
    const name = (nameInput.value || '').trim();

    try {
      const res = await API.createProject({ name, templateId });
      this.closeModal('modal-new-project');
      if (res && res.project) {
        await this.loadProject(res.project.id);
        this.showToast('New project created!', 'success');
      }
    } catch (err) {
      this.showToast(`Error creating project: ${err.message}`, 'error');
    }
  },

  async openSwitchProjectModal() {
    const modal = document.getElementById('modal-switch-project');
    const listEl = document.getElementById('modal-project-list');
    listEl.innerHTML = '<div style="padding: 1rem; color: var(--text-muted);">Loading projects...</div>';
    modal.classList.add('active');

    try {
      const res = await API.getProjects();
      this.projectsList = res.projects || [];
      listEl.innerHTML = '';

      if (this.projectsList.length === 0) {
        listEl.innerHTML = '<div style="padding: 1rem; color: var(--text-muted);">No projects found.</div>';
        return;
      }

      this.projectsList.forEach(p => {
        const card = document.createElement('div');
        card.className = `template-card ${this.currentProject && this.currentProject.id === p.id ? 'selected' : ''}`;

        card.innerHTML = `
          <div class="tpl-header">
            <span class="tpl-icon"><i class="fas fa-folder" style="color: var(--accent-cyan);"></i></span>
            <span class="tpl-badge">${p.id}</span>
          </div>
          <div class="tpl-title">${p.name}</div>
          <div class="tpl-desc">${p.description || 'Web project'}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: auto;">Updated: ${new Date(p.updatedAt).toLocaleDateString()}</div>
        `;

        card.addEventListener('click', async () => {
          this.closeModal('modal-switch-project');
          await this.loadProject(p.id);
        });

        listEl.appendChild(card);
      });
    } catch (err) {
      listEl.innerHTML = `<div style="color: var(--accent-rose);">Failed to load projects: ${err.message}</div>`;
    }
  },

  openNewItemModal(type = 'file') {
    this.newItemType = type;
    const modal = document.getElementById('modal-new-item');
    const title = document.getElementById('modal-new-item-title');
    const label = document.getElementById('modal-item-label');
    const input = document.getElementById('modal-item-name');

    title.innerHTML = type === 'file' ? '<i class="fas fa-file-plus"></i> New File' : '<i class="fas fa-folder-plus"></i> New Folder';
    label.textContent = type === 'file' ? 'File Name (with extension):' : 'Folder Name:';
    input.placeholder = type === 'file' ? 'e.g. about.html or style.css' : 'e.g. assets or components';
    input.value = '';

    modal.classList.add('active');
    setTimeout(() => input.focus(), 100);
  },

  async handleCreateNewItem() {
    const input = document.getElementById('modal-item-name');
    const itemName = (input.value || '').trim();
    if (!itemName) return;

    try {
      if (this.newItemType === 'file') {
        await API.saveFile(this.currentProject.id, itemName, '');
        this.closeModal('modal-new-item');
        await this.refreshProjectFiles();
        await this.loadFileIntoEditor(itemName);
        this.showToast(`Created file: ${itemName}`, 'success');
      } else {
        await API.createFolder(this.currentProject.id, itemName);
        this.closeModal('modal-new-item');
        await this.refreshProjectFiles();
        this.showToast(`Created folder: ${itemName}`, 'success');
      }
    } catch (err) {
      this.showToast(`Error creating item: ${err.message}`, 'error');
    }
  },

  async refreshProjectFiles() {
    if (!this.currentProject) return;
    try {
      const res = await API.getProject(this.currentProject.id);
      if (res && res.project) {
        this.currentProject.files = res.project.files;
        FileTreeManager.render(this.currentProject.files);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  },

  async uploadAssetFile(fileObj) {
    if (!this.currentProject) return;
    try {
      this.showToast(`Uploading ${fileObj.name}...`, 'info');
      await API.uploadAsset(this.currentProject.id, fileObj);
      await this.refreshProjectFiles();
      this.showToast(`Uploaded ${fileObj.name} successfully!`, 'success');
      ConsoleManager.addLog('info', `Uploaded asset: ${fileObj.name}`);
    } catch (err) {
      this.showToast(`Upload failed: ${err.message}`, 'error');
    }
  },

  promptRename(oldPath) {
    const newName = prompt(`Enter new path/name for "${oldPath}":`, oldPath);
    if (newName && newName !== oldPath) {
      API.renameItem(this.currentProject.id, oldPath, newName).then(() => {
        this.refreshProjectFiles();
        this.showToast(`Renamed to ${newName}`, 'success');
      }).catch(err => {
        this.showToast(`Rename failed: ${err.message}`, 'error');
      });
    }
  },

  confirmDelete(targetPath) {
    if (confirm(`Are you sure you want to delete "${targetPath}"?`)) {
      API.deleteItem(this.currentProject.id, targetPath).then(() => {
        EditorManager.closeTab(targetPath);
        this.refreshProjectFiles();
        this.showToast(`Deleted ${targetPath}`, 'info');
      }).catch(err => {
        this.showToast(`Delete failed: ${err.message}`, 'error');
      });
    }
  },

  exportCurrentProject() {
    if (!this.currentProject) return;
    const url = `/api/projects/${this.currentProject.id}/export`;
    window.location.href = url;
    this.showToast('Exporting ZIP archive...', 'info');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  setupSplitResizer() {
    const resizer = document.getElementById('split-resizer');
    const editorPane = document.getElementById('pane-editor');
    const previewPane = document.getElementById('pane-preview');
    let isDragging = false;

    resizer.addEventListener('mousedown', (e) => {
      isDragging = true;
      resizer.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      // Disable pointer events on iframe while dragging to prevent drag capture
      const iframe = document.getElementById('preview-iframe');
      if (iframe) iframe.style.pointerEvents = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const containerRect = document.getElementById('split-workspace').getBoundingClientRect();
      const offset = e.clientX - containerRect.left;
      const totalWidth = containerRect.width;

      // Restrict minimum bounds (20% to 80%)
      if (offset > 240 && offset < totalWidth - 240) {
        const leftPercent = (offset / totalWidth) * 100;
        editorPane.style.flex = `0 0 ${leftPercent}%`;
        previewPane.style.flex = `1 1 ${100 - leftPercent}%`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = 'default';
        const iframe = document.getElementById('preview-iframe');
        if (iframe) iframe.style.pointerEvents = 'auto';
      }
    });
  },

  setupDrawerResizer() {
    const resizer = document.getElementById('drawer-resizer');
    const drawer = document.getElementById('bottom-drawer');
    let isDragging = false;

    resizer.addEventListener('mousedown', (e) => {
      isDragging = true;
      document.body.style.cursor = 'row-resize';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const height = window.innerHeight - e.clientY;
      if (height > 60 && height < window.innerHeight * 0.6) {
        drawer.style.height = `${height}px`;
        drawer.classList.remove('collapsed');
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
      }
    });
  },

  setupWebSocket() {
    API.initWebSocket((data) => {
      if (data.type === 'PEER_FILE_UPDATE' && this.currentProject && data.projectId === this.currentProject.id) {
        ConsoleManager.addLog('info', `File synced: ${data.path}`);
      }
    });
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '<i class="fas fa-info-circle"></i>';
    if (type === 'success') icon = '<i class="fas fa-check-circle" style="color: var(--accent-emerald);"></i>';
    if (type === 'error') icon = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-rose);"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
