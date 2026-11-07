// server/services/templates.js
// Pre-configured starter templates for students learning web development

const templates = [
  {
    id: 'portfolio',
    name: 'Personal Developer Portfolio',
    description: 'A modern, responsive portfolio with dark mode, interactive project cards, skills showcase, and contact form.',
    category: 'Showcase',
    icon: '🚀',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Rivera | Creative Frontend Developer</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <!-- Header / Navigation -->
  <header class="navbar">
    <div class="logo">
      <span class="logo-bracket">&lt;</span>Alex<span class="logo-accent">.dev</span><span class="logo-bracket">/&gt;</span>
    </div>
    <nav class="nav-links">
      <a href="#about" class="nav-item">About</a>
      <a href="#skills" class="nav-item">Skills</a>
      <a href="#projects" class="nav-item">Projects</a>
      <a href="#contact" class="nav-item btn-primary">Let's Talk</a>
    </nav>
  </header>

  <!-- Hero Section -->
  <section class="hero" id="about">
    <div class="hero-badge">
      <span class="pulse-dot"></span> Available for new opportunities
    </div>
    <h1 class="hero-title">
      Crafting <span class="gradient-text">digital experiences</span> that inspire and engage.
    </h1>
    <p class="hero-desc">
      Hi! I'm Alex, a frontend developer and UI designer passionate about building interactive, accessible, and high-performance web applications.
    </p>
    <div class="hero-actions">
      <a href="#projects" class="btn btn-glow">View My Work <i class="fas fa-arrow-right"></i></a>
      <button id="theme-btn" class="btn btn-outline"><i class="fas fa-magic"></i> Surprise Effect</button>
    </div>
  </section>

  <!-- Skills Section -->
  <section class="section" id="skills">
    <div class="section-header">
      <h2 class="section-title">My Tech Stack</h2>
      <p class="section-subtitle">Technologies and tools I use to bring ideas to life</p>
    </div>
    <div class="skills-grid">
      <div class="skill-card">
        <i class="fab fa-html5 skill-icon html"></i>
        <h3>Semantic HTML5</h3>
        <p>Accessible and SEO-optimized structures</p>
      </div>
      <div class="skill-card">
        <i class="fab fa-css3-alt skill-icon css"></i>
        <h3>Modern CSS & Flexbox</h3>
        <p>Responsive grid layouts, animations & variables</p>
      </div>
      <div class="skill-card">
        <i class="fab fa-js skill-icon js"></i>
        <h3>JavaScript (ES6+)</h3>
        <p>DOM manipulation, async APIs, interactive logic</p>
      </div>
      <div class="skill-card">
        <i class="fas fa-mobile-alt skill-icon mobile"></i>
        <h3>Responsive Design</h3>
        <p>Flawless on smartphones, tablets & desktop displays</p>
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <section class="section" id="projects">
    <div class="section-header">
      <h2 class="section-title">Featured Projects</h2>
      <p class="section-subtitle">Hands-on websites and creative interactive tools</p>
    </div>
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-thumb gradient-1">
          <i class="fas fa-bolt project-icon"></i>
        </div>
        <div class="project-content">
          <div class="project-tags">
            <span class="tag">HTML5</span>
            <span class="tag">CSS Grid</span>
            <span class="tag">Canvas</span>
          </div>
          <h3>Retro Arcade Runner</h3>
          <p>A fast-paced mini browser game with particle effects and custom sound synthesizers.</p>
          <button class="card-btn" onclick="openDemo('Arcade')">Live Demo <i class="fas fa-external-link-alt"></i></button>
        </div>
      </div>

      <div class="project-card">
        <div class="project-thumb gradient-2">
          <i class="fas fa-cloud-sun project-icon"></i>
        </div>
        <div class="project-content">
          <div class="project-tags">
            <span class="tag">JavaScript</span>
            <span class="tag">Fetch API</span>
            <span class="tag">CSS Glass</span>
          </div>
          <h3>Atmosphere Weather Radar</h3>
          <p>Real-time meteorological forecast application with animated weather condition icons.</p>
          <button class="card-btn" onclick="openDemo('Weather')">Live Demo <i class="fas fa-external-link-alt"></i></button>
        </div>
      </div>

      <div class="project-card">
        <div class="project-thumb gradient-3">
          <i class="fas fa-palette project-icon"></i>
        </div>
        <div class="project-content">
          <div class="project-tags">
            <span class="tag">CSS Variables</span>
            <span class="tag">JS Color Engine</span>
          </div>
          <h3>Chroma Palette Generator</h3>
          <p>Generates harmonic color schemes with one-click hex copying and accessibility contrast ratings.</p>
          <button class="card-btn" onclick="openDemo('Chroma')">Live Demo <i class="fas fa-external-link-alt"></i></button>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Contact Section -->
  <section class="section contact-section" id="contact">
    <div class="contact-card">
      <h2>Have a project in mind?</h2>
      <p>Send me a message or connect through social channels.</p>
      <form id="contact-form" class="contact-form">
        <div class="form-group">
          <input type="text" id="name" placeholder="Your Name" required>
        </div>
        <div class="form-group">
          <input type="email" id="email" placeholder="Your Email Address" required>
        </div>
        <div class="form-group">
          <textarea id="message" rows="4" placeholder="Tell me about your project..." required></textarea>
        </div>
        <button type="submit" class="btn btn-glow">Send Message <i class="fas fa-paper-plane"></i></button>
      </form>
      <div id="status-msg" class="status-msg hidden"></div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 Alex Rivera. Built inside CodeCraft Studio IDE.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `:root {
  --bg-primary: #0b0f19;
  --bg-card: rgba(22, 28, 45, 0.7);
  --bg-card-hover: rgba(30, 41, 69, 0.9);
  --accent-blue: #00d2ff;
  --accent-purple: #9d4edd;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --glow-shadow: 0 0 25px rgba(0, 210, 255, 0.35);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
  transition: background-color 0.4s ease;
}

/* Navigation */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  background: rgba(11, 15, 25, 0.85);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logo-accent {
  color: var(--accent-blue);
}

.logo-bracket {
  color: var(--accent-purple);
  font-family: var(--font-mono);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: var(--text-main);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  color: #fff;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
}

.btn-glow {
  background: linear-gradient(135deg, #00d2ff, #7928ca);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 210, 255, 0.3);
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 210, 255, 0.5);
}

.btn-outline {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-subtle);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Hero */
.hero {
  padding: 6rem 2rem 4rem;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 1rem;
  background: rgba(0, 210, 255, 0.1);
  border: 1px solid rgba(0, 210, 255, 0.25);
  color: var(--accent-blue);
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -1.5px;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #00d2ff 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 1.2rem;
  color: var(--text-muted);
  max-width: 680px;
  margin: 0 auto 2.5rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Sections */
.section {
  padding: 4.5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.8px;
}

.section-subtitle {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 210, 255, 0.3);
  background: var(--bg-card-hover);
}

.skill-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.skill-icon.html { color: #f97316; }
.skill-icon.css { color: #38bdf8; }
.skill-icon.js { color: #facc15; }
.skill-icon.mobile { color: #a855f7; }

.skill-card h3 {
  font-size: 1.15rem;
  margin-bottom: 0.4rem;
}

.skill-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.project-thumb {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-thumb.gradient-1 { background: linear-gradient(135deg, #4f46e5, #06b6d4); }
.project-thumb.gradient-2 { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); }
.project-thumb.gradient-3 { background: linear-gradient(135deg, #ec4899, #8b5cf6); }

.project-icon {
  font-size: 3.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.project-content {
  padding: 1.5rem;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.project-content h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.project-content p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.card-btn {
  background: transparent;
  color: var(--accent-blue);
  border: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0;
  font-size: 0.95rem;
}

.card-btn:hover {
  text-decoration: underline;
}

/* Contact */
.contact-card {
  background: linear-gradient(180deg, rgba(22, 28, 45, 0.8), rgba(15, 20, 32, 0.95));
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  padding: 3rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.contact-card h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.contact-card p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  color: var(--text-main);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-blue);
  background: rgba(255, 255, 255, 0.06);
}

.status-msg {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.status-msg.success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.hidden {
  display: none;
}

/* Footer */
.footer {
  text-align: center;
  padding: 2.5rem;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.2rem; }
  .navbar { padding: 1rem 1.5rem; }
  .nav-links { display: none; }
}`,
      'script.js': `// Alex Rivera's Portfolio - Interactive Logic
console.log("Welcome to Alex Rivera's Portfolio!");
console.log("Try modifying this file in CodeCraft Studio to see live changes.");

// Interactive Theme / Particle Surprise Button
const surpriseBtn = document.getElementById('theme-btn');
let clickCount = 0;

if (surpriseBtn) {
  surpriseBtn.addEventListener('click', () => {
    clickCount++;
    console.log("Surprise button clicked! Count:", clickCount);
    
    // Playful background cycle
    const colors = [
      'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)',
      'linear-gradient(135deg, #052e16 0%, #0b0f19 100%)',
      'linear-gradient(135deg, #31103f 0%, #0b0f19 100%)',
      '#0b0f19'
    ];
    document.body.style.background = colors[clickCount % colors.length];
    
    surpriseBtn.innerHTML = '<i class="fas fa-check"></i> Theme Activated #' + clickCount;
  });
}

// Live demo card notification
function openDemo(name) {
  console.log("Demo opened:", name);
  alert("Launching live preview for " + name + " project!");
}

// Contact form handling with validation
const contactForm = document.getElementById('contact-form');
const statusMsg = document.getElementById('status-msg');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    console.log("Form submitted with:", { name, email });
    
    statusMsg.className = 'status-msg success';
    statusMsg.innerText = "Thank you, " + name + "! Your message has been received.";
    contactForm.reset();
  });
}`
    }
  },
  {
    id: 'game',
    name: 'Cyber Arcade - 2D Canvas Game',
    description: 'An interactive HTML5 Canvas spaceship game with keyboard controls, lasers, asteroids, scoring, and explosion animations.',
    category: 'Game',
    icon: '🎮',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Space Defender 2D</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="game-wrapper">
    <header class="game-header">
      <h1>CYBER DEFENDER</h1>
      <div class="stats-bar">
        <div class="stat"><span class="label">SCORE:</span> <span id="score-val">0</span></div>
        <div class="stat"><span class="label">LIVES:</span> <span id="lives-val">3</span></div>
        <div class="stat"><span class="label">WAVE:</span> <span id="wave-val">1</span></div>
      </div>
    </header>

    <div class="canvas-container">
      <canvas id="gameCanvas" width="600" height="450"></canvas>
      <div id="game-overlay" class="game-overlay">
        <h2 id="overlay-title">SPACE DEFENDER</h2>
        <p id="overlay-sub">Use [Arrow Keys] or [A / D] to Move • [Spacebar] to Fire</p>
        <button id="start-btn" class="arcade-btn">LAUNCH MISSION</button>
      </div>
    </div>

    <div class="controls-hint">
      <span>Controls: <strong>←</strong> / <strong>→</strong> or <strong>A</strong> / <strong>D</strong> Move | <strong>SPACE</strong> Fire Laser</span>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #060913;
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.game-header {
  text-align: center;
}

.game-header h1 {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.4rem;
  color: #00f3ff;
  text-shadow: 0 0 12px rgba(0, 243, 255, 0.7);
  letter-spacing: 2px;
  margin-bottom: 0.6rem;
}

.stats-bar {
  display: flex;
  gap: 2rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 243, 255, 0.3);
}

