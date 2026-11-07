// Cyber Space Defender - 2D Canvas Game Engine
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
}