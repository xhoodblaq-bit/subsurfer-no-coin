 const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreValue = document.getElementById('scoreValue');
const highscoreValue = document.getElementById('highscoreValue');
const distanceValue = document.getElementById('distanceValue');
const itemsValue = document.getElementById('itemsValue');
const multiplierDisplay = document.getElementById('multiplierDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');
const finalDistance = document.getElementById('finalDistance');

const leftBtn = document.getElementById('leftBtn');
const jumpBtn = document.getElementById('jumpBtn');
const rightBtn = document.getElementById('rightBtn');

let gameRunning = false;
let gameState = 'menu';
let score = 0;
let highscore = Number(localStorage.getItem('subwayHighscore') || 0);
let distance = 0;
let items = 0;
let multiplier = 1;
let lastTime = 0;
let frameCount = 0;
let gameSpeed = 7;
let maxSpeed = 18;
let speedIncrement = 0.0018;

const lanes = [canvas.width / 2 - 220, canvas.width / 2, canvas.width / 2 + 220];
let currentLane = 1;
let targetLane = 1;

const groundY = canvas.height - 85;
const player = {
  x: lanes[1],
  y: groundY - 78,
  width: 38,
  height: 78,
  jumping: false,
  falling: false,
  sliding: false,
  velocityY: 0,
  jumpPower: 14.5,
  gravity: 0.52,
  invulnerable: false,
  invulnerableTime: 0,
  lane: 1,
  runCycle: 0,
};

let obstacles = [];
let coins = [];
let powerUps = [];
let particles = [];
let obstacleTimer = 35;
let coinTimer = 18;
let powerTimer = 120;
let backgroundOffset = 0;

highscoreValue.textContent = highscore;

function addParticle(x, y, color, vx, vy) {
  particles.push({
    x,
    y,
    vx: vx ?? (Math.random() - 0.5) * 7,
    vy: vy ?? Math.random() * -5 - 1,
    life: 1,
    color,
    size: 3 + Math.random() * 4,
  });
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = (timestamp - lastTime) / 16.67;
  lastTime = timestamp;
  frameCount++;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGround();

  if (gameState === 'menu') {
    drawMenu();
  } else if (gameState === 'playing') {
    updateGame(deltaTime);
    drawCoins();
    drawPowerUps();
    drawObstacles();
    drawParticles();
    drawPlayer();
    updateHUD();
    checkCollisions();
  }

  requestAnimationFrame(gameLoop);
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#24528c');
  sky.addColorStop(0.55, '#16345d');
  sky.addColorStop(1, '#09111f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  backgroundOffset = (backgroundOffset + 0.8) % 240;

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 8; i++) {
    const x = (i * 220 + backgroundOffset) % (canvas.width + 220) - 110;
    const h = 70 + (i % 3) * 35;
    ctx.fillRect(x, canvas.height - 240 - h, 80, h);
    ctx.fillRect(x + 30, canvas.height - 220 - h, 20, h - 18);
  }

  ctx.fillStyle = '#0f1728';
  for (let i = 0; i < 5; i++) {
    const x = 80 + i * 220;
    ctx.fillRect(x, canvas.height - 210, 90, 130);
    ctx.fillRect(x + 16, canvas.height - 230, 58, 24);
  }

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 24]);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(lanes[i], 0);
    ctx.lineTo(lanes[i], canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = '#1b1f2b';
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  ctx.fillStyle = '#303a4e';
  ctx.fillRect(0, groundY + 8, canvas.width, 18);

  ctx.strokeStyle = '#f4c542';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 8);
  ctx.lineTo(canvas.width, groundY + 8);
  ctx.stroke();

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    const x = (i * 110 + backgroundOffset * 1.4) % (canvas.width + 110) - 55;
    ctx.beginPath();
    ctx.moveTo(x, groundY + 24);
    ctx.lineTo(x + 50, groundY + 24);
    ctx.stroke();
  }

  ctx.strokeStyle = '#ff7f2a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 30);
  ctx.lineTo(canvas.width, groundY + 30);
  ctx.stroke();
}

function drawMenu() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffcf33';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ffcf33';
  ctx.shadowBlur = 18;
  ctx.fillText('SUBWAY SURFER', canvas.width / 2, canvas.height / 2 - 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.shadowBlur = 0;
  ctx.fillText('Schneller Runner mit echten Spuren', canvas.width / 2, canvas.height / 2 - 24);

  ctx.fillStyle = '#33ffcc';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('Tap oder SPACE zum Starten', canvas.width / 2, canvas.height / 2 + 50);

  ctx.fillStyle = '#ffab2d';
  ctx.font = '16px Arial';
  ctx.fillText('← Spur wechseln • ↑ springen • ↓ rutschen • Sammle Münzen →', canvas.width / 2, canvas.height / 2 + 110);

  ctx.fillStyle = '#8ecbff';
  ctx.font = '16px Arial';
  ctx.fillText(`Best Score: ${Math.floor(highscore)}`, canvas.width / 2, canvas.height - 50);
}

