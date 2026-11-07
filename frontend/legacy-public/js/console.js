// public/js/console.js - Real-time Console & Interactive REPL

const ConsoleManager = {
  logsListEl: null,
  replInputEl: null,
  errorBadgeEl: null,
  errorCount: 0,
  history: [],
  historyIndex: -1,

  init() {
    this.logsListEl = document.getElementById('console-logs-list');
    this.replInputEl = document.getElementById('console-repl-input');
    this.errorBadgeEl = document.getElementById('console-error-badge');

    // REPL input submission
    if (this.replInputEl) {
      this.replInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.executeRepl();
        } else if (e.key === 'ArrowUp') {
          // Cycle through history
          if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.replInputEl.value = this.history[this.history.length - 1 - this.historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          if (this.historyIndex > 0) {
            this.historyIndex--;
            this.replInputEl.value = this.history[this.history.length - 1 - this.historyIndex];
          } else if (this.historyIndex === 0) {
            this.historyIndex = -1;
            this.replInputEl.value = '';
          }
        }
      });
    }

    // Clear console button
    const clearBtn = document.getElementById('btn-clear-console');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }

    // Toggle drawer button
    const toggleBtn = document.getElementById('btn-toggle-drawer');
    const drawerEl = document.getElementById('bottom-drawer');
    if (toggleBtn && drawerEl) {
      toggleBtn.addEventListener('click', () => {
        drawerEl.classList.toggle('collapsed');
        const isCollapsed = drawerEl.classList.contains('collapsed');
        toggleBtn.innerHTML = isCollapsed ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
      });
    }
  },

  addLog(level = 'log', message = '', timestamp = null) {
    if (!this.logsListEl) return;

    const time = timestamp || new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `console-entry ${level}`;

    let iconHtml = '<i class="fas fa-angle-right"></i>';
    if (level === 'error') {
      iconHtml = '<i class="fas fa-times-circle"></i>';
      this.errorCount++;
      this.updateErrorBadge();
    } else if (level === 'warn') {
      iconHtml = '<i class="fas fa-exclamation-triangle"></i>';
    } else if (level === 'info') {
      iconHtml = '<i class="fas fa-info-circle"></i>';
    }

    entry.innerHTML = `
      <span class="console-time">${time}</span>
      <span class="console-icon">${iconHtml}</span>
      <span>${this.escapeHtml(message)}</span>
    `;

    this.logsListEl.appendChild(entry);
    this.logsListEl.scrollTop = this.logsListEl.scrollHeight;
  },

  executeRepl() {
    const code = (this.replInputEl.value || '').trim();
    if (!code) return;

    this.history.push(code);
    this.historyIndex = -1;
    this.replInputEl.value = '';

    // Print command entered in console
    this.addLog('info', `> ${code}`);

    // Send code to preview iframe to be evaluated
    const iframe = document.getElementById('preview-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'EVAL_CODE',
        code: code
      }, '*');
    }
  },

  clear() {
    if (this.logsListEl) {
      this.logsListEl.innerHTML = '';
    }
    this.errorCount = 0;
    this.updateErrorBadge();
    this.addLog('info', 'Console cleared.');
  },

  updateErrorBadge() {
    if (!this.errorBadgeEl) return;
    if (this.errorCount > 0) {
      this.errorBadgeEl.textContent = this.errorCount;
      this.errorBadgeEl.classList.remove('hidden');
    } else {
      this.errorBadgeEl.classList.add('hidden');
    }
  },

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
