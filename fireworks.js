const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');

let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

let sparks = [];
let spinning = false;
let centerX = cw / 2;
let centerY = ch / 2;
let rotationAngle = 0;

let spinVelocity = 0;
let maxSpinVelocity = 0.3;
let accelerating = false;
let decelerating = false;

const img = new Image();
img.src = '/assets/circle.png'

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Spark {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const speed = random(3, 10);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = random(0.01, 0.02);
    this.color = `hsl(${Math.floor(random(30, 60))}, 100%, 50%)`;
  }

  update(index) {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    if (this.alpha <= 0) sparks.splice(index, 1);
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 1, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function emitSparks(x, y) {
  const radius = 15;
  const sparkCountPerFrame = 10;

  for (let i = 0; i < sparkCountPerFrame; i++) {
    const offset = (Math.PI * 2 / sparkCountPerFrame) * i;
    const angle = rotationAngle + offset;
    const sx = x + Math.cos(angle) * radius;
    const sy = y + Math.sin(angle) * radius;
    sparks.push(new Spark(sx, sy, angle));
  }
}

spinBtn.addEventListener('click', () => {
  if (!spinning) {
    spinning = true;
    spinVelocity = 0;
    accelerating = true;
    decelerating = false;
    spinBtn.innerText = "🛑 Stop";

    setTimeout(() => {
      accelerating = false;
      decelerating = true;
      spinBtn.innerText = "✨ Spin";
    }, 5000);

  } else {
    accelerating = false;
    decelerating = true;
    spinBtn.innerText = "✨ Spin";
  }
});

function moveCenter() {
  const movementSpeed = 1;
  
  centerX += random(-movementSpeed, movementSpeed);
  centerY += random(-movementSpeed, movementSpeed);
}

img.onload = () => {
  function loop() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, cw, ch);

    if (spinning) {
      if (accelerating && spinVelocity < maxSpinVelocity) {
        spinVelocity += 0.005;
      } else if (decelerating) {
        spinVelocity -= 0.005;
        if (spinVelocity <= 0) {
          spinVelocity = 0;
          spinning = false;
          decelerating = false;
        }
      }

      rotationAngle += spinVelocity;

      emitSparks(centerX, centerY);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      const imgWidth = 30;
      const imgHeight = 30;

      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      ctx.restore();
    }

    sparks.forEach((s, i) => {
      s.update(i);
      s.draw();
    });

    moveCenter();

    requestAnimationFrame(loop);
  }

  loop();
};

window.addEventListener('resize', () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
  centerX = cw / 2;
  centerY = ch / 2;
});

loop();
