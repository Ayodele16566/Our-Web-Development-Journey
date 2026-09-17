const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');
const waveEl = document.getElementById('wave');
const weaponEl = document.getElementById('weapon');
const ammoEl = document.getElementById('ammo');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

const keys = {};
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  down: false
};

const game = {
  running: false,
  score: 0,
  wave: 1,
  lastTime: 0,
  spawnTimer: 0,
  shootTimer: 0,
  backgroundShift: 0,
  player: null,
  bullets: [],
  enemies: [],
  particles: []
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetGame() {
  game.score = 0;
  game.wave = 1;
  game.spawnTimer = 0.8;
  game.shootTimer = 0;
  game.backgroundShift = 0;
  game.bullets = [];
  game.enemies = [];
  game.particles = [];

  game.player = {
    x: canvas.width / 2,
    y: canvas.height - 70,
    radius: 18,
    speed: 320,
    health: 100,
    weaponIndex: 0,
    weapons: {
      rifle: { label: 'Rifle', ammo: 30, reserveAmmo: 90, maxAmmo: 30, fireRate: 0.12, bulletSpeed: 700, pellets: 1 },
      shotgun: { label: 'Shotgun', ammo: 8, reserveAmmo: 32, maxAmmo: 8, fireRate: 0.45, bulletSpeed: 620, pellets: 7 }
    },
    reloadTimer: 0,
    recoil: 0,
    color: '#7df7bf'
  };

  updateHud();
}

function getCurrentWeapon() {
  const player = game.player;
  return player.weapons[player.weaponIndex === 0 ? 'rifle' : 'shotgun'];
}

function switchWeapon(index) {
  if (!game.running) return;
  game.player.weaponIndex = index;
  game.player.reloadTimer = 0;
  updateHud();
}

function updateHud() {
  const player = game.player;
  const currentWeapon = getCurrentWeapon();

  scoreEl.textContent = String(game.score);
  healthEl.textContent = String(Math.max(0, Math.round(player.health)));
  waveEl.textContent = String(game.wave);
  weaponEl.textContent = currentWeapon.label;
  ammoEl.textContent = `${currentWeapon.ammo} / ${currentWeapon.reserveAmmo}`;
}

function showIntro() {
  overlay.classList.add('visible');
  overlay.querySelector('h1').textContent = 'Strike Front';
  overlay.querySelector('.small-title').textContent = 'OPERATION';
  overlay.querySelector('.instructions').textContent = 'Move with WASD or arrow keys. Aim with the mouse. Click, Space, or hold fire to engage the enemy. Press R to reload.';
  startButton.textContent = 'Deploy';
}

function startGame() {
  resetGame();
  game.running = true;
  overlay.classList.remove('visible');
}

function endGame() {
  game.running = false;
  overlay.classList.add('visible');
  overlay.querySelector('h1').textContent = 'Mission Failed';
  overlay.querySelector('.small-title').textContent = 'STATUS';
  overlay.querySelector('.instructions').textContent = `Final score: ${game.score}. Enemy pressure reached your squad. Press deploy to retry.`;
  startButton.textContent = 'Retry Mission';
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -30;
  } else if (side === 1) {
    x = canvas.width + 30;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + 30;
  } else {
    x = -30;
    y = Math.random() * canvas.height;
  }

  const hp = 1 + Math.floor(game.wave / 2);
  const radius = 16 + Math.random() * 12;
  const speed = 55 + Math.random() * 60 + game.wave * 12;
  const angle = Math.atan2(game.player.y - y, game.player.x - x);

  game.enemies.push({
    x,
    y,
    radius,
    hp,
    speed,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    color: ['#ff5a63', '#ffd166', '#8b7bff', '#5fd1ff'][Math.floor(Math.random() * 4)]
  });
}

function createBurst(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.6;
    const speed = 60 + Math.random() * 150;
    game.particles.push({
      x,
      y,
      radius: 2 + Math.random() * 3,
      life: 0.45 + Math.random() * 0.5,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      color
    });
  }
}

function reloadWeapon() {
  if (!game.running) return;
  const player = game.player;
  const currentWeapon = getCurrentWeapon();

  if (currentWeapon.ammo === currentWeapon.maxAmmo || currentWeapon.reserveAmmo <= 0 || player.reloadTimer > 0) return;

  player.reloadTimer = 1.1;
}