.stat .label {
  color: #a855f7;
}

.canvas-container {
  position: relative;
  border: 2px solid #00f3ff;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0, 243, 255, 0.25);
  overflow: hidden;
  background: #02040a;
}

#gameCanvas {
  display: block;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 4, 10, 0.88);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  text-align: center;
  padding: 1rem;
}

.game-overlay h2 {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.3rem;
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.8);
}

.game-overlay p {
  color: #94a3b8;
  font-size: 0.85rem;
  max-width: 400px;
}

.arcade-btn {
  font-family: 'Press Start 2P', monospace;
  background: #00f3ff;
  color: #02040a;
  border: none;
  padding: 0.8rem 1.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.6);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.arcade-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(0, 243, 255, 0.9);
}

.controls-hint {
  font-size: 0.85rem;
  color: #64748b;
}`,
      'script.js': `// Cyber Space Defender - 2D Canvas Game Engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-val');
const livesEl = document.getElementById('lives-val');
const overlay = document.getElementById('game-overlay');
const startBtn = document.getElementById('start-btn');
const overlayTitle = document.getElementById('overlay-title');

let gameRunning = false;
let score = 0;
let lives = 3;
let keys = {};

// Player Ship Object
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 45,
  width: 40,
  height: 25,
  speed: 7,
  color: '#00f3ff'
};

