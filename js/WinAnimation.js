// ================================================================
// WinAnimation.js — Ultra Premium Smooth Smart v3
// Pure Canvas + Vanilla JavaScript
// ================================================================

class WinAnimation {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas #${canvasId} not found`);

    this.ctx = this.canvas.getContext('2d');

    const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth <= 768;
    const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 4;
    const perf = isLowEnd ? 0.72 : isMobile ? 0.88 : 1;

    this.options = {
      duration: options.duration || 15000,
      scoreDelay: options.scoreDelay ?? 5,
      scoreDuration: options.scoreDuration || 30,
      coinCount: options.coinCount || Math.round(240 * perf),
      maxCoins: options.maxCoins || Math.round(360 * perf),
      sparkleCount: options.sparkleCount || Math.round(85 * perf),
      shardCount: options.shardCount || Math.round(22 * perf),
      confettiCount: options.confettiCount || Math.round(42 * perf),
      quality: options.quality || 'auto',
      allowSkip: options.allowSkip ?? true,
      coinScale: options.coinScale || 1.2,
      coinFrontRatio: options.coinFrontRatio ?? 0.6,
      coinCols: options.coinCols || 4,
      coinRows: options.coinRows || 4,
      ...options
    };

    this.isMobile = isMobile;
    this.isLowEnd = isLowEnd;
    this.images = {};
    this.loaded = false;
    this.active = false;
    this.type = 'mega';
    this.timer = 0;
    this.targetScore = 1000000;
    this.displayScore = 0;
    this.flash = 0;
    this.shake = 0;
    this.ringRotation = 0;
    this.ringPulse = 0;
    this.onComplete = null;
    this.onStart = null;
    this._stopTimer = null;

    this.coinsBack = [];
    this.coinsFront = [];
    this.sparkles = [];
    this.shards = [];
    this.shockwaves = [];
    this.confetti = [];

