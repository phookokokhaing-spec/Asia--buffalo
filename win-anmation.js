(function(global) {
    'use strict';
    
    console.log('🎰 Casino WinAnimation loading...');
    
    // Container and elements
    const container = document.getElementById('win-animation-container');
    const canvas = document.getElementById('animCanvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    const winText = document.getElementById('win-text');
    const amountText = document.getElementById('amount-text');
    const subText = document.getElementById('sub-text');
    
    let W, H;
    let animationId = null;
    let isAnimating = false;
    let frameCount = 0;
    let screenShakeIntensity = 0;
    
    // Particle arrays
    let stars = [];
    let sparks = [];
    let rays = [];
    let backgroundStars = [];
    let shockwaves = [];
    let radialBursts = [];
    
    // Resize handler
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    
    // ========== PARTICLE CLASSES ==========
    
    // 5-pointed golden/cyan star
    class Star {
        constructor(x, y, vx, vy) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.6;
            this.life = 1;
            this.decay = 0.008 + Math.random() * 0.012;
            this.size = 12 + Math.random() * 16;
            this.type = Math.floor(Math.random() * 2); // 0 = golden, 1 = cyan
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.05 + Math.random() * 0.1;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.08 + Math.random() * 0.15;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.12;
            this.vx *= 0.985;
            this.rotation += this.rotSpeed;
            this.wobble += this.wobbleSpeed;
            this.pulse += this.pulseSpeed;
            this.life -= this.decay;
        }
        
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.translate(this.x + Math.sin(this.wobble) * 4, this.y);
            ctx.rotate(this.rotation);
            
            const pulseFactor = 0.8 + Math.sin(this.pulse) * 0.3;
            const finalSize = this.size * pulseFactor;
            
            // Draw 5-pointed star
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
            
            // Gradient fill
            if (this.type === 0) {
                const grad = ctx.createRadialGradient(-4, -4, 0, 0, 0, finalSize);
                grad.addColorStop(0, '#ffff99');
                grad.addColorStop(0.5, '#ffd700');
                grad.addColorStop(1, '#ff8c00');
                ctx.fillStyle = grad;
            } else {
                const grad = ctx.createRadialGradient(-4, -4, 0, 0, 0, finalSize);
                grad.addColorStop(0, '#00ffff');
                grad.addColorStop(0.6, '#00d4ff');
                grad.addColorStop(1, '#0088ff');
                ctx.fillStyle = grad;
            }
            
            ctx.fill();
            
            // Outer glow stroke
            ctx.globalAlpha = this.life * 0.6;
            ctx.strokeStyle = this.type === 0 ? '#ffff00' : '#00ffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Inner bright highlight
            ctx.globalAlpha = this.life * 0.8;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    // Colorful spark particle
    class Spark {
        constructor(x, y, speed) {
            const angle = Math.random() * Math.PI * 2;
            const moveSpeed = speed || (4 + Math.random() * 12);
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * moveSpeed;
            this.vy = Math.sin(angle) * moveSpeed;
            this.life = 1;
            this.decay = 0.012 + Math.random() * 0.018;
            this.size = 1.5 + Math.random() * 6;
            this.hue = 35 + Math.random() * 50;
            this.glowSize = this.size * 3;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.18;
            this.vx *= 0.965;
            this.life -= this.decay;
        }
        
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.6;
            ctx.fillStyle = `hsl(${this.hue}, 100%, 55%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = this.life;
            ctx.fillStyle = `hsl(${this.hue}, 100%, 75%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Shockwave ring
    class Shockwave {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.radius = 10;
            this.maxRadius = 400 + Math.random() * 200;
            this.life = 1;
            this.decay = 0.015;
            this.color = color || 'rgba(255, 215, 0, 0.8)';
            this.width = 8 + Math.random() * 5;
        }
        
        update() {
            this.radius += 12;
            this.life -= this.decay;
        }
        
        draw() {
            if (this.life <= 0 || this.radius > this.maxRadius) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.8;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
    
    // Background twinkling star
    class BackgroundStar {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = 0.5 + Math.random() * 2;
            this.pulse = Math.random() * Math.PI * 2;
            this.speed = 0.02 + Math.random() * 0.04;
            this.intensity = 0.3 + Math.random() * 0.5;
        }
        
        update() {
            this.pulse += this.speed;
        }
        
        draw() {
            const alpha = this.intensity * (0.3 + Math.sin(this.pulse) * 0.5);
            ctx.fillStyle = `rgba(100, 200, 255, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Light ray beam
    class LightRay {
        constructor(centerX, centerY, angle) {
            this.centerX = centerX;
            this.centerY = centerY;
            this.angle = angle;
            this.length = 250 + Math.random() * 200;
            this.width = 5 + Math.random() * 8;
            this.life = 1;
            this.decay = 0.014 + Math.random() * 0.020;
            this.hue = 30 + Math.random() * 50;
            this.pulse = Math.random() * Math.PI * 2;
            this.expandRate = 1.02 + Math.random() * 0.08;
        }
        
        update() {
            this.life -= this.decay;
            this.pulse += 0.12;
            this.length *= this.expandRate;
        }
        
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            
            const pulseFactor = 0.8 + Math.sin(this.pulse) * 0.3;
            const x1 = this.centerX + Math.cos(this.angle) * 15;
            const y1 = this.centerY + Math.sin(this.angle) * 15;
            const x2 = this.centerX + Math.cos(this.angle) * this.length;
            const y2 = this.centerY + Math.sin(this.angle) * this.length;
            
            // Wide glow
            ctx.globalAlpha = this.life * 0.15;
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 70%)`;
            ctx.lineWidth = this.width * 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Mid glow
            ctx.globalAlpha = this.life * 0.25;
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 65%)`;
            ctx.lineWidth = this.width * 3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Core beam
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `hsl(${this.hue}, 100%, 90%)`);
            grad.addColorStop(0.3, `hsl(${this.hue}, 100%, 75%)`);
            grad.addColorStop(0.7, `hsl(${this.hue}, 100%, 60%)`);
            grad.addColorStop(1, `hsl(${this.hue}, 80%, 40%)`);
            
            ctx.globalAlpha = this.life * 0.9 * pulseFactor;
            ctx.strokeStyle = grad;
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    // Radial burst pattern
    class RadialBurst {
        constructor(x, y) {
            this.x = x;
            this.y = y;
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
        
        draw() {
            if (this.life <= 0 || this.expansion > this.maxExpansion) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.7;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            const count = 8;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const x = Math.cos(angle) * this.expansion;
                const y = Math.sin(angle) * this.expansion;
                
                ctx.strokeStyle = `hsl(${40 + i * 5}, 100%, 60%)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    // ========== SPAWN FUNCTIONS ==========
    
    function spawnStarBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            stars.push(new Star(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
    }
    
    function spawnSparkBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            sparks.push(new Spark(x, y));
        }
    }
    
    function spawnLightRays(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            rays.push(new LightRay(x, y, angle));
        }
    }
    
    function spawnShockwave(x, y, color) {
        shockwaves.push(new Shockwave(x, y, color));
    }
    
    function spawnRadialBurst(x, y) {
        radialBursts.push(new RadialBurst(x, y));
    }
    
    // ========== DRAW FUNCTIONS ==========
    
    function drawBackground() {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, 'rgba(10, 14, 39, 0.95)');
        grad.addColorStop(0.5, 'rgba(26, 31, 58, 0.95)');
        grad.addColorStop(1, 'rgba(10, 14, 39, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        
        // Background stars
        for (let star of backgroundStars) {
            star.update();
            star.draw();
        }
        
        // Animated grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        const offset = (frameCount * 0.3) % gridSize;
        
        for (let x = -offset; x < W; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        
        for (let y = -offset; y < H; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    }
    
    // ========== MAIN ANIMATION LOOP ==========
    
    function animate() {
        if (!isAnimating) return;
        
        frameCount++;
        
        // Screen shake
        if (screenShakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * screenShakeIntensity;
            canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            screenShakeIntensity *= 0.94;
        } else {
            canvas.style.transform = 'translate(0, 0)';
        }
        
        drawBackground();
        
        // Update and draw all particles
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            shockwaves[i].update();
            shockwaves[i].draw();
            if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);
        }
        
        for (let i = rays.length - 1; i >= 0; i--) {
            rays[i].update();
            rays[i].draw();
            if (rays[i].life <= 0) rays.splice(i, 1);
        }
        
        for (let i = radialBursts.length - 1; i >= 0; i--) {
            radialBursts[i].update();
            radialBursts[i].draw();
            if (radialBursts[i].life <= 0) radialBursts.splice(i, 1);
        }
        
        for (let i = sparks.length - 1; i >= 0; i--) {
            sparks[i].update();
            sparks[i].draw();
            if (sparks[i].life <= 0) sparks.splice(i, 1);
        }
        
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();
            if (stars[i].life <= 0) stars.splice(i, 1);
        }
        
        // Continue if particles remain
        if (stars.length > 0 || sparks.length > 0 || rays.length > 0 || 
            shockwaves.length > 0 || radialBursts.length > 0 || screenShakeIntensity > 0.1) {
            animationId = requestAnimationFrame(animate);
        } else {
            // Animation complete
            console.log('✅ Animation complete');
        }
    }
    
    // ========== MAIN PLAY FUNCTION ==========
    
    function playAnimation(type, amount) {
        if (isAnimating) {
            // Clear previous
            cancelAnimationFrame(animationId);
            gsap.killTweensOf([winText, amountText, subText]);
        }
        
        isAnimating = true;
        frameCount = 0;
        
        // Clear particles
        stars = [];
        sparks = [];
        rays = [];
        shockwaves = [];
        radialBursts = [];
        
        // Resize
        resize();
        
        // Show container
        container.classList.add('active');
        
        // Set text
        const typeText = type === 'big' ? 'BIG WIN' : type === 'super' ? 'SUPER WIN' : 'MEGA WIN';
        winText.textContent = typeText;
        amountText.textContent = '$' + amount.toLocaleString();
        
        const centerX = W / 2;
        const centerY = H / 2;
        
        // Reset UI
        gsap.set([winText, amountText, subText], { opacity: 0 });
        gsap.set(winText, { scale: 0, rotation: -180 });
        gsap.set(amountText, { scale: 0, rotation: 180 });
        gsap.set(subText, { y: 50 });
        
        // Initialize background stars
        backgroundStars = [];
        for (let i = 0; i < 150; i++) {
            backgroundStars.push(new BackgroundStar());
        }
        
        const tl = gsap.timeline();
        
        // === PHASE 1: MASSIVE INITIAL BURST ===
        tl.add(() => {
            screenShakeIntensity = 8;
            spawnStarBurst(centerX, centerY, 120);
            spawnSparkBurst(centerX, centerY, 200);
            spawnLightRays(centerX, centerY, 40);
            spawnShockwave(centerX, centerY, 'rgba(255, 215, 0, 1)');
            spawnRadialBurst(centerX, centerY);
            animate();
        }, 0);
        
        // Win text
        tl.to(winText, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.9,
            ease: 'elastic.out(1.3, 0.6)'
        }, 0.15);
        
        // Amount text
        tl.to(amountText, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            ease: 'elastic.out(1.2, 0.5)'
        }, 0.35);
        
        // === PHASE 2: Top-left burst ===
        tl.add(() => {
            screenShakeIntensity = 5;
            spawnStarBurst(centerX - 200, centerY - 150, 60);
            spawnSparkBurst(centerX - 200, centerY - 150, 100);
            spawnShockwave(centerX - 200, centerY - 150, 'rgba(255, 165, 0, 0.9)');
        }, 1.0);
        
        // === PHASE 3: Top-right burst ===
        tl.add(() => {
            screenShakeIntensity = 5;
            spawnStarBurst(centerX + 200, centerY - 150, 60);
            spawnSparkBurst(centerX + 200, centerY - 150, 100);
            spawnLightRays(centerX + 200, centerY - 150, 20);
            spawnShockwave(centerX + 200, centerY - 150, 'rgba(255, 165, 0, 0.9)');
        }, 1.3);
        
        // Sub text
        tl.to(subText, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'back.out(1.5)'
        }, 1.5);
        
        // === PHASE 4: Bottom burst ===
        tl.add(() => {
            screenShakeIntensity = 4;
            spawnStarBurst(centerX, centerY + 150, 70);
            spawnSparkBurst(centerX, centerY + 100, 120);
            spawnRadialBurst(centerX, centerY + 150);
            spawnShockwave(centerX, centerY + 150, 'rgba(255, 215, 0, 0.8)');
        }, 1.8);
        
        // === PHASE 5: Text pulse ===
        tl.to(winText, {
            scale: 1.15,
            duration: 0.5,
            ease: 'sine.inOut',
            repeat: 2,
            yoyo: true
        }, 1.4);
        
        tl.to(amountText, {
            scale: 1.12,
            duration: 0.4,
            ease: 'sine.inOut',
            repeat: 1,
            yoyo: true
        }, 2.0);
        
        // === PHASE 6: Final burst ===
        tl.add(() => {
            screenShakeIntensity = 6;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                const x = centerX + Math.cos(angle) * 120;
                const y = centerY + Math.sin(angle) * 120;
                spawnStarBurst(x, y, 40);
                spawnSparkBurst(x, y, 60);
            }
            spawnLightRays(centerX, centerY, 36);
            spawnShockwave(centerX, centerY, 'rgba(255, 255, 0, 0.9)');
        }, 2.5);
        
        // === PHASE 7: Exit ===
        tl.add(() => {
            gsap.to([winText, amountText, subText], {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => {
                    isAnimating = false;
                    container.classList.remove('active');
                    cancelAnimationFrame(animationId);
                    canvas.style.transform = 'translate(0, 0)';
                }
            });
        }, 4.5);
    }
    
    // ========== PUBLIC API ==========
    global.WinAnimation = {
        mega: function(amount) {
            console.log('🚀 MEGA WIN:', amount);
            playAnimation('mega', amount || 0);
        },
        big: function(amount) {
            console.log('🚀 BIG WIN:', amount);
            playAnimation('big', amount || 0);
        },
        super: function(amount) {
            console.log('🚀 SUPER WIN:', amount);
            playAnimation('super', amount || 0);
        },
        clear: function() {
            console.log('🧹 Clearing');
            isAnimating = false;
            container.classList.remove('active');
            cancelAnimationFrame(animationId);
            gsap.killTweensOf([winText, amountText, subText]);
            canvas.style.transform = 'translate(0, 0)';
        }
    };
    
    // Handle resize
    window.addEventListener('resize', resize);
    
    console.log('✅ WinAnimation ready! Try: WinAnimation.mega(100000)');
})(window);
