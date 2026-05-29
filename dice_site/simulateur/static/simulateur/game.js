// ============================================================
// DICE CUBE 3D — Build & control
// ============================================================
const DC = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const PIP_PATTERNS = {
  1: [[1,1]],
  2: [[0,2], [2,0]],
  3: [[0,2], [1,1], [2,0]],
  4: [[0,0], [0,2], [2,0], [2,2]],
  5: [[0,0], [0,2], [1,1], [2,0], [2,2]],
  6: [[0,0], [0,2], [1,0], [1,2], [2,0], [2,2]]
};

const FACE_NAMES = ['front', 'back', 'right', 'left', 'top', 'bottom'];
const FACE_VALUES = [1, 6, 2, 5, 3, 4];
const FACE_ROTATIONS = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 }
};

function buildDiceCube(containerId) {
  const cube = document.getElementById(containerId);
  if (!cube) return;
  cube.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const face = document.createElement('div');
    face.className = 'dice-face ' + FACE_NAMES[i];
    const val = FACE_VALUES[i];
    const pattern = PIP_PATTERNS[val];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = document.createElement('div');
        if (pattern.some(([pr, pc]) => pr === r && pc === c)) {
          cell.className = 'dice-pip';
        }
        face.appendChild(cell);
      }
    }
    cube.appendChild(face);
  }
}

function setDiceFace(cubeId, value) {
  const rot = FACE_ROTATIONS[value];
  const el = document.getElementById(cubeId);
  if (el) el.style.transform = 'rotateX(' + rot.x + 'deg) rotateY(' + rot.y + 'deg)';
}


// ============================================================
// CONFETTI — Canvas particles
// ============================================================
const CONFETTI_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#f472b6'];

function launchConfetti(targetEl) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const rect = targetEl.getBoundingClientRect();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const particles = [];
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    particles.push({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed * (0.5 + Math.random()),
      vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      life: 1,
      gravity: 0.2 + Math.random() * 0.15
    });
  }

  let frame = 0;
  const maxFrames = 120;
  function animateConfetti() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.life -= 0.008;
      if (p.life < 0) p.life = 0;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      const s = p.size * p.life;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(-s / 2, -s / 4, s, s / 2);
      ctx.restore();
    }
    if (alive && frame < maxFrames) {
      requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animateConfetti();
}