let bullets = [];
let asteroids = [];
let particles = [];

// Event Listeners for Keyboard
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space' && gameRunning) {
    fireBullet();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

startBtn.addEventListener('click', startGame);

function startGame() {
  score = 0;
  lives = 3;
  bullets = [];
  asteroids = [];
  particles = [];
  player.x = canvas.width / 2 - 20;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  overlay.style.display = 'none';
  gameRunning = true;
  console.log("Game started!");
  requestAnimationFrame(gameLoop);
}

function fireBullet() {
  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 12,
    speed: 9
  });
}

function spawnAsteroid() {
  if (Math.random() < 0.035) {
    asteroids.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      radius: Math.random() * 15 + 12,
      speed: Math.random() * 2 + 1.5,
      color: '#f43f5e'
    });
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      alpha: 1,
      color
    });
  }
}

function update() {
  // Move player
  if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) {
    player.x -= player.speed;
  }
  if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -20) bullets.splice(i, 1);
  }

  // Spawn & update asteroids
  spawnAsteroid();
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed;

    // Check collision with player
    const distPlayer = Math.hypot(a.x - (player.x + player.width / 2), a.y - (player.y + player.height / 2));
    if (distPlayer < a.radius + 15) {
      lives--;
      livesEl.textContent = lives;
      createExplosion(a.x, a.y, '#f59e0b');
      asteroids.splice(i, 1);
      if (lives <= 0) {
        gameOver();
      }
      continue;
    }

    // Check collision with bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < a.radius) {
        score += 50;
        scoreEl.textContent = score;
        createExplosion(a.x, a.y, '#00f3ff');
        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        break;
      }
    }

    if (a.y > canvas.height + 30) asteroids.splice(i, 1);
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}

