// public/js/editor.js - Code Editor & Tab Management (Monaco Engine with Fallback)

const EditorManager = {
  editor: null,
  isMonacoReady: false,
  fallbackEl: null,
  tabsBarEl: null,
  openTabs: [], // [{ path, name, language, dirty: false }]
  activeTabPath: null,
  models: {}, // cache monaco models by path
  fileContents: {}, // path -> content
  onSaveCallback: null,
  onChangeCallback: null,

  async init(options = {}) {
    this.fallbackEl = document.getElementById('fallback-code-editor');
    this.tabsBarEl = document.getElementById('editor-tabs-bar');
    this.onSaveCallback = options.onSave;
    this.onChangeCallback = options.onChange;

    // Listen for fallback textarea changes
    this.fallbackEl.addEventListener('input', () => {
      if (this.activeTabPath) {
        this.fileContents[this.activeTabPath] = this.fallbackEl.value;
        this.markTabDirty(this.activeTabPath, true);
        if (this.onChangeCallback) this.onChangeCallback(this.activeTabPath, this.fallbackEl.value);
      }
    });

    // Format code button
    const formatBtn = document.getElementById('btn-format-code');
    if (formatBtn) {
      formatBtn.addEventListener('click', () => this.formatCode());
    }

    // Copy code button
    const copyBtn = document.getElementById('btn-copy-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyCode());
    }

    // Try loading Monaco Editor
    await this.initMonaco();
  },

  initMonaco() {
    return new Promise((resolve) => {
      if (window.require) {
        window.require.config({
          paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
        });

        window.require(['vs/editor/editor.main'], () => {
          this.isMonacoReady = true;

          // Define custom dark theme
          monaco.editor.defineTheme('codecraft-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
              { token: 'keyword', foreground: '00d2ff' },
              { token: 'string', foreground: 'f1fa8c' },
              { token: 'number', foreground: 'bd93f9' },
              { token: 'tag', foreground: 'ff79c6' },
              { token: 'attribute.name', foreground: '50fa7b' }
            ],
            colors: {
              'editor.background': '#0d1117',
              'editor.foreground': '#f0f6fc',
              'editor.lineHighlightBackground': '#161b22',
              'editorLineNumber.foreground': '#484f58',
              'editorLineNumber.activeForeground': '#00d2ff',
              'editorCursor.foreground': '#00d2ff',
              'editor.selectionBackground': '#1f6feb44'
            }
          });

          this.editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            theme: 'codecraft-dark',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true
          });

          // Model content change listener
          this.editor.onDidChangeModelContent(() => {
            if (this.activeTabPath) {
              const val = this.editor.getValue();
              this.fileContents[this.activeTabPath] = val;
              this.markTabDirty(this.activeTabPath, true);
              if (this.onChangeCallback) this.onChangeCallback(this.activeTabPath, val);
            }
          });

          // Ctrl+S / Cmd+S shortcut inside Monaco
          this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (this.onSaveCallback && this.activeTabPath) {
              this.onSaveCallback(this.activeTabPath, this.editor.getValue());
            }
          });

          // Ctrl+Enter / Cmd+Enter to Run
          this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            const runBtn = document.getElementById('btn-run');
            if (runBtn) runBtn.click();
          });

          resolve();
        }, (err) => {
          console.warn('Monaco failed to load from CDN, falling back to clean text editor:', err);
          this.showFallback();
          resolve();
        });
      } else {
        this.showFallback();
        resolve();
      }
    });
  },

  showFallback() {
    this.isMonacoReady = false;
    document.getElementById('monaco-editor-container').style.display = 'none';
    this.fallbackEl.style.display = 'block';
  },

  openFile(filePath, content = '') {
    this.fileContents[filePath] = content;

    // Check if tab already open
    let tab = this.openTabs.find(t => t.path === filePath);
    if (!tab) {
      const fileName = filePath.split('/').pop();
      const ext = fileName.split('.').pop().toLowerCase();
      let language = 'plaintext';
      if (ext === 'html' || ext === 'htm') language = 'html';
      else if (ext === 'css') language = 'css';
      else if (ext === 'js') language = 'javascript';
      else if (ext === 'json') language = 'json';
      else if (ext === 'md') language = 'markdown';

      tab = { path: filePath, name: fileName, language, dirty: false };
      this.openTabs.push(tab);
    }

    this.setActiveTab(filePath);
    this.renderTabs();
  },

  setActiveTab(filePath) {
    this.activeTabPath = filePath;
    const tab = this.openTabs.find(t => t.path === filePath);
    if (!tab) return;

    const content = this.fileContents[filePath] || '';

    // Update Breadcrumbs
    const bcFile = document.getElementById('breadcrumb-file');
    if (bcFile) bcFile.textContent = tab.name;

    if (this.isMonacoReady && this.editor) {
      let model = this.models[filePath];
      if (!model) {
        model = monaco.editor.createModel(content, tab.language);
        this.models[filePath] = model;
      } else {
        if (model.getValue() !== content) {
          model.setValue(content);
        }
      }
      this.editor.setModel(model);
      this.editor.focus();
    } else {
      this.fallbackEl.value = content;
      this.fallbackEl.focus();
    }

    this.renderTabs();
  },

  closeTab(filePath) {
    const index = this.openTabs.findIndex(t => t.path === filePath);
    if (index === -1) return;

    this.openTabs.splice(index, 1);
    delete this.models[filePath];

    if (this.activeTabPath === filePath) {
      if (this.openTabs.length > 0) {
        const nextTab = this.openTabs[Math.max(0, index - 1)];
        this.setActiveTab(nextTab.path);
      } else {
        this.activeTabPath = null;
        if (this.isMonacoReady && this.editor) {
          this.editor.setModel(null);
        } else {
          this.fallbackEl.value = '';
        }
      }
    }

    this.renderTabs();
  },

  markTabDirty(filePath, isDirty) {
    const tab = this.openTabs.find(t => t.path === filePath);
    if (tab) {
      tab.dirty = isDirty;
      this.renderTabs();
    }
  },

  renderTabs() {
    if (!this.tabsBarEl) return;
    this.tabsBarEl.innerHTML = '';

    this.openTabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab-item ${tab.path === this.activeTabPath ? 'active' : ''} ${tab.dirty ? 'dirty' : ''}`;

      let iconClass = 'far fa-file-code';
      let iconColor = '#94a3b8';
      if (tab.language === 'html') { iconClass = 'fab fa-html5'; iconColor = '#f97316'; }
      else if (tab.language === 'css') { iconClass = 'fab fa-css3-alt'; iconColor = '#38bdf8'; }
      else if (tab.language === 'javascript') { iconClass = 'fab fa-js'; iconColor = '#facc15'; }

      tabEl.innerHTML = `
        <i class="${iconClass}" style="color: ${iconColor};"></i>
        <span>${tab.name}</span>
        <span class="tab-dirty-indicator"></span>
        <span class="tab-close" title="Close Tab">&times;</span>
      `;

      tabEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close')) {
          this.setActiveTab(tab.path);
        }
      });

      const closeBtn = tabEl.querySelector('.tab-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(tab.path);
      });

      this.tabsBarEl.appendChild(tabEl);
    });
  },

  getCurrentContent() {
    if (this.isMonacoReady && this.editor) {
      return this.editor.getValue();
    }
    return this.fallbackEl.value;
  },

  setCurrentContent(content) {
    if (this.activeTabPath) {
      this.fileContents[this.activeTabPath] = content;
    }
    if (this.isMonacoReady && this.editor) {
      this.editor.setValue(content);
    } else {
      this.fallbackEl.value = content;
    }
  },

  formatCode() {
    if (this.isMonacoReady && this.editor) {
      this.editor.getAction('editor.action.formatDocument').run();
      App.showToast('Code formatted cleanly', 'info');
    } else {
      App.showToast('Auto-formatting active', 'info');
    }
  },

  copyCode() {
    const code = this.getCurrentContent();
    navigator.clipboard.writeText(code).then(() => {
      App.showToast('Code copied to clipboard!', 'success');
    }).catch(() => {
      App.showToast('Failed to copy', 'error');
    });
  },

  setFontSize(size) {
    if (this.isMonacoReady && this.editor) {
      this.editor.updateOptions({ fontSize: parseInt(size, 10) });
    }
    this.fallbackEl.style.fontSize = `${size}px`;
  },

  setWordWrap(wrap) {
    if (this.isMonacoReady && this.editor) {
      this.editor.updateOptions({ wordWrap: wrap });
    }
  },

  setTabSize(size) {
    if (this.isMonacoReady && this.editor) {
      this.editor.updateOptions({ tabSize: parseInt(size, 10) });
    }
  }
};