    this.resize();
    addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointerdown', () => {
      if (this.active && this.options.allowSkip) {
        this.displayScore = this.targetScore;
        this.stop();
      }
    });

    this.loop();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const cssW = parent?.clientWidth || innerWidth;
    const cssH = parent?.clientHeight || innerHeight;

    this.dpr = 1;
    this.canvas.width = cssW;
    this.canvas.height = cssH;
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.w = cssW;
    this.h = cssH;
    this.cx = cssW / 2;
    this.cy = cssH / 2;
    this.baseScale = Math.max(.38, Math.min(1, Math.min(cssW / 900, cssH / 900) + .14));
  }

  getTheme() {
    const themes = {
      big: { winKey: 'winBig', a: '#00e86f', b: '#8dffc2', c: '#ffe66b', glow: 'rgba(0,232,111,.95)', score: 250000 },
      mega: { winKey: 'winMega', a: '#ff3f4b', b: '#ff9b57', c: '#ffe66b', glow: 'rgba(255,63,75,.95)', score: 1000000 },
      super: { winKey: 'winSuper', a: '#4b8dff', b: '#76efff', c: '#da7dff', glow: 'rgba(75,141,255,.95)', score: 5000000 }
    };
    return themes[this.type] || themes.big;
  }

  getDuration(type) {
    return { big: 7000, mega: 7000, super: 7000 }[type] || this.options.duration;
  }

  getParticleConfig(type) {
    const m = type === 'super' ? 1.25 : type === 'mega' ? 1 : .82;
    return {
      coins: Math.min(Math.round(this.options.coinCount * m), this.options.maxCoins),
      sparkles: Math.round(this.options.sparkleCount * m),
      shards: Math.round(this.options.shardCount * m),
      confetti: Math.round(this.options.confettiCount * m)
    };
  }

  getQualitySettings() {
    if (this.options.quality === 'low') return { layers: 1, ring: 18, bright: 22, blur: 10, rays: 12 };
    if (this.options.quality === 'high') return { layers: 3, ring: 36, bright: 42, blur: 28, rays: 24 };
    if (this.isMobile || this.isLowEnd) return { layers: 2, ring: 24, bright: 28, blur: 16, rays: 16 };
    return { layers: 3, ring: 36, bright: 42, blur: 26, rays: 22 };
  }

  loadImages(map) {
    return new Promise(resolve => {
      const entries = Object.entries(map);
      if (!entries.length) {
        this.loaded = true;
        resolve(this.images);
        return;
      }

      let done = 0;
      const finish = () => {
        done++;
        if (done === entries.length) {
          this.loaded = true;
          resolve(this.images);
        }
      };

      for (const [key, src] of entries) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { this.images[key] = img; finish(); };
        img.onerror = () => { console.warn('Failed image:', key, src); finish(); };
        img.src = src;
      }
    });
  }

  trigger(type = 'mega', score = null, options = {}) {
    if (this.active) this.stop(false);

    this.type = type;
    const theme = this.getTheme();
    const particle = this.getParticleConfig(type);
    const duration = options.duration ?? this.getDuration(type);

    this.active = true;
    this.timer = 0;
    this.targetScore = score ?? theme.score;
    this.displayScore = 0;
    this.flash = 1;
    this.shake = type === 'super' ? 18 : type === 'mega' ? 12 : 8;
    this.ringRotation = 0;
    this.ringPulse = 1;

    this.clearParticles();

    this.onStart = options.onStart || null;
    this.onComplete = options.onComplete || null;
    if (this.onStart) this.onStart(type, this.targetScore);

    for (let i = 0; i < particle.coins; i++) {
      const coin = new PremiumCoin(
        this.cx,
        this.cy,
        this.baseScale * this.options.coinScale,
        theme,
        this.w,
        this.h,
        this.options.coinCols,
        this.options.coinRows
      );
      (Math.random() < this.options.coinFrontRatio ? this.coinsFront : this.coinsBack).push(coin);
    }

    for (let i = 0; i < particle.sparkles; i++) this.sparkles.push(new PremiumSpark(this.cx, this.cy, theme));
    for (let i = 0; i < particle.shards; i++) this.shards.push(new LightShard(this.cx, this.cy, theme));

    this.shockwaves.push(new Shockwave(this.cx, this.cy, theme.a, 12));
    this.shockwaves.push(new Shockwave(this.cx, this.cy, theme.b, 8));

    for (let i = 0; i < particle.confetti; i++) this.confetti.push(new Confetti(this.cx, this.cy, theme));

    clearTimeout(this._stopTimer);
    this._stopTimer = setTimeout(() => this.stop(true), duration);
  }

  stop(runCallback = true) {
    if (!this.active && !this._stopTimer) return;

    this.active = false;
    this.displayScore = this.targetScore;
    clearTimeout(this._stopTimer);
    this._stopTimer = null;

    this.clearParticles();
    this.flash = 0;
    this.shake = 0;
    this.ringPulse = 0;

    const callback = this.onComplete;
    this.onStart = null;
    this.onComplete = null;

    this.ctx.clearRect(0, 0, this.w, this.h);
    if (runCallback && callback) callback(this.type, this.targetScore);
  }

  clearParticles() {
    this.coinsBack.length = 0;
    this.coinsFront.length = 0;
    this.sparkles.length = 0;
    this.shards.length = 0;
    this.shockwaves.length = 0;
    this.confetti.length = 0;
  }

  loop() {
    requestAnimationFrame(() => this.loop());

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    if (!this.active) return;

    this.timer++;
    const theme = this.getTheme();

    this.flash *= .89;
    this.shake *= .90;
    this.ringRotation += this.type === 'super' ? .012 : .009;
    this.ringPulse *= .965;

    const p = Math.min(
    Math.max((this.timer - this.options.scoreDelay) / this.options.scoreDuration, 0),
    1
);
this.displayScore = this.targetScore; 

    ctx.save();

    if (this.shake > .4) {
      ctx.translate((Math.random() - .5) * this.shake, (Math.random() - .5) * this.shake);
    }

    this.drawBackground(theme);
    this.drawRainbowCycle(theme);
    this.drawArray(this.shockwaves);
    this.drawArray(this.shards);
    this.drawArray(this.sparkles);
    this.drawArray(this.coinsBack, this.images.coins);
    this.drawArray(this.confetti);
    this.drawWinImage(theme);

    if (this.timer > this.options.scoreDelay) this.drawScoreBox(theme);

    this.drawArray(this.coinsFront, this.images.coins);
    ctx.restore();
    this.drawPostFX();
  }

  drawArray(arr, extra) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const item = arr[i];
      item.update();
      item.draw(this.ctx, extra);
      if (!item.active) arr.splice(i, 1);
    }
  }

  drawBackground(theme) {
    const ctx = this.ctx;
    const q = this.getQualitySettings();

    const g = ctx.createRadialGradient(this.cx, this.cy, 20, this.cx, this.cy, Math.max(this.w, this.h) * .8);
    g.addColorStop(0, '#202638');
    g.addColorStop(.32, '#0b1020');
    g.addColorStop(1, '#010208');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.rotate(this.ringRotation * .15);

    const len = Math.max(this.w, this.h) * .9;
    for (let i = 0; i < q.rays; i++) {
      const a = i / q.rays * Math.PI * 2;
      const rg = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
      rg.addColorStop(0, 'rgba(255,255,255,0)');
      rg.addColorStop(.28, hexAlpha(theme.a, .10));
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - .045) * len, Math.sin(a - .045) * len);
      ctx.lineTo(Math.cos(a + .045) * len, Math.sin(a + .045) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawRainbowCycle(theme) {
    const ctx = this.ctx;
    const q = this.getQualitySettings();
    const radius = Math.min(this.w, this.h) * .25;
    const ringWidth = Math.max(18, radius * .15);

    ctx.save();
    ctx.translate(this.cx, this.cy - 18 * this.baseScale);
    ctx.rotate(this.ringRotation);
    ctx.globalCompositeOperation = 'lighter';

    for (let layer = 0; layer < q.layers; layer++) {
      ctx.save();
      ctx.rotate(layer * .17);
      ctx.globalAlpha = .16 - layer * .035;
      ctx.lineWidth = ringWidth * (2.8 + layer);
      ctx.shadowBlur = q.blur + layer * 5;
      ctx.shadowColor = theme.b;

      for (let i = 0; i < q.ring; i++) {
        const a0 = i / q.ring * Math.PI * 2;
        const a1 = a0 + Math.PI * 2 / q.ring * .72;
        ctx.strokeStyle = `hsl(${(i * 15 + this.timer * 2.2 + layer * 35) % 360},100%,62%)`;
        ctx.beginPath();
        ctx.arc(0, 0, radius + layer * 12, a0, a1);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.globalAlpha = .92;
    ctx.lineWidth = ringWidth;
    ctx.shadowBlur = q.blur;

    for (let i = 0; i < q.bright; i++) {
      const a0 = i / q.bright * Math.PI * 2;
      const a1 = a0 + Math.PI * 2 / q.bright * .62;
      ctx.strokeStyle = `hsl(${(i * 12.8 + this.timer * 3.1) % 360},100%,67%)`;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(0, 0, radius, a0, a1);
      ctx.stroke();
    }

    ctx.globalAlpha = .42;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, radius - ringWidth * .72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawWinImage(theme) {
    const ctx = this.ctx;
    const img = this.images[theme.winKey];
    const t = this.timer;

    let scale;
    if (t < 26) scale = .18 + easeOutBack(t / 26) * 1.08;
    else if (t < 46) scale = 1.28 - easeOutQuad((t - 26) / 20) * .28;
    else scale = 1 + Math.sin(t * .055) * .018;

    const y = this.cy - 18 * this.baseScale;
    const finalScale = scale * this.baseScale * 1.38;

    ctx.save();
    ctx.translate(this.cx, y);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 220 * this.baseScale);
    glow.addColorStop(0, 'rgba(255,255,255,.16)');
    glow.addColorStop(.18, hexAlpha(theme.a, .24));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 220 * this.baseScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(finalScale, finalScale);
    ctx.shadowBlur = 42 * this.baseScale;
    ctx.shadowColor = theme.glow;

    if (img) {
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 88px Impact, Arial Black, sans-serif';
      const tg = ctx.createLinearGradient(-220, 0, 220, 0);
      tg.addColorStop(0, theme.b);
      tg.addColorStop(.45, '#fff');
      tg.addColorStop(.75, theme.c);
      tg.addColorStop(1, theme.a);
      ctx.fillStyle = tg;
      ctx.fillText(this.type.toUpperCase() + ' WIN', 0, 0);
    }

    ctx.restore();

    if (t > 48 && t < 112) this.drawWinShine(img, y, finalScale, (t - 48) / 64);
  }

  drawWinShine(img, y, scale, p) {
    const ctx = this.ctx;
    const width = img ? img.width * scale : 520 * this.baseScale;
    const height = img ? img.height * scale : 150 * this.baseScale;
    const x = -width / 2 + p * width * 1.45;

    ctx.save();
    ctx.translate(this.cx, y);
    ctx.beginPath();
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.clip();
    ctx.rotate(-.22);
    ctx.globalCompositeOperation = 'lighter';

    const sg = ctx.createLinearGradient(x - 38, -height / 2, x + 38, height / 2);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(.5, 'rgba(255,255,255,.95)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(x - 60, -height / 2, 120, height);
    ctx.restore();
  }

  drawScoreBox(theme) {
    const ctx = this.ctx;
    const img = this.images.scoreBox;
    const p = Math.min(Math.max((this.timer - this.options.scoreDelay) / 20, 0), 1);
    const scale = .72 + easeOutBack(p) * .28;
    const y = this.cy + 225 * this.baseScale;

    ctx.save();
    ctx.translate(this.cx, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = p;

    if (img) {
      const sw = img.width * this.baseScale * .72;
      const sh = img.height * this.baseScale * .72;
      ctx.shadowBlur = 18;
      ctx.shadowColor = theme.c;
      ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
    } else {
      const bw = 380 * this.baseScale;
      const bh = 86 * this.baseScale;
      roundedRect(ctx, -bw / 2, -bh / 2, bw, bh, 24 * this.baseScale);
      ctx.fillStyle = 'rgba(18,20,30,.88)';
      ctx.fill();
      ctx.strokeStyle = theme.c;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    const fontSize = 58 * this.baseScale;
    ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tg = ctx.createLinearGradient(-150, 0, 150, 0);
    tg.addColorStop(0, '#fff8d7');
    tg.addColorStop(.45, theme.c);
    tg.addColorStop(1, '#ff9d00');
    ctx.fillStyle = tg;
    ctx.shadowBlur = 16;
    ctx.shadowColor = theme.c;
    ctx.fillText(this.formatScore(this.displayScore), 0, 2);
    ctx.restore();
  }

  formatScore(value) {
    return Math.floor(value).toLocaleString('en-US');
  }

  drawPostFX() {
    const ctx = this.ctx;

    if (this.flash > .01) {
      ctx.fillStyle = `rgba(255,255,255,${this.flash * .42})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    const vg = ctx.createRadialGradient(
      this.cx, this.cy, Math.min(this.w, this.h) * .2,
      this.cx, this.cy, Math.max(this.w, this.h) * .76
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.52)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.w, this.h);
  }
}

class PremiumCoin {
  constructor(x, y, scale, theme, screenW, screenH, cols = 4, rows = 4) {
    this.x = x + (Math.random() - .5) * 180 * scale;
    this.y = y + (Math.random() - .5) * 120 * scale;

    const angle = Math.random() * Math.PI * 2;
    const speed = 16 + Math.random() * 32;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.gravity = 0.08 + Math.random() * 0.10;
    this.drag = 0.992;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.45;

    // Bigger + longer-lived coin
    this.size = (26 + Math.random() * 24) * scale;
    this.life = 1;
    this.decay = .0035 + Math.random() * .0045;
    this.active = true;

    this.theme = theme;
    this.screenW = screenW;
    this.screenH = screenH;
    this.cols = Math.max(1, cols);
    this.rows = Math.max(1, rows);

    this.frameX = Math.floor(Math.random() * this.cols);
    this.frameY = Math.floor(Math.random() * this.rows);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.rotation += this.rotSpeed;
    this.life -= this.decay;

    if (
      this.life <= 0 ||
      this.x < -160 || this.x > this.screenW + 160 ||
      this.y < -200 || this.y > this.screenH + 200
    ) this.active = false;
  }

draw(ctx, coinImg) {
  if (!this.active) return;

  const squash =
    Math.abs(Math.cos(this.rotation)) * .72 + .28;

  ctx.save();

  ctx.globalAlpha = Math.min(1, this.life * 1.6);

  ctx.translate(this.x, this.y);
  ctx.rotate(this.rotation * .18);
  ctx.scale(squash, 1);

  ctx.shadowBlur = 5;
  ctx.shadowColor = '#ffd84d';

  if (
    coinImg &&
    coinImg.complete &&
    coinImg.naturalWidth > 0
  ) {
   const frameW = coinImg.naturalWidth / this.cols;
const frameH = coinImg.naturalHeight / this.rows;

const sx = this.frameX * frameW;
const sy = this.frameY * frameH;

ctx.drawImage(
  coinImg,
  sx,
  sy,
  frameW,
  frameH,
  -this.size,
  -this.size,
  this.size * 2,
  this.size * 2
);
  } else {
    const g = ctx.createRadialGradient(
      -this.size * .3,
      -this.size * .3,
      0,
      0,
      0,
      this.size
    );

    g.addColorStop(0, '#ffffff');
    g.addColorStop(.2, '#fff7a8');
    g.addColorStop(.55, '#ffd84d');
    g.addColorStop(1, '#9a6200');

    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff2a0';
    ctx.stroke();
  }

  ctx.restore();
 }  
}
class PremiumSpark {
  constructor(x, y, theme) {
    const a = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 13;
    this.x = x; this.y = y;
    this.vx = Math.cos(a) * speed;
    this.vy = Math.sin(a) * speed;
    this.life = 1;
    this.decay = .012 + Math.random() * .018;
    this.size = 1 + Math.random() * 4;
    this.color = Math.random() < .5 ? theme.a : theme.b;
    this.active = true;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= .97;
    this.vy *= .97;
    this.life -= this.decay;
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class LightShard {
  constructor(x, y, theme) {
    this.x = x; this.y = y;
    this.a = Math.random() * Math.PI * 2;
    this.speed = 7 + Math.random() * 14;
    this.len = 40 + Math.random() * 120;
    this.life = 1;
    this.decay = .015 + Math.random() * .02;
    this.color = Math.random() < .5 ? theme.a : theme.b;
    this.active = true;
  }
  update() {
    this.x += Math.cos(this.a) * this.speed;
    this.y += Math.sin(this.a) * this.speed;
    this.speed *= .985;
    this.life -= this.decay;
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    const ex = this.x + Math.cos(this.a) * this.len;
    const ey = this.y + Math.sin(this.a) * this.len;
    const g = ctx.createLinearGradient(this.x, this.y, ex, ey);
    g.addColorStop(0, '#fff');
    g.addColorStop(.28, this.color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2 + this.life * 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();
  }
}

class Shockwave {
  constructor(x, y, color, speed) {
    this.x = x; this.y = y;
    this.r = 8;
    this.speed = speed;
    this.life = 1;
    this.active = true;
    this.color = color;
  }
  update() {
    this.r += this.speed;
    this.life -= .022;
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life * .88);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 10 * this.life + 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

class Confetti {
  constructor(x, y, theme) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - .5) * 12;
    this.vy = -4 - Math.random() * 12;
    this.gravity = .16;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - .5) * .25;
    this.life = 1;
    this.decay = .006 + Math.random() * .008;
    this.color = [theme.a, theme.b, theme.c, '#fff'][Math.floor(Math.random() * 4)];
    this.active = true;
  }
  update() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.life -= this.decay;
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.color;
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutQuad(t) {
  return t * (2 - t);
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function hexAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

window.WinAnimation = WinAnimation;