function shootBullet() {
  const player = game.player;
  const currentWeapon = getCurrentWeapon();

  if (!game.running || player.reloadTimer > 0 || currentWeapon.ammo <= 0) {
    if (currentWeapon.ammo <= 0 && currentWeapon.reserveAmmo > 0 && player.reloadTimer <= 0) reloadWeapon();
    return;
  }

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const bulletSpeed = currentWeapon.bulletSpeed;
  player.recoil = 0.14;

  const pelletSpread = currentWeapon.label === 'Shotgun' ? 0.18 : 0.02;
  const pelletCount = currentWeapon.pellets;

  for (let i = 0; i < pelletCount; i++) {
    const spreadOffset = (Math.random() - 0.5) * pelletSpread;
    const shotAngle = angle + spreadOffset;

    game.bullets.push({
      x: player.x,
      y: player.y,
      radius: currentWeapon.label === 'Shotgun' ? 4 : 5,
      velocityX: Math.cos(shotAngle) * bulletSpeed,
      velocityY: Math.sin(shotAngle) * bulletSpeed,
      color: '#8ef0ff',
      damage: currentWeapon.label === 'Shotgun' ? 1 : 2
    });
  }

  currentWeapon.ammo -= 1;
  game.shootTimer = currentWeapon.fireRate;
  updateHud();
}

function handleInput(dt) {
  if (!game.running) return;

  const player = game.player;
  let moveX = 0;
  let moveY = 0;

  if (keys['w'] || keys['arrowup']) moveY -= 1;
  if (keys['s'] || keys['arrowdown']) moveY += 1;
  if (keys['a'] || keys['arrowleft']) moveX -= 1;
  if (keys['d'] || keys['arrowright']) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY) || 1;
    player.x += (moveX / length) * player.speed * dt;
    player.y += (moveY / length) * player.speed * dt;
  }

  player.x = clamp(player.x, 22, canvas.width - 22);
  player.y = clamp(player.y, 26, canvas.height - 26);

  if ((mouse.down || keys[' ']) && player.reloadTimer <= 0) {
    shootBullet();
  }

  if (keys['r']) {
    reloadWeapon();
  }
}

function update(dt) {
  if (!game.running) return;

  const player = game.player;
  const currentWeapon = getCurrentWeapon();
  game.backgroundShift += dt * 55;
  game.spawnTimer -= dt;
  game.shootTimer = Math.max(0, game.shootTimer - dt);
  player.recoil = Math.max(0, player.recoil - dt * 0.7);
  player.reloadTimer = Math.max(0, player.reloadTimer - dt);

  if (player.reloadTimer === 0 && currentWeapon.ammo < currentWeapon.maxAmmo && currentWeapon.reserveAmmo > 0 && keys['r']) {
    const needed = currentWeapon.maxAmmo - currentWeapon.ammo;
    const loaded = Math.min(needed, currentWeapon.reserveAmmo);
    currentWeapon.ammo += loaded;
    currentWeapon.reserveAmmo -= loaded;
    updateHud();
  }

  if (player.reloadTimer > 0 && currentWeapon.ammo < currentWeapon.maxAmmo && currentWeapon.reserveAmmo > 0 && player.reloadTimer <= 0.05) {
    const needed = currentWeapon.maxAmmo - currentWeapon.ammo;
    const loaded = Math.min(needed, currentWeapon.reserveAmmo);
    currentWeapon.ammo += loaded;
    currentWeapon.reserveAmmo -= loaded;
    updateHud();
  }

  if (game.spawnTimer <= 0) {
    spawnEnemy();
    game.spawnTimer = Math.max(0.5, 1.2 - game.wave * 0.08);
  }

  handleInput(dt);

  for (let i = game.bullets.length - 1; i >= 0; i--) {
    const bullet = game.bullets[i];
    bullet.x += bullet.velocityX * dt;
    bullet.y += bullet.velocityY * dt;

    if (
      bullet.x < -20 ||
      bullet.y < -20 ||
      bullet.x > canvas.width + 20 ||
      bullet.y > canvas.height + 20
    ) {
      game.bullets.splice(i, 1);
    }
  }

  for (let i = game.enemies.length - 1; i >= 0; i--) {
    const enemy = game.enemies[i];
    enemy.x += enemy.dx * dt;
    enemy.y += enemy.dy * dt;

    const playerDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (playerDistance < enemy.radius + player.radius) {
      player.health -= 12 + game.wave * 0.8;
      createBurst(enemy.x, enemy.y, enemy.color);
      game.enemies.splice(i, 1);
      if (player.health <= 0) {
        player.health = 0;
        updateHud();
        endGame();
        return;
      }
      updateHud();
      continue;
    }

    if (enemy.x < -80 || enemy.x > canvas.width + 80 || enemy.y < -80 || enemy.y > canvas.height + 80) {
      game.enemies.splice(i, 1);
    }
  }

  for (let i = game.bullets.length - 1; i >= 0; i--) {
    const bullet = game.bullets[i];
    let hit = false;

    for (let j = game.enemies.length - 1; j >= 0; j--) {
      const enemy = game.enemies[j];
      const distance = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

      if (distance < bullet.radius + enemy.radius) {
        enemy.hp -= bullet.damage || 1;
        createBurst(bullet.x, bullet.y, '#8ef0ff');
        game.bullets.splice(i, 1);

        if (enemy.hp <= 0) {
          createBurst(enemy.x, enemy.y, enemy.color);
          game.enemies.splice(j, 1);
          game.score += 10;
        }

        hit = true;
        break;
      }
    }

    if (hit) {
      game.wave = Math.max(1, Math.floor(game.score / 75) + 1);
      updateHud();
    }
  }

  for (let i = game.particles.length - 1; i >= 0; i--) {
    const particle = game.particles[i];
    particle.x += particle.velocityX * dt;
    particle.y += particle.velocityY * dt;
    particle.life -= dt;

    if (particle.life <= 0) {
      game.particles.splice(i, 1);
    }
  }

  updateHud();
}

