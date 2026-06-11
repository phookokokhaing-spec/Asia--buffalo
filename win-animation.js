(function(global) {
    'use strict';

    console.log('%c🎆 WinAnimation Professional v3.1 - Ultimate Visual Edition (with Number Animation)', 'color: #ffd700; font-size: 14px; font-weight: bold;');

    // ============================================
    // CONFIGURATION & CONSTANTS
    // ============================================
    const CONFIG = {
        PARTICLE_MULTIPLIER: 1.0,
        RAINBOW_MODE: true,
        RAINBOW_SPEED: 2,
        
        PARTICLES: {
            STARS_BURST: 120,
            STARS_SIDE: 60,
            STARS_BOTTOM: 70,
            STARS_FINAL: 40,
            SPARKS_BURST: 200,
            SPARKS_SIDE: 100,
            SPARKS_BOTTOM: 120,
            SPARKS_FINAL: 60,
            RAYS_MAIN: 40,
            RAYS_SIDE: 20,
            RAYS_FINAL: 36,
            BACKGROUND_STARS: 150,
            CONFETTI: 80,
            DUST: 100
        },

        GRAVITY: {
            STARS: 0.12,
            SPARKS: 0.18,
            CONFETTI: 0.2
        },
        FRICTION: {
            STARS: 0.985,
            SPARKS: 0.965,
            CONFETTI: 0.98
        },

        SHAKE: {
            INITIAL: 8,
            SIDE: 5,
            BOTTOM: 4,
            FINAL: 6,
            DECAY: 0.94
        },

        COLORS: {
            GOLD: { inner: '#ffff99', mid: '#ffd700', outer: '#ff8c00', glow: '#ffff00' },
            CYAN: { inner: '#00ffff', mid: '#00d4ff', outer: '#0088ff', glow: '#00ffff' }
        },

        TIMING: {
            PHASE_1: 0, PHASE_2: 1.0, PHASE_3: 1.3, PHASE_4: 1.8,
            PHASE_5_START: 1.4, PHASE_6: 2.5, EXIT: 4.5
        },

        DURATION: {
            WIN_TEXT: 0.9, AMOUNT_TEXT: 0.8, SUB_TEXT: 0.6,
            PULSE_WIN: 0.5, PULSE_AMOUNT: 0.4, EXIT: 0.5,
            NUMBER_ANIMATION: 800  // ဂဏန်းတိုးကြာချိန် (ms)
        }
    };

    // Mobile detection
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    CONFIG.PARTICLE_MULTIPLIER = isMobile ? 0.4 : 1.0;

    // DOM Elements
    const DOM = { container: null, canvas: null, ctx: null, winText: null, amountText: null, subText: null };
    const State = { W: 0, H: 0, animationId: null, isAnimating: false, frameCount: 0, screenShakeIntensity: 0, onCompleteCallback: null, rainbowHue: 0 };

    // Particle Systems (Z-index layered)
    const Particles = {
        backgroundStars: [],   // layer 0 (deepest)
        dust: [],              // layer 1
        shockwaves: [],        // layer 2
        rays: [],              // layer 3
        confetti: [],          // layer 4
        radialBursts: [],      // layer 5
        sparks: [],            // layer 6
        stars: [],             // layer 7
        foreground: []         // layer 8 (top)
    };

    // ============================================
    // UTILITIES
    // ============================================
    const Utils = {
        random: (min, max) => Math.random() * (max - min) + min,
        randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
        degToRad: (deg) => deg * Math.PI / 180,
        
        // Format number with commas
        formatNumber: (num) => num.toLocaleString()
    };

    // ============================================
    // 🔥 NUMBER ANIMATION UTILITY (NEW)
    // ============================================
    function animateNumber(element, start, end, duration = 800, onComplete = null) {
        if (!element) return;
        
        const startVal = start;
        const endVal = end;
        const steps = 40;
        const stepTime = duration / steps;
        const increment = (endVal - startVal) / steps;
        
        let current = startVal;
        let step = 0;
        
        if (element._animInterval) clearInterval(element._animInterval);
        
        element._animInterval = setInterval(() => {
            step++;
            current += increment;
            
            if (step >= steps) {
                element.textContent = '$' + Utils.formatNumber(Math.floor(endVal));
                clearInterval(element._animInterval);
                element._animInterval = null;
                if (onComplete) onComplete();
            } else {
                element.textContent = '$' + Utils.formatNumber(Math.floor(current));
            }
        }, stepTime);
    }

    // ============================================
    // FEATURE 10: RAINBOW COLOR FUNCTION
    // ============================================
    function getRainbowColor(offset = 0) {
        if (!CONFIG.RAINBOW_MODE) return CONFIG.COLORS.GOLD;
        const hue = (State.rainbowHue + offset) % 360;
        return {
            inner: `hsl(${hue}, 100%, 70%)`,
            mid: `hsl(${hue}, 100%, 60%)`,
            outer: `hsl(${hue}, 100%, 50%)`,
            glow: `hsl(${hue}, 100%, 65%)`
        };
    }

    // ============================================
    // FEATURE 1: STAR WITH TRAIL (Motion Blur)
    // ============================================
    class Star {
        constructor(x, y, vx, vy) {
            this.x = x; this.y = y; this.vx = vx; this.vy = vy;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.6;
            this.life = 1;
            this.decay = 0.008 + Math.random() * 0.012;
            this.size = 12 + Math.random() * 16;
            this.type = Math.floor(Math.random() * 2);
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.05 + Math.random() * 0.1;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.08 + Math.random() * 0.15;
            // Trail
            this.prevX = x; this.prevY = y;
        }

        update() {
            this.prevX = this.x; this.prevY = this.y;
            this.x += this.vx; this.y += this.vy;
            this.vy += CONFIG.GRAVITY.STARS;
            this.vx *= CONFIG.FRICTION.STARS;
            this.rotation += this.rotSpeed;
            this.wobble += this.wobbleSpeed;
            this.pulse += this.pulseSpeed;
            this.life -= this.decay;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            
            // Motion blur trail
            ctx.globalAlpha = this.life * 0.3;
            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = getRainbowColor(this.type * 180).glow;
            ctx.lineWidth = this.size * 1.5;
            ctx.stroke();

            ctx.globalAlpha = this.life;
            ctx.translate(this.x + Math.sin(this.wobble) * 4, this.y);
            ctx.rotate(this.rotation);

            const pulseFactor = 0.8 + Math.sin(this.pulse) * 0.3;
            const finalSize = this.size * pulseFactor;

            const points = 5;
            const outerRadius = finalSize;
            const innerRadius = finalSize * 0.4;
            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            const colors = getRainbowColor(this.type * 180);
            const grad = ctx.createRadialGradient(-4, -4, 0, 0, 0, finalSize);
            grad.addColorStop(0, colors.inner);
            grad.addColorStop(0.5, colors.mid);
            grad.addColorStop(1, colors.outer);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.globalAlpha = this.life * 0.6;
            ctx.strokeStyle = colors.glow;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    }

    // ============================================
    // FEATURE 3: CONFETTI
    // ============================================
    class Confetti {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 150;
            this.y = y + (Math.random() - 0.5) * 100;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = Math.random() * -10 - 5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.2;
            this.life = 1;
            this.decay = 0.008 + Math.random() * 0.015;
            this.size = 5 + Math.random() * 8;
            this.hue = Math.random() * 360;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += CONFIG.GRAVITY.CONFETTI;
            this.vx *= CONFIG.FRICTION.CONFETTI;
            this.rotation += this.rotSpeed;
            this.life -= this.decay;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.8;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    // ============================================
    // FEATURE 4: GOLDEN DUST
    // ============================================
    class GoldenDust {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 300;
            this.y = y + (Math.random() - 0.5) * 250;
            this.life = 1;
            this.decay = 0.01 + Math.random() * 0.02;
            this.size = 1 + Math.random() * 3;
            this.twinkle = Math.random() * Math.PI * 2;
        }
        update() {
            this.life -= this.decay;
            this.twinkle += 0.1;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            const intensity = 0.5 + Math.sin(this.twinkle) * 0.5;
            ctx.globalAlpha = this.life * intensity * 0.7;
            ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + intensity * 0.3})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============================================
    // FEATURE 7: RIPPLE WAVE
    // ============================================
    class RippleWave {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            this.radius = 10;
            this.maxRadius = 500;
            this.life = 1;
            this.decay = 0.02;
            this.color = color || `rgba(255, 215, 0, 0.8)`;
            this.width = 5;
        }
        update() {
            this.radius += 15;
            this.life -= this.decay;
            this.width = Math.max(1, this.width * 0.95);
        }
        draw(ctx) {
            if (this.life <= 0 || this.radius > this.maxRadius) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.6;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ============================================
    // FEATURE 2: LENS FLARE
    // ============================================
    class LensFlare {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.life = 1;
            this.decay = 0.025;
        }
        update() {
            this.life -= this.decay;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.4;
            for (let i = 1; i <= 3; i++) {
                const radius = 60 * i;
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
                grad.addColorStop(0, `rgba(255, 215, 0, ${0.3 / i})`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // ============================================
    // FEATURE 8: BACKGROUND STAR (twinkling)
    // ============================================
    class BackgroundStar {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = 0.5 + Math.random() * 2;
            this.pulse = Math.random() * Math.PI * 2;
            this.speed = 0.02 + Math.random() * 0.04;
            this.intensity = 0.3 + Math.random() * 0.5;
        }
        update() { this.pulse += this.speed; }
        draw(ctx) {
            const alpha = this.intensity * (0.3 + Math.sin(this.pulse) * 0.5);
            ctx.fillStyle = `rgba(200, 220, 255, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ============================================
    // Spark, LightRay, RadialBurst, Shockwave (Enhanced)
    // ============================================
    class Spark {
        constructor(x, y, speed) {
            const angle = Math.random() * Math.PI * 2;
            const moveSpeed = speed || (4 + Math.random() * 12);
            this.x = x; this.y = y;
            this.vx = Math.cos(angle) * moveSpeed;
            this.vy = Math.sin(angle) * moveSpeed;
            this.life = 1;
            this.decay = 0.012 + Math.random() * 0.018;
            this.size = 1.5 + Math.random() * 6;
            this.hue = Math.random() * 360;
            // Trail
            this.prevX = x; this.prevY = y;
        }
        update() {
            this.prevX = this.x; this.prevY = this.y;
            this.x += this.vx;
            this.y += this.vy;
            this.vy += CONFIG.GRAVITY.SPARKS;
            this.vx *= CONFIG.FRICTION.SPARKS;
            this.life -= this.decay;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            // Motion trail for sparks
            ctx.globalAlpha = this.life * 0.3;
            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 60%)`;
            ctx.lineWidth = this.size * 2;
            ctx.stroke();

            ctx.globalAlpha = this.life;
            ctx.fillStyle = `hsl(${this.hue}, 100%, 65%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class LightRay {
        constructor(centerX, centerY, angle) {
            this.centerX = centerX; this.centerY = centerY; this.angle = angle;
            this.length = 250 + Math.random() * 200;
            this.width = 5 + Math.random() * 8;
            this.life = 1;
            this.decay = 0.014 + Math.random() * 0.020;
            this.hue = (State.rainbowHue + Math.random() * 60) % 360;
            this.pulse = Math.random() * Math.PI * 2;
            this.expandRate = 1.02 + Math.random() * 0.08;
        }
        update() {
            this.life -= this.decay;
            this.pulse += 0.12;
            this.length *= this.expandRate;
        }
        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            const pulseFactor = 0.8 + Math.sin(this.pulse) * 0.3;
            const x1 = this.centerX + Math.cos(this.angle) * 15;
            const y1 = this.centerY + Math.sin(this.angle) * 15;
            const x2 = this.centerX + Math.cos(this.angle) * this.length;
            const y2 = this.centerY + Math.sin(this.angle) * this.length;

            ctx.globalAlpha = this.life * 0.15;
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 70%)`;
            ctx.lineWidth = this.width * 6;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

            ctx.globalAlpha = this.life * 0.25;
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 65%)`;
            ctx.lineWidth = this.width * 3;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `hsl(${this.hue}, 100%, 90%)`);
            grad.addColorStop(0.7, `hsl(${this.hue}, 100%, 60%)`);
            ctx.globalAlpha = this.life * 0.9 * pulseFactor;
            ctx.strokeStyle = grad;
            ctx.lineWidth = this.width;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            ctx.restore();
        }
    }

    class RadialBurst {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.life = 1;
            this.decay = 0.02;
            this.expansion = 0;
            this.maxExpansion = 300;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        }
        update() {
            this.life -= this.decay;
            this.expansion += 8;
            this.rotation += this.rotationSpeed;
        }
        draw(ctx) {
            if (this.life <= 0 || this.expansion > this.maxExpansion) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.7;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            const count = 12;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const x = Math.cos(angle) * this.expansion;
                const y = Math.sin(angle) * this.expansion;
                ctx.strokeStyle = `hsl(${(State.rainbowHue + i * 30) % 360}, 100%, 60%)`;
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y); ctx.stroke();
            }
            ctx.restore();
        }
    }

    class Shockwave {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            this.radius = 10;
            this.maxRadius = 400 + Math.random() * 200;
            this.life = 1;
            this.decay = 0.015;
            this.color = color || `hsl(${State.rainbowHue}, 100%, 60%)`;
            this.width = 8 + Math.random() * 5;
        }
        update() {
            this.radius += 12;
            this.life -= this.decay;
        }
        draw(ctx) {
            if (this.life <= 0 || this.radius > this.maxRadius) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.8;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    }

    // ============================================
    // SPAWN FUNCTIONS
    // ============================================
    function spawnStarBurst(x, y, count) {
        const c = Math.floor(count * CONFIG.PARTICLE_MULTIPLIER);
        for (let i = 0; i < c; i++) {
            const angle = (i / c) * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            Particles.stars.push(new Star(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
    }

    function spawnSparkBurst(x, y, count) {
        const c = Math.floor(count * CONFIG.PARTICLE_MULTIPLIER);
        for (let i = 0; i < c; i++) Particles.sparks.push(new Spark(x, y));
    }

    function spawnConfetti(x, y, count) {
        const c = Math.floor((count || 40) * CONFIG.PARTICLE_MULTIPLIER);
        for (let i = 0; i < c; i++) Particles.confetti.push(new Confetti(x, y));
    }

    function spawnGoldenDust(x, y, count) {
        const c = Math.floor((count || 60) * CONFIG.PARTICLE_MULTIPLIER);
        for (let i = 0; i < c; i++) Particles.dust.push(new GoldenDust(x, y));
    }

    function spawnLensFlare(x, y) { Particles.foreground.push(new LensFlare(x, y)); }
    function spawnRipple(x, y, color) { Particles.shockwaves.push(new RippleWave(x, y, color)); }
    function spawnLightRays(x, y, count) {
        const c = Math.floor(count * CONFIG.PARTICLE_MULTIPLIER);
        for (let i = 0; i < c; i++) Particles.rays.push(new LightRay(x, y, (i / c) * Math.PI * 2));
    }
    function spawnShockwave(x, y, color) { Particles.shockwaves.push(new Shockwave(x, y, color)); }
    function spawnRadialBurst(x, y) { Particles.radialBursts.push(new RadialBurst(x, y)); }

    // ============================================
    // FEATURE 9: FIREWORK SHELL BURST (Multi-stage)
    // ============================================
    function spawnFireworkShell(x, y, stage = 1) {
        if (stage > 3) return;
        setTimeout(() => {
            if (!State.isAnimating) return;
            spawnStarBurst(x, y, 40);
            spawnSparkBurst(x, y, 60);
            spawnConfetti(x, y, 30);
            spawnGoldenDust(x, y, 40);
            spawnShockwave(x, y, `hsl(${State.rainbowHue}, 100%, 60%)`);
            spawnFireworkShell(x - 60, y - 40, stage + 1);
            spawnFireworkShell(x + 60, y - 40, stage + 1);
        }, stage * 120);
    }

    // ============================================
    // FEATURE 5 & 8: BACKGROUND DRAWING
    // ============================================
    function drawBackground(ctx) {
        // Animated gradient background (Feature 5)
        const time = Date.now() * 0.002;
        const hue1 = (200 + Math.sin(time) * 30) % 360;
        const hue2 = (260 + Math.cos(time * 0.7) * 40) % 360;
        const grad = ctx.createLinearGradient(0, 0, State.W, State.H);
        grad.addColorStop(0, `hsla(${hue1}, 70%, 10%, 0.95)`);
        grad.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2}, 60%, 15%, 0.95)`);
        grad.addColorStop(1, `hsla(${hue2}, 70%, 10%, 0.95)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, State.W, State.H);

        // Background stars (Feature 8)
        for (let star of Particles.backgroundStars) { star.update(); star.draw(ctx); }

        // Animated grid
        ctx.strokeStyle = `hsla(${State.rainbowHue}, 80%, 50%, 0.08)`;
        ctx.lineWidth = 1;
        const gridSize = 50;
        const offset = (State.frameCount * 0.3) % gridSize;
        for (let x = -offset; x < State.W; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, State.H); ctx.stroke();
        }
        for (let y = -offset; y < State.H; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(State.W, y); ctx.stroke();
        }
    }

    // ============================================
    // RESIZE
    // ============================================
    function resize() {
        State.W = DOM.canvas.width = window.innerWidth;
        State.H = DOM.canvas.height = window.innerHeight;
    }

    // ============================================
    // MAIN ANIMATION LOOP
    // ============================================
    function animate() {
        if (!State.isAnimating) return;
        State.frameCount++;
        if (CONFIG.RAINBOW_MODE) State.rainbowHue = (State.rainbowHue + CONFIG.RAINBOW_SPEED) % 360;

        // Screen shake
        if (State.screenShakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * State.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * State.screenShakeIntensity;
            DOM.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            State.screenShakeIntensity *= CONFIG.SHAKE.DECAY;
        } else DOM.canvas.style.transform = 'translate(0, 0)';

        drawBackground(DOM.ctx);

        // Draw all layers in Z-order
        const systems = [
            Particles.backgroundStars,
            Particles.dust,
            Particles.shockwaves,
            Particles.rays,
            Particles.confetti,
            Particles.radialBursts,
            Particles.sparks,
            Particles.stars,
            Particles.foreground
        ];

        for (const system of systems) {
            for (let i = system.length - 1; i >= 0; i--) {
                system[i].update();
                system[i].draw(DOM.ctx);
                if (system[i].life <= 0) system.splice(i, 1);
            }
        }

        const hasParticles = Particles.stars.length > 0 || Particles.sparks.length > 0 ||
                           Particles.rays.length > 0 || Particles.shockwaves.length > 0 ||
                           Particles.radialBursts.length > 0 || Particles.confetti.length > 0 ||
                           Particles.dust.length > 0 || Particles.foreground.length > 0 ||
                           State.screenShakeIntensity > 0.1;

        if (hasParticles) State.animationId = requestAnimationFrame(animate);
        else console.log('%c✅ Animation complete', 'color: #00ff00;');
    }

    // ============================================
    // INIT & PLAY
    // ============================================
    function init() {
        DOM.container = document.getElementById('win-animation-container');
        DOM.canvas = document.getElementById('animCanvas');
        DOM.ctx = DOM.canvas.getContext('2d', { alpha: true });
        DOM.winText = document.getElementById('win-text');
        DOM.amountText = document.getElementById('amount-text');
        DOM.subText = document.getElementById('sub-text');
        if (!DOM.container || !DOM.canvas) return false;
        resize();
        window.addEventListener('resize', resize);
        return true;
    }

    function resetParticles() {
        Particles.stars = []; Particles.sparks = []; Particles.rays = [];
        Particles.shockwaves = []; Particles.radialBursts = []; Particles.confetti = [];
        Particles.dust = []; Particles.foreground = [];
    }

    function playAnimation(type, amount, onComplete) {
        if (!DOM.ctx && !init()) return;
        if (State.isAnimating) cancelAnimationFrame(State.animationId);
        State.onCompleteCallback = onComplete || null;
        State.isAnimating = true;
        State.frameCount = 0;
        resetParticles();
        resize();
        DOM.container.classList.add('active');

        const typeText = type === 'big' ? 'BIG WIN' : type === 'super' ? 'SUPER WIN' : 'MEGA WIN';
        DOM.winText.textContent = typeText;
        
        // ===== 🔥 NUMBER ANIMATION (မူရင်းအတိုင်း တန်းမပြတော့ဘူး) =====
        // DOM.amountText.textContent = '$' + amount.toLocaleString();  // ← ဒါကို ဖျက်ပါ
        animateNumber(DOM.amountText, 0, amount, CONFIG.DURATION.NUMBER_ANIMATION);
        
        const centerX = State.W / 2;
        const centerY = State.H / 2;

        if (typeof gsap !== 'undefined') {
            gsap.set([DOM.winText, DOM.amountText, DOM.subText], { opacity: 0 });
            gsap.set(DOM.winText, { scale: 0, rotation: -180 });
            gsap.set(DOM.amountText, { scale: 0, rotation: 180 });
            gsap.set(DOM.subText, { y: 50 });
        }

        // Background stars
        Particles.backgroundStars = [];
        for (let i = 0; i < CONFIG.PARTICLES.BACKGROUND_STARS * CONFIG.PARTICLE_MULTIPLIER; i++)
            Particles.backgroundStars.push(new BackgroundStar(State.W, State.H));

        const tl = typeof gsap !== 'undefined' ? gsap.timeline() : null;

                // Phase 1
        // Animation စတာနဲ့ အရင်ဆုံး Particles တွေကို Spawn လုပ်မယ်
        spawnStarBurst(centerX, centerY, CONFIG.PARTICLES.STARS_BURST);
        spawnSparkBurst(centerX, centerY, CONFIG.PARTICLES.SPARKS_BURST);
        spawnLightRays(centerX, centerY, CONFIG.PARTICLES.RAYS_MAIN);
        spawnShockwave(centerX, centerY);
        spawnRadialBurst(centerX);
        spawnConfetti(centerX, centerY, CONFIG.PARTICLES.CONFETTI);
        spawnGoldenDust(centerX, centerY, CONFIG.PARTICLES.DUST);
        spawnLensFlare(centerX, centerY);
        spawnRipple(centerX, centerY);

        // Coin Animation ကို 0.5s နောက်ကျပြီးမှ စမယ် (Amount Text ပေါ်လာတဲ့အချိန်)
        setTimeout(() => {
            const rect = DOM.amountText.getBoundingClientRect();
            const sourceX = rect.left + rect.width / 2;
            const sourceY = rect.top + rect.height / 2;

            if (typeof animateWinCoins === 'function') {
                animateWinCoins(amount, null, document.getElementById('balanceAmount'), 'big-win', {x: sourceX, y: sourceY});
            }
        }, 500);

        // အောက်က animate(); တစ်ခုကိုသာ ထားပါ
        animate(); 


        if (tl) {
            tl.to(DOM.winText, { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.3,0.6)' }, 0.15);
            tl.to(DOM.amountText, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1.2,0.5)' }, 0.35);
            
            // Feature 6: Text Glow + Shadow Animation
            tl.to(DOM.winText, {
                textShadow: '0 0 30px gold, 0 0 60px orange, 0 0 90px #ff6600',
                duration: 0.3, repeat: 3, yoyo: true
            }, 2.0);
            tl.to(DOM.amountText, {
                textShadow: '0 0 20px cyan, 0 0 40px #00aaff',
                duration: 0.3, repeat: 2, yoyo: true
            }, 2.1);
            tl.to(DOM.subText, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.5)' }, 1.5);
            tl.to(DOM.winText, { scale: 1.15, duration: 0.5, ease: 'sine.inOut', repeat: 2, yoyo: true }, 1.4);
            tl.to(DOM.amountText, { scale: 1.12, duration: 0.4, ease: 'sine.inOut', repeat: 1, yoyo: true }, 2.0);
        }

        // Phase 2
        setTimeout(() => {
            State.screenShakeIntensity = CONFIG.SHAKE.SIDE;
            spawnStarBurst(centerX - 200, centerY - 150, CONFIG.PARTICLES.STARS_SIDE);
            spawnSparkBurst(centerX - 200, centerY - 150, CONFIG.PARTICLES.SPARKS_SIDE);
            spawnShockwave(centerX - 200, centerY - 150);
            spawnConfetti(centerX - 200, centerY - 150, 30);
        }, 1000);

        // Phase 3
        setTimeout(() => {
            State.screenShakeIntensity = CONFIG.SHAKE.SIDE;
            spawnStarBurst(centerX + 200, centerY - 150, CONFIG.PARTICLES.STARS_SIDE);
            spawnSparkBurst(centerX + 200, centerY - 150, CONFIG.PARTICLES.SPARKS_SIDE);
            spawnLightRays(centerX + 200, centerY - 150, CONFIG.PARTICLES.RAYS_SIDE);
            spawnShockwave(centerX + 200, centerY - 150);
            spawnConfetti(centerX + 200, centerY - 150, 30);
        }, 1300);

        // Phase 4
        setTimeout(() => {
            State.screenShakeIntensity = CONFIG.SHAKE.BOTTOM;
            spawnStarBurst(centerX, centerY + 150, CONFIG.PARTICLES.STARS_BOTTOM);
            spawnSparkBurst(centerX, centerY + 100, CONFIG.PARTICLES.SPARKS_BOTTOM);
            spawnRadialBurst(centerX, centerY + 150);
            spawnShockwave(centerX, centerY + 150);
            spawnGoldenDust(centerX, centerY + 100, 50);
        }, 1800);

        // Phase 6: Firework multi-stage (Feature 9)
        setTimeout(() => {
            State.screenShakeIntensity = CONFIG.SHAKE.FINAL;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                const x = centerX + Math.cos(angle) * 120;
                const y = centerY + Math.sin(angle) * 120;
                spawnStarBurst(x, y, CONFIG.PARTICLES.STARS_FINAL);
                spawnSparkBurst(x, y, CONFIG.PARTICLES.SPARKS_FINAL);
                spawnFireworkShell(x, y, 1);
            }
            spawnLightRays(centerX, centerY, CONFIG.PARTICLES.RAYS_FINAL);
            spawnShockwave(centerX, centerY);
            spawnLensFlare(centerX, centerY);
            spawnRipple(centerX, centerY);
        }, 2500);

        // Exit
        setTimeout(() => {
            if (tl) {
                tl.to([DOM.winText, DOM.amountText, DOM.subText], {
                    opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.in',
                    onComplete: () => {
                        State.isAnimating = false;
                        DOM.container.classList.remove('active');
                        cancelAnimationFrame(State.animationId);
                        DOM.canvas.style.transform = 'translate(0,0)';
                        if (State.onCompleteCallback) State.onCompleteCallback();
                    }
                });
            } else {
                setTimeout(() => {
                    State.isAnimating = false;
                    DOM.container.classList.remove('active');
                    if (State.onCompleteCallback) State.onCompleteCallback();
                }, 500);
            }
        }, 4500);
    }

    // Public API
    const WinAnimation = {
        mega: (amount, onComplete) => playAnimation('mega', amount, onComplete),
        big: (amount, onComplete) => playAnimation('big', amount, onComplete),
        super: (amount, onComplete) => playAnimation('super', amount, onComplete),
        clear: () => {
            State.isAnimating = false;
            DOM.container?.classList.remove('active');
            cancelAnimationFrame(State.animationId);
            if (typeof gsap !== 'undefined') gsap.killTweensOf([DOM.winText, DOM.amountText, DOM.subText]);
            DOM.canvas && (DOM.canvas.style.transform = 'translate(0,0)');
        },
        isPlaying: () => State.isAnimating,
        setRainbowMode: (enabled) => { CONFIG.RAINBOW_MODE = enabled; },
        init: init
    };

    global.WinAnimation = WinAnimation;
    console.log('%c✅ WinAnimation v3.1 Ultimate Visual Edition ready! (with Number Animation)', 'color: #ffd700; font-size: 14px;');
    console.log('%c🔢 Number animation: 0 → amount in ' + CONFIG.DURATION.NUMBER_ANIMATION + 'ms', 'color: #00ff00;');
    console.log('%c🎨 Features: Trails | Confetti | Dust | Lens Flare | Ripple | Rainbow | Fireworks', 'color: #00ff00;');
})(window);