function drawParticles() {
  particles = particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.16;
    particle.life -= 0.018;

    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return particle.life > 0;
  });
}

function drawPlayer() {
  ctx.save();

  if (player.invulnerable && Math.floor(frameCount / 5) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  const glow = player.sliding ? '#ff7f2a' : '#33ffcc';
  ctx.shadowColor = glow;
  ctx.shadowBlur = 22;

  const bodyY = player.sliding ? player.y + 20 : player.y;
  const bodyH = player.sliding ? 40 : 64;

  if (player.sliding) {
    ctx.fillStyle = '#1f2b40';
    ctx.fillRect(player.x - 24, bodyY, 48, bodyH);

    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(player.x - 18, bodyY + 6, 36, 18);

    ctx.fillStyle = '#f4c48b';
    ctx.beginPath();
    ctx.arc(player.x + 8, bodyY + 4, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 10, bodyY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const legSwing = Math.sin(frameCount * 0.35) * 6;

    ctx.fillStyle = '#1f2b40';
    ctx.fillRect(player.x - 14, bodyY + 6, 28, 28);

    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(player.x - 16, bodyY, 32, bodyH - 10);

    ctx.fillStyle = '#f4c48b';
    ctx.beginPath();
    ctx.arc(player.x, bodyY - 8, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x - 4, bodyY - 10, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 4, bodyY - 10, 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(player.x - 8, bodyY + 18);
    ctx.lineTo(player.x - 12 + legSwing, bodyY + 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(player.x + 8, bodyY + 18);
    ctx.lineTo(player.x + 12 - legSwing, bodyY + 34);
    ctx.stroke();

    ctx.strokeStyle = '#1f2b40';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(player.x - 10, bodyY + 4);
    ctx.lineTo(player.x - 16, bodyY + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(player.x + 10, bodyY + 4);
    ctx.lineTo(player.x + 16, bodyY + 14);
    ctx.stroke();
  }

  ctx.restore();
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.save();

    if (obstacle.type === 'barrier') {
      ctx.fillStyle = obstacle.color;
      ctx.shadowColor = obstacle.color;
      ctx.shadowBlur = 14;
      ctx.fillRect(obstacle.x - obstacle.width / 2, obstacle.y, obstacle.width, obstacle.height);
      ctx.fillStyle = '#ffde59';
      ctx.fillRect(obstacle.x - obstacle.width / 2 + 6, obstacle.y + 8, obstacle.width - 12, 8);
    } else if (obstacle.type === 'train') {
      ctx.fillStyle = obstacle.color;
      ctx.shadowColor = obstacle.color;
      ctx.shadowBlur = 16;
      ctx.fillRect(obstacle.x - obstacle.width / 2, obstacle.y, obstacle.width, obstacle.height);
      ctx.fillStyle = '#4c84ff';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(obstacle.x - obstacle.width / 2 + 10 + i * 18, obstacle.y + 10, 12, 14);
      }
      ctx.strokeStyle = '#ffee66';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(obstacle.x - obstacle.width / 2, obstacle.y + 6);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + 6);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (obstacle.type === 'truck') {
      ctx.fillStyle = obstacle.color;
      ctx.shadowColor = obstacle.color;
      ctx.shadowBlur = 16;
      ctx.fillRect(obstacle.x - obstacle.width / 2, obstacle.y, obstacle.width, obstacle.height);
      ctx.fillStyle = '#4c84ff';
      ctx.fillRect(obstacle.x - obstacle.width / 2 + 8, obstacle.y + 8, obstacle.width - 16, obstacle.height / 2 - 8);
      ctx.fillStyle = '#ffde59';
      ctx.fillRect(obstacle.x - obstacle.width / 2 + 10, obstacle.y + obstacle.height - 5, obstacle.width - 20, 5);
    }

    ctx.restore();
  });
}

function drawCoins() {
  coins.forEach((coin) => {
    ctx.save();
    ctx.fillStyle = '#ffd84d';
    ctx.shadowColor = '#ffd84d';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', coin.x, coin.y);
    ctx.restore();
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate((frameCount / 12) % (Math.PI * 2));

    if (powerUp.type === 'shield') {
      ctx.fillStyle = '#18d8ff';
      ctx.shadowColor = '#18d8ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b5d82';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, 0);
    } else {
      ctx.fillStyle = '#ff7f2a';
      ctx.shadowColor = '#ff7f2a';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * powerUp.radius;
        const y = Math.sin(angle) * powerUp.radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('X', 0, 2);
    }

    ctx.restore();
  });
}

function updateGame(deltaTime) {
  gameSpeed = Math.min(gameSpeed + speedIncrement * deltaTime, maxSpeed);
  player.lane = targetLane;

  if (player.invulnerable) {
    player.invulnerableTime -= deltaTime;
    if (player.invulnerableTime <= 0) {
      player.invulnerable = false;
    }
  }

  if (player.jumping || player.falling) {
    player.velocityY += player.gravity * deltaTime;
    player.y += player.velocityY * deltaTime;
    if (player.y >= groundY - player.height) {
      player.y = groundY - player.height;
      player.jumping = false;
      player.falling = false;
      player.velocityY = 0;
    }
  } else if (player.sliding) {
    player.y = groundY - player.height + 20;
  } else {
    player.y = groundY - player.height;
  }

  const targetX = lanes[targetLane];
  player.x += (targetX - player.x) * 0.18 * deltaTime;

  obstacleTimer -= deltaTime;
  if (obstacleTimer <= 0) {
    spawnObstacle();
    obstacleTimer = Math.max(18, 48 - gameSpeed * 1.3);
  }

  coinTimer -= deltaTime;
  if (coinTimer <= 0) {
    spawnCoin();
    coinTimer = Math.max(13, 26 - gameSpeed * 0.5);
  }

  powerTimer -= deltaTime;
  if (powerTimer <= 0) {
    spawnPowerUp();
    powerTimer = Math.max(80, 140 - gameSpeed * 2.2);
  }

  obstacles = obstacles.filter((obstacle) => {
    obstacle.x -= (gameSpeed + 3) * deltaTime;
    return obstacle.x + obstacle.width > -80;
  });

  coins = coins.filter((coin) => {
    coin.x -= (gameSpeed + 1.8) * deltaTime;
    return coin.x + coin.radius > -30;
  });

  powerUps = powerUps.filter((powerUp) => {
    powerUp.x -= (gameSpeed + 2) * deltaTime;
    return powerUp.x + powerUp.radius > -30;
  });

  score += 1 + Math.floor(multiplier * 0.3);
  distance += gameSpeed * 0.22;
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * lanes.length);
  const roll = Math.random();
  let type = 'barrier';
  let width = 34;
  let height = 58;
  let color = '#ff4d4d';

  if (roll < 0.4) {
    type = 'barrier';
    width = 34;
    height = 58;
    color = '#ff4d4d';
  } else if (roll < 0.75) {
    type = 'train';
    width = 88;
    height = 62;
    color = '#d54b4b';
  } else {
    type = 'truck';
    width = 72;
    height = 54;
    color = '#ff8b3d';
  }

  obstacles.push({
    x: canvas.width + width + 20,
    y: groundY - height,
    width,
    height,
    lane,
    color,
    type,
  });
}

