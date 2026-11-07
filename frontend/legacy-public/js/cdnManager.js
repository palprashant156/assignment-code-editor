// public/js/cdnManager.js - 1-Click Library & CDN Injector

const CdnManager = {
  containerEl: null,

  libraries: [
    {
      id: 'font-awesome',
      name: 'Font Awesome 6 Icons',
      desc: 'Thousands of vector icons (fab, fas, far) for UI design.',
      tag: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">'
    },
    {
      id: 'confetti',
      name: 'Canvas Confetti',
      desc: 'Drop festive confetti cannons on clicks and victories.',
      tag: '<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>'
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS (CDN)',
      desc: 'Utility-first modern CSS framework.',
      tag: '<script src="https://cdn.tailwindcss.com"></script>'
    },
    {
      id: 'gsap',
      name: 'GSAP Animation Library',
      desc: 'High-performance JavaScript animations and transitions.',
      tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
    },
    {
      id: 'chartjs',
      name: 'Chart.js',
      desc: 'Simple yet flexible JavaScript charting for data.',
      tag: '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>'
    },
    {
      id: 'threejs',
      name: 'Three.js (3D Graphics)',
      desc: 'WebGL 3D engine for rendering 3D scenes in canvas.',
      tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
    }
  ],

  init() {
    this.containerEl = document.getElementById('cdn-list-root');
    this.render();
  },

  render() {
    if (!this.containerEl) return;
    this.containerEl.innerHTML = '';

    this.libraries.forEach(lib => {
      const card = document.createElement('div');
      card.className = 'cdn-card';

      card.innerHTML = `
        <div class="cdn-info">
          <h4>${lib.name}</h4>
          <p>${lib.desc}</p>
        </div>
        <button class="cdn-add-btn" data-lib-id="${lib.id}">
          <i class="fas fa-plus"></i> Add
        </button>
      `;

      card.querySelector('.cdn-add-btn').addEventListener('click', () => {
        this.injectLibrary(lib);
      });

      this.containerEl.appendChild(card);
    });
  },

  async injectLibrary(lib) {
    if (!App.currentProject) return;

    try {
      // Fetch or use open index.html
      let htmlContent = '';
      if (EditorManager.activeTabPath === 'index.html') {
        htmlContent = EditorManager.getCurrentContent();
      } else {
        const res = await API.getFile(App.currentProject.id, 'index.html');
        htmlContent = res.content;
      }

      // Check if already injected
      if (htmlContent.includes(lib.tag.substring(0, 30))) {
        App.showToast(`${lib.name} is already included in index.html!`, 'info');
        return;
      }

      // Inject before </head> or at start
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `  ${lib.tag}\n</head>`);
      } else {
        htmlContent = `${lib.tag}\n` + htmlContent;
      }

      // Update editor or file
      if (EditorManager.activeTabPath === 'index.html') {
        EditorManager.setCurrentContent(htmlContent);
      }
      await API.saveFile(App.currentProject.id, 'index.html', htmlContent);

      App.showToast(`✨ ${lib.name} injected into index.html!`, 'success');
      PreviewManager.reload();
      ConsoleManager.addLog('info', `Injected package: ${lib.name}`);
    } catch (err) {
      App.showToast(`Failed to inject: ${err.message}`, 'error');
    }
  }
};
