// Retro stopper shooter — LEFT/RIGHT to move, SPACE to shoot.
// "TRY AGAIN": if chickens reach bottom, reset score + wave, until targetScore is reached.

function startChickenShooter({ targetScore = 5 } = {}) {
    return new Promise((resolve) => {
      // background music
      const music = new Audio("assets/sounds/game-theme.wav");
      music.loop = true;
      music.volume = 0.4; // adjust volume
      music.play().catch(() => {});

      const overlay = document.getElementById("gameOverlay");
      const canvas = document.getElementById("gameCanvas");
      const hud = document.getElementById("gameHud");
      const ctx = canvas.getContext("2d");
  
      overlay.classList.remove("hidden");
  
      let running = true;
      let score = 0;
  
      const W = canvas.width, H = canvas.height;
  
      // Player (Starbucks stopper)
      const player = { x: W / 2, y: H - 30, w: 10, h: 18, speed: 6 };
  
      // ===== CHICKENS (auto-fit to canvas) =====
      let cols = 10, rows = 4;
      const bodyW = 28, bodyH = 20;
      const margin = 40;
      const startYBase = 60;
      const gapY = 60;
  
      // dynamic state
      let chickens = [];
      let dir = 1;
      let stepDown = false;
      let chickenSpeed = 1.2;
      let edgeCooldown = 0;
      const bottomLimit = H - 60;
  
      // Bullets
      const bullets = [];
  
      // Input
      const keys = {};
      function keydown(e) { keys[e.key] = true; if (e.key === " ") e.preventDefault(); }
      function keyup(e)   { keys[e.key] = false; }
      window.addEventListener("keydown", keydown);
      window.addEventListener("keyup", keyup);
  
      function shoot() {
        bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 8, w: 4, h: 10, vy: -8 });
      }
      let shootCooldown = 0;
  
      function spawnFormation(speedBoost = 0) {
        const usable = Math.max(0, W - margin * 2 - bodyW);
        const gapX = Math.max(40, Math.floor(usable / Math.max(1, cols - 1)));
        const startX = margin;
  
        chickens = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * gapX;
            const y = startYBase + r * gapY;
            chickens.push({ x, y, w: bodyW, h: bodyH, alive: true });
          }
        }
        dir = 1;
        stepDown = false;
        chickenSpeed = 1.2 + speedBoost;
        edgeCooldown = 0;
        bullets.length = 0;
      }
  
      // initial wave
      let attempts = 0;
      let pauseUntil = 0;
      let flashAlpha = 0;
      spawnFormation(0);
  
      function update(now = performance.now()) {
        if (!running) return;
  
        // Pause state (TRY AGAIN)
        if (now < pauseUntil) {
          hud.textContent = `TRY AGAIN — chickens reached the ground! Starting over…`;
          flashAlpha = Math.max(0, flashAlpha - 0.05);
          draw(true);
          requestAnimationFrame(update);
          return;
        }
  
        // input
        if (keys["ArrowLeft"])  player.x -= player.speed;
        if (keys["ArrowRight"]) player.x += player.speed;
        player.x = Math.max(10, Math.min(W - 20, player.x));
  
        if (keys[" "] && shootCooldown <= 0) {
          shoot();
          shootCooldown = 10;
        }
        shootCooldown--;
  
        // move chickens
        let hitEdge = false;
        for (const ch of chickens) {
          if (!ch.alive) continue;
          ch.x += chickenSpeed * dir;
          if (ch.x < 20 || ch.x + ch.w > W - 20) hitEdge = true;
        }
  
        if (hitEdge && edgeCooldown <= 0) {
          dir *= -1;
          stepDown = true;
          edgeCooldown = 8;
        } else {
          edgeCooldown = Math.max(0, edgeCooldown - 1);
        }
  
        if (stepDown) {
          for (const ch of chickens) if (ch.alive) ch.y += 12;
          stepDown = false;
        }
  
        // bullets
        for (const b of bullets) b.y += b.vy;
  
        // collisions
        for (const b of bullets) {
          for (const ch of chickens) {
            if (!ch.alive) continue;
            if (b.x < ch.x + ch.w && b.x + b.w > ch.x && b.y < ch.y + ch.h && b.y + b.h > ch.y) {
              ch.alive = false;
              b.y = -9999;
              score++;
            }
          }
        }
  
        // cull bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          if (bullets[i].y < -20) bullets.splice(i, 1);
        }
  
        // bottom check
        let reachedBottom = false;
        for (const ch of chickens) {
          if (ch.alive && ch.y + ch.h >= bottomLimit) { reachedBottom = true; break; }
        }
        if (reachedBottom && score < targetScore) {
          attempts++;
          score = 0; // reset score on fail
          hud.textContent = `TRY AGAIN — chickens reached the ground! Score reset.`;
          flashAlpha = 0.6;
          pauseUntil = now + 1200;
          spawnFormation(Math.min(0.2 * attempts, 1.2));
          draw(true);
          requestAnimationFrame(update);
          return;
        }
  
        // HUD + win
        hud.textContent = `Chickens herded: ${score}/${targetScore} — LEFT/RIGHT to move, SPACE to flick stoppers`;
        if (score >= targetScore) {
          running = false;
          cleanup();
          resolve();
          return;
        }
  
        draw(false);
        requestAnimationFrame(update);
      }
  
      function draw(showFlash) {
        ctx.clearRect(0, 0, W, H);
  
        // grid
        ctx.strokeStyle = "rgba(0,255,160,.2)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  
        // player
        ctx.fillStyle = "#80ffea";
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillRect(player.x - 2, player.y + player.h, player.w + 4, 3);
  
        // chickens
        for (const ch of chickens) {
          if (!ch.alive) continue;
          ctx.fillStyle = "#ffd166";
          ctx.fillRect(ch.x, ch.y, ch.w, ch.h);
          ctx.fillStyle = "#ff6b6b";
          ctx.fillRect(ch.x + ch.w - 5, ch.y + 8, 5, 4);
        }
  
        // bullets
        ctx.fillStyle = "#7df9ff";
        for (const b of bullets) ctx.fillRect(b.x, b.y, b.w, b.h);
  
        // flash
        if (showFlash && flashAlpha > 0) {
          ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha})`;
          ctx.fillRect(0, 0, W, H);
        }
      }
  
      function cleanup() {
        overlay.classList.add("hidden");
        window.removeEventListener("keydown", keydown);
        window.removeEventListener("keyup", keyup);

        // stop music when game ends
        music.pause();
        music.currentTime = 0;
      }

      // Start game
      draw(false);
      requestAnimationFrame(update);
    });
  }