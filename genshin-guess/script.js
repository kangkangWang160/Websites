window.onload = function() {
  // Black screen logic
  const blackScreen = document.getElementById('blackScreen');
  const continuePromptScreen = document.getElementById('continuePromptScreen');
  const flappyGameScreen = document.getElementById('flappyGameScreen');

  // JS bouncing for image
  const img = document.querySelector('.bouncing-img');
  const debugMsg = document.getElementById('debug-message');
  if (debugMsg) debugMsg.textContent = 'Script running: looking for image...';
  if (img) {
    let x = Math.random() * (window.innerWidth - 140);
    let y = Math.random() * (window.innerHeight - 180);
    let dx = 3 + Math.random() * 2;
    let dy = 2 + Math.random() * 2;
    let angle = 0;
    function bounce() {
      x += dx;
      y += dy;
      angle += 5; // keep increasing angle, never reset
      if (x <= 0 || x >= window.innerWidth - 120) dx *= -1;
      if (y <= 0 || y >= window.innerHeight - 120) dy *= -1;
      img.style.left = x + 'px';
      img.style.top = y + 'px';
      img.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(bounce);
    }
    img.style.left = x + 'px';
    img.style.top = y + 'px';
    img.style.display = 'block';
    img.style.pointerEvents = 'none';
    img.style.transition = 'transform 0.1s linear';
    bounce();
  } else {
    if (debugMsg) debugMsg.textContent = 'Image NOT found!';
  }

  // Remove auto-advance, only advance on button click
  nextBtn.onclick = () => {
    blackScreen.style.display = 'none';
    towerScreen.style.display = 'flex';
  };
  toGameBtn.onclick = () => {
    // Hide tower screen and show the next screen (continue prompt)
    towerScreen.style.display = 'none';
    continuePromptScreen.style.display = 'flex';
  };
  levelBtn.onclick = () => {
    blackScreen.style.display = 'none';
    continuePromptScreen.style.display = 'flex';
  };
  closeLevelBtn.onclick = () => {
    levelScreen.style.display = 'none';
  };

  // Get prompt and game elements
  const continueYesBtn = document.getElementById('continueYesBtn');
  const continueNoBtn = document.getElementById('continueNoBtn');

  continueYesBtn.onclick = () => {
    continuePromptScreen.style.display = 'none';
    flappyGameScreen.style.display = 'flex';
    startFlappyBird();
  };
  continueNoBtn.onclick = () => {
    continuePromptScreen.style.display = 'none';
    blackScreen.style.display = 'flex';
  };

  // Ensure only blackScreen is visible on load
  blackScreen.style.display = 'flex';
  towerScreen.style.display = 'none';
  gameUI.style.display = 'none';
  continuePromptScreen.style.display = 'none';
  flappyGameScreen.style.display = 'none';

  // Animate maxresdefault image after tower-escape-text animation
  const escapeZoomImg = document.getElementById('escapeZoomImg');
  const towerEscapeText = document.querySelector('.tower-escape-text');
  if (towerEscapeText && escapeZoomImg) {
    towerEscapeText.addEventListener('animationend', () => {
      escapeZoomImg.style.display = 'block';
      setTimeout(() => {
        escapeZoomImg.style.transform = 'translate(-50%,-50%) scale(2.5)';
      }, 10); // allow display:block to apply before scaling
    });
  }
};

function setHealth(percent) {
  const bar = document.getElementById('healthBar');
  const healthText = document.getElementById('healthText');
  bar.style.width = percent + '%';
  healthText.textContent = Math.round(percent) + ' / 100';
}

// Flappy Bird Game Implementation
function startFlappyBird() {
  const flappyGameScreen = document.getElementById('flappyGameScreen');
  flappyGameScreen.innerHTML = '<canvas id="flappyCanvas" width="400" height="600" style="background:#70c5ce;display:block;margin:auto;border-radius:16px;"></canvas>';
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');

  // Game variables
  let frames = 0;
  const gravity = 0.25;
  const jump = 4.6;
  let score = 0;
  let best = 0;
  let pipes = [];
  let gameState = 0; // 0: get ready, 1: game, 2: over

  // Bird
  const bird = {
    x: 60,
    y: 150,
    w: 34,
    h: 24,
    radius: 12,
    velocity: 0,
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.min(Math.PI/2, this.velocity/10));
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    },
    flap() {
      this.velocity = -jump;
    },
    update() {
      if (gameState === 1) {
        this.velocity += gravity;
        this.y += this.velocity;
        if (this.y + this.radius >= canvas.height) {
          this.y = canvas.height - this.radius;
          gameState = 2;
        }
      } else if (gameState === 0) {
        this.y = 150;
        this.velocity = 0;
      }
    }
  };

  // Pipes
  function resetPipes() {
    pipes = [];
    pipes.push({ x: canvas.width, y: -Math.floor(Math.random()*200)-50 });
  }

  function drawPipes() {
    ctx.fillStyle = '#0f0';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, pipe.y, 52, 320);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.y + 320 + 120, 52, canvas.height);
    });
  }

  function updatePipes() {
    if (frames % 100 === 0) {
      pipes.push({ x: canvas.width, y: -Math.floor(Math.random()*200)-50 });
    }
    pipes.forEach(pipe => {
      pipe.x -= 2;
    });
    // Remove off-screen pipes
    if (pipes.length && pipes[0].x < -52) pipes.shift();
  }

  function checkCollision() {
    pipes.forEach(pipe => {
      // Bird hit top pipe
      if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + 52) {
        if (bird.y - bird.radius < pipe.y + 320 || bird.y + bird.radius > pipe.y + 320 + 120) {
          gameState = 2;
        }
      }
    });
  }

  function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.fillText(score, canvas.width/2-10, 50);
  }

  function resetGame() {
    score = 0;
    bird.y = 150;
    bird.velocity = 0;
    resetPipes();
    gameState = 0;
  }

  canvas.onclick = function() {
    if (gameState === 0) {
      gameState = 1;
    } else if (gameState === 1) {
      bird.flap();
    } else if (gameState === 2) {
      resetGame();
    }
  };

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw pipes
    drawPipes();
    // Draw bird
    bird.draw();
    // Draw score
    drawScore();
    // Update
    if (gameState === 1) {
      bird.update();
      updatePipes();
      checkCollision();
      // Score
      pipes.forEach(pipe => {
        if (!pipe.passed && bird.x > pipe.x + 52) {
          score++;
          pipe.passed = true;
        }
      });
    } else if (gameState === 2) {
      ctx.fillStyle = '#fff';
      ctx.font = '28px Arial';
      ctx.fillText('Game Over! Click to restart.', 40, canvas.height/2);
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText('Click to start', 120, canvas.height/2);
    }
    frames++;
    requestAnimationFrame(loop);
  }
  resetGame();
  loop();
}
