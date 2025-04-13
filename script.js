const canvas = document.getElementById('canvas');
const button = document.getElementById('fireBtn');
const ctx = canvas.getContext('2d');
let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

let fireworks = [];
let particles = [];
let isFiring = false;
let isMobile = window.innerWidth <= 768;

const fireworkSound = new Audio('assets/firework-sound.mp3');
fireworkSound.volume = 0.8;

button.addEventListener('click', () => {
  if (!isFiring) {
    launch();
    isFiring = true;
    button.disabled = true;
    button.innerText = "🎆 Firing...";

    fireworkSound.play();

    const animationTime = isMobile ? 1000 : 3000;
    
    setTimeout(() => {
      if (fireworks.length > 0) {
        const finalFirework = fireworks[0];
        explode(finalFirework.x, finalFirework.y);
        fireworkSound.play();
        fireworks = [];
      }

      isFiring = false;
      button.disabled = false;
      button.innerText = "🔥 Fire";
    }, animationTime);
  }
});

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function Firework(x, y, tx, ty) {
  this.x = x;
  this.y = y;
  this.tx = tx;
  this.ty = ty;
  this.distance = Math.hypot(tx - x, ty - y);
  this.speed = isMobile ? 14 : 3;
  this.angle = Math.atan2(ty - y, tx - x);
  this.brightness = random(50, 70);
  this.alpha = 1;
  this.trail = [];
  this.lastPos = isMobile ? 8 : 5;
  this.startTime = Date.now();
}

Firework.prototype.update = function(index) {
  const maxAnimTime = isMobile ? 1500 : 3000;
  const timeElapsed = Date.now() - this.startTime;
  if (timeElapsed > maxAnimTime) {
    this.trail = [];
  }

  this.trail.push([this.x, this.y]);
  if (this.trail.length > this.lastPos) this.trail.shift();

  const wobble = Math.sin(this.y * 0.2) * random(isMobile ? -0.5 : -1.5, isMobile ? 0.5 : 1.5);
  const vx = Math.cos(this.angle) * this.speed + wobble;
  const vy = Math.sin(this.angle) * this.speed;

  this.x += vx;
  this.y += vy;

  const proximityThreshold = isMobile ? 15 : 10;
  if (Math.hypot(this.tx - this.x, this.ty - this.y) < proximityThreshold) {
    fireworks.splice(index, 1);
    return true;
  }
  return false;
};

Firework.prototype.draw = function() {
  ctx.beginPath();
  ctx.moveTo(this.trail[0][0], this.trail[0][1]);
  for (let i = 1; i < this.trail.length; i++) {
    ctx.lineTo(this.trail[i][0], this.trail[i][1]);
  }

  const fireworkColors = [
    'yellow', 
    'orange', 
    'white'
  ];

  const randomColor = fireworkColors[Math.floor(random(0, fireworkColors.length))];

  ctx.strokeStyle = randomColor;
  ctx.lineWidth = isMobile ? 3 : 2;
  ctx.stroke();
  ctx.lineWidth = 1;
};

function Particle(x, y, color) {
  this.x = x;
  this.y = y;
  this.speed = random(1, isMobile ? 12 : 10);
  this.angle = random(0, Math.PI * 2);
  this.gravity = 0.05;
  this.friction = 0.95;
  this.alpha = 1;
  this.decay = random(isMobile ? 0.02 : 0.01, isMobile ? 0.05 : 0.03);
  this.color = color;
}

Particle.prototype.update = function(index) {
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;
  if (this.alpha <= 0) particles.splice(index, 1);
};

Particle.prototype.draw = function() {
  ctx.globalAlpha = this.alpha;
  ctx.beginPath();
  // Slightly larger particles on mobile
  const particleSize = isMobile ? 3 : 2;
  ctx.arc(this.x, this.y, particleSize, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.globalAlpha = 1;
};

function explode(x, y) {
  const numParticles = isMobile ? 70 : 100;
  const fireworkColors = [
    'white', 
    'orange', 
    'yellow'
  ];

  for (let i = 0; i < numParticles; i++) {
    const randomColor = fireworkColors[Math.floor(random(0, fireworkColors.length))];
    particles.push(new Particle(x, y, randomColor));
  }
}

function loop() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, cw, ch);

  fireworks.forEach((f, i) => {
    const reachedTarget = f.update(i);
    f.draw();
    if (reachedTarget) {
      explode(f.x, f.y);
    }
  });

  particles.forEach((p, i) => {
    p.update(i);
    p.draw();
  });

  requestAnimationFrame(loop);
}

function launch() {
  const x = cw / 2;
  const y = ch - 50;
  const tx = random(cw * 0.2, cw * 0.8);
  
  const ty = isMobile ? ch * 0.25 : ch * 0.25;
  
  fireworks.push(new Firework(x, y, tx, ty));
}

loop();

window.addEventListener('resize', () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
  isMobile = window.innerWidth <= 768;
});