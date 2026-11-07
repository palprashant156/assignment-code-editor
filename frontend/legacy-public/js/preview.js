// public/js/preview.js - Live Sandboxed Preview & Device Framing

const PreviewManager = {
  iframeEl: null,
  loaderEl: null,
  frameWrapperEl: null,
  addressTextEl: null,
  currentProjectId: null,
  currentDevice: 'desktop',

  init() {
    this.iframeEl = document.getElementById('preview-iframe');
    this.loaderEl = document.getElementById('preview-loader');
    this.frameWrapperEl = document.getElementById('device-frame-wrapper');
    this.addressTextEl = document.getElementById('virtual-url-text');

    // Reload button
    const reloadBtn = document.getElementById('btn-reload-preview');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => this.reload());
    }

    // Open in new tab button
    const popoutBtn = document.getElementById('btn-open-newtab');
    if (popoutBtn) {
      popoutBtn.addEventListener('click', () => this.openInNewTab());
    }

    const popoutNavBtn = document.getElementById('btn-popout-preview');
    if (popoutNavBtn) {
      popoutNavBtn.addEventListener('click', () => this.openInNewTab());
    }

    // Device switcher buttons
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const device = btn.dataset.device;
        this.setDeviceMode(device);
      });
    });

    // Listen for bridge messages from inside preview iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'codecraft_preview') {
        if (event.data.type === 'CONSOLE_MESSAGE') {
          ConsoleManager.addLog(event.data.level, event.data.message, event.data.timestamp);
        } else if (event.data.type === 'PREVIEW_LOADED') {
          this.hideLoader();
        }
      }
    });

    // Fallback load event on iframe element
    this.iframeEl.addEventListener('load', () => {
      setTimeout(() => this.hideLoader(), 250);
    });
  },

  setProject(projectId, projectName = 'student-repl') {
    this.currentProjectId = projectId;
    const cleanName = (projectName || 'repl').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (this.addressTextEl) {
      this.addressTextEl.textContent = `https://${cleanName}.run/index.html`;
    }
    this.reload();
  },

  reload() {
    if (!this.currentProjectId || !this.iframeEl) return;
    this.showLoader();

    // Set src with cache buster timestamp
    const url = `/api/preview/${this.currentProjectId}/index.html?t=${Date.now()}`;
    this.iframeEl.src = url;
  },

  showLoader() {
    if (this.loaderEl) this.loaderEl.classList.add('visible');
  },

  hideLoader() {
    if (this.loaderEl) this.loaderEl.classList.remove('visible');
  },

  setDeviceMode(mode) {
    this.currentDevice = mode;
    
    // Update active button state
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.device === mode);
    });

    // Update frame wrapper CSS class
    this.frameWrapperEl.className = `frame-wrapper mode-${mode}`;
    App.showToast(`Preview mode: ${mode.toUpperCase()}`, 'info');
  },

  openInNewTab() {
    if (!this.currentProjectId) return;
    const url = `/api/preview/${this.currentProjectId}/index.html`;
    window.open(url, '_blank');
  }
};