function draw() {
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Stars in Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let s = 0; s < 20; s++) {
    ctx.fillRect((s * 37) % canvas.width, (s * 83 + Date.now() / 20) % canvas.height, 2, 2);
  }

  // Draw Player
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Engine flame glow
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(player.x + player.width / 2 - 3, player.y + player.height, 6, 8 + Math.random() * 5);

  // Draw Bullets
  ctx.fillStyle = '#38bdf8';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  // Draw Asteroids
  asteroids.forEach(a => {
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
    ctx.restore();
  });
}

function gameOver() {
  gameRunning = false;
  console.log("Game over! Final Score:", score);
  overlayTitle.textContent = "GAME OVER";
  overlayTitle.style.color = '#ef4444';
  overlay.style.display = 'flex';
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}`
    }
  },
  {
    id: 'calculator',
    name: 'Smart Neumorphic Calculator',
    description: 'A stylish interactive calculator featuring history tape, keyboard shortcuts, memory buttons, and smooth animations.',
    category: 'Application',
    icon: '🧮',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Glassmorphic Calculator</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="calculator-app">
    <div class="calculator-card">
      <div class="calc-header">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="app-title">CodeCraft Calc</span>
      </div>

      <div class="display-container">
        <div id="prev-operation" class="prev-op"></div>
        <div id="current-display" class="current-display">0</div>
      </div>

      <div class="keypad">
        <button class="key func" data-action="clear">AC</button>
        <button class="key func" data-action="delete">DEL</button>
        <button class="key func" data-action="percent">%</button>
        <button class="key op" data-op="/">÷</button>

        <button class="key num" data-num="7">7</button>
        <button class="key num" data-num="8">8</button>
        <button class="key num" data-num="9">9</button>
        <button class="key op" data-op="*">×</button>

        <button class="key num" data-num="4">4</button>
        <button class="key num" data-num="5">5</button>
        <button class="key num" data-num="6">6</button>
        <button class="key op" data-op="-">−</button>

        <button class="key num" data-num="1">1</button>
        <button class="key num" data-num="2">2</button>
        <button class="key num" data-num="3">3</button>
        <button class="key op" data-op="+">+</button>

        <button class="key num zero" data-num="0">0</button>
        <button class="key num" data-num=".">.</button>
        <button class="key equals" data-action="calculate">=</button>
      </div>
    </div>

    <!-- History Panel -->
    <div class="history-panel">
      <h3>Calculation History</h3>
      <ul id="history-list">
        <li class="empty-hint">Calculations will appear here</li>
      </ul>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: radial-gradient(circle at 50% 30%, #1e1b4b, #090d16);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #fff;
  padding: 1.5rem;
}

.calculator-app {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

.calculator-card {
  width: 320px;
  background: rgba(22, 27, 46, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.calc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 1.2rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

.app-title {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
}

.display-container {
  background: rgba(10, 13, 24, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.2rem;
  text-align: right;
  margin-bottom: 1.5rem;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.prev-op {
  font-size: 0.9rem;
  color: #64748b;
  min-height: 1.2rem;
  font-family: 'JetBrains Mono', monospace;
}

.current-display {
  font-size: 2.2rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #f8fafc;
  word-break: break-all;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.key {
  height: 54px;
  border-radius: 12px;
  border: none;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  transition: all 0.15s ease;
}

.key:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
}

.key:active {
  transform: translateY(0);
}

.key.func {
  color: #00d2ff;
  background: rgba(0, 210, 255, 0.1);
}

.key.op {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
}

.key.equals {
  background: linear-gradient(135deg, #00d2ff, #7928ca);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0, 210, 255, 0.4);
}

.key.zero {
  grid-column: span 2;
}

.history-panel {
  width: 260px;
  background: rgba(22, 27, 46, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.4rem;
}

.history-panel h3 {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

#history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  max-height: 320px;
  overflow-y: auto;
}

#history-list li {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  color: #cbd5e1;
}

.empty-hint {
  color: #64748b !important;
  font-style: italic;
  font-size: 0.8rem;
}`,
      'script.js': `// Smart Calculator Logic
let currentInput = '0';
let previousInput = '';
let currentOperation = null;

const currentDisplay = document.getElementById('current-display');
const prevDisplay = document.getElementById('prev-operation');
const historyList = document.getElementById('history-list');

function updateDisplay() {
  currentDisplay.textContent = currentInput;
  if (currentOperation != null) {
    prevDisplay.textContent = \`\${previousInput} \${currentOperation}\`;
  } else {
    prevDisplay.textContent = '';
  }
}

function appendNumber(number) {
  if (number === '.' && currentInput.includes('.')) return;
  if (currentInput === '0' && number !== '.') {
    currentInput = number;
  } else {
    currentInput += number;
  }
  updateDisplay();
}

function chooseOperation(op) {
  if (currentInput === '') return;
  if (previousInput !== '') {
    compute();
  }
  currentOperation = op;
  previousInput = currentInput;
  currentInput = '';
  updateDisplay();
}

function compute() {
  let computation;
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(current)) return;

  switch (currentOperation) {
    case '+': computation = prev + current; break;
    case '-': computation = prev - current; break;
    case '*': computation = prev * current; break;
    case '/': computation = current === 0 ? 'Error' : prev / current; break;
    default: return;
  }

  addHistory(\`\${prev} \${currentOperation} \${current} = \${computation}\`);
  console.log("Calculated:", prev, currentOperation, current, "=", computation);
  currentInput = computation.toString();
  currentOperation = null;
  previousInput = '';
  updateDisplay();
}

function addHistory(entry) {
  const empty = historyList.querySelector('.empty-hint');
  if (empty) empty.remove();
  const li = document.createElement('li');
  li.textContent = entry;
  historyList.prepend(li);
}

// Button Click Listeners
document.querySelectorAll('.key.num').forEach(btn => {
  btn.addEventListener('click', () => appendNumber(btn.dataset.num));
});

document.querySelectorAll('.key.op').forEach(btn => {
  btn.addEventListener('click', () => chooseOperation(btn.dataset.op));
});

document.querySelector('[data-action="calculate"]').addEventListener('click', compute);

document.querySelector('[data-action="clear"]').addEventListener('click', () => {
  currentInput = '0';
  previousInput = '';
  currentOperation = null;
  updateDisplay();
});

document.querySelector('[data-action="delete"]').addEventListener('click', () => {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
});`
    }
  },
  {
    id: 'starter',
    name: 'Starter HTML5 / CSS3 / JS Playground',
    description: 'Clean boilerplate designed for learning basic HTML elements, CSS stylings, and JavaScript event listeners.',
    category: 'Starter',
    icon: '⚡',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Web Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <div class="card">
      <div class="badge">CodeCraft Starter</div>
      <h1>Hello, World! 🚀</h1>
      <p>Welcome to your live coding sandbox. Edit any file on the left side and see the instant changes here on the right!</p>
      
      <div class="interactive-area">
        <button id="counter-btn" class="glow-btn">Clicks: <span id="count">0</span></button>
        <button id="color-btn" class="outline-btn">Random Color</button>
      </div>

      <div class="tips-box">
        <h3>💡 Student Tips:</h3>
        <ul>
          <li>Open <code>index.html</code> to change the text and structure.</li>
          <li>Open <code>style.css</code> to customize colors, fonts, and borders.</li>
          <li>Open <code>script.js</code> to add custom behavior and sound.</li>
        </ul>
      </div>
    </div>
  </main>

  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #0f172a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.container {
  max-width: 560px;
  width: 100%;
}