function spawnCoin() {
  const lane = Math.floor(Math.random() * lanes.length);
  coins.push({
    x: canvas.width + 20,
    y: groundY - 110 - Math.random() * 70,
    radius: 12,
    lane,
  });
}

function spawnPowerUp() {
  const lane = Math.floor(Math.random() * lanes.length);
  const type = Math.random() < 0.5 ? 'shield' : 'boost';
  powerUps.push({
    x: canvas.width + 20,
    y: groundY - 120 - Math.random() * 70,
    radius: 15,
    lane,
    type,
  });
}

function checkCollisions() {
  obstacles.forEach((obstacle) => {
    if (obstacle.lane !== targetLane) return;

    const playerCollider = {
      x: player.x - 12,
      y: player.y + 10,
      width: 24,
      height: player.sliding ? 30 : 60,
    };

    const obstacleCollider = {
      x: obstacle.x - obstacle.width / 2,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };

    const lowBarrier = obstacle.type === 'barrier' && obstacle.height <= 58 && player.sliding;
    const intersects = !lowBarrier && playerCollider.x < obstacleCollider.x + obstacleCollider.width && playerCollider.x + playerCollider.width > obstacleCollider.x && playerCollider.y < obstacleCollider.y + obstacleCollider.height && playerCollider.y + playerCollider.height > obstacleCollider.y;

    if (intersects) {
      if (player.invulnerable) {
        for (let i = 0; i < 10; i++) addParticle(player.x, player.y, '#ffd84d');
        obstacle.x = -1000;
      } else {
        endGame();
      }
    }
  });

  coins.forEach((coin, index) => {
    if (coin.lane !== targetLane) return;
    const hit = Math.abs(player.x - coin.x) < 24 && Math.abs(player.y - coin.y) < 24;
    if (hit) {
      score += 45 + Math.floor(multiplier * 8);
      items++;
      multiplier = 1 + items * 0.14;
      for (let i = 0; i < 8; i++) addParticle(coin.x, coin.y, '#ffd84d');
      coins.splice(index, 1);
    }
  });

  powerUps.forEach((powerUp, index) => {
    if (powerUp.lane !== targetLane) return;
    const hit = Math.abs(player.x - powerUp.x) < 24 && Math.abs(player.y - powerUp.y) < 24;
    if (hit) {
      for (let i = 0; i < 12; i++) addParticle(powerUp.x, powerUp.y, powerUp.type === 'shield' ? '#18d8ff' : '#ff7f2a');
      if (powerUp.type === 'shield') {
        player.invulnerable = true;
        player.invulnerableTime = 220;
        score += 180;
      } else {
        gameSpeed = Math.min(gameSpeed + 3.5, maxSpeed);
        score += 220;
      }
      powerUps.splice(index, 1);
    }
  });
}

