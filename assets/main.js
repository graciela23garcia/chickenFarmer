/* =====================
   CONFIG — personalize!
   ===================== */

   const STAR_NAME = "Starbucks Prince"; // used throughout until the finale

   const RIDDLES = [
     {
       q: `RIDDLE for the ${STAR_NAME}:\n  A tiny green soldier, guarding against leaks,\n  but in our hands it became a weapon of sneaks.\n  What am I?`,
       a: "starbucks stopper",
       hint: "Green, tiny, sometimes airborne…"
     },
     {
       q: `RIDDLE for the ${STAR_NAME}:\n  Bricks and sheep, roads and wheat,\n  our empire grows with every beat.\n  What game am I?`,
       a: "catan",
       hint: "Roll, trade, build."
     },
     {
       q: `RIDDLE for the ${STAR_NAME}:\n  A place of pencils, playgrounds, and halls,\n  where fate had us cross paths within its walls.\n  What school am I?`,
       a: "captain gray elementary",
       hint: "Where we met."
     },
     {
       q: `RIDDLE for the ${STAR_NAME}:\n  Born in the '90s, boxy and bold,\n  a fixer-upper project, with stories untold.\n  What car am I?`,
       a: "chevy blazer",
       hint: "90's & boxy."
     }
   ];
   
   // photos for finale — put files in /photos or use absolute URLs
   const PHOTOS = [
    "photos/IMG_1339-2.jpeg",
    "photos/IMG_1339.jpeg",
    "photos/IMG_1940.jpeg",
    "photos/IMG_2014.jpeg",
    "photos/IMG_2523.jpeg",
    "photos/IMG_2733.jpeg",
    "photos/IMG_3300.jpeg",
    "photos/IMG_4029.jpeg",
    "photos/IMG_4161.jpeg",
    "photos/IMG_4167-2.jpeg",
    "photos/IMG_4167.jpeg",
    "photos/IMG_4302.jpeg",
    "photos/IMG_4516.jpeg",
    "photos/IMG_4607.jpeg",
    "photos/IMG_4610.jpeg",
    "photos/IMG_4620.jpeg",
    "photos/IMG_4628.jpeg",
    "photos/IMG_4685-2.jpeg",
    "photos/IMG_4685.jpeg",
    "photos/IMG_4689.jpeg",
    "photos/IMG_4750.jpeg",
    "photos/IMG_4817.jpeg",
    "photos/IMG_4831.jpeg",
    "photos/IMG_4839.jpeg",
    "photos/IMG_4850.jpeg",
    "photos/IMG_4903.jpeg",
    "photos/IMG_4908.jpeg",
    "photos/IMG_4918.jpeg",
    "photos/IMG_4933.jpeg",
    "photos/IMG_4939.jpeg",
    "photos/IMG_4943.jpeg",
    "photos/IMG_4992.jpeg",
    "photos/IMG_9869-2.jpeg",
    "photos/IMG_9869.jpeg"
  ];
  
  
   
   const FINAL_MESSAGE = "Happy Birthday, my Hudson! 💙\nYou are my favorite everything. I'm so excited for this year, and the next, and the next, and the next:)....";
   
   /* =====================
      SOUNDS — multi-sample key clicks
      ===================== */
   // Put these files in /assets/sounds/
   const CLICK_SOUNDS = [
     "assets/sounds/key1.wav",
     "assets/sounds/key2.wav",
     "assets/sounds/key3.wav"
   ];
   
   // browsers block audio until a gesture; unlock on first gesture
   let soundOn = false;
   function enableSound() {
     soundOn = true;
     // (optional) pre-warm one sound so subsequent plays are instant
     try {
       const a = new Audio(CLICK_SOUNDS[0]);
       a.volume = 0.45;
       a.play().then(() => a.pause()).catch(() => {});
     } catch {}
   }
   window.addEventListener("pointerdown", enableSound, { once: true });
   window.addEventListener("keydown", enableSound, { once: true });
   
   function playClick() {
     if (!soundOn) return;
     const pick = CLICK_SOUNDS[Math.floor(Math.random() * CLICK_SOUNDS.length)];
     const a = new Audio(pick); // new instance each time to overlap safely
     a.volume = 0.45;           // tweak to taste (0.0–1.0)
     a.play().catch(() => {});
   }
   
   /* ===================== */
   const $ = (s) => document.querySelector(s);
   const out = $("#out");
   const input = $("#input");
   const crt = $("#crt");
   const photoField = $("#photo-field");
   const blackout = $("#blackout");
   
   let shutdownMode = false;
   
   /* ===== typewriter ===== */
   function typeLine(text, speed = 35) { // slower typing for nicer clicks
     return new Promise((resolve) => {
       const line = document.createElement("div");
       line.className = "line";
       out.appendChild(line);
       let i = 0;
       const t = setInterval(() => {
         line.textContent = text.slice(0, i++);
         crt.scrollTop = crt.scrollHeight;
   
         // play a click every 2 chars
         if (i <= text.length && i % 2 === 0) {
           playClick();
         }
   
         if (i > text.length) {
           clearInterval(t);
           resolve();
         }
       }, speed);
     });
   }
   
   async function typeLines(lines, gap = 250) {
     for (const ln of lines) {
       await typeLine(ln);
       await sleep(gap);
     }
   }
   
   function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
   
   function flash(msg, cls = "ok") {
     const el = document.createElement("div");
     el.className = "line " + cls;
     el.textContent = msg;
     out.appendChild(el);
     crt.scrollTop = crt.scrollHeight;
   }
   
   /* ===== progress + map ===== */
   function showProgress(percent) {
     const total = 10; const filled = Math.round((percent / 100) * total);
     const bar = `[${"#".repeat(filled)}${".".repeat(total - filled)}] ${percent}%`;
     flash(`Progress: ${bar}`, "warn");
   }
   
   const MAP_STATES = [
   `LEVEL MAP:\n\n[START] *----.\n`,
   `LEVEL MAP:\n\n[START] *---->----.\n             |\n             [ ? ]\n`,
   `LEVEL MAP:\n\n[START] *---->---->----.\n                   |\n                   [ ? ]\n`,
   `LEVEL MAP:\n\n[START] *---->---->----.\n                   |\n                   [EXIT]\n`
   ];
   
   async function renderMap(stageIndex) {
    await typeLine("\nUpdating navigation map…"); // uses default speed = 45
    await sleep(300); // small pause for drama
    await typeLine(MAP_STATES[Math.min(stageIndex, MAP_STATES.length - 1)]); // also default speed
    await sleep(300);
  }
  
   
   /* ===== input ===== */
   function readCommand({ validator = null } = {}) {
     return new Promise((resolve) => {
       // show the prompt + focus input
       const prompt = document.getElementById("prompt");
       prompt.classList.remove("hidden");
   
       input.value = "";
       input.disabled = false;
       input.focus();
   
       function onKey(e) {
         if (shutdownMode) return; // no input during blackout
         if (e.key === "Enter") {
           const val = input.value.trim();
           if (!validator || validator(val)) {
             window.removeEventListener("keydown", onKey);
             resolve(val);
           } else {
             flash("invalid input — try again (type 'hint' for help)", "err");
           }
         }
       }
       window.addEventListener("keydown", onKey);
     });
   }
   
   /* ===== finale visuals ===== */
   function confettiBurst(n = 200) {
     for (let i = 0; i < n; i++) {
       const c = document.createElement("div");
       c.className = "conf";
       c.style.left = Math.random() * 100 + "vw";
       c.style.top = (-10 - Math.random() * 20) + "vh";
       c.style.background = ["#7df9ff","#80ffea","#f1fa8c","#c7f9cc","#bd93f9","#ffd166"][Math.floor(Math.random()*6)];
       c.style.animationDuration = (2 + Math.random() * 3) + "s";
       document.body.appendChild(c);
       setTimeout(() => c.remove(), 5000);
     }
   }
   
   function rand(min, max) { return Math.random() * (max - min) + min; }
   
   function launchPhotos() {
     // hide terminal during photo celebration
  document.getElementById("crt").style.display = "none";
    photoField.classList.remove("hidden");
    photoField.setAttribute("aria-hidden","false");
  
    // preload
    PHOTOS.forEach(src => { const im = new Image(); im.src = src; });
  
    let spawned = 0;
  
    const timer = setInterval(() => {
      const src = PHOTOS[spawned % PHOTOS.length];
      spawned++;
  
      const img = new Image();
      img.className = "shot";
  
      // random square size (looks lively); matches CSS object-fit: cover
      const side = Math.floor(rand(140, 190)); // px
      img.style.width = side + "px";
      img.style.height = side + "px";
      img.style.transform = "rotate(" + rand(-8, 8) + "deg)";
  
      img.onload = () => {
        const w = window.innerWidth, h = window.innerHeight;
  
        // ----- center safe zone where the message sits -----
        const safeZone = {
          x: w/2 - 220,
          y: h/2 - 120,
          w: 440,
          h: 240
        };
  
        // find a spot outside the safe zone (with bounds)
        let x, y, tries = 0;
        do {
          x = rand(8, Math.max(8, w - side - 8));
          y = rand(8, Math.max(8, h - side - 8));
          tries++;
          if (tries > 50) break; // fallback if screen is tiny
        } while (
          x < safeZone.x + safeZone.w &&
          x + side > safeZone.x &&
          y < safeZone.y + safeZone.h &&
          y + side > safeZone.y
        );
  
        img.style.left = x + "px";
        img.style.top  = y + "px";
  
        photoField.appendChild(img);
        setTimeout(() => img.remove(), 9000);
        if (spawned % 3 === 0) confettiBurst(40);
      };
  
      img.onerror = () => {
        // skip silently if a path is wrong
      };
  
      img.src = src; // kick off load
    }, 240);
  
    // center message (above photos)
const msg = document.createElement("div");
Object.assign(msg.style, {
  position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
  padding:"16px 18px", background:"rgba(0,16,0,.6)", border:"1px solid #0a2",
  borderRadius:"10px", boxShadow:"0 0 40px rgba(0,255,128,.15)", textAlign:"center",
  maxWidth:"92vw", whiteSpace:"pre-wrap", zIndex: 10000
});
msg.textContent = FINAL_MESSAGE;
msg.className = "finale-message";
document.body.appendChild(msg);

// auto-hide after 30s
setTimeout(() => msg.remove(), 30000);
   }
  
   
   /* ===== shutdown / reboot ===== */
   let rebootBuffer = "";
   function enableShutdownAndReboot() {
     shutdownMode = true;
     input.blur();
     $("#prompt").classList.add("hidden");
     blackout.classList.remove("hidden");
     blackout.setAttribute("aria-hidden","false");
   
     function onKey(e) {
       if (!shutdownMode) return;
       if (e.key.length === 1) {
         rebootBuffer += e.key.toLowerCase();
         if (rebootBuffer.length > 6) rebootBuffer = rebootBuffer.slice(-6);
         if (rebootBuffer === "reboot") {
           window.removeEventListener("keydown", onKey);
           rebootBuffer = "";
           restartProgram();
         }
       }
     }
     window.addEventListener("keydown", onKey);
   }
   
   function restartProgram() {
     out.innerHTML = "";
     photoField.classList.add("hidden");
     photoField.innerHTML = "";
     blackout.classList.add("hidden");
     $("#prompt").classList.remove("hidden");
     shutdownMode = false;
     run(); // boot again
   }
   

   /* ===== level complete popup ===== */