function drawBackground() {
  ctx.fillStyle = '#071823';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 30) {
    ctx.strokeStyle = 'rgba(143, 240, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, y + (game.backgroundShift % 30));
    ctx.lineTo(canvas.width, y + (game.backgroundShift % 30));
    ctx.stroke();
  }

  for (let i = 0; i < 50; i++) {
    const x = (i * 97 + game.backgroundShift * 1.5) % (canvas.width + 20);
    const y = (i * 71 + game.backgroundShift * 0.9) % (canvas.height + 20);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(95,209,255,0.22)' : 'rgba(139,123,255,0.16)';
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawCrosshair() {
  const x = mouse.x;
  const y = mouse.y;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 10, y);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + 10);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(95,209,255,0.8)';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlayer() {
  const { x, y, radius, color, recoil } = game.player;
  const angle = Math.atan2(mouse.y - y, mouse.x - x);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = '#253d52';
  ctx.fillRect(-10, -18, 20, 36);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(radius + 10 - recoil * 24, 0);
  ctx.lineTo(-radius, -radius / 2);
  ctx.lineTo(-radius, radius / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d9f8ff';
  ctx.fillRect(-radius * 0.8, -2, radius * 0.8, 4);

  ctx.fillStyle = 'rgba(142, 240, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(radius + 10 - recoil * 24, 0, 4 + recoil * 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBullets() {
  for (const bullet of game.bullets) {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEnemies() {
  for (const enemy of game.enemies) {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(6, 10, 18, 0.45)';
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.2, enemy.y - enemy.radius * 0.2, enemy.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles() {
  for (const particle of game.particles) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function draw() {
  drawBackground();

  if (game.running) {
    drawBullets();
    drawEnemies();
    drawPlayer();
    drawParticles();
    drawCrosshair();
  } else {
    ctx.fillStyle = 'rgba(95, 209, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function loop(timestamp) {
  const dt = Math.min((timestamp - game.lastTime) / 1000 || 0.016, 0.033);
  game.lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === ' ') {
    event.preventDefault();
    keys[' '] = true;
  }
  keys[key] = true;

  if (key === '1') switchWeapon(0);
  if (key === '2') switchWeapon(1);
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === ' ') {
    keys[' '] = false;
  }
  keys[key] = false;
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  mouse.x = (event.clientX - rect.left) * scaleX;
  mouse.y = (event.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', () => {
  mouse.down = true;
  shootBullet();
});

window.addEventListener('mouseup', () => {
  mouse.down = false;
});

startButton.addEventListener('click', () => {
  startGame();
});

showIntro();
resetGame();
requestAnimationFrame(loop);
