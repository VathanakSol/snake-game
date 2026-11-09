const GRID = 20;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

let snake, dir, nextDir, food, score, best, speed, loopId, running;

best = Number(localStorage.getItem("snake-best") || 0);
bestEl.textContent = best;

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  speed = 140;
  scoreEl.textContent = score;
  placeFood();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
}

function tick() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
  const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return gameOver();

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
    if (speed > 60) speed -= 3;
    clearInterval(loopId);
    loopId = setInterval(tick, speed);
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  const cell = canvas.width / GRID;

  ctx.fillStyle = "#0d1330";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, canvas.height);
    ctx.moveTo(0, i * cell);
    ctx.lineTo(canvas.width, i * cell);
    ctx.stroke();
  }

  ctx.fillStyle = "#f87171";
  ctx.beginPath();
  ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * 0.38, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach((seg, i) => {
    const t = i / snake.length;
    ctx.fillStyle = i === 0 ? "#4ade80" : `rgba(74, 222, 128, ${1 - t * 0.6})`;
    const pad = i === 0 ? 1 : 2;
    ctx.beginPath();
    ctx.roundRect(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2, 5);
    ctx.fill();
  });
}

function gameOver() {
  clearInterval(loopId);
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("snake-best", best);
    bestEl.textContent = best;
  }
  overlayTitle.textContent = "Game Over";
  overlayMsg.textContent = `You scored ${score} points`;
  startBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function start() {
  reset();
  draw();
  overlay.classList.add("hidden");
  clearInterval(loopId);
  loopId = setInterval(tick, speed);
  running = true;
}

function setDir(x, y) {
  if (!running) return;
  if (dir.x === -x && dir.y === -y) return;
  nextDir = { x, y };
}

document.addEventListener("keydown", (e) => {
  const keys = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  };
  const k = keys[e.key] || keys[e.key.toLowerCase()];
  if (k) {
    e.preventDefault();
    setDir(k[0], k[1]);
  } else if (e.key === " " && !running) {
    e.preventDefault();
    start();
  }
});

document.querySelectorAll(".dir-btn").forEach((btn) => {
  const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const d = dirs[btn.dataset.dir];
  btn.addEventListener("touchstart", (e) => { e.preventDefault(); setDir(d[0], d[1]); }, { passive: false });
  btn.addEventListener("click", () => setDir(d[0], d[1]));
});

startBtn.addEventListener("click", start);

reset();
draw();
