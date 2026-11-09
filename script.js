/**
 * ============================================================================
 * 🎂 HAPPY BIRTHDAY - INTERACTIVE CANDLE WISH WEBSITE
 * ============================================================================
 * 
 * ✏️ EASY SETUP:
 * You can edit the 3 lines inside the CONFIG object below to personalize 
 * the birthday card! You can also click the "Personalize" button on the 
 * website itself to edit it live or generate a shareable link.
 */

const CONFIG = {
  // The name of the birthday person:
  name: "kiyu",

  // Your name (who the card is from):
  from: "Fitsum",

  // The heartfelt birthday message:
  message: "Another year, another reason to celebrate you. I hope this one is full of good surprises, laughter, and endless happiness!"
};

// ============================================================================
// STATE & AUDIO INITIALIZATION
// ============================================================================

let soundEnabled = true;
let audioCtx = null;
let activeAudioNodes = [];

// Initialize or resume Web Audio API on first user interaction
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Stops all currently playing music/notes immediately
 */
function stopAllMusic() {
  activeAudioNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) {}
  });
  activeAudioNodes = [];
}

/**
 * Plays a quick test chime when toggling "Sound ON" so the user knows audio works
 */
function playTestChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [587.33, 880]; // D5, A5
  notes.forEach((freq, i) => {
    const startTime = now + i * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

/**
 * Synthesizes a soft, realistic candle blow sound:
 * Air puff (filtered noise) + sweet magical chime
 */
function playBlowSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Air Puff (Noise)
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.28);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.45, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.3);

  // 2. High-pitch magical sparkle chime
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.exponentialRampToValueAtTime(1479.98, now + 0.18); // F#6

  oscGain.gain.setValueAtTime(0.25, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.36);
}

/**
 * Plays the full, charming "Happy Birthday To You" music-box melody!
 * G4, G4, A4, G4, C5, B4 ...
 */
function playHappyBirthdaySong() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  stopAllMusic();

  const now = ctx.currentTime;

  // Melody: [frequency (Hz), duration, start offset]
  const notes = [
    // Line 1: "Happy birthday to you"
    { freq: 392.00, dur: 0.35, time: 0.0 },   // G4
    { freq: 392.00, dur: 0.35, time: 0.38 },  // G4
    { freq: 440.00, dur: 0.60, time: 0.76 },  // A4
    { freq: 392.00, dur: 0.60, time: 1.40 },  // G4
    { freq: 523.25, dur: 0.60, time: 2.05 },  // C5
    { freq: 493.88, dur: 1.10, time: 2.70 },  // B4

    // Line 2: "Happy birthday to you"
    { freq: 392.00, dur: 0.35, time: 3.90 },  // G4
    { freq: 392.00, dur: 0.35, time: 4.28 },  // G4
    { freq: 440.00, dur: 0.60, time: 4.66 },  // A4
    { freq: 392.00, dur: 0.60, time: 5.30 },  // G4
    { freq: 587.33, dur: 0.60, time: 5.95 },  // D5
    { freq: 523.25, dur: 1.10, time: 6.60 },  // C5

    // Line 3: "Happy birthday dear Kiyu"
    { freq: 392.00, dur: 0.35, time: 7.80 },  // G4
    { freq: 392.00, dur: 0.35, time: 8.18 },  // G4
    { freq: 783.99, dur: 0.70, time: 8.56 },  // G5
    { freq: 659.25, dur: 0.70, time: 9.30 },  // E5
    { freq: 523.25, dur: 0.60, time: 10.05 }, // C5
    { freq: 493.88, dur: 0.60, time: 10.70 }, // B4
    { freq: 440.00, dur: 1.10, time: 11.35 }, // A4

    // Line 4: "Happy birthday to you"
    { freq: 698.46, dur: 0.35, time: 12.55 }, // F5
    { freq: 698.46, dur: 0.35, time: 12.93 }, // F5
    { freq: 659.25, dur: 0.70, time: 13.31 }, // E5
    { freq: 523.25, dur: 0.70, time: 14.05 }, // C5
    { freq: 587.33, dur: 0.70, time: 14.80 }, // D5
    { freq: 523.25, dur: 1.40, time: 15.55 }  // C5
  ];

  notes.forEach(n => {
    const startTime = now + n.time;
    const dur = n.dur;

    // Music box sound: combination of triangle wave + high sparkle overtone
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, startTime);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(n.freq * 2, startTime); // 1 octave higher for music box bell shimmer

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.24, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0005, startTime + dur);

    osc.connect(gain);
    overtone.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    overtone.start(startTime);
    osc.stop(startTime + dur + 0.05);
    overtone.stop(startTime + dur + 0.05);

    activeAudioNodes.push(osc, overtone);
  });
}

