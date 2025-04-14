const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

let sparklerActive = false;
let sparklerX = cw / 2;
let sparklerY = ch / 2;
let sparklerParticles = [];

document.getElementById('sparklerBtn').addEventListener('click', () => {
  sparklerActive = !sparklerActive;
});

canvas.addEventListener('mousemove', (e) => {
  sparklerX = e.clientX;
  sparklerY = e.clientY;
});

canvas.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  sparklerX = touch.clientX;
  sparklerY = touch.clientY;
});

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function drawStick(x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 60);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function emitSparkles(x, y) {
  const colors = ['#ffffff', '#ffe066', '#ffcc00'];

  for (let i = 0; i < 20; i++) {
    sparklerParticles.push(new Particle(
      x,
      y - 60,
      colors[Math.floor(Math.random() * colors.length)]
    ));
  }
}

function Particle(x, y, color) {
  this.x = x;
  this.y = y;
  this.speed = random(1, 10);
  this.angle = random(0, Math.PI * 2);
  this.gravity = 0.9;
  this.friction = 0.95;
  this.alpha = 1;
  this.decay = random(0.01, 0.03);
  this.color = color;
}

Particle.prototype.update = function(index) {
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;
  if (this.alpha <= 0) sparklerParticles.splice(index, 1);
};

Particle.prototype.draw = function() {
  ctx.shadowBlur = 8;
  ctx.shadowColor = this.color;
  ctx.globalAlpha = this.alpha;
  ctx.beginPath();
  ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
};

function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, cw, ch);

  if (sparklerActive) {
    drawStick(sparklerX, sparklerY);
    emitSparkles(sparklerX, sparklerY);
  }

  sparklerParticles.forEach((p, i) => {
    p.update(i);
    p.draw();
  });

  requestAnimationFrame(loop);
}

loop();

window.addEventListener('resize', () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
});
