// public/js/aiTutor.js - Student AI Coding Tutor

const AiTutorManager = {
  chatBoxEl: null,
  promptInputEl: null,
  promptFormEl: null,

  init() {
    this.chatBoxEl = document.getElementById('ai-chat-box');
    this.promptInputEl = document.getElementById('ai-prompt-input');
    this.promptFormEl = document.getElementById('ai-prompt-form');

    if (this.promptFormEl) {
      this.promptFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = (this.promptInputEl.value || '').trim();
        if (!text) return;
        this.askQuestion(text, 'chat');
        this.promptInputEl.value = '';
      });
    }

    // Quick action pills
    document.querySelectorAll('.ai-quick-pills .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleQuickAction(action);
      });
    });
  },

  handleQuickAction(action) {
    const currentPath = EditorManager.activeTabPath || 'index.html';
    const currentContent = EditorManager.getCurrentContent();
    const ext = currentPath.split('.').pop().toLowerCase();

    if (action === 'explain') {
      this.addMessage('user', `Can you explain the code in ${currentPath}?`);
      this.fetchAiResponse({
        mode: 'explain',
        currentFile: currentPath,
        code: currentContent,
        fileType: ext
      });
    } else if (action === 'debug') {
      this.addMessage('user', `Please check ${currentPath} for syntax errors or bugs.`);
      this.fetchAiResponse({
        mode: 'debug',
        currentFile: currentPath,
        code: currentContent,
        fileType: ext
      });
    } else if (action === 'improve') {
      this.addMessage('user', `How can I make my design and code cooler?`);
      this.fetchAiResponse({
        mode: 'improve',
        currentFile: currentPath,
        code: currentContent,
        fileType: ext
      });
    } else if (action === 'center') {
      this.addMessage('user', `How do I center an element in CSS?`);
      this.fetchAiResponse({
        mode: 'chat',
        prompt: 'how to center an element'
      });
    }
  },

  askQuestion(prompt, mode = 'chat') {
    this.addMessage('user', prompt);
    const currentPath = EditorManager.activeTabPath || 'index.html';
    const currentContent = EditorManager.getCurrentContent();
    const ext = currentPath.split('.').pop().toLowerCase();

    this.fetchAiResponse({
      mode,
      prompt,
      currentFile: currentPath,
      code: currentContent,
      fileType: ext
    });
  },

  async fetchAiResponse(payload) {
    this.addMessage('assistant', '<i class="fas fa-spinner fa-spin"></i> Analyzing code and generating response...', 'loading-msg');

    try {
      const data = await API.askAi(payload);
      this.removeLoadingMessage();

      if (data && data.reply) {
        this.addMessage('assistant', this.formatReply(data.reply));
      } else {
        this.addMessage('assistant', 'Sorry, I could not process that request. Please try again!');
      }
    } catch (err) {
      this.removeLoadingMessage();
      this.addMessage('assistant', `⚠️ Error connecting to AI tutor: ${err.message}`);
    }
  },

  addMessage(sender, htmlContent, customClass = '') {
    if (!this.chatBoxEl) return;

    const msg = document.createElement('div');
    msg.className = `ai-message ${sender} ${customClass}`;
    msg.innerHTML = htmlContent;

    // Attach "Insert into Editor" listeners
    msg.querySelectorAll('.btn-insert-snippet').forEach(btn => {
      btn.addEventListener('click', () => {
        const snippet = decodeURIComponent(btn.dataset.code);
        EditorManager.setCurrentContent(snippet);
        App.showToast('Snippet inserted into active editor!', 'success');
      });
    });

    this.chatBoxEl.appendChild(msg);
    this.chatBoxEl.scrollTop = this.chatBoxEl.scrollHeight;
  },

  removeLoadingMessage() {
    const loading = this.chatBoxEl.querySelector('.loading-msg');
    if (loading) loading.remove();
  },

  formatReply(text) {
    // Convert Markdown code blocks into formatted HTML with Insert button
    let formatted = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const encoded = encodeURIComponent(code);
      return `
        <div style="background: rgba(0,0,0,0.4); border-radius: 6px; padding: 0.6rem; margin: 0.5rem 0; font-family: var(--font-code); font-size: 0.75rem; border: 1px solid var(--border-subtle); position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; color: var(--text-muted); font-size: 0.7rem;">
            <span>${lang.toUpperCase() || 'CODE'}</span>
            <button class="btn-insert-snippet nav-btn" data-code="${encoded}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">
              <i class="fas fa-plus"></i> Insert
            </button>
          </div>
          <pre style="overflow-x: auto; margin: 0; color: #f8fafc;"><code>${this.escapeHtml(code)}</code></pre>
        </div>
      `;
    });

    // Bold text **word**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 0.1rem 0.3rem; border-radius: 3px; color: #38bdf8;">$1</code>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  },

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};