/**
 * Synthesizes a gentle whoosh chime when relighting candles
 */
function playRelightSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.36);
}

// ============================================================================
// DOM ELEMENTS & INITIALIZATION
// ============================================================================

const candles = [...document.querySelectorAll('.candle')];
const titleEl = document.getElementById('title');
const msgEl = document.getElementById('msg');
const fromEl = document.getElementById('from');
const againBtn = document.getElementById('again');
const hintInstruction = document.getElementById('hintInstruction');
const counterDots = [...document.querySelectorAll('.counter-dot')];
const wishFloats = document.getElementById('wishFloats');
const soundToggle = document.getElementById('soundToggle');

// Modal Elements
const customizeBtn = document.getElementById('customizeBtn');
const customizeModal = document.getElementById('customizeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const customizeForm = document.getElementById('customizeForm');
const inputName = document.getElementById('inputName');
const inputFrom = document.getElementById('inputFrom');
const inputMessage = document.getElementById('inputMessage');
const copyShareBtn = document.getElementById('copyShareBtn');
const shareNotice = document.getElementById('shareNotice');

/**
 * Read URL parameters (?name=...&from=...&msg=...) to allow custom links
 */
function loadCustomParameters() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('name')) CONFIG.name = params.get('name').trim();
  if (params.has('from')) CONFIG.from = params.get('from').trim();
  if (params.has('msg')) CONFIG.message = params.get('msg').trim();

  renderContent();
}

/**
 * Render text content to page
 */
function renderContent() {
  titleEl.textContent = `Happy birthday, ${CONFIG.name}!`;
  msgEl.textContent = CONFIG.message;
  fromEl.textContent = `With love, ${CONFIG.from} ❤️`;
  document.title = `Happy Birthday, ${CONFIG.name}! 🎂`;
}

// ============================================================================
// AMBIENT BACKGROUND STARS
// ============================================================================
function createAmbientStars() {
  const container = document.getElementById('ambientStars');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star-dot';
    const size = Math.random() * 3 + 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    star.style.animationDuration = `${4 + Math.random() * 4}s`;
    container.appendChild(star);
  }
}

// ============================================================================
// CANDLE INTERACTION LOGIC
// ============================================================================

const wishMessages = [
  "✨ Wish #1 made!",
  "💫 Wish #2 made!",
  "💖 Final wish made!"
];

/**
 * Show a floating wish pill when a candle is tapped
 */
function showWishFloat(candleEl, text) {
  const rect = candleEl.getBoundingClientRect();
  const cakeRect = candleEl.parentElement.getBoundingClientRect();

  const tag = document.createElement('div');
  tag.className = 'wish-tag';
  tag.textContent = text;

  // Position relative to candle
  const leftPos = rect.left - cakeRect.left + rect.width / 2;
  const topPos = rect.top - cakeRect.top;

  tag.style.left = `${leftPos}px`;
  tag.style.top = `${topPos}px`;

  wishFloats.appendChild(tag);
  setTimeout(() => tag.remove(), 2100);
}

/**
 * Update room lighting, counter dots, and check if all candles are blown
 */
