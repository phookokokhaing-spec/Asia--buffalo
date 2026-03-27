

const JackpotFX = (function() {
    
    // ========== PRIVATE VARIABLES ==========
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let isActive = false;
    let currentAmount = 0;
    
    let particles = [];
    let coins = [];
    let fireworks = [];
    let rotatingLights = [];
    let time = 0;
    let scaleText = 0;
    let glowIntensity = 0;
    let wobbleX = 0;
    let wobbleY = 0;
    let shakeX = 0;
    let shakeY = 0;
    let displayAmount = "";
    let digitIndex = 0;
    let burstInterval = null;
    let screenShakeInterval = null;
    let coinRainInterval = null;
    
    const WIDTH = 800;
    const HEIGHT = 500;
    
    // ========== SOUND SYSTEM (Optional) ==========
    let audioContext = null;
    let isSoundEnabled = true;
    
    function initAudio() {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.warn("JackpotFX: Web Audio API not supported");
            isSoundEnabled = false;
        }
    }
    
    function playTone(frequency, duration, volume = 0.3, type = 'sine') {
        if (!isSoundEnabled || !audioContext || audioContext.state !== 'running') return;
        try {
            const now = audioContext.currentTime;
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch(e) {}
    }
    
    function playDing() {
        playTone(880, 0.2, 0.4, 'sine');
        setTimeout(() => playTone(1046.5, 0.3, 0.4, 'sine'), 150);
        setTimeout(() => playTone(1318.5, 0.5, 0.5, 'sine'), 350);
    }
    
    function playCoinDrop() {
        playTone(523.25, 0.1, 0.2, 'triangle');
        setTimeout(() => playTone(392.00, 0.15, 0.2, 'triangle'), 80);
    }
    
    function playSparkle() {
        playTone(2093.0, 0.08, 0.15, 'sine');
        setTimeout(() => playTone(2637.02, 0.08, 0.15, 'sine'), 50);
    }
    
    function playFirework() {
        playTone(80, 0.5, 0.5, 'sawtooth');
        setTimeout(() => playTone(60, 0.6, 0.4, 'sawtooth'), 100);
    }
    
    function playDrumHit() {
        playTone(80, 0.3, 0.6, 'sawtooth');
    }
    
    function playTick() {
        playTone(880, 0.05, 0.1, 'sine');
    }
    
    function playFanfare() {
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.25, 0.5, 'sine'), i * 180);
        });
    }
    
    // ========== COIN PARTICLE ==========
    class CoinFX {
        constructor(x, y, vx, vy, size, color, rotationSpeed) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = rotationSpeed;
            this.gravity = 0.15;
            this.alpha = 1;
            this.age = 0;
        }
        
        update() {
            this.vx *= 0.99;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.age++;
            
            if (this.y > HEIGHT - 50 && this.vy > 0) {
                this.vy *= -0.5;
                this.vx *= 0.98;
                this.y = HEIGHT - 51;
                if (Math.abs(this.vy) < 0.8) {
                    this.vy = 0;
                }
            }
            
            if (this.age > 400) {
                this.alpha -= 0.01;
            }
            
            if (this.y > HEIGHT + 200 || this.y < -100 || this.x < -100 || this.x > WIDTH + 100) {
                return false;
            }
            return this.alpha > 0;
        }
        
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "gold";
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            const grad = ctx.createLinearGradient(-this.size/2, -this.size/2, this.size/2, this.size/2);
            grad.addColorStop(0, '#FFD966');
            grad.addColorStop(0.6, '#DAA520');
            grad.addColorStop(1, '#B8860B');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = "#FFD700";
            ctx.font = `bold ${this.size * 0.6}px "Segoe UI", monospace`;
            ctx.fillText("$", -this.size*0.22, this.size*0.28);
            ctx.restore();
        }
    }
    
    // ========== FIREWORK PARTICLE ==========
    class FireworkFX {
        constructor(x, y, vx, vy, color, life) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.size = Math.random() * 4 + 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08;
            this.life -= 4;
            return this.life > 0;
        }
        
        draw(ctx) {
            const alpha = Math.min(1, this.life / this.maxLife);
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    // ========== ROTATING LIGHTS ==========
    function initRotatingLights() {
        rotatingLights = [];
        for (let i = 0; i < 12; i++) {
            rotatingLights.push({
                angle: (i / 12) * Math.PI * 2,
                radius: 160,
                color: i % 2 === 0 ? '#FFD700' : '#FF8C00',
                size: 7 + Math.random() * 5,
                speed: 0.008,
                pulse: 0
            });
        }
    }
    
    function updateRotatingLights() {
        for (let i = 0; i < rotatingLights.length; i++) {
            rotatingLights[i].angle += rotatingLights[i].speed;
            rotatingLights[i].pulse = 0.6 + Math.sin(time * 0.01 + i) * 0.4;
        }
    }
    
    function drawRotatingLights(centerX, centerY) {
            if (!ctx || !rotatingLights) return;
        for (const light of rotatingLights) {
            const x = centerX + Math.cos(light.angle) * light.radius;
            const y = centerY + Math.sin(light.angle) * light.radius;
            
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = light.color;
            ctx.beginPath();
            ctx.arc(x, y, light.size * light.pulse, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, light.size * 1.5);
            grad.addColorStop(0, light.color);
            grad.addColorStop(0.7, light.color + 'aa');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }
    }
    
    // ========== JACKPOT TEXT ==========
    function drawJackpotText(x, y, scale, wobbleX, wobbleY, glowIntensity) {
        if (!ctx) return;
        const text = "JACKPOT";
        const fontSize = 64 * (0.7 + scale * 0.4);
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `900 ${fontSize}px "Poppins", "Arial Black", "Impact"`;
        
        const offsetX = Math.sin(wobbleX) * 3;
        const offsetY = Math.sin(wobbleY) * 2;
        
        const layers = [
            { offset: 6, color: '#8B4513' },
            { offset: 4, color: '#B8860B' },
            { offset: 2, color: '#DAA520' },
            { offset: 0, color: '#FFD700' }
        ];
        
        for (const layer of layers) {
            ctx.shadowBlur = 8;
            ctx.fillStyle = layer.color;
            ctx.fillText(text, x + layer.offset + offsetX + shakeX, y + layer.offset + offsetY + shakeY);
        }
        
        const grad = ctx.createLinearGradient(x - 80, y - 30, x + 80, y + 30);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#FFA500');
        grad.addColorStop(1, '#FF4500');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 25 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, ${0.6 + glowIntensity * 0.5})`;
        ctx.fillText(text, x + offsetX + shakeX, y + offsetY + shakeY);
        
        ctx.restore();
    }
    
    function drawAmount(amountStr, x, y, scale, glowIntensity) {
        if (!ctx) return;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 48 * (0.8 + scale * 0.3);
        ctx.font = `bold ${fontSize}px "Poppins", "Arial Black", monospace`;
        
        ctx.fillStyle = '#4a2a00';
        ctx.fillText(amountStr, x + 4 + shakeX, y + 4 + shakeY);
        ctx.fillStyle = '#DAA520';
        ctx.fillText(amountStr, x + 2 + shakeX, y + 2 + shakeY);
        
        const grad = ctx.createLinearGradient(x - 50, y - 15, x + 50, y + 15);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#FFA500');
        grad.addColorStop(1, '#FF8C00');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 18 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, 0.7)`;
        ctx.fillText(amountStr, x + shakeX, y + shakeY);
        
        ctx.restore();
    }
    
    // ========== BACKGROUND ==========
   // ========== BACKGROUND ==========
