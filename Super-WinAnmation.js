    // ============================================
// WinAnimation.js - Casino Win Effect Module v18
// ============================================

class WinAnimation {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas #${canvasId} not found!`);
    }
    this.ctx = this.canvas.getContext('2d');
    
    this.config = {
      winDuration: options.winDuration || 1000,
      maxCoins: options.maxCoins || 500,
      maxSparkles: options.maxSparkles || 150,
      coinGravity: options.coinGravity || 0.18,
      coinSpawnRate: options.coinSpawnRate || 5,
      sparkleSpawnRate: options.sparkleSpawnRate || 6,
      scoreCountDuration: options.scoreCountDuration || 1800,
      scoreBoxDelay: options.scoreBoxDelay || 150,
      riseDuration: options.riseDuration || 60,
      ...options
    };
    
    this.winActive = false;
    this.winTimer = 0;
    this.winType = 'big';
    this.score = 0;
    this.targetScore = 0;
    this.scoreDisplay = 0;
    
    this.images = {};
    this.loaded = false;
    
    this.coins = [];
    this.sparkles = [];
    this.bgStripes = [];
    
    this.onComplete = null;
    this.onStart = null;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.loop();
  }
  
  getWinConfig() {
    const configs = {
      big: {
        bgColor: { r: 20, g: 20, b: 20 },
        bgColor2: { r: 5, g: 5, b: 5 },
        stripeColor: 'rgba(255, 255, 255, 0.03)',
        rayColor: { r: 0, g: 220, b: 60 },
        textGlow: 'rgba(0, 220, 60, 0.8)',
        imgKey: 'winBig'
      },
      mega: {
        bgColor: { r: 20, g: 20, b: 20 },
        bgColor2: { r: 5, g: 5, b: 5 },
        stripeColor: 'rgba(255, 255, 255, 0.03)',
        rayColor: { r: 255, g: 40, b: 40 },
        textGlow: 'rgba(255, 0, 0, 0.8)',
        imgKey: 'winMega'
      },
      super: {
        bgColor: { r: 20, g: 20, b: 20 },
        bgColor2: { r: 5, g: 5, b: 5 },
        stripeColor: 'rgba(255, 255, 255, 0.03)',
        rayColor: { r: 40, g: 130, b: 255 },
        textGlow: 'rgba(0, 90, 255, 0.8)',
        imgKey: 'winSuper'
      }
    };
    return configs[this.winType] || configs.big;
  }
  
  resize() {
    this.canvas.width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.parentElement?.clientHeight || window.innerHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;
    
    const minDim = Math.min(this.canvas.width, this.canvas.height);
    this.isLandscape = this.canvas.width > this.canvas.height;
    
    if (this.isLandscape) {
      this.baseScale = Math.min(1, this.canvas.height / 800);
    } else {
      this.baseScale = Math.min(1, this.canvas.width / 500);
    }
    this.baseScale = Math.max(this.baseScale, 0.35);
    
    this.createBgStripes();
  }
  
  createBgStripes() {
    this.bgStripes = [];
    const stripeCount = 8;
    for (let i = 0; i < stripeCount; i++) {
      this.bgStripes.push({
        offset: (i / stripeCount) * Math.PI * 2,
        speed: 0.08 + Math.random() * 0.1
      });
    }
  }
  
  loadImages(imageMap) {
    return new Promise((resolve) => {
      let loaded = 0;
      const total = Object.keys(imageMap).length;
      
      if (total === 0) {
        this.loaded = true;
        resolve(this.images);
        return;
      }
      
      for (const [key, src] of Object.entries(imageMap)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          this.images[key] = img;
          loaded++;
          console.log(`WinAnimation: Loaded ${key}`);
          if (loaded === total) {
            this.loaded = true;
            resolve(this.images);
          }
        };
        
        img.onerror = () => {
          console.warn(`WinAnimation: Failed to load ${key}: ${src}`);
          loaded++;
          if (loaded === total) {
            this.loaded = true;
            resolve(this.images);
          }
        };
        
        img.src = src;
      }
    });
  }
  
  trigger(type, score, options = {}) {
    if (!this.loaded) {
      console.warn('WinAnimation: Images not loaded yet!');
      return;
    }
    
    this.winActive = true;
    this.winTimer = 0;
    this.winType = type;
    this.targetScore = score;
    this.scoreDisplay = 0;
    
    this.coins = [];
    this.sparkles = [];
    
    const duration = options.duration || this.config.winDuration;
    this.config.winDuration = duration;
    
    this.onComplete = options.onComplete || null;
    this.onStart = options.onStart || null;
    
    if (this.onStart) this.onStart(type, score);
    
    const burstCount = type === 'super' ? 180 : type === 'mega' ? 160 : 150;
    for (let i = 0; i < burstCount; i++) {
      this.coins.push(new CoinParticle(
        this.cx + (Math.random() - 0.5) * 250 * this.baseScale,
        this.cy - 80 * this.baseScale,
        this.config.coinGravity,
        this.baseScale
      ));
    }
    
    setTimeout(() => {
      this.stop();
    }, (duration / 60) * 1000);
  }
  
  stop() {
    this.winActive = false;
    this.coins = [];
    this.sparkles = [];
    if (this.onComplete) {
      this.onComplete(this.winType, this.scoreDisplay);
    }
  }
  
  isActive() {
    return this.winActive;
  }
  
  loop() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    if (this.winActive) {
      this.winTimer++;
      const cfg = this.getWinConfig();
      
      const riseProgress = Math.min(this.winTimer / this.config.riseDuration, 1);
      const riseEase = 1 - Math.pow(1 - riseProgress, 3);
      const riseOffset = (1 - riseEase) * 300 * this.baseScale;
      
      const scoreStartTime = this.config.scoreBoxDelay;
      if (this.winTimer > scoreStartTime && this.scoreDisplay < this.targetScore) {
        const scoreProgress = Math.min((this.winTimer - scoreStartTime) / this.config.scoreCountDuration, 1);
        const easeOut = 1 - Math.pow(1 - scoreProgress, 2);
        this.scoreDisplay = Math.floor(this.targetScore * easeOut);
        if (this.scoreDisplay > this.targetScore) {
          this.scoreDisplay = this.targetScore;
        }
      }
      
      const coinEndTime = this.config.winDuration - 600;
      if (this.winTimer < coinEndTime && 
          this.coins.length < this.config.maxCoins && 
          this.winTimer % this.config.coinSpawnRate === 0) {
        this.coins.push(new CoinParticle(
          this.cx + (Math.random() - 0.5) * 450 * this.baseScale,
          this.cy - 120 * this.baseScale,
          this.config.coinGravity,
          this.baseScale
        ));
      }
      
      if (this.sparkles.length < this.config.maxSparkles && 
          this.winTimer % this.config.sparkleSpawnRate === 0) {
        this.sparkles.push(new Sparkle(
          this.cx + (Math.random() - 0.5) * 550 * this.baseScale,
          this.cy + (Math.random() - 0.5) * 400 * this.baseScale,
          cfg,
          this.baseScale
        ));
      }
      
      this.drawOverlay(w, h);
      this.drawBackground(w, h, cfg);
      this.drawLightRays(w, h, cfg);
      
      // Draw win text image (stars already included in image)
      this.drawWinImage(cfg, riseOffset);
      
      this.sparkles = this.sparkles.filter(s => {
        s.update();
        s.draw(ctx);
        return s.active;
      });
      
      this.coins = this.coins.filter(coin => {
        coin.update();
        coin.draw(ctx, this.images.coins);
        return coin.active;
      });
      
      if (this.winTimer > this.config.scoreBoxDelay) {
        this.drawScore();
      }
      
      if (this.winTimer >= this.config.winDuration) {
        this.stop();
      }
    }
    
    requestAnimationFrame(() => this.loop());
  }
  
  drawOverlay(w, h) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  
  drawBackground(w, h, cfg) {
    const ctx = this.ctx;
    ctx.save();
    
    const gradient = ctx.createRadialGradient(
      this.cx, this.cy, 0,
      this.cx, this.cy, Math.max(w, h) * 0.8
    );
    gradient.addColorStop(0, 'rgba(40, 40, 40, 0.4)');
    gradient.addColorStop(0.5, 'rgba(15, 15, 15, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    const time = Date.now() * 0.0001;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2 * this.baseScale;
    
    for (let i = 0; i < this.bgStripes.length; i++) {
      const stripe = this.bgStripes[i];
      const angle = stripe.offset + time * stripe.speed;
      
      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.rotate(angle);
      
      const maxDist = Math.max(w, h);
      ctx.beginPath();
      ctx.moveTo(-maxDist, -30 * this.baseScale);
      ctx.lineTo(maxDist, -30 * this.baseScale);
      ctx.moveTo(-maxDist, 30 * this.baseScale);
      ctx.lineTo(maxDist, 30 * this.baseScale);
      ctx.stroke();
      
      ctx.restore();
    }
    
    const glow = ctx.createRadialGradient(
      this.cx, this.cy, 0,
      this.cx, this.cy, 450 * this.baseScale
    );
    glow.addColorStop(0, 'rgba(60, 50, 30, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    
    ctx.restore();
  }
  
  drawLightRays(w, h, cfg) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.cx, this.cy);
    
    const time = Date.now() * 0.0003;
    const rayCount = this.winType === 'super' ? 12 : this.winType === 'mega' ? 10 : 8;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 / rayCount) * i + time;
      const rayGradient = ctx.createLinearGradient(
        0, 0,
        Math.cos(angle) * 900 * this.baseScale,
        Math.sin(angle) * 900 * this.baseScale
      );
      rayGradient.addColorStop(0, `rgba(${cfg.rayColor.r}, ${cfg.rayColor.g}, ${cfg.rayColor.b}, 0)`);
      rayGradient.addColorStop(0.4, `rgba(${cfg.rayColor.r}, ${cfg.rayColor.g}, ${cfg.rayColor.b}, 0.04)`);
      rayGradient.addColorStop(1, `rgba(${cfg.rayColor.r}, ${cfg.rayColor.g}, ${cfg.rayColor.b}, 0)`);
      
      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(angle - 0.08) * 900 * this.baseScale,
        Math.sin(angle - 0.08) * 900 * this.baseScale
      );
      ctx.lineTo(
        Math.cos(angle + 0.08) * 900 * this.baseScale,
        Math.sin(angle + 0.08) * 900 * this.baseScale
      );
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // ===== DRAW WIN IMAGE (stars included in image) =====
  drawWinImage(cfg, riseOffset = 0) {
    const ctx = this.ctx;
    const img = this.images[cfg.imgKey];
    
    if (!img) {
      this.drawFallbackText(cfg, riseOffset);
      return;
    }
    
    let animScale = 1;
    if (this.winTimer < 200) {
      const t = this.winTimer / 200;
      animScale = 0.05 + t * t * 1.15;
      if (animScale > 1.2) animScale = 1.2;
    } else if (this.winTimer < 120) {
      const t = (this.winTimer - 60) / 60;
      animScale = 1.2 - t * 0.2;
    } else {
      animScale = 1 + Math.sin(this.winTimer * 0.03) * 0.03;
    }
    
    const scale = animScale * this.baseScale;
    
    let shakeX = 0, shakeY = 0;
    if (this.winType !== 'big' && this.winTimer > 120 && this.winTimer < 200) {
      shakeX = Math.sin(this.winTimer * 0.3) * 2 * this.baseScale;
      shakeY = Math.cos(this.winTimer * 0.2) * 1.5 * this.baseScale;
    }
    
    const winTextY = this.cy - 50 * this.baseScale + riseOffset;
    
    ctx.save();
    ctx.translate(this.cx + shakeX, winTextY + shakeY);
    ctx.scale(scale, scale);
    
    const glowIntensity = 50 + Math.sin(this.winTimer * 0.05) * 15;
    ctx.shadowBlur = glowIntensity * this.baseScale;
    ctx.shadowColor = cfg.textGlow;
    
    // Draw win text image (stars already included in the image!)
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    
    ctx.restore();
  }
  
  drawFallbackText(cfg, riseOffset = 0) {
    const ctx = this.ctx;
    const text = this.winType === 'super' ? 'SUPER WIN' : this.winType === 'mega' ? 'MEGA WIN' : 'BIG WIN';
    
    let animScale = 1;
    if (this.winTimer < 100) {
      const t = this.winTimer / 100;
      animScale = 0.05 + t * t * 1.15;
    } else if (this.winTimer < 200) {
      const t = (this.winTimer - 200) / 200;
      animScale = 1.2 - t * 0.2;
    } else {
      animScale = 1 + Math.sin(this.winTimer * 0.03) * 0.03;
    }
    
    const scale = animScale * this.baseScale;
    const fontSize = 100 * scale;
    
    const winTextY = this.cy - 50 * this.baseScale + riseOffset;
    
    ctx.save();
    ctx.translate(this.cx, winTextY);
    ctx.scale(scale, scale);
    
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const glowIntensity = 40 + Math.sin(this.winTimer * 0.05) * 10;
    ctx.shadowBlur = glowIntensity * this.baseScale;
    ctx.shadowColor = cfg.textGlow;
    ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
    ctx.fillText(text, 0, 0);
    
    ctx.restore();
  }
  
  drawScore() {
    const ctx = this.ctx;
    const frame = this.images.scoreBox;
    
    const boxScale = 0.5;
    const scoreBoxY = this.cy + 350 * this.baseScale;
    
    ctx.save();
    ctx.translate(this.cx, scoreBoxY);
    
    if (frame && frame.width > 0) {
      const frameW = frame.width * this.baseScale * boxScale * 1.3;
      const frameH = frame.height * this.baseScale * boxScale * 1.3;
      ctx.drawImage(frame, -frameW / 2, -frameH / 2, frameW, frameH);
    } else {
      const boxW = 550 * this.baseScale * boxScale;
      const boxH = 120 * this.baseScale * boxScale;
      
      ctx.fillStyle = 'rgba(40, 10, 10, 0.9)';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4 * this.baseScale;
      
      const r = 15 * this.baseScale;
      ctx.beginPath();
      ctx.moveTo(-boxW / 2 + r, -boxH / 2);
      ctx.lineTo(boxW / 2 - r, -boxH / 2);
      ctx.quadraticCurveTo(boxW / 2, -boxH / 2, boxW / 2, -boxH / 2 + r);
      ctx.lineTo(boxW / 2, boxH / 2 - r);
      ctx.quadraticCurveTo(boxW / 2, boxH / 2, boxW / 2 - r, boxH / 2);
      ctx.lineTo(-boxW / 2 + r, boxH / 2);
      ctx.quadraticCurveTo(-boxW / 2, boxH / 2, -boxW / 2, boxH / 2 - r);
      ctx.lineTo(-boxW / 2, -boxH / 2 + r);
      ctx.quadraticCurveTo(-boxW / 2, -boxH / 2, -boxW / 2 + r, -boxH / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    const fontSize = 90 * this.baseScale;
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const shimmer = Math.sin(this.winTimer * 0.08) * 0.3 + 0.7;
    ctx.shadowBlur = 20 * shimmer;
    ctx.shadowColor = '#FFD700';
    
    const textGradient = ctx.createLinearGradient(0, -30 * this.baseScale, 0, 30 * this.baseScale);
    textGradient.addColorStop(0, '#FFF8DC');
    textGradient.addColorStop(0.4, '#FFD700');
    textGradient.addColorStop(0.6, '#FFA500');
    textGradient.addColorStop(1, '#B8860B');
    ctx.fillStyle = textGradient;
    
    ctx.fillText(this.scoreDisplay.toLocaleString(), 0, 0);
    
    ctx.restore();
  }
}

// ============================================
// COIN PARTICLE
// ============================================

class CoinParticle {
  constructor(cx, cy, gravity, baseScale = 1) {
    this.x = cx + (Math.random() - 0.5) * 250 * baseScale;
    this.y = cy;
    this.vx = (Math.random() - 0.5) * 6 * baseScale;
    this.vy = -Math.random() * 12 * baseScale - 4;
    this.gravity = gravity;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
    this.scale = (Math.random() * 0.8 + 0.5) * baseScale;
    this.opacity = 1;
    this.life = 1;
    this.active = true;
    this.baseScale = baseScale;
  }
  
  update() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.life -= 0.008;
    this.opacity = Math.max(0, this.life);
    
    if (this.life <= 0 || this.y > window.innerHeight + 50) {
      this.active = false;
    }
  }
  
  draw(ctx, coinImg) {
    if (!this.active || !coinImg) return;
    
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    
    const coinW = (coinImg.width / 4) * this.baseScale;
    const coinH = (coinImg.height / 4) * this.baseScale;
    const sx = Math.floor(Math.random() * 3) * (coinImg.width / 4);
    const sy = Math.floor(Math.random() * 3) * (coinImg.height / 4);
    
    ctx.drawImage(coinImg, sx, sy, coinImg.width/4, coinImg.height/4, -coinW/2, -coinH/2, coinW, coinH);
    
    ctx.restore();
  }
}

// ============================================
// SPARKLE
// ============================================

class Sparkle {
  constructor(x, y, cfg, baseScale = 1) {
    this.x = x;
    this.y = y;
    this.size = (Math.random() * 5 + 3) * baseScale;
    this.maxLife = Math.random() * 180 + 120;
    this.life = this.maxLife;
    this.active = true;
    this.cfg = cfg;
    this.baseScale = baseScale;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.active = false;
  }
  
  draw(ctx) {
    if (!this.active) return;
    
    const progress = this.life / this.maxLife;
    const alpha = Math.sin(progress * Math.PI);
    const size = this.size * (0.3 + progress * 0.7);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 12 * this.baseScale;
    ctx.shadowColor = this.cfg.starGlow;
    ctx.fillStyle = '#FFFFFF';
    
    ctx.beginPath();
    const spikes = 4;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? size : size * 0.25;
      const a = (Math.PI * i) / spikes - Math.PI / 2;
      const px = this.x + Math.cos(a) * r;
      const py = this.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WinAnimation;
}