// ============================================================
// SOUNDS — Web Audio API
// ============================================================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playDiceSound() {
  try {
    const ctx = getAudioCtx();
    const bufSize = ctx.sampleRate * 0.08;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

function playWinSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function playLoseSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

function playClickSound() {
  try {
    const ctx = getAudioCtx();
    const bufSize = ctx.sampleRate * 0.02;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}


// ============================================================
// CANVAS CHART
// ============================================================
function drawChart() {
  const canvas = document.getElementById('convergence-chart');
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.min(rect.width - 32, 800);
  const h = 240;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const data = window.CHART_DATA || [];
  if (data.length === 0) return;

  const pad = { top: 20, bottom: 30, left: 40, right: 20 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const teorique = data[0].teorique;

  function draw(animProgress) {
    ctx.clearRect(0, 0, w, h);
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + ch * (1 - i / 4);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((i * 0.05).toFixed(2), pad.left - 8, y + 3);
    }
    // Theoretical line
    const teoY = pad.top + ch * (1 - teorique / 0.2);
    ctx.strokeStyle = 'rgba(245,158,11,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad.left, teoY); ctx.lineTo(w - pad.right, teoY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Theorique: ' + teorique.toFixed(3), w - pad.right - 100, teoY - 4);
    // Bars
    const visible = Math.floor(animProgress * data.length);
    for (let i = 0; i < visible && i < data.length; i++) {
      const s = data[i];
      const x = pad.left + (i / (data.length - 1 || 1)) * cw;
      const bw = Math.max(4, cw / data.length * 0.6);
      const freq = s.freq;
      const bh = (freq / 0.2) * ch;
      const by = pad.top + ch - bh;
      const gradient = ctx.createLinearGradient(0, by, 0, pad.top + ch);
      if (s.n >= 1000) {
        gradient.addColorStop(0, 'rgba(16,185,129,0.6)');
        gradient.addColorStop(1, 'rgba(16,185,129,0.15)');
      } else {
        gradient.addColorStop(0, 'rgba(139,92,246,0.6)');
        gradient.addColorStop(1, 'rgba(139,92,246,0.15)');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const r = bw / 2;
      ctx.moveTo(x - bw/2 + r, by);
      ctx.lineTo(x + bw/2 - r, by);
      ctx.arcTo(x + bw/2, by, x + bw/2, by + r, r);
      ctx.lineTo(x + bw/2, pad.top + ch);
      ctx.lineTo(x - bw/2, pad.top + ch);
      ctx.lineTo(x - bw/2, by + r);
      ctx.arcTo(x - bw/2, by, x - bw/2 + r, by, r);
      ctx.fill();
      ctx.shadowColor = s.n >= 1000 ? 'rgba(16,185,129,0.5)' : 'rgba(139,92,246,0.5)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = s.n >= 1000 ? '#10b981' : '#8b5cf6';
      ctx.beginPath(); ctx.arc(x, by, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.n, x, pad.top + ch + 18);
      }
    }
    if (animProgress < 1) {
      requestAnimationFrame(() => draw(Math.min(1, animProgress + 0.03)));
    }
  }
  draw(0);
}


// ============================================================
// GAME CLASS
// ============================================================
const Game = {
  players: [],
  activePlayerIndex: -1,
  rolling: false,
  els: {},

  init() {
    buildDiceCube('cube1');
    buildDiceCube('cube2');
    setDiceFace('cube1', 1);
    setDiceFace('cube2', 1);

    const $ = (id) => document.getElementById(id);
    this.els = {
      input: $('player-name-input'),
      btnAdd: $('btn-add-player'),
      playersList: $('players-list'),
      activeDisplay: $('active-player-display'),
      activeName: $('active-player-name'),
      leaderboard: $('leaderboard'),
      dice1: $('game-dice1'), dice2: $('game-dice2'),
      cube1: $('cube1'), cube2: $('cube2'),
      result: $('game-result'),
      total: $('game-total'), succes: $('game-succes'), freq: $('game-freq'),
      btnLancer: $('btn-game-lancer'),
      btnLancer10: $('btn-game-lancer10'),
      btnReset: $('btn-game-reset'),
      playerSelect: $('player-select-buttons'),
      labels: document.querySelectorAll('.dice-label'),
    };

    this.els.btnAdd.addEventListener('click', () => { playClickSound(); this.addPlayer(); });
    this.els.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { playClickSound(); this.addPlayer(); } });
    this.els.btnLancer.addEventListener('click', () => this.roll(1));
    this.els.btnLancer10.addEventListener('click', () => this.roll(10));
    this.els.btnReset.addEventListener('click', () => { playClickSound(); this.resetPlayer(); });

    if (typeof window.CHART_DATA !== 'undefined') {
      setTimeout(drawChart, 200);
      window.addEventListener('resize', drawChart);
    }
  },

  getAvatarColor(name) {
    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#f472b6', '#6366f1', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  addPlayer() {
    const name = this.els.input.value.trim();
    if (!name) return;
    if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) { alert('Ce joueur existe déjà !'); return; }
    this.players.push({ name, total: 0, succes: 0 });
    this.els.input.value = '';
    this.refresh();
    if (this.players.length === 1) { this.activePlayerIndex = 0; this.activate(0); }
  },

  activate(index) {
    this.activePlayerIndex = index;
    const p = this.players[index];
    this.els.activeName.textContent = p.name;
    this.els.activeDisplay.classList.remove('d-none');
    this.els.total.textContent = p.total;
    this.els.succes.textContent = p.succes;
    this.els.freq.textContent = p.total > 0 ? (p.succes / p.total).toFixed(4) : '—';
    this.els.btnLancer.disabled = false;
    this.els.btnLancer10.disabled = false;
    this.els.btnReset.disabled = false;
    this.refresh();
  },

  removePlayer(index) {
    this.players.splice(index, 1);
    if (this.players.length === 0) {
      this.activePlayerIndex = -1;
      this.els.activeDisplay.classList.add('d-none');
      this.els.btnLancer.disabled = this.els.btnLancer10.disabled = this.els.btnReset.disabled = true;
      this.els.total.textContent = '0'; this.els.succes.textContent = '0'; this.els.freq.textContent = '—';
    } else if (index <= this.activePlayerIndex) {
      this.activePlayerIndex = Math.max(0, this.activePlayerIndex - 1);
      this.activate(this.activePlayerIndex);
    }
    this.refresh();
  },

  refresh() {
    const els = this.els;
    if (this.players.length === 0) {
      els.playersList.innerHTML = '<div class="empty-state">Ajoutez au moins 2 joueurs</div>';
    } else {
      els.playersList.innerHTML = this.players.map((p, i) =>
        '<div class="player-card' + (i === this.activePlayerIndex ? ' active' : '') + '" onclick="Game.activate(' + i + ')">' +
          '<div class="player-avatar" style="background:' + this.getAvatarColor(p.name) + '">' + esc(p.name.charAt(0).toUpperCase()) + '</div>' +
          '<div class="player-info"><div class="player-name">' + esc(p.name) + '</div><div class="player-sub">' + p.total + ' lances · ' + p.succes + ' paires</div></div>' +
          '<button class="player-remove" onclick="event.stopPropagation(); Game.removePlayer(' + i + ')">✕</button>' +
        '</div>'
      ).join('');
    }
    if (this.players.length < 2) {
      els.playerSelect.innerHTML = '<span style="color:var(--text-muted);font-size:0.7rem;">Ajoutez au moins 2 joueurs</span>';
    } else {
      els.playerSelect.innerHTML = this.players.map((p, i) =>
        '<button class="btn-game ' + (i === this.activePlayerIndex ? 'btn-primary' : 'btn-outline') + ' btn-sm" onclick="Game.activate(' + i + ')">' +
          (i === this.activePlayerIndex ? '▸ ' : '') + esc(p.name) + '</button>'
      ).join('');
    }
    if (this.players.length === 0) {
      els.leaderboard.innerHTML = '<div class="empty-state">En attente de joueurs...</div>';
      return;
    }
    const sorted = [...this.players].sort((a, b) => {
      const fA = a.total > 0 ? a.succes / a.total : 0;
      const fB = b.total > 0 ? b.succes / b.total : 0;
      return fB - fA || b.total - a.total;
    });
    const medals = ['🥇', '🥈', '🥉'];
    els.leaderboard.innerHTML = '<table class="leaderboard-table"><tbody>' +
      sorted.map((p, i) => {
        const freq = p.total > 0 ? (p.succes / p.total) : 0;
        return '<tr><td class="leaderboard-rank">' + (i < 3 ? medals[i] : '') + '</td>' +
          '<td class="leaderboard-name">' + esc(p.name) + '</td>' +
          '<td class="leaderboard-stat">' + p.total + ' lanc</td>' +
          '<td class="leaderboard-freq">' + (freq > 0 ? freq.toFixed(4) : '—') + '</td></tr>';
      }).join('') + '</tbody></table>';
  },

  async roll(n) {
    if (this.rolling || this.activePlayerIndex < 0) return;
    this.rolling = true;
    this.els.btnLancer.disabled = this.els.btnLancer10.disabled = true;
    const fast = n > 1;
    for (let i = 0; i < n; i++) await this.rollOne(fast);
    this.rolling = false;
    this.els.btnLancer.disabled = this.els.btnLancer10.disabled = false;
  },

  async rollOne(fast) {
    const data = await (await fetch('/lancer/')).json();
    const p = this.players[this.activePlayerIndex];
    const d1 = this.els.dice1, d2 = this.els.dice2;
    const c1 = this.els.cube1, c2 = this.els.cube2;

    d1.classList.remove('dice-glow'); d2.classList.remove('dice-glow');
    c1.classList.remove('spinning'); c2.classList.remove('spinning');
    c1.style.transition = 'none'; c2.style.transition = 'none';
    this.els.labels.forEach(l => l.classList.remove('show'));
    this.els.result.innerHTML = '<span class="result-suspense">🎲 LANCEMENT...</span>';

    playDiceSound();
    await this.animateDice(fast, data.de1, data.de2);

    this.els.labels.forEach(l => l.classList.add('show'));
    c1.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    c2.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDiceFace('cube1', data.de1);
        setDiceFace('cube2', data.de2);
      });
    });

    p.total++;
    if (data.egaux) p.succes++;

    d1.classList.remove('dice-glow'); d2.classList.remove('dice-glow');

    if (data.egaux) {
      d1.style.filter = 'drop-shadow(0 0 25px rgba(16,185,129,0.5))';
      d2.style.filter = 'drop-shadow(0 0 25px rgba(16,185,129,0.5))';
      this.els.result.innerHTML = '<span class="result-jackpot">🔥 DOUBLE ! ' + data.de1 + ' = ' + data.de2 + ' 🎉</span>';
      playWinSound();
      launchConfetti(document.getElementById('dice-area'));
      screenShake();
      setTimeout(() => { d1.style.filter = ''; d2.style.filter = ''; }, 1500);
    } else {
      d1.style.filter = 'drop-shadow(0 0 15px rgba(239,68,68,0.3))';
      d2.style.filter = 'drop-shadow(0 0 15px rgba(239,68,68,0.3))';
      this.els.result.innerHTML = '<span class="result-fail">😞 ' + data.de1 + ' ≠ ' + data.de2 + ' — Pas de chance, ' + esc(p.name) + '</span>';
      playLoseSound();
      setTimeout(() => { d1.style.filter = ''; d2.style.filter = ''; }, 800);
    }

    this.els.total.textContent = p.total;
    this.els.succes.textContent = p.succes;
    this.els.freq.textContent = (p.succes / p.total).toFixed(4);
    this.refresh();
  },

  animateDice(fast, finalVal1, finalVal2) {
    return new Promise(resolve => {
      const d1 = this.els.dice1, d2 = this.els.dice2;
      const c1 = this.els.cube1, c2 = this.els.cube2;
      const duration = fast ? 600 : 1600;
      const faceIntervalMs = fast ? 50 : 80;
      const startTime = performance.now();
      const dirs = [
        { vx: (Math.random() - 0.5) * 500, vy: -(Math.random() * 180 + 220), phase: Math.random() * Math.PI * 2 },
        { vx: (Math.random() - 0.5) * 500, vy: -(Math.random() * 180 + 220), phase: Math.random() * Math.PI * 2 }
      ];
      const els = [d1, d2];
      const cubes = [c1, c2];

      d1.classList.add('dice-glow'); d2.classList.add('dice-glow');
      c1.classList.add('spinning'); c2.classList.add('spinning');

      let spinAngle = 0;
      const spinSpeed = fast ? 25 : 20;

      const faceTimer = setInterval(() => {
        spinAngle += spinSpeed;
        c1.style.transform = 'rotateX(' + (Math.sin(spinAngle * 0.07 + dirs[0].phase) * 720) + 'deg) rotateY(' + (Math.cos(spinAngle * 0.05 + dirs[0].phase) * 540) + 'deg)';
        c2.style.transform = 'rotateX(' + (Math.sin(spinAngle * 0.06 + dirs[1].phase) * 720) + 'deg) rotateY(' + (Math.cos(spinAngle * 0.08 + dirs[1].phase) * 540) + 'deg)';
      }, fast ? 30 : 40);

      let slowdownTimer = null;
      if (!fast) {
        slowdownTimer = setTimeout(() => {
          clearInterval(faceTimer);
          const t1 = setInterval(() => {
            spinAngle += 10;
            c1.style.transform = 'rotateX(' + (Math.sin(spinAngle * 0.04 + dirs[0].phase) * 360) + 'deg) rotateY(' + (Math.cos(spinAngle * 0.03 + dirs[0].phase) * 270) + 'deg)';
            c2.style.transform = 'rotateX(' + (Math.sin(spinAngle * 0.035 + dirs[1].phase) * 360) + 'deg) rotateY(' + (Math.cos(spinAngle * 0.045 + dirs[1].phase) * 270) + 'deg)';
          }, 100);
          setTimeout(() => {
            clearInterval(t1);
            const t2 = setInterval(() => {
              spinAngle += 5;
              c1.style.transform = 'rotateX(' + (Math.sin(spinAngle * 0.02 + dirs[0].phase) * 180) + 'deg) rotateY(' + (Math.cos(spinAngle * 0.015 + dirs[0].phase) * 135) + 'deg)';
              c2.style.transform = 'rotateX(' + (Math.sin(spinAngle * 0.018 + dirs[1].phase) * 180) + 'deg) rotateY(' + (Math.cos(spinAngle * 0.022 + dirs[1].phase) * 135) + 'deg)';
            }, 160);
            setTimeout(() => clearInterval(t2), 500);
          }, 400);
        }, 700);
      }

      function frame(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        if (t >= 1) {
          clearInterval(faceTimer);
          if (slowdownTimer) clearTimeout(slowdownTimer);
          c1.classList.remove('spinning'); c2.classList.remove('spinning');
          d1.style.transform = ''; d2.style.transform = '';
          resolve();
          return;
        }
        const easeOut = 1 - Math.pow(1 - t, 2.5);
        const gravScale = 0.3 + t * 0.7;
        for (let i = 0; i < 2; i++) {
          const el = els[i], d = dirs[i];
          const baseX = d.vx * easeOut * 0.15;
          const baseY = d.vy * easeOut * 0.15 + 300 * gravScale * Math.pow(t, 2);
          const shakeMag = (1 - t) * 12;
          const shakeX = Math.sin(elapsed * 0.06 + d.phase) * shakeMag;
          const shakeY = Math.cos(elapsed * 0.05 + d.phase * 1.3) * shakeMag;
          const wobble = Math.sin(elapsed * 0.03 + d.phase * 2) * (1 - t) * 30;
          let bounceY = 0;
          if (t > 0.45 && t < 0.8) {
            const bp = (t - 0.45) / 0.35;
            bounceY = Math.sin(bp * Math.PI * 3) * Math.max(0, (1 - bp)) * 25;
          }
          let scale = 1;
          if (t > 0.5 && t < 0.85) {
            const sp = (t - 0.5) / 0.35;
            scale += Math.sin(sp * Math.PI * 4) * Math.max(0, (1 - sp)) * 0.08;
          }
          el.style.transform = 'translate(' + (baseX + wobble + shakeX) + 'px, ' + (baseY + bounceY + shakeY) + 'px) scale(' + scale + ')';
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  },

  resetPlayer() {
    if (this.activePlayerIndex < 0) return;
    const p = this.players[this.activePlayerIndex];
    p.total = 0; p.succes = 0;
    this.els.total.textContent = '0'; this.els.succes.textContent = '0'; this.els.freq.textContent = '—';
    this.els.dice1.className = 'dice-box'; this.els.dice2.className = 'dice-box';
    this.els.dice1.style.transform = ''; this.els.dice2.style.transform = '';
    this.els.dice1.style.filter = ''; this.els.dice2.style.filter = '';
    this.els.labels.forEach(l => l.classList.remove('show'));
    setDiceFace('cube1', 1); setDiceFace('cube2', 1);
    this.els.result.innerHTML = '<span style="color:var(--text-muted);">Stats reinitialisees pour ' + esc(p.name) + '</span>';
    this.refresh();
  }
};

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// SCREEN SHAKE
// ============================================================
function screenShake() {
  const table = document.querySelector('.game-section');
  if (!table) return;
  table.classList.remove('shake');
  void table.offsetWidth;
  table.classList.add('shake');
}


// ============================================================
// FLOATING PARTICLES
// ============================================================
function createParticleField() {
  const existing = document.querySelector('.particle-field');
  if (existing) existing.remove();

  const field = document.createElement('div');
  field.className = 'particle-field';
  const colors = ['var(--purple)', 'var(--cyan)', 'var(--gold)', 'var(--green)'];

  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'particle-dot';
    const size = 2 + Math.random() * 3;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = Math.random() * 100 + '%';
    dot.style.background = colors[i % colors.length];
    dot.style.boxShadow = '0 0 ' + (size * 2) + 'px ' + colors[i % colors.length];
    dot.style.animationDuration = (15 + Math.random() * 20) + 's';
    dot.style.animationDelay = (Math.random() * 10) + 's';
    dot.style.animationName = 'float-particle';
    dot.style.opacity = '0.3';
    field.appendChild(dot);
  }
  document.body.appendChild(field);
}

// Add float-particle keyframes if they don't exist
(function() {
  if (!document.getElementById('particle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'particle-keyframes';
    style.textContent = `
      @keyframes float-particle {
        0%   { transform: translate(0, 0) scale(0); opacity: 0; }
        10%  { opacity: 0.6; }
        90%  { opacity: 0.4; }
        100% { transform: translate(var(--dx, 50px), var(--dy, -80px)) scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  // Set random direction for each dot
  document.querySelectorAll('.particle-dot').forEach(dot => {
    dot.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
    dot.style.setProperty('--dy', (Math.random() - 0.5) * 120 + 'px');
  });
})();


document.addEventListener('DOMContentLoaded', () => {
  createParticleField();
  Game.init();
});