function updateHUD() {
  scoreValue.textContent = Math.floor(score);
  distanceValue.textContent = Math.floor(distance);
  itemsValue.textContent = items;
  multiplierDisplay.textContent = multiplier > 1 ? `x${multiplier.toFixed(1)}` : '';
}

function startGame() {
  gameState = 'playing';
  gameRunning = true;
  gameOverScreen.classList.remove('active');
  lastTime = 0;
  score = 0;
  distance = 0;
  items = 0;
  multiplier = 1;
  gameSpeed = 7;
  targetLane = 1;
  currentLane = 1;
  player.x = lanes[1];
  player.y = groundY - player.height;
  player.sliding = false;
  player.invulnerable = false;
  obstacles = [];
  coins = [];
  powerUps = [];
  particles = [];
  obstacleTimer = 35;
  coinTimer = 18;
  powerTimer = 120;
}

function endGame() {
  gameState = 'menu';
  gameRunning = false;
  finalScore.textContent = Math.floor(score);
  finalDistance.textContent = Math.floor(distance);

  if (score > highscore) {
    highscore = score;
    localStorage.setItem('subwayHighscore', highscore);
    highscoreValue.textContent = highscore;
  }

  gameOverScreen.classList.add('active');
}

const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;

  if (!gameRunning && (e.key === ' ' || e.key === 'Enter')) {
    e.preventDefault();
    startGame();
  }

  if (gameRunning) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      targetLane = Math.max(0, targetLane - 1);
      currentLane = targetLane;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      targetLane = Math.min(2, targetLane + 1);
      currentLane = targetLane;
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      e.preventDefault();
      if (!player.jumping && !player.falling && !player.sliding) {
        player.jumping = true;
        player.falling = true;
        player.velocityY = -player.jumpPower;
      }
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      if (!player.jumping && !player.falling && !player.sliding) {
        player.sliding = true;
        setTimeout(() => {
          player.sliding = false;
        }, 380);
      }
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

leftBtn.addEventListener('click', () => {
  if (gameRunning) {
    targetLane = Math.max(0, targetLane - 1);
    currentLane = targetLane;
  }
});

rightBtn.addEventListener('click', () => {
  if (gameRunning) {
    targetLane = Math.min(2, targetLane + 1);
    currentLane = targetLane;
  }
});

jumpBtn.addEventListener('click', () => {
  if (gameRunning && !player.jumping && !player.falling && !player.sliding) {
    player.jumping = true;
    player.falling = true;
    player.velocityY = -player.jumpPower;
  }
});

let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  if (!gameRunning) startGame();
});

canvas.addEventListener('touchmove', (e) => {
  if (!gameRunning) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const deltaY = touch.clientY - touchStartY;

  if (x < canvas.width / 3) {
    targetLane = Math.max(0, targetLane - 1);
    currentLane = targetLane;
  } else if (x > (canvas.width / 3) * 2) {
    targetLane = Math.min(2, targetLane + 1);
    currentLane = targetLane;
  }

  if (deltaY > 45 && !player.jumping && !player.falling && !player.sliding) {
    player.sliding = true;
    setTimeout(() => {
      player.sliding = false;
    }, 380);
  }

  if (deltaY < -45 && !player.jumping && !player.falling && !player.sliding) {
    player.jumping = true;
    player.falling = true;
    player.velocityY = -player.jumpPower;
  }
});

restartButton.addEventListener('click', startGame);
requestAnimationFrame(gameLoop);
