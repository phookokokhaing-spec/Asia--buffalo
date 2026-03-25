/**
 * JackpotAnimation.js
 * အသံအားလုံး Web Audio API နဲ့ ထည့်ထားတယ်
 * SoundManager မလိုပါ
 */

const JackpotAnimation = (function() {
    
    // ========== PRIVATE VARIABLES ==========
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let isActive = false;
    let currentAmount = 0;
    
    let diamonds = [];
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
    let fireworkInterval = null;
    let screenShakeInterval = null;
    
    const WIDTH = 800;
    const HEIGHT = 450;
    
    // ========== WEB AUDIO API SOUND SYSTEM ==========
    let audioContext = null;
    let isSoundEnabled = true;
    
    function initAudio() {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("🔊 AudioContext created");
        } catch(e) {
            console.warn("Web Audio API not supported");
            isSoundEnabled = false;
        }
    }
    
    function unlockAudio() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("🔊 Audio unlocked!");
            });
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    }
    
    function playTone(frequency, duration, volume = 0.3, type = 'sine', delay = 0) {
        if (!isSoundEnabled || !audioContext) return;
        
        setTimeout(() => {
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
        }, delay);
    }
    
    // ========== JACKPOT SOUNDS ==========
    function playDing() {
        playTone(880, 0.2, 0.4, 'sine');
        playTone(1046.5, 0.25, 0.4, 'sine', 180);
        playTone(1318.5, 0.3, 0.5, 'sine', 380);
    }
    
    function playCoinDrop() {
        playTone(523.25, 0.12, 0.25, 'triangle');
        playTone(392.00, 0.18, 0.25, 'triangle', 100);
    }
    
    function playSparkle() {
        playTone(2093.0, 0.1, 0.2, 'sine');
        playTone(2637.02, 0.1, 0.2, 'sine', 60);
        playTone(3136.0, 0.1, 0.15, 'sine', 120);
    }
    
    function playFirework() {
        playTone(80, 0.6, 0.5, 'sawtooth');
        playTone(60, 0.7, 0.4, 'sawtooth', 120);
        playTone(100, 0.5, 0.3, 'sawtooth', 250);
    }
    
    function playDrumHit() {
        playTone(70, 0.4, 0.5, 'sawtooth');
        playTone(55, 0.5, 0.4, 'sawtooth', 50);
    }
    
    function playTick() {
        playTone(880, 0.05, 0.12, 'sine');
    }
    
    function playFanfare() {
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
        notes.forEach((freq, i) => {
            playTone(freq, 0.3, 0.5, 'sine', i * 200);
        });
        // Extra bass at end
        playTone(130.81, 0.8, 0.6, 'sawtooth', notes.length * 200 + 100);
        playTone(174.61, 0.8, 0.5, 'sawtooth', notes.length * 200 + 350);
    }
    
    function playJackpotSequence() {
        // Intro
        playDing();
        
        // Coins
        for (let i = 0; i < 10; i++) {
            setTimeout(() => playCoinDrop(), 800 + i * 450);
        }
        
        // Fireworks
        setTimeout(() => playFirework(), 1200);
        setTimeout(() => playFirework(), 2800);
        setTimeout(() => playFirework(), 4400);
        setTimeout(() => playFirework(), 6000);
        
        // Drum hits during shake
        for (let i = 0; i < 12; i++) {
            setTimeout(() => playDrumHit(), 2000 + i * 500);
        }
        
        // Final fanfare
        setTimeout(() => playFanfare(), 11000);
    }
    
    // ========== DIAMOND PARTICLE ==========
    class Diamond {
        constructor(x, y, vx, vy, size, life) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.life = life;
            this.maxLife = life;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.08;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.06;
            this.vx *= 0.995;
            this.life -= 1.2;
            this.rotation += this.rotSpeed;
            return this.life > 0;
        }
        draw(ctx) {
            const alpha = Math.min(1, this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00ffff';
            
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size * 0.7, -this.size * 0.3);
            ctx.lineTo(this.size * 0.3, this.size * 0.5);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size * 0.3, this.size * 0.5);
            ctx.lineTo(-this.size * 0.7, -this.size * 0.3);
            ctx.closePath();
            
            const grad = ctx.createLinearGradient(-this.size, 0, this.size, 0);
            grad.addColorStop(0, '#88ffff');
            grad.addColorStop(0.5, '#ffffff');
            grad.addColorStop(1, '#ff88ff');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }
    }
    
    // ========== FIREWORK ==========
    class Firework {
        constructor(x, y, vx, vy, color, life) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.size = Math.random() * 5 + 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08;
            this.life -= 2;
            return this.life > 0;
        }
        draw(ctx) {
            const alpha = Math.min(1, this.life / this.maxLife);
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 12;
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
        for (let i = 0; i < 20; i++) {
            rotatingLights.push({
                angle: (i / 20) * Math.PI * 2,
                radius: 190,
                color: i % 2 === 0 ? '#FFD700' : '#FF4500',
                size: 9 + Math.random() * 7,
                speed: 0.004,
                pulse: 0
            });
        }
    }
    
    function updateRotatingLights() {
        for (let i = 0; i < rotatingLights.length; i++) {
            const light = rotatingLights[i];
            light.angle += light.speed;
            light.pulse = 0.6 + Math.sin(time * 0.005 + i) * 0.4;
        }
    }
    
    function drawRotatingLights(centerX, centerY) {
        for (const light of rotatingLights) {
            const x = centerX + Math.cos(light.angle) * light.radius;
            const y = centerY + Math.sin(light.angle) * light.radius;
            
            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = light.color;
            ctx.beginPath();
            ctx.arc(x, y, light.size * light.pulse, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, light.size * 1.8);
            grad.addColorStop(0, light.color);
            grad.addColorStop(0.7, light.color + 'aa');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }
    }
    
    // ========== 3D JACKPOT TEXT ==========
    function drawJackpotText(x, y, scale, wobbleX, wobbleY, glowIntensity) {
        const text = "JACKPOT";
        const fontSize = 72 * (0.5 + scale * 0.6);
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `900 ${fontSize}px "Poppins", "Arial Black", "Impact"`;
        
        const offsetX = Math.sin(wobbleX) * 5;
        const offsetY = Math.sin(wobbleY) * 4;
        
        const goldLayers = [
            { offset: 10, color: '#5a2a0a', blur: 0 },
            { offset: 8, color: '#8B4513', blur: 2 },
            { offset: 6, color: '#B8860B', blur: 4 },
            { offset: 4, color: '#DAA520', blur: 6 },
            { offset: 2, color: '#FFD700', blur: 8 },
            { offset: 0, color: '#FFA500', blur: 10 }
        ];
        
        for (let i = 0; i < goldLayers.length; i++) {
            const layer = goldLayers[i];
            ctx.shadowBlur = layer.blur;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.fillStyle = layer.color;
            ctx.fillText(text, x + layer.offset + offsetX + shakeX, y + layer.offset + offsetY + shakeY);
        }
        
        const grad = ctx.createLinearGradient(x - 100, y - 40, x + 100, y + 40);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.3, '#FFA500');
        grad.addColorStop(0.6, '#FF4500');
        grad.addColorStop(1, '#FFD700');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 40 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, ${0.9 + glowIntensity * 0.5})`;
        ctx.fillText(text, x + offsetX + shakeX, y + offsetY + shakeY);
        
        ctx.fillStyle = 'rgba(255,255,200,0.7)';
        ctx.fillText(text, x + offsetX - 2 + shakeX, y + offsetY - 2 + shakeY);
        
        ctx.restore();
    }
    
    function drawAmount(amountStr, x, y, scale, glowIntensity) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 58 * (0.7 + scale * 0.4);
        ctx.font = `bold ${fontSize}px "Poppins", "Arial Black", monospace`;
        
        ctx.fillStyle = '#3a1a00';
        ctx.fillText(amountStr, x + 8 + shakeX, y + 8 + shakeY);
        ctx.fillStyle = '#5a2a00';
        ctx.fillText(amountStr, x + 5 + shakeX, y + 5 + shakeY);
        ctx.fillStyle = '#8B4513';
        ctx.fillText(amountStr, x + 3 + shakeX, y + 3 + shakeY);
        ctx.fillStyle = '#DAA520';
        ctx.fillText(amountStr, x + 1 + shakeX, y + 1 + shakeY);
        
        const grad = ctx.createLinearGradient(x - 80, y - 25, x + 80, y + 25);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#FFA500');
        grad.addColorStop(1, '#FF4500');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 25 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, 0.9)`;
        ctx.fillText(amountStr, x + shakeX, y + shakeY);
        
        ctx.restore();
    }
    
    // ========== BACKGROUND ==========
    function drawBackground() {
        if (!ctx) return;
        
        const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        grad.addColorStop(0, '#1a0a0a');
        grad.addColorStop(0.5, '#2a1a0a');
        grad.addColorStop(1, '#3a2a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        for (let i = 0; i < 40; i++) {
            if (Math.random() > 0.99) {
                ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.25})`;
                ctx.beginPath();
                ctx.ellipse((i * 173 + time * 0.5) % WIDTH, (time * 0.3 + i * 80) % HEIGHT, 60, 30, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // ========== SCREEN SHAKE ==========
    function startScreenShake() {
        if (screenShakeInterval) clearInterval(screenShakeInterval);
        let shakeCount = 0;
        screenShakeInterval = setInterval(() => {
            if (shakeCount >= 28) {
                clearInterval(screenShakeInterval);
                screenShakeInterval = null;
                shakeX = 0;
                shakeY = 0;
                return;
            }
            shakeX = (Math.random() - 0.5) * 14;
            shakeY = (Math.random() - 0.5) * 10;
            shakeCount++;
            if (shakeCount % 4 === 0) playDrumHit();
        }, 70);
    }
    
    // ========== PARTICLES ==========
    function createDiamondBurst() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 30;
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * speed * (Math.random() * 1.2);
            const vy = Math.sin(angle) * speed * (Math.random() * 1.0) - 0.8;
            const size = Math.random() * 9 + 5;
            const life = Math.random() * 200 + 150;
            diamonds.push(new Diamond(centerX, centerY, vx, vy, size, life));
            playSparkle();
        }
    }
    
    function createFireworkBurst() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 20;
        const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF69B4', '#00FFFF', '#FF00FF', '#00FF00'];
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 1.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = Math.random() * 140 + 120;
            fireworks.push(new Firework(centerX, centerY, vx, vy, color, life));
        }
        playFirework();
    }
    
    function createCoinRain() {
        for (let i = 0; i < 130; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'jackpot-coin';
                coin.textContent = ['🪙', '💰', '💎', '👑', '⭐', '✨', '💫'][Math.floor(Math.random() * 7)];
                coin.style.position = 'fixed';
                coin.style.left = Math.random() * 100 + '%';
                coin.style.top = '-10%';
                coin.style.fontSize = (Math.random() * 35 + 28) + 'px';
                coin.style.zIndex = '999998';
                coin.style.pointerEvents = 'none';
                coin.style.animation = 'coinFallSlow 5s linear forwards';
                coin.style.color = '#FFD700';
                coin.style.textShadow = '0 0 15px orange, 0 0 5px red';
                document.body.appendChild(coin);
                setTimeout(() => coin.remove(), 5000);
                if (i % 8 === 0) playCoinDrop();
            }, i * 100);
        }
    }
    
    // ========== CSS STYLES ==========
    function addStyles() {
        if (document.getElementById('jackpot-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'jackpot-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Bangers&display=swap');
            
            .jackpot-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 999999;
                width: 90%;
                max-width: 800px;
                pointer-events: none;
                animation: containerFloat 12s ease-in-out forwards;
            }
            @keyframes containerFloat {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                10% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                20% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; }
            }
            .jackpot-text-css {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 10px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                background: linear-gradient(135deg, #FFD700, #FFA500, #FF4500, #FFD700, #FFA500);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-shadow: 0 0 40px rgba(255,100,0,0.8);
                animation: jackpotGlowLong 0.6s infinite alternate, jackpotShakeLong 0.08s infinite;
            }
            @keyframes jackpotGlowLong {
                from { filter: drop-shadow(0 0 15px gold); background-position: 0% 50%; }
                to { filter: drop-shadow(0 0 50px orange) drop-shadow(0 0 30px red); background-position: 100% 50%; }
            }
            @keyframes jackpotShakeLong {
                0% { transform: translate(0,0); }
                20% { transform: translate(3px,-2px); }
                40% { transform: translate(-2px,3px); }
                60% { transform: translate(3px,2px); }
                80% { transform: translate(-3px,-2px); }
                100% { transform: translate(0,0); }
            }
            .jackpot-counter {
                display: block;
                font-size: 64px;
                color: #FFD700;
                font-family: 'Bangers', cursive;
                text-shadow: 0 0 25px rgba(255,100,0,0.9), 0 0 15px red;
                margin-top: 25px;
                animation: counterJackpotLong 0.4s infinite alternate;
            }
            @keyframes counterJackpotLong {
                from { transform: scale(1); text-shadow: 0 0 25px gold; }
                to { transform: scale(1.15); text-shadow: 0 0 60px orange, 0 0 30px red; }
            }
            .jackpot-coin {
                position: fixed;
                animation: coinFallSlow 5s linear forwards;
                pointer-events: none;
                z-index: 999998;
                text-shadow: 0 0 15px gold;
            }
            @keyframes coinFallSlow {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(120vh) rotate(1080deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    function addCSSJackpot(amount) {
        const existing = document.getElementById('jackpot-container');
        if (existing) existing.remove();
        
        const container = document.createElement('div');
        container.id = 'jackpot-container';
        container.className = 'jackpot-container';
        container.style.zIndex = '999999';
        
        const div = document.createElement('div');
        div.className = 'jackpot-text-css';
        div.innerHTML = `JACKPOT <div id="jackpot-counter" class="jackpot-counter">0 KS</div>`;
        container.appendChild(div);
        document.body.appendChild(container);
        
        let startVal = 0;
        let endVal = amount;
        let duration = 8000;
        let startTime = null;
        function animateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentVal = Math.floor(progress * (endVal - startVal) + startVal);
            const counterEl = document.getElementById('jackpot-counter');
            if (counterEl) counterEl.innerHTML = currentVal.toLocaleString() + ' KS';
            if (progress < 1) requestAnimationFrame(animateCounter);
        }
        requestAnimationFrame(animateCounter);
        
        setTimeout(() => {
            const c = document.getElementById('jackpot-container');
            if (c) c.remove();
        }, 13000);
    }
    
    // ========== CANVAS SETUP ==========
    function setupCanvas() {
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        
        canvas = document.createElement('canvas');
        canvas.id = 'jackpot-canvas';
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.position = 'fixed';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = '999995';
        canvas.style.borderRadius = '20px';
        canvas.style.boxShadow = '0 0 80px rgba(255,100,0,0.9), 0 0 30px gold';
        canvas.style.border = '3px solid #FFD700';
        document.body.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
    }
    
    // ========== ANIMATION LOOP ==========
    function resetAndStart(amount) {
        if (!canvas || !ctx) {
            setupCanvas();
        }
        
        if (!canvas || !ctx) {
            console.error("Canvas not available");
            return;
        }
        
        if (animationId) cancelAnimationFrame(animationId);
        if (burstInterval) clearInterval(burstInterval);
        if (fireworkInterval) clearInterval(fireworkInterval);
        
        isActive = true;
        currentAmount = amount;
        
        scaleText = 0;
        glowIntensity = 0;
        digitIndex = 0;
        diamonds = [];
        fireworks = [];
        time = 0;
        
        const amountStr = amount.toLocaleString();
        displayAmount = "";
        
        const animateDigits = () => {
            if (digitIndex <= amountStr.length) {
                displayAmount = amountStr.substring(0, digitIndex);
                digitIndex++;
                setTimeout(animateDigits, 100);
                if (digitIndex % 3 === 0) playTick();
            }
        };
        animateDigits();
        
        if (typeof gsap !== 'undefined') {
            gsap.to({val:0}, {val:1, duration:1.2, ease:"backOut(1.5)", onUpdate:function(){ scaleText = this.targets()[0].val; }});
            gsap.to({g:0}, {g:1, duration:1.5, repeat:8, yoyo:true, onUpdate:function(){ glowIntensity = this.targets()[0].g; }});
            gsap.to({x:0}, {x:Math.PI*2, duration:5, repeat:-1, ease:"none", onUpdate:function(){ wobbleX = this.targets()[0].x; }});
            gsap.to({y:0}, {y:Math.PI*2, duration:6, repeat:-1, ease:"none", onUpdate:function(){ wobbleY = this.targets()[0].y; }});
        } else {
            scaleText = 1; glowIntensity = 1;
        }
        
        playJackpotSequence();
        
        createDiamondBurst();
        createFireworkBurst();
        createCoinRain();
        startScreenShake();
        addCSSJackpot(amount);
        
        let burstTimes = 0;
        burstInterval = setInterval(() => {
            burstTimes++;
            if (burstTimes < 5) createDiamondBurst();
            if (burstTimes >= 6) { clearInterval(burstInterval); burstInterval = null; }
        }, 1200);
        
        let fireworkTimes = 0;
        fireworkInterval = setInterval(() => {
            fireworkTimes++;
            if (fireworkTimes < 4) createFireworkBurst();
            if (fireworkTimes >= 5) { clearInterval(fireworkInterval); fireworkInterval = null; }
        }, 1800);
        
        setTimeout(() => {
            if (isActive) {
                if (typeof gsap !== 'undefined') {
                    gsap.to({val:scaleText}, {val:0, duration:1.2, onUpdate:function(){ scaleText = this.targets()[0].val; }, onComplete:()=>{ isActive=false; clearCanvas(); }});
                } else { isActive = false; clearCanvas(); }
            }
        }, 15000);
        
        function animateLoop() {
            if (!ctx) return;
            
            if (!isActive && diamonds.length === 0 && fireworks.length === 0) {
                animationId = null;
                return;
            }
            
            drawBackground();
            updateRotatingLights();
            
            if (isActive) {
                const cx = WIDTH/2, cy = HEIGHT/2 - 30;
                drawRotatingLights(cx, cy);
                drawJackpotText(cx, cy, scaleText, wobbleX, wobbleY, glowIntensity);
                if (displayAmount) drawAmount(displayAmount, cx, cy + 80, scaleText, glowIntensity);
            }
            
            for (let i = 0; i < diamonds.length; i++) {
                const alive = diamonds[i].update();
                if (alive) diamonds[i].draw(ctx);
                else { diamonds.splice(i,1); i--; }
            }
            
            for (let i = 0; i < fireworks.length; i++) {
                const alive = fireworks[i].update();
                if (alive) fireworks[i].draw(ctx);
                else { fireworks.splice(i,1); i--; }
            }
            
            time++;
            animationId = requestAnimationFrame(animateLoop);
        }
        animateLoop();
    }
    
    function clearCanvas() {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = null; 
        ctx = null;
        if (screenShakeInterval) clearInterval(screenShakeInterval);
        if (burstInterval) clearInterval(burstInterval);
        if (fireworkInterval) clearInterval(fireworkInterval);
        const container = document.getElementById('jackpot-container');
        if (container) container.remove();
        document.querySelectorAll('.jackpot-coin').forEach(el => el.remove());
    }
    
    // ========== PUBLIC API ==========
    function show(amount = 0) {
        addStyles();
        initRotatingLights();
        initAudio();
        
        // Auto unlock audio on first user interaction
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        
        setupCanvas();
        resetAndStart(amount);
    }
    
    return { show: show };
})();