function drawBackground() {
    if (!ctx) {
        console.warn('⚠️ drawBackground: ctx is null');
        return;
    }
    
    try {
        const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.5, '#1a0f1a');
        grad.addColorStop(1, '#2a1a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        for (let i = 0; i < 50; i++) {
            if (Math.random() > 0.99) {
                ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.arc((i * 137) % WIDTH, (time + i * 83) % HEIGHT, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } catch(e) {
        console.error('❌ drawBackground error:', e);
    }
}
    
    // ========== SCREEN SHAKE ==========
    function startScreenShake() {
        if (screenShakeInterval) clearInterval(screenShakeInterval);
        let shakeCount = 0;
        screenShakeInterval = setInterval(() => {
            if (shakeCount >= 12) {
                clearInterval(screenShakeInterval);
                screenShakeInterval = null;
                shakeX = 0;
                shakeY = 0;
                return;
            }
            shakeX = (Math.random() - 0.5) * 10;
            shakeY = (Math.random() - 0.5) * 6;
            shakeCount++;
            playDrumHit();
        }, 45);
    }
    
    // ========== PARTICLE EFFECTS ==========
    function createCoinBurst(centerX, centerY, intensity = 50) {
        const goldColors = ['#FFD700', '#FDB931', '#FFC125', '#E6B422', '#FFB347'];
        for (let i = 0; i < intensity; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 10;
            const vx = Math.cos(angle) * speed * (Math.random() * 1.4);
            const vy = Math.sin(angle) * speed * (Math.random() * 1.2) - 4;
            const size = 10 + Math.random() * 18;
            const color = goldColors[Math.floor(Math.random() * goldColors.length)];
            const rotSpeed = (Math.random() - 0.5) * 0.2;
            coins.push(new CoinFX(centerX, centerY, vx, vy, size, color, rotSpeed));
            if (i % 8 === 0) playCoinDrop();
        }
    }
    
    function createFireworkBurst(x, y, intensity = 40) {
        const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF69B4', '#00FFFF', '#FF66CC'];
        for (let i = 0; i < intensity; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 7;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = 60 + Math.random() * 80;
            fireworks.push(new FireworkFX(x, y, vx, vy, color, life));
        }
        playFirework();
    }
    
    function createMultipleCoinBursts() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 + 40;
        
        createCoinBurst(centerX, centerY, 55);
        
        setTimeout(() => {
            createCoinBurst(centerX + 40, centerY - 20, 45);
            createCoinBurst(centerX - 40, centerY - 20, 45);
        }, 200);
        
        setTimeout(() => {
            createCoinBurst(centerX, centerY + 20, 60);
            createCoinBurst(WIDTH * 0.25, HEIGHT * 0.7, 35);
            createCoinBurst(WIDTH * 0.75, HEIGHT * 0.7, 35);
        }, 450);
        
        setTimeout(() => {
            createCoinBurst(centerX, centerY - 10, 50);
        }, 700);
    }
    
    function createMultipleFireworks() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 20;
        
        createFireworkBurst(centerX, centerY, 50);
        
        setTimeout(() => {
            createFireworkBurst(WIDTH * 0.3, HEIGHT * 0.4, 35);
            createFireworkBurst(WIDTH * 0.7, HEIGHT * 0.4, 35);
        }, 250);
        
        setTimeout(() => {
            createFireworkBurst(WIDTH * 0.2, HEIGHT * 0.6, 30);
            createFireworkBurst(WIDTH * 0.5, HEIGHT * 0.7, 40);
            createFireworkBurst(WIDTH * 0.8, HEIGHT * 0.6, 30);
        }, 600);
        
        setTimeout(() => {
            createFireworkBurst(centerX, HEIGHT * 0.5, 45);
        }, 1000);
    }
    
    // ========== SCREEN FLASH ==========
    function addScreenFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flashn.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 200, 50, 0.5)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '999997';
        flash.style.animation = 'jackpotFXFlash 0.5s ease-out forwards';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }
    
    // ========== CSS STYLES ==========
    function addStyles() {
        if (document.getElementById('jackpotfx-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'jackpotfx-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Bangers&display=swap');
            
            @keyframes jackpotFXFlash {
                0% { opacity: 0.7; backdrop-filter: blur(2px); }
                100% { opacity: 0; backdrop-filter: blur(0px); }
            }
            
            @keyframes coinFallFX {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            
            .jackpotfx-coin {
                position: fixed;
                animation: coinFallFX 3.5s linear forwards;
                pointer-events: none;
                z-index: 999996;
                font-size: 28px;
                text-shadow: 0 0 5px gold;
            }
        `;
        document.head.appendChild(style);
    }
    
    function createFallingCoins() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const coinEl = document.createElement('div');
                coinEl.className = 'jackpotfx-coin';
                coinEl.textContent = '🪙';
                coinEl.style.left = Math.random() * 100 + '%';
                coinEl.style.top = '-10%';
                coinEl.style.fontSize = (Math.random() * 28 + 20) + 'px';
                document.body.appendChild(coinEl);
                setTimeout(() => coinEl.remove(), 3500);
            }, i * 70);
        }
    }
    
    // ========== CANVAS SETUP ==========
    function setupCanvas() {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        
        canvas = document.createElement('canvas');
        canvas.id = 'jackpotfx-canvas';
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.position = 'fixed';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = '999995';
        canvas.style.borderRadius = '20px';
        canvas.style.boxShadow = '0 0 40px rgba(255,100,0,0.6)';
        canvas.style.border = '3px solid rgba(255,215,0,0.7)';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Failed to get canvas context');
    } else {
        console.log('✅ Canvas context ready');
    }
}
    
    // ========== MAIN ANIMATION ==========
    // ========== MAIN ANIMATION ==========
function startAnimation(amount) {
    if (animationId) cancelAnimationFrame(animationId);
    if (burstInterval) clearInterval(burstInterval);
    if (coinRainInterval) clearInterval(coinRainInterval);

    isActive = true;
    currentAmount = amount;

    scaleText = 0;
    glowIntensity = 0;
    digitIndex = 0;
    coins = [];
    fireworks = [];
    time = 0;

    const amountStr = amount.toLocaleString();
    displayAmount = "";

    const animateDigits = () => {
        if (digitIndex <= amountStr.length) {
            displayAmount = amountStr.substring(0, digitIndex);
            digitIndex++;
            setTimeout(animateDigits, 70);
            playTick();
        }
    };
    animateDigits();

    let scaleAnim = 0;
    const scaleInterval = setInterval(() => {
        scaleAnim += 0.05;
        if (scaleAnim >= 1) {
            clearInterval(scaleInterval);
        }
        scaleText = Math.sin(scaleAnim * Math.PI / 2);
    }, 30);

    let glowAnim = 0;
    const glowInterval = setInterval(() => {
        glowAnim += 0.1;
        glowIntensity = 0.5 + Math.sin(glowAnim) * 0.5;
        if (glowAnim > Math.PI * 4) {
            clearInterval(glowInterval);
        }
    }, 60);

    let wobbleTime = 0;
    const wobbleInterval = setInterval(() => {
        wobbleTime += 0.15;
        wobbleX = wobbleTime;
        wobbleY = wobbleTime * 0.8;
    }, 50);

    // ===== PHASE 1: Initial Burst (0-15 sec) =====
    playDing();
    createMultipleCoinBursts();
    createMultipleFireworks();
    createFallingCoins();
    addScreenFlash();
    startScreenShake();

    // ===== PHASE 2: Mid Celebration (15-30 sec) =====
    setTimeout(() => {
        if (isActive) {
            // ဒုတိယအကြိမ် ဒင်္ဂါးတွေ ထပ်ကျဲ
            createCoinBurst(WIDTH/2, HEIGHT/2 + 40, 45);
            createFireworkBurst(WIDTH/2, HEIGHT/2, 40);
            createFireworkBurst(WIDTH * 0.3, HEIGHT * 0.4, 30);
            createFireworkBurst(WIDTH * 0.7, HEIGHT * 0.4, 30);
            // မီးရောင်တွေ ပိုတောက်အောင်
            glowIntensity = 1.2;
            // Screen flash ထပ်လုပ်
            addScreenFlash();
        }
    }, 15000);

    // ===== PHASE 3: Grand Finale (30-45 sec) =====
    setTimeout(() => {
        if (isActive) {
            // နောက်ဆုံးအကြိမ် အကြီးအကျယ်
            createCoinBurst(WIDTH/2, HEIGHT/2 + 40, 80);
            createCoinBurst(WIDTH * 0.2, HEIGHT * 0.6, 40);
            createCoinBurst(WIDTH * 0.8, HEIGHT * 0.6, 40);
            createFireworkBurst(WIDTH/2, HEIGHT/2 - 30, 70);
            createFireworkBurst(WIDTH * 0.25, HEIGHT * 0.5, 45);
            createFireworkBurst(WIDTH * 0.75, HEIGHT * 0.5, 45);
            createFireworkBurst(WIDTH * 0.5, HEIGHT * 0.7, 50);
            // Multiple screen flashes
            addScreenFlash();
            setTimeout(() => addScreenFlash(), 200);
            // ပိုပြီး တုန်ခါအောင်
            startScreenShake();
        }
    }, 30000);

    // ===== PHASE 4: Fade Out & Afterglow (45-60 sec) =====
    setTimeout(() => {
        if (isActive) {
            // နောက်ဆုံး ဒင်္ဂါးအသင့်အတင့်
            createCoinBurst(WIDTH/2, HEIGHT/2 + 30, 35);
            createFireworkBurst(WIDTH/2, HEIGHT/2, 30);
            
            // တဖြည်းဖြည်းမှိန်သွားအောင်
            let fadeOpacity = 1;
            const fadeInterval = setInterval(() => {
                if (canvas && isActive) {
                    fadeOpacity -= 0.02;
                    canvas.style.opacity = fadeOpacity;
                    if (fadeOpacity <= 0.3) {
                        clearInterval(fadeInterval);
                    }
                } else {
                    clearInterval(fadeInterval);
                }
            }, 500);
            
            // နောက်ဆုံး sparkle လေးတွေ
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    if (isActive) {
                        createFireworkBurst(
                            WIDTH * (0.2 + Math.random() * 0.6),
                            HEIGHT * (0.3 + Math.random() * 0.5),
                            8
                        );
                    }
                }, i * 200);
            }
        }
    }, 45000);

    // ===== ANIMATION END (60 sec) =====
    setTimeout(() => {
        isActive = false;
        clearInterval(scaleInterval);
        clearInterval(glowInterval);
        clearInterval(wobbleInterval);
        if (burstInterval) clearInterval(burstInterval);
        if (coinRainInterval) clearInterval(coinRainInterval);

        if (canvas) {
            canvas.style.transition = 'opacity 0.5s';
            canvas.style.opacity = '0';
            setTimeout(() => {
                if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
                canvas = null;
                ctx = null;
            }, 500);
        }
    }, 60000);  // 👈 60 sec

   
       function animateLoop() {
    if (!ctx) {  // 👈 ဒီလိုထည့်
        animationId = requestAnimationFrame(animateLoop);
        return;
    }
        if (!isActive && coins.length === 0 && fireworks.length === 0) {
            animationId = null;
            return;
        }

        drawBackground();
        updateRotatingLights();

        if (isActive) {
            const cx = WIDTH/2;
            const cy = HEIGHT/2 - 20;
            drawRotatingLights(cx, cy);
            drawJackpotText(cx, cy, scaleText, wobbleX, wobbleY, glowIntensity);
            if (displayAmount) {
                drawAmount(displayAmount, cx, cy + 70, scaleText, glowIntensity);
            }
        }

        for (let i = 0; i < coins.length; i++) {
            const alive = coins[i].update();
            if (alive) coins[i].draw(ctx);
            else { coins.splice(i, 1); i--; }
        }

        for (let i = 0; i < fireworks.length; i++) {
            const alive = fireworks[i].update();
            if (alive) fireworks[i].draw(ctx);
            else { fireworks.splice(i, 1); i--; }
        }

        time++;
        animationId = requestAnimationFrame(animateLoop);
    }

    animateLoop();
}
    // ========== CLEANUP ==========
    function cleanup() {
        isActive = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (burstInterval) clearInterval(burstInterval);
        if (screenShakeInterval) clearInterval(screenShakeInterval);
        if (coinRainInterval) clearInterval(coinRainInterval);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = null;
        ctx = null;
        document.querySelectorAll('.jackpotfx-coin').forEach(el => el.remove());
        const container = document.getElementById('jackpotfx-container');
        if (container) container.remove();
    }
    
    // ========== PUBLIC API ==========
    function show(amount = 0, options = {}) {
        cleanup();
        addStyles();
        setupCanvas();
        initRotatingLights();
        initAudio();
        
        const unlockAudio = () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        
        startAnimation(amount);
        
        return {
            cleanup: cleanup
        };
    }
    
    // ========== EXPORT ==========
    return {
        show: show,
        version: '1.0.0'
    };
    
})();

// Global
if (typeof window !== 'undefined') {
    window.JackpotFX = JackpotFX;
}

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JackpotFX;
}