function levelCompletePopup(titleText = "LEVEL COMPLETE!", jokeText = "Press Enter to continue…") {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "popup-backdrop";
    const box = document.createElement("div");
    box.className = "popup";
    box.innerHTML = `
      <h2>${titleText}</h2>
      <p class="hint">${jokeText}</p>
    `;
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    function done() {
      window.removeEventListener("keydown", onKey);
      backdrop.remove();
      resolve();
    }
    function onKey(e) {
      if (e.key === "Enter") done();
    }

    // click anywhere also continues
    backdrop.addEventListener("click", done);
    window.addEventListener("keydown", onKey);
  });
}


/* ===== finale music helpers ===== */
let finaleAudio = null;
function startFinaleMusic() {
  try {
    finaleAudio = new Audio("assets/sounds/finale.wav");
    finaleAudio.loop = true;
    finaleAudio.volume = 0.5; // tweak
    finaleAudio.play().catch(() => {});
  } catch {}
}
function stopFinaleMusic() {
  if (!finaleAudio) return;
  try {
    finaleAudio.pause();
    finaleAudio.currentTime = 0;
  } catch {}
  finaleAudio = null;
}

/* ===== shutdown popup with countdown ===== */
function shutdownCountdown(seconds = 5) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "popup-backdrop";
    const box = document.createElement("div");
    box.className = "popup";

    // ✅ make the countdown box solid black (not transparent)
    Object.assign(box.style, {
      background: "#000",
      color: "#0f0",          // terminal green
      border: "2px solid #0f0",
      borderRadius: "10px"
    });

    box.innerHTML = `
      <h2>System shutting down…</h2>
      <p class="hint">Securing memories.</p>
      <div class="count">${seconds}</div>
      <p class="hint">Our next year together awaits. Until next time, yours always, your stinky winky</p>
    `;
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    let t = seconds;
    const countEl = box.querySelector(".count");
    const iv = setInterval(() => {
      t -= 1;
      countEl.textContent = t;
      if (t <= 0) {
        clearInterval(iv);
        backdrop.remove();
        resolve();
      }
    }, 1000);
  });
}



