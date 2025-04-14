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

const fireworkSound = new Audio('assets/firework-sound.mp3');
fireworkSound.volume = 0.8;

button.addEventListener('click', () => {
  if (!isFiring) {
    launch();
    isFiring = true;
    button.disabled = true;
    button.innerText = "🎆 Firing...";
    fireworkSound.play();

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
    }, 3000);
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

  const duration = 3000;
  this.speed = this.distance / (duration / 1000);

  this.angle = Math.atan2(ty - y, tx - x);
  this.brightness = random(50, 70);
  this.alpha = 1;
  this.trail = [];
  this.lastPos = 8;
  this.startTime = Date.now();

  this.motionType = Math.floor(random(0, 3)); // 0 = straight, 1 = arc, 2 = wiggle
  this.elapsed = 0;
}

Firework.prototype.update = function(index) {
  const maxAnimTime = 3000;
  if (Date.now() - this.startTime > maxAnimTime) {
    this.trail = [];
  }

  this.trail.push([this.x, this.y]);
  if (this.trail.length > this.lastPos) this.trail.shift();

  const wobble = Math.sin(this.y * 0.2) * random(-0.5, 0.5);

  const delta = 1 / 60;

  this.elapsed += delta;

  let vx = 0;
  let vy = 0;

  switch (this.motionType) {
    case 0: // straight
      vx = Math.cos(this.angle) * this.speed * delta;
      vy = Math.sin(this.angle) * this.speed * delta;
      break;

    case 1: // arc
      vx = Math.cos(this.angle + Math.sin(this.elapsed * 2) * 0.3) * this.speed * delta;
      vy = Math.sin(this.angle + Math.sin(this.elapsed * 2) * 0.3) * this.speed * delta;
      break;

    case 2: // spiral
      vx = Math.cos(this.angle) * this.speed * delta + Math.sin(this.elapsed * 10) * 0.5;
      vy = Math.sin(this.angle) * this.speed * delta + Math.cos(this.elapsed * 10) * 0.5;
      break;
  }

  this.x += vx;
  this.y += vy;


  if (Math.hypot(this.tx - this.x, this.ty - this.y) < 15) {
    fireworks.splice(index, 1);
    return true;
  }
  return false;
};

Firework.prototype.draw = function() {
  if (this.trail.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(this.trail[0][0], this.trail[0][1]);
  for (let i = 1; i < this.trail.length; i++) {
    ctx.lineTo(this.trail[i][0], this.trail[i][1]);
  }

  const fireworkColors = ['yellow', 'orange', 'white'];
  const randomColor = fireworkColors[Math.floor(random(0, fireworkColors.length))];

  ctx.strokeStyle = randomColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
};

function Particle(x, y, color) {
  this.x = x;
  this.y = y;
  this.speed = random(5, 20);
  this.angle = random(0, Math.PI * 2);
  this.gravity = 2;
  this.friction = 0.95;
  this.alpha = 2;
  this.decay = random(0.02, 0.05);
  this.color = color;
}

// Particle.prototype.update = function(index) {
//   this.speed *= this.friction;
//   this.x += Math.cos(this.angle) * this.speed;
//   this.y += Math.sin(this.angle) * this.speed + this.gravity;
//   this.alpha -= this.decay;
//   if (this.alpha <= 0) particles.splice(index, 1);
// };

Particle.prototype.update = function(index) {
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed * 1.5;
  this.y += Math.sin(this.angle) * this.speed * 1.5 + this.gravity;
  this.alpha -= this.decay;
  if (this.alpha <= 0) particles.splice(index, 1);
};

Particle.prototype.draw = function() {
  ctx.globalAlpha = this.alpha;
  ctx.beginPath();
  ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2) // particle size
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.globalAlpha = 1;
};

function explode(x, y) {
  const numParticles = 350; // number of particles
  const fireworkColors = ['white', 'orange', 'yellow', 'red',];

  for (let i = 0; i < numParticles; i++) {
    const randomColor = fireworkColors[Math.floor(random(0, fireworkColors.length))];
    const particle = new Particle(x, y, randomColor);
    particle.speed = random(2, 10);
    particles.push(particle);
  }
}

function loop() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.shadowBlur = 10;
  ctx.shadowColor = this.color;

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
  const ty = ch * 0.25;
  fireworks.push(new Firework(x, y, tx, ty));
}

loop();

window.addEventListener('resize', () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
});