function updateCandlesState() {
  const outCount = candles.filter(c => c.classList.contains('out')).length;
  const remaining = candles.length - outCount;

  // Modulate candle glow CSS variable (1 = full light, 0 = all blown)
  const glowRatio = 1 - (outCount / candles.length);
  document.documentElement.style.setProperty('--glow', glowRatio);

  // Update dots indicator
  counterDots.forEach((dot, idx) => {
    if (idx < remaining) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Update hint text dynamically
  if (remaining === 2) {
    hintInstruction.textContent = "Two more candles remaining... keep wishing! ✨";
  } else if (remaining === 1) {
    hintInstruction.textContent = "One last candle! Make your biggest wish! 🌟";
  } else if (remaining === 0) {
    hintInstruction.textContent = "All wishes made! Here's your surprise... 🎁";
    
    // Short dramatic suspense before room lights burst on
    setTimeout(() => {
      document.body.classList.add('lit');
      playCelebrationFanfare();
      playHappyBirthdaySong();
      triggerConfettiExplosion();
    }, 450);
  } else {
    hintInstruction.textContent = "Tap each candle to blow it out and make a wish.";
  }
}

// Attach click listener to each candle
candles.forEach((candle, index) => {
  candle.addEventListener('click', () => {
    if (candle.classList.contains('out')) return;

    candle.classList.add('out');
    playBlowSound();

    const outCount = candles.filter(c => c.classList.contains('out')).length;
    const wishText = wishMessages[outCount - 1] || "✨ Wish made!";
    showWishFloat(candle, wishText);

    updateCandlesState();
  });
});

// "Light the candles again" button handler
againBtn.addEventListener('click', () => {
  stopAllMusic();
  playRelightSound();
  document.body.classList.remove('lit');

  candles.forEach(candle => {
    candle.classList.remove('out');
  });

  updateCandlesState();
  hintInstruction.textContent = "Tap each candle to blow it out and make a wish.";
});

// ============================================================================
// CONFETTI SYSTEM (Ultra Smooth Canvas Animation)
// ============================================================================

const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = [
  '#ffb547', '#ff5d8f', '#7ef0c8', '#fff1dc', '#b794ff', '#ff3864', '#ffe066'
];

function createConfettiParticle() {
  const isRibbon = Math.random() > 0.4;
  return {
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * -confettiCanvas.height * 0.5,
    size: Math.random() * 8 + 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    speedY: Math.random() * 3 + 2.5,
    speedX: (Math.random() - 0.5) * 3,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    isRibbon: isRibbon,
    aspect: Math.random() * 0.5 + 0.5
  };
}

function updateAndDrawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    p.y += p.speedY;
    p.x += p.speedX;
    p.rot += p.rotSpeed;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rot * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;

    if (p.isRibbon) {
      confettiCtx.fillRect(-p.size / 2, -p.size * p.aspect / 2, p.size, p.size * p.aspect);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  }

  // Keep alive until all particles fall off screen
  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 40);

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(updateAndDrawConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

function triggerConfettiExplosion() {
  cancelAnimationFrame(confettiAnimationId);
  confettiParticles = [];
  const total = window.innerWidth < 600 ? 90 : 150;
  for (let i = 0; i < total; i++) {
    confettiParticles.push(createConfettiParticle());
  }
  updateAndDrawConfetti();
}

// ============================================================================
// SOUND TOGGLE
// ============================================================================

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  const icon = soundToggle.querySelector('.icon');
  const text = soundToggle.querySelector('.btn-text');
  if (soundEnabled) {
    icon.textContent = '🔊';
    text.textContent = 'Sound ON';
    getAudioContext();
    playTestChime();
  } else {
    icon.textContent = '🔇';
    text.textContent = 'Sound OFF';
    stopAllMusic();
  }
});

// ============================================================================
// PERSONALIZATION MODAL & SHARING
// ============================================================================

function openModal() {
  inputName.value = CONFIG.name;
  inputFrom.value = CONFIG.from;
  inputMessage.value = CONFIG.message;
  shareNotice.textContent = '';
  customizeModal.classList.add('open');
  customizeModal.setAttribute('aria-hidden', 'false');
  inputName.focus();
}

function closeModal() {
  customizeModal.classList.remove('open');
  customizeModal.setAttribute('aria-hidden', 'true');
}

customizeBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

customizeModal.addEventListener('click', (e) => {
  if (e.target === customizeModal) closeModal();
});

customizeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  CONFIG.name = inputName.value.trim() || "kiyu";
  CONFIG.from = inputFrom.value.trim() || "Fitsum";
  CONFIG.message = inputMessage.value.trim() || "Happy Birthday!";

  renderContent();
  closeModal();
});

// Generate shareable link with query parameters
copyShareBtn.addEventListener('click', () => {
  const nameVal = encodeURIComponent(inputName.value.trim() || CONFIG.name);
  const fromVal = encodeURIComponent(inputFrom.value.trim() || CONFIG.from);
  const msgVal = encodeURIComponent(inputMessage.value.trim() || CONFIG.message);

  const url = `${window.location.origin}${window.location.pathname}?name=${nameVal}&from=${fromVal}&msg=${msgVal}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      shareNotice.textContent = '✓ Link copied! Send it to your friend!';
      shareNotice.style.color = 'var(--mint)';
    }).catch(() => {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
});

function fallbackCopy(text) {
  prompt('Copy this personalized link to share:', text);
}

// ============================================================================
// STARTUP
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  createAmbientStars();
  loadCustomParameters();
  updateCandlesState();
});