.card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
}

.badge {
  display: inline-block;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

p {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.8rem;
}

.interactive-area {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  border: none;
}

button:hover {
  transform: translateY(-2px);
}

.glow-btn {
  background: #0284c7;
  color: white;
}

.glow-btn:hover {
  background: #0369a1;
}

.outline-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #f8fafc;
}

.outline-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tips-box {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tips-box h3 {
  font-size: 1rem;
  margin-bottom: 0.6rem;
  color: #cbd5e1;
}

.tips-box ul {
  padding-left: 1.2rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.tips-box li {
  margin-bottom: 0.4rem;
}

code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: #38bdf8;
  font-family: monospace;
}`,
      'script.js': `// Student Starter JavaScript
console.log("Playground initialized!");

let count = 0;
const countSpan = document.getElementById('count');
const counterBtn = document.getElementById('counter-btn');
const colorBtn = document.getElementById('color-btn');

counterBtn.addEventListener('click', () => {
  count++;
  countSpan.textContent = count;
  console.log("Count is now:", count);
});

colorBtn.addEventListener('click', () => {
  const hues = [210, 160, 280, 340, 45, 12];
  const randomHue = hues[Math.floor(Math.random() * hues.length)];
  document.body.style.backgroundColor = \`hsl(\${randomHue}, 40%, 12%)\`;
  console.log("Background updated to hue:", randomHue);
});`
    }
  }
];

module.exports = { templates };
