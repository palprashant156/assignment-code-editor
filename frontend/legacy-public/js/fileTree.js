// public/js/fileTree.js - Project File Explorer and Asset Manager

const FileTreeManager = {
  treeRootEl: null,
  currentFiles: [],
  onFileSelectCallback: null,

  init(options = {}) {
    this.treeRootEl = document.getElementById('file-tree-root');
    this.onFileSelectCallback = options.onFileSelect;

    // New File button
    const newFileBtn = document.getElementById('btn-new-file');
    if (newFileBtn) {
      newFileBtn.addEventListener('click', () => {
        App.openNewItemModal('file');
      });
    }

    // New Folder button
    const newFolderBtn = document.getElementById('btn-new-folder');
    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => {
        App.openNewItemModal('folder');
      });
    }

    // Asset upload button
    const uploadBtn = document.getElementById('btn-upload-file');
    const uploadInput = document.getElementById('asset-upload-input');
    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener('click', () => uploadInput.click());
      uploadInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          await App.uploadAssetFile(file);
          uploadInput.value = '';
        }
      });
    }

    // Refresh files button
    const refreshBtn = document.getElementById('btn-refresh-files');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => App.refreshProjectFiles());
    }
  },

  render(files) {
    this.currentFiles = files || [];
    if (!this.treeRootEl) return;
    this.treeRootEl.innerHTML = '';

    if (this.currentFiles.length === 0) {
      this.treeRootEl.innerHTML = '<li style="padding: 1rem; color: var(--text-muted); font-size: 0.8rem;">No files yet. Create one!</li>';
      return;
    }

    this.renderItems(this.currentFiles, this.treeRootEl);
  },

  renderItems(items, containerEl, depth = 0) {
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = `file-item ${item.type}`;
      li.style.paddingLeft = `${depth * 14 + 16}px`;

      let iconHtml = '<i class="fas fa-file file-icon"></i>';
      if (item.type === 'directory') {
        iconHtml = '<i class="fas fa-folder file-icon folder"></i>';
      } else {
        const ext = item.name.split('.').pop().toLowerCase();
        if (ext === 'html' || ext === 'htm') iconHtml = '<i class="fab fa-html5 file-icon html"></i>';
        else if (ext === 'css') iconHtml = '<i class="fab fa-css3-alt file-icon css"></i>';
        else if (ext === 'js') iconHtml = '<i class="fab fa-js file-icon js"></i>';
        else if (ext === 'json') iconHtml = '<i class="fas fa-code file-icon json"></i>';
        else if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext)) {
          iconHtml = '<i class="fas fa-image file-icon image"></i>';
        }
      }

      li.innerHTML = `
        ${iconHtml}
        <span class="file-label" title="${item.path}">${item.name}</span>
        <div class="file-actions">
          <button class="file-action-btn rename" title="Rename"><i class="fas fa-pen"></i></button>
          <button class="file-action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      `;

      // Select file on click
      li.addEventListener('click', (e) => {
        if (e.target.closest('.file-action-btn')) return;
        if (item.type === 'file') {
          // Highlight active item
          document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
          li.classList.add('active');
          if (this.onFileSelectCallback) {
            this.onFileSelectCallback(item.path);
          }
        }
      });

      // Action: Rename
      const renameBtn = li.querySelector('.file-action-btn.rename');
      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        App.promptRename(item.path);
      });

      // Action: Delete
      const deleteBtn = li.querySelector('.file-action-btn.delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        App.confirmDelete(item.path);
      });

      containerEl.appendChild(li);

      // Render children if directory
      if (item.type === 'directory' && item.children && item.children.length > 0) {
        this.renderItems(item.children, containerEl, depth + 1);
      }
    });
  }
};