/* ===== tiny stick-figure maze animation =====
   Usage: await playMaze(levelNumber);
   Shows a simple maze and auto-animates a stick figure along waypoints.
================================================ 
function playMaze(level = 1) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("mazeOverlay");
    const canvas = document.getElementById("mazeCanvas");
    const ctx = canvas.getContext("2d");
    overlay.classList.remove("hidden");

    const W = canvas.width, H = canvas.height;

    // --- pre-baked waypoint paths per level (pixel coords) ---
    // Feel free to tweak/add more points to change the route.
    const PATHS = {
      1: [[40,360],[140,360],[140,300],[260,300],[260,220],[360,220],[360,280],[520,280],[520,200],[700,200],[760,160]],
      2: [[60,340],[60,240],[160,240],[160,180],[280,180],[280,120],[420,120],[420,220],[560,220],[560,320],[740,320]],
      3: [[80,300],[220,300],[220,260],[320,260],[320,180],[420,180],[420,140],[600,140],[600,220],[700,220]],
      4: [[60,340],[180,340],[180,260],[240,260],[240,200],[360,200],[360,160],[520,160],[520,240],[680,240]],
      5: [[40,360],[200,360],[200,300],[300,300],[300,240],[440,240],[440,180],[620,180],[620,120],[760,120]],
    };
    const path = PATHS[level] || PATHS[1];

    // --- draw a simple maze background (walls) ---
    function drawMaze() {
      ctx.clearRect(0,0,W,H);
      // grid tint
      ctx.strokeStyle = "rgba(0,255,160,.1)";
      for (let x=0; x<=W; x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y=0; y<=H; y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // walls (rects & corridors)
      ctx.strokeStyle = "#0a2";
      ctx.lineWidth = 10;
      const walls = [
        [20, 60, 760, 10],
        [20, 350, 760, 10],
        [20, 60, 10, 300],
        [770, 60, 10, 300],
        [120, 110, 10, 240],
        [230, 60, 10, 240],
        [340, 130, 10, 230],
        [460, 60, 10, 240],
        [580, 130, 10, 230],
        [680, 60, 10, 240],
      ];
      ctx.fillStyle = "rgba(0,255,128,.12)";
      walls.forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h));

      // start/goal marks
      const [sx, sy] = path[0];
      const [gx, gy] = path[path.length-1];
      ctx.fillStyle = "#80ffea";
      ctx.fillRect(sx-8, sy-8, 16, 16);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(gx-10, gy-10, 20, 20);
    }

    // --- simple stick figure drawing ---
    function drawStick(x, y, t) {
      ctx.save();
      // body
      ctx.strokeStyle = "#bfffbf";
      ctx.lineWidth = 2;
      // head
      ctx.beginPath();
      ctx.arc(x, y-10, 6, 0, Math.PI*2);
      ctx.stroke();
      // body line
      ctx.beginPath();
      ctx.moveTo(x, y-4); ctx.lineTo(x, y+12);
      ctx.stroke();
      // arms (swing a bit)
      const swing = Math.sin(t*8) * 6;
      ctx.beginPath();
      ctx.moveTo(x, y+2); ctx.lineTo(x-10, y+2+swing);
      ctx.moveTo(x, y+2); ctx.lineTo(x+10, y+2-swing);
      ctx.stroke();
      // legs
      ctx.beginPath();
      ctx.moveTo(x, y+12); ctx.lineTo(x-8, y+24);
      ctx.moveTo(x, y+12); ctx.lineTo(x+8, y+24);
      ctx.stroke();
      ctx.restore();
    }

    // --- animate along path ---
    let seg = 0, t = 0;
    const speed = 0.02; // segment lerp speed (lower = slower)
    let raf;

    function loop(ts) {
      drawMaze();

      // progress along current segment
      const [x1, y1] = path[seg];
      const [x2, y2] = path[Math.min(seg+1, path.length-1)];
      t += speed;
      const x = x1 + (x2 - x1) * Math.min(t,1);
      const y = y1 + (y2 - y1) * Math.min(t,1);
      drawStick(x, y, ts/1000);

      if (t >= 1) {
        seg++;
        t = 0;
        if (seg >= path.length-1) {
          // done! hold a beat, then clean up
          cancelAnimationFrame(raf);
          setTimeout(() => {
            overlay.classList.add("hidden");
            resolve();
          }, 600);
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    }

    // start
    loop(performance.now());
  });
}
*/

   /* ===== LEVEL ENGINE ===== */
   async function run() {
     await typeLines([
       "booting bday-game v1.0…",
       "loading memories…",
       "initializing surprises…",
       "",
       `> Hi ${STAR_NAME}.`,
       "> Would you like to play a game? (y/n)"
     ]);
     const yn = await readCommand({ validator: v => /^(y|yes|n|no)$/i.test(v) });
     if (/n/i.test(yn)) {
       await typeLine("ok, maybe later. type 'start' if you change your mind.");
       await readCommand({ validator: v => v.toLowerCase() === "start" });
     }
   
     // Level 1 — Stopper riddle
     await doRiddle(RIDDLES[0], 30, 0);
     //await playMaze(1);
     await levelCompletePopup("LEVEL 1 COMPLETE!", "Press Enter to continue (or look away dramaticallyand walk away).");

   
     // Level 2 — Chicken shooter mini-game
     await typeLines([
       `\n${STAR_NAME}, poultry containment protocol engaged…`,
       "Target: rogue chickens detected 🐔",
       "Use LEFT/RIGHT to move, SPACE to flick stoppers.",
       "Herd 20 chickens to secure the barn!"
     ]);
     await sleep(5000);

     await startChickenShooter({ targetScore: 20 });
     flash("✔ LEVEL 2 COMPLETE", "ok");
     showProgress(60); await renderMap(1);
     //await playMaze(2);
     await levelCompletePopup("LEVEL 2 COMPLETE!", "Press Enter to continue (Alt+F4 doesn’t work here 😜).");

   
     // Level 3 — Catan
     await doRiddle(RIDDLES[1], 80, 2);
     //await playMaze(3);
     await levelCompletePopup("LEVEL 3 COMPLETE!", "Press Enter to continue (only on your birthday are you ever better than me at catan).");

   
     // Level 4 — Captain Gray
     await doRiddle(RIDDLES[2], 90, 3);
     //await playMaze(4);
     await levelCompletePopup("LEVEL 4 COMPLETE!", "Press Enter to continue (this is almost over I promise).");

   
     // Level 5 — Blazer
     await doRiddle(RIDDLES[3], 100, 3, { final: true });
     //await playMaze(5);
     await levelCompletePopup("ALL LEVELS COMPLETE!", "Press Enter... if you dare...");

   
    // Finale
flash("[EXIT] reached!", "ok");
flash("SYSTEM UNLOCKED: FINAL MESSAGE", "warn");
confettiBurst(240);
launchPhotos();

// start finale song while the photos fly
startFinaleMusic();

// let the celebration run (adjust as you like)
await sleep(30000);

// small countdown box; photos/message stay visible underneath
// remove the center message before countdown starts
const msg = document.querySelector(".finale-message");
if (msg) msg.remove();

// then show the countdown
await shutdownCountdown(10);

// ✨ FADE TO BLACK smoothly
const bo = document.getElementById("blackout");
bo.classList.remove("hidden");                 // ensure it's visible
bo.setAttribute("aria-hidden", "false");
requestAnimationFrame(() => bo.classList.add("show")); // trigger CSS transition
await sleep(900); // match ~800ms CSS transition

// stop the music, then enter reboot mode (still black)
stopFinaleMusic();
enableShutdownAndReboot();
    }
   
   async function doRiddle(r, percentAfter, mapStage, opts = {}) {
     await typeLines([`\n${r.q}`, "(type the word, or 'hint')"]);
     while (true) {
       const guess = (await readCommand()).toLowerCase();
       if (guess === r.a) { flash("✔ correct!", "ok"); break; }
       if (guess === "hint") { flash("hint: " + r.hint, "warn"); continue; }
       flash("✖ not quite — try again or type 'hint'", "err");
     }
     flash(`✔ LEVEL ${opts?.final ? "5" : "COMPLETE"}`, "ok");
     showProgress(percentAfter);
     await renderMap(mapStage);
   }
   
   /* ===== startup ===== */
   window.addEventListener("click", () => input.focus(), { passive:true });
   run();
   