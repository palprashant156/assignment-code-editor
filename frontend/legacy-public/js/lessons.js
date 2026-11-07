// public/js/lessons.js - Student Curriculum & Automated Code Verifier

const LessonsManager = {
  lessons: [],
  currentLessonId: null,
  selectEl: null,
  descEl: null,
  taskListEl: null,
  verifyBtn: null,

  async init() {
    this.selectEl = document.getElementById('lesson-select');
    this.descEl = document.getElementById('lesson-description');
    this.taskListEl = document.getElementById('lesson-task-list');
    this.verifyBtn = document.getElementById('btn-verify-lesson');

    if (this.selectEl) {
      this.selectEl.addEventListener('change', (e) => {
        this.selectLesson(e.target.value);
      });
    }

    if (this.verifyBtn) {
      this.verifyBtn.addEventListener('click', () => this.verifyCurrentCode());
    }

    await this.loadLessons();
  },

  async loadLessons() {
    try {
      const data = await API.getLessons();
      if (data && data.lessons) {
        this.lessons = data.lessons;
        this.renderSelect();
        if (this.lessons.length > 0) {
          this.selectLesson(this.lessons[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  },

  renderSelect() {
    if (!this.selectEl) return;
    this.selectEl.innerHTML = '';

    this.lessons.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = `${l.title} (${l.difficulty})`;
      this.selectEl.appendChild(opt);
    });
  },

  selectLesson(lessonId) {
    this.currentLessonId = lessonId;
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (this.descEl) this.descEl.textContent = lesson.description;
    this.renderTasks(lesson.tasks);
  },

  renderTasks(tasks) {
    if (!this.taskListEl) return;
    this.taskListEl.innerHTML = '';

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.id = `task-card-${task.id}`;

      card.innerHTML = `
        <div class="task-header">
          <i class="far fa-circle task-check-icon"></i>
          <span>${task.title}</span>
        </div>
        <p class="task-instruction">${task.instruction}</p>
        <button class="task-hint-btn"><i class="fas fa-lightbulb"></i> Need a hint?</button>
        <div class="task-hint-content">${task.hint}</div>
      `;

      const hintBtn = card.querySelector('.task-hint-btn');
      const hintContent = card.querySelector('.task-hint-content');
      hintBtn.addEventListener('click', () => {
        hintContent.classList.toggle('open');
      });

      this.taskListEl.appendChild(card);
    });
  },

  async verifyCurrentCode() {
    if (!this.currentLessonId) return;

    // Fetch current file contents for index.html, style.css, script.js
    let html = '';
    let css = '';
    let js = '';

    try {
      const htmlRes = await API.getFile(App.currentProject.id, 'index.html').catch(() => null);
      if (htmlRes && htmlRes.content) html = htmlRes.content;
      
      const cssRes = await API.getFile(App.currentProject.id, 'style.css').catch(() => null);
      if (cssRes && cssRes.content) css = cssRes.content;

      const jsRes = await API.getFile(App.currentProject.id, 'script.js').catch(() => null);
      if (jsRes && jsRes.content) js = jsRes.content;

      // Prefer editor buffers so verification includes changes not saved to disk yet.
      const currentContents = { ...EditorManager.fileContents };
      if (EditorManager.activeTabPath) {
        currentContents[EditorManager.activeTabPath] = EditorManager.getCurrentContent();
      }
      html = currentContents['index.html'] ?? html;
      css = currentContents['style.css'] ?? css;
      js = currentContents['script.js'] ?? js;

      this.verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking tests...';

      const res = await API.verifyLesson({
        lessonId: this.currentLessonId,
        html,
        css,
        js
      });

      this.verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify My Code';

      if (res && res.report) {
        this.applyTestResults(res.report);
      }
    } catch (err) {
      this.verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify My Code';
      App.showToast(`Verification error: ${err.message}`, 'error');
    }
  },

  applyTestResults(report) {
    report.results.forEach(result => {
      const card = document.getElementById(`task-card-${result.taskId}`);
      if (!card) return;

      const icon = card.querySelector('.task-check-icon');
      if (result.passed) {
        card.classList.add('passed');
        icon.className = 'fas fa-check-circle task-check-icon';
      } else {
        card.classList.remove('passed');
        icon.className = 'far fa-circle task-check-icon';
      }
    });

    if (report.isComplete) {
      App.showToast(`🎉 Congratulations! You completed ${report.lessonTitle}!`, 'success');
      ConsoleManager.addLog('info', `🏆 Level Completed: All tests passed for "${report.lessonTitle}"!`);
    } else {
      App.showToast(`Progress: ${report.passedCount}/${report.totalTasks} tasks passed`, 'info');
    }
  }
};
