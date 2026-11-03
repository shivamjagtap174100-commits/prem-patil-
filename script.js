/**
 * Retro 8-bit "Will You Go Out With Me?" Web Application
 * Monochromatic Pink Theme, Parallax Landscape, Web Audio SFX & Micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    currentScreen: 1,
    noClickCount: 0,
    selectedDate: null,
    selectedActivity: null,
    soundEnabled: true,
    senderName: 'Prem Patil',
    typewriterTimeout: null,
    typewriterRunning: false
  };

  // Phrases for the sequential "No" button escalation
  const NO_PHRASES = [
    "Are you sure?",
    "Better say yes!",
    "Babe please :(",
    "Don't do this",
    "I'm gonna cry.."
  ];

  // Love note template
  const NOTE_TEMPLATE = 
`Dear Miss World,

you're really cute no matter what. don't let anyone tell you any different, okay? you make every ordinary day feel special. today and every day, I celebrate you and us.

xoxo,
`;

  // --- AUDIO SYNTHESIZER (8-BIT PROCEDURAL WEB AUDIO API) ---
  class RetroAudio {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playBlip(freq = 440, duration = 0.08, type = 'square') {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playWobble() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      } catch (e) {}
    }

    playFanfare() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
        notes.forEach((freq, idx) => {
          const startTime = this.ctx.currentTime + (idx * 0.08);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.16);
        });
      } catch (e) {}
    }

    playChime() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
        notes.forEach((freq, idx) => {
          const startTime = this.ctx.currentTime + (idx * 0.11);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.16, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });
      } catch (e) {}
    }

    playKeyClick() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const randFreq = 650 + Math.random() * 200;
        osc.frequency.setValueAtTime(randFreq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
      } catch (e) {}
    }
  }

  const sfx = new RetroAudio();

  // Sound Toggle Handler
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    if (state.soundEnabled) {
      sfx.init();
      soundIcon.textContent = '🔊';
      soundText.textContent = 'SFX: ON';
      sfx.playBlip(520, 0.1);
    } else {
      soundIcon.textContent = '🔇';
      soundText.textContent = 'SFX: OFF';
    }
  });

  // Unlock Web Audio on first user interaction anywhere
  const unlockAudio = () => {
    sfx.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // --- FLOATING HEARTS BACKGROUND PARTICLE SYSTEM ---
  const heartsCanvas = document.getElementById('heartsCanvas');
  const hCtx = heartsCanvas.getContext('2d');
  let hearts = [];
  const HEART_COUNT = 24;

  function resizeCanvas() {
    heartsCanvas.width = window.innerWidth;
    heartsCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Draw 8-bit pixel heart on canvas
  function drawPixelHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const s = size / 8; // 8x8 grid for retro pixel heart

    const matrix = [
      [0,1,1,0,0,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
    ];

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          ctx.fillRect(Math.floor(x + c * s), Math.floor(y + r * s), Math.ceil(s), Math.ceil(s));
        }
      }
    }
    ctx.restore();
  }

  function initHearts() {
    hearts = [];
    const colors = ['#ff69b4', '#ff1493', '#fda4af', '#f43f5e', '#ffffff'];
    for (let i = 0; i < HEART_COUNT; i++) {
      hearts.push({
        x: Math.random() * heartsCanvas.width,
        y: Math.random() * heartsCanvas.height,
        size: Math.random() * 12 + 10,
        speed: Math.random() * 0.7 + 0.4,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmount: Math.random() * 25 + 10,
        seed: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.35
      });
    }
  }
  initHearts();

  let tick = 0;
  function animateHearts() {
    hCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
    tick += 0.05;

    for (let h of hearts) {
      h.y -= h.speed;
      const swayX = h.x + Math.sin(tick * h.swaySpeed + h.seed) * h.swayAmount;

      drawPixelHeart(hCtx, swayX, h.y, h.size, h.color, h.alpha);

      // Reset when heart rises above viewport
      if (h.y < -30) {
        h.y = heartsCanvas.height + 20;
        h.x = Math.random() * heartsCanvas.width;
      }
    }
    requestAnimationFrame(animateHearts);
  }
  animateHearts();

  // --- CONFETTI & BURST CANVAS SYSTEM ---
  const burstCanvas = document.getElementById('burstCanvas');
  const bCtx = burstCanvas.getContext('2d');
  let burstParticles = [];

  function resizeBurstCanvas() {
    burstCanvas.width = window.innerWidth;
    burstCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeBurstCanvas);
  resizeBurstCanvas();

  function triggerBurst(originX, originY) {
    const colors = ['#ff1493', '#ff69b4', '#ffffff', '#ffdfba', '#db2777', '#f43f5e'];
    const count = 75;
    const x = originX || window.innerWidth / 2;
    const y = originY || window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: Math.floor(Math.random() * 6 + 4),
        isHeart: Math.random() > 0.45,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.24,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }
  }

  function animateBurst() {
    bCtx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);

    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const p = burstParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        burstParticles.splice(i, 1);
        continue;
      }

      if (p.isHeart) {
        drawPixelHeart(bCtx, p.x, p.y, p.size * 2, p.color, p.alpha);
      } else {
        bCtx.save();
        bCtx.globalAlpha = p.alpha;
        bCtx.fillStyle = p.color;
        bCtx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        bCtx.restore();
      }
    }
    requestAnimationFrame(animateBurst);
  }
  animateBurst();

  // --- SCREEN NAVIGATION CONTROLLER ---
  function goToScreen(screenNumber) {
    const currentScreenEl = document.getElementById(`screen-${state.currentScreen}`);
    const nextScreenEl = document.getElementById(`screen-${screenNumber}`);

    if (!nextScreenEl) return;

    // Transition out
    if (currentScreenEl) {
      currentScreenEl.style.opacity = '0';
      currentScreenEl.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        currentScreenEl.classList.remove('active');
        currentScreenEl.style.display = 'none';

        // Transition in
        nextScreenEl.style.display = 'flex';
        void nextScreenEl.offsetWidth; // Force reflow
        nextScreenEl.classList.add('active');
        nextScreenEl.style.opacity = '1';
        nextScreenEl.style.transform = 'translateY(0)';
        state.currentScreen = screenNumber;
      }, 250);
    }
  }

  // --- SCREEN 1: THE PROPOSAL & ESCALATION LOGIC ---
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const noSubtext = document.getElementById('noSubtext');

  let lastNoActionTime = 0;

  function handleNoAction(e, isHover = false) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const now = Date.now();
    // Prevent double firing when mouseenter is followed instantly by click
    if (!isHover && now - lastNoActionTime < 280) {
      sfx.playWobble();
      return;
    }
    if (isHover && now - lastNoActionTime < 400) {
      return;
    }
    lastNoActionTime = now;

    sfx.playWobble();
    state.noClickCount++;
    const count = state.noClickCount;

    // 1. Update subtext sequentially through exact requested phrases
    const phraseIndex = Math.min(count - 1, NO_PHRASES.length - 1);
    const phrase = NO_PHRASES[phraseIndex];
    noSubtext.textContent = phrase;
    noSubtext.classList.remove('hidden');

    // Retrigger shake animation
    noSubtext.style.animation = 'none';
    void noSubtext.offsetWidth;
    noSubtext.style.animation = 'shakeWarning 0.3s ease-in-out';

    // 2. YES+ button increases in scale by 25-30% each time
    const scaleFactor = 1 + (count * 0.28);
    btnYes.style.transform = `scale(${scaleFactor})`;

    // Playful jitter / dodge of the "No" button so it's fun to chase
    const randX = (Math.random() - 0.5) * 50;
    const randY = (Math.random() - 0.5) * 25;
    const noScale = Math.max(0.6, 1 - (count * 0.07));
    btnNo.style.transform = `translate(${randX}px, ${randY}px) scale(${noScale})`;

    // 3. If user keeps clicking "No" (5+ clicks), YES+ takes over the screen!
    if (count >= 5) {
      btnYes.classList.add('fullscreen-takeover');
      btnYes.innerHTML = `<span>💖 YES! 💖<br><span style="font-size:12px;display:block;margin-top:14px;letter-spacing:1px">(THERE IS NO ESCAPE!)</span></span>`;
      noSubtext.textContent = "I'm gonna cry.. PLEASE JUST SAY YES! 😭";
      btnNo.style.display = 'none'; // Completely hidden so they CANNOT click No anymore!
    }
  }

  btnNo.addEventListener('click', (e) => handleNoAction(e, false));
  btnNo.addEventListener('mouseenter', (e) => {
    if (state.noClickCount < 5) {
      handleNoAction(e, true);
    }
  });

  // Handle "YES+" click
  btnYes.addEventListener('click', (e) => {
    sfx.playFanfare();
    const rect = btnYes.getBoundingClientRect();
    triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    setTimeout(() => {
      goToScreen(2);
    }, 400);
  });

  // --- SCREEN 2: THE CELEBRATION ---
  const btnContinueToDate = document.getElementById('btnContinueToDate');
  btnContinueToDate.addEventListener('click', () => {
    sfx.playBlip(560, 0.1);
    goToScreen(3);
  });

  // --- SCREEN 3: DATE PICKER ---
  const dateInput = document.getElementById('dateInput');
  const dateDisplay = document.getElementById('dateDisplay');
  const btnContinueToActivity = document.getElementById('btnContinueToActivity');
  const chipBtns = document.querySelectorAll('.chip-btn');

  // Set minimum date to today (user can't pick in the past)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;

  function formatDateDDMMYYYY(dateObj) {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d} / ${m} / ${y}`;
  }

  function setDate(dateObj) {
    state.selectedDate = dateObj;
    const formattedDate = formatDateDDMMYYYY(dateObj);
    dateDisplay.innerHTML = `<span>🗓️ ${formattedDate}</span>`;
    dateDisplay.classList.add('has-date');

    // Format for native date input value: YYYY-MM-DD
    const inputYear = dateObj.getFullYear();
    const inputMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const inputDay = String(dateObj.getDate()).padStart(2, '0');
    dateInput.value = `${inputYear}-${inputMonth}-${inputDay}`;

    // Enable continue button
    btnContinueToActivity.disabled = false;
    btnContinueToActivity.classList.remove('disabled');
    sfx.playBlip(620, 0.08);
  }

  // Trigger calendar on click of retro box
  dateDisplay.addEventListener('click', () => {
    if (typeof dateInput.showPicker === 'function') {
      try {
        dateInput.showPicker();
        return;
      } catch (err) {}
    }
    dateInput.focus();
    dateInput.click();
  });

  dateInput.addEventListener('change', (e) => {
    if (!e.target.value) return;
    const parts = e.target.value.split('-');
    const chosenDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    setDate(chosenDate);
  });

  // Quick preset chips
  chipBtns.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const daysToAdd = parseInt(chip.dataset.days, 10);
      const targetDate = new Date();
      if (daysToAdd === 5) {
        // "This Weekend": next upcoming Saturday
        const dayOfWeek = targetDate.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + daysUntilSaturday);
      } else {
        targetDate.setDate(targetDate.getDate() + daysToAdd);
      }
      setDate(targetDate);
    });
  });

  btnContinueToActivity.addEventListener('click', () => {
    if (!state.selectedDate) return;
    sfx.playBlip(560, 0.1);
    goToScreen(4);
  });

  // --- SCREEN 4: ACTIVITY SELECTION ---
  const activityCards = document.querySelectorAll('.activity-card');
  const btnLockItIn = document.getElementById('btnLockItIn');

  activityCards.forEach(card => {
    card.addEventListener('click', () => {
      const isAlreadyActive = card.classList.contains('active');
      sfx.playBlip(580, 0.09);

      // Deselect all
      activityCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });

      if (!isAlreadyActive) {
        // Select clicked
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        state.selectedActivity = card.getAttribute('data-activity');
        btnLockItIn.disabled = false;
        btnLockItIn.classList.remove('disabled');
      } else {
        // Toggled off
        state.selectedActivity = null;
        btnLockItIn.disabled = true;
        btnLockItIn.classList.add('disabled');
      }
    });
  });

  btnLockItIn.addEventListener('click', () => {
    if (!state.selectedActivity) return;
    sfx.playFanfare();
    const rect = btnLockItIn.getBoundingClientRect();
    triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    populateSummary();
    goToScreen(5);

    // Screen 5 notification drop-down
    setTimeout(() => {
      showNotificationPill();
    }, 650);
  });

  // --- SCREEN 5: CONFIRMATION & NOTIFICATION ---
  const summaryDate = document.getElementById('summaryDate');
  const summaryActivity = document.getElementById('summaryActivity');
  const notificationPill = document.getElementById('notificationPill');
  const btnOpenNoteManual = document.getElementById('btnOpenNoteManual');

  function populateSummary() {
    if (state.selectedDate) {
      // E.g. Fri, August 21, 2026
      const options = { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' };
      summaryDate.textContent = state.selectedDate.toLocaleDateString('en-US', options);
    }
    if (state.selectedActivity) {
      summaryActivity.textContent = state.selectedActivity;
    }
  }

  function showNotificationPill() {
    notificationPill.classList.remove('hidden');
    sfx.playChime();
    const rect = notificationPill.getBoundingClientRect();
    triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  notificationPill.addEventListener('click', openLoveNote);
  btnOpenNoteManual.addEventListener('click', openLoveNote);

  // --- SCREEN 6: RETRO DRAGGABLE OS-STYLE WINDOW (THE LOVE NOTE) ---
  const loveNoteOverlay = document.getElementById('loveNoteOverlay');
  const draggableWindow = document.getElementById('draggableWindow');
  const windowHeader = document.getElementById('windowHeader');
  const btnCloseNote = document.getElementById('btnCloseNote');
  const btnMinimizeNote = document.getElementById('btnMinimizeNote');
  const typewriterText = document.getElementById('typewriterText');
  const senderNameInput = document.getElementById('senderNameInput');
  const btnSaveCard = document.getElementById('btnSaveCard');

  let currentTranslateX = 0;
  let currentTranslateY = 0;

  function openLoveNote() {
    sfx.playBlip(700, 0.1);
    loveNoteOverlay.classList.remove('hidden');
    // Reset window translation to center
    currentTranslateX = 0;
    currentTranslateY = 0;
    draggableWindow.style.transform = 'translate(0px, 0px)';
    startTypewriter();
  }

  function closeLoveNote() {
    sfx.playBlip(400, 0.08);
    loveNoteOverlay.classList.add('hidden');
    if (state.typewriterTimeout) {
      clearTimeout(state.typewriterTimeout);
    }
    state.typewriterRunning = false;
  }

  btnCloseNote.addEventListener('click', closeLoveNote);
  btnMinimizeNote.addEventListener('click', closeLoveNote);

  // Close when clicking overlay backdrop
  loveNoteOverlay.addEventListener('click', (e) => {
    if (e.target === loveNoteOverlay) {
      closeLoveNote();
    }
  });

  // Typewriter effect
  function startTypewriter() {
    if (state.typewriterTimeout) {
      clearTimeout(state.typewriterTimeout);
    }
    state.typewriterRunning = true;
    typewriterText.textContent = '';

    const fullMessage = NOTE_TEMPLATE + state.senderName;
    let index = 0;

    function typeNextChar() {
      if (index < fullMessage.length) {
        typewriterText.textContent += fullMessage.charAt(index);
        index++;
        if (index % 3 === 0) {
          sfx.playKeyClick();
        }
        state.typewriterTimeout = setTimeout(typeNextChar, 28);
      } else {
        state.typewriterRunning = false;
      }
    }
    typeNextChar();
  }

  // Sender Name Customization
  senderNameInput.addEventListener('input', (e) => {
    state.senderName = e.target.value.trim() || 'Your Name';
    if (!state.typewriterRunning) {
      typewriterText.textContent = NOTE_TEMPLATE + state.senderName;
    }
  });

  // Save / Copy Memory Card Button
  btnSaveCard.addEventListener('click', () => {
    sfx.playFanfare();
    const formattedDate = summaryDate.textContent;
    const formattedAct = summaryActivity.textContent;
    const memoryReceipt = 
`╔═══════════════════════════════════╗
║     💖 OUR 8-BIT DATE LOCK-IN     ║
╠═══════════════════════════════════╣
║ DATE:     ${formattedDate.padEnd(23)} ║
║ ACTIVITY: ${formattedAct.padEnd(23)} ║
║ FROM:     ${state.senderName.padEnd(23)} ║
╚═══════════════════════════════════╝
"you're really cute no matter what.
don't let anyone tell you any different, okay?
you make every ordinary day feel special.
today and every day, I celebrate you and us."`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(memoryReceipt).then(() => {
        btnSaveCard.textContent = 'COPIED TO CLIPBOARD! ✨';
        setTimeout(() => {
          btnSaveCard.textContent = '📸 SAVE MEMORY CARD';
        }, 2200);
      }).catch(() => {
        alert(memoryReceipt);
      });
    } else {
      alert(memoryReceipt);
    }
  });

  // --- DRAGGABLE OS WINDOW IMPLEMENTATION (MOUSE & TOUCH) ---
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  function onDragStart(e) {
    if (e.target.closest('.window-controls') || e.target.closest('button') || e.target.closest('input')) return;
    isDragging = true;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    dragStartX = clientX - currentTranslateX;
    dragStartY = clientY - currentTranslateY;
    document.body.style.userSelect = 'none';
  }

  function onDragMove(e) {
    if (!isDragging) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    currentTranslateX = clientX - dragStartX;
    currentTranslateY = clientY - dragStartY;
    draggableWindow.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px)`;
  }

  function onDragEnd() {
    isDragging = false;
    document.body.style.userSelect = '';
  }

  windowHeader.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  windowHeader.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('touchend', onDragEnd);
});
