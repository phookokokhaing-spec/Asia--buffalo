

const JackpotAnimation = (function() {
    
    // ========== PRIVATE VARIABLES ==========
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let isActive = false;
    let currentAmount = 0;
    
    let particles = [];
    let diamonds = [];
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
    
    const WIDTH = 800;
    const HEIGHT = 450;
    
    // ========== SOUND SYSTEM (Web Audio API) ==========
    let audioContext = null;
    let isSoundEnabled = true;
    
    function initAudio() {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.warn("Web Audio API not supported");
            isSoundEnabled = false;
        }
    }
    
    function playTone(frequency, duration, volume = 0.3, type = 'sine') {
        if (!isSoundEnabled || !audioContext) return;
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
        playTone(880, 0.2, 0.4, 'sine');  // A5
        setTimeout(() => playTone(1046.5, 0.3, 0.4, 'sine'), 150); // C6
        setTimeout(() => playTone(1318.5, 0.5, 0.5, 'sine'), 350); // E6
    }
    
    function playCoinDrop() {
        playTone(523.25, 0.1, 0.2, 'triangle'); // C5
        setTimeout(() => playTone(392.00, 0.15, 0.2, 'triangle'), 80); // G4
    }
    
    function playSparkle() {
        playTone(2093.0, 0.08, 0.15, 'sine'); // C7
        setTimeout(() => playTone(2637.02, 0.08, 0.15, 'sine'), 50); // E7
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
        // Jackpot fanfare melody
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.25, 0.5, 'sine'), i * 180);
        });
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
            this.rotSpeed = (Math.random() - 0.5) * 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08;
            this.vx *= 0.99;
            this.life -= 1.5;
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
            
            // Diamond shape
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
    
    // ========== FIREWORK PARTICLE ==========
    class Firework {
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
            this.vy += 0.1;
            this.life -= 3;
            return this.life > 0;
        }
        draw(ctx) {
            const alpha = Math.min(1, this.life / this.maxLife);
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    // ========== ROTATING GOLD LIGHTS ==========
    function initRotatingLights() {
        rotatingLights = [];
        for (let i = 0; i < 16; i++) {
            rotatingLights.push({
                angle: (i / 16) * Math.PI * 2,
                radius: 180,
                color: i % 2 === 0 ? '#FFD700' : '#FF4500',
                size: 8 + Math.random() * 6,
                speed: 0.006,
                pulse: 0
            });
        }
    }
    
    function updateRotatingLights() {
        for (let i = 0; i < rotatingLights.length; i++) {
            const light = rotatingLights[i];
            light.angle += light.speed;
            light.pulse = 0.6 + Math.sin(time * 0.008 + i) * 0.4;
        }
    }
    
    function drawRotatingLights(centerX, centerY) {
        for (const light of rotatingLights) {
            const x = centerX + Math.cos(light.angle) * light.radius;
            const y = centerY + Math.sin(light.angle) * light.radius;
            
            ctx.save();
            ctx.shadowBlur = 20;
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
    
    // ========== 3D JACKPOT TEXT ==========
    function drawJackpotText(x, y, scale, wobbleX, wobbleY, glowIntensity) {
        const text = "JACKPOT";
        const fontSize = 68 * (0.6 + scale * 0.5);
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `900 ${fontSize}px "Poppins", "Arial Black", "Impact"`;
        
        const offsetX = Math.sin(wobbleX) * 4;
        const offsetY = Math.sin(wobbleY) * 3;
        
        // 3D Gold Layers
        const goldLayers = [
            { offset: 8, color: '#8B4513', blur: 0 },
            { offset: 6, color: '#B8860B', blur: 2 },
            { offset: 4, color: '#DAA520', blur: 4 },
            { offset: 2, color: '#FFD700', blur: 6 },
            { offset: 0, color: '#FFA500', blur: 8 }
        ];
        
        for (let i = 0; i < goldLayers.length; i++) {
            const layer = goldLayers[i];
            ctx.shadowBlur = layer.blur;
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.fillStyle = layer.color;
            ctx.fillText(text, x + layer.offset + offsetX + shakeX, y + layer.offset + offsetY + shakeY);
        }
        
        // Main gradient
        const grad = ctx.createLinearGradient(x - 80, y - 30, x + 80, y + 30);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.3, '#FFA500');
        grad.addColorStop(0.6, '#FF4500');
        grad.addColorStop(1, '#FFD700');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 30 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, ${0.8 + glowIntensity * 0.5})`;
        ctx.fillText(text, x + offsetX + shakeX, y + offsetY + shakeY);
        
        // Diamond sparkle overlay
        ctx.fillStyle = 'rgba(255,255,200,0.6)';
        ctx.fillText(text, x + offsetX - 1 + shakeX, y + offsetY - 1 + shakeY);
        
        ctx.restore();
    }
    
    function drawAmount(amountStr, x, y, scale, glowIntensity) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 52 * (0.8 + scale * 0.3);
        ctx.font = `bold ${fontSize}px "Poppins", "Arial Black", monospace`;
        
        ctx.fillStyle = '#4a2a00';
        ctx.fillText(amountStr, x + 6 + shakeX, y + 6 + shakeY);
        ctx.fillStyle = '#8B4513';
        ctx.fillText(amountStr, x + 4 + shakeX, y + 4 + shakeY);
        ctx.fillStyle = '#DAA520';
        ctx.fillText(amountStr, x + 2 + shakeX, y + 2 + shakeY);
        
        const grad = ctx.createLinearGradient(x - 60, y - 20, x + 60, y + 20);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, '#FFA500');
        grad.addColorStop(1, '#FF4500');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 20 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, 0.8)`;
        ctx.fillText(amountStr, x + shakeX, y + shakeY);
        
        ctx.restore();
    }
    
    // ========== BACKGROUND ==========
    function drawBackground() {
        const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        grad.addColorStop(0, '#1a0a0a');
        grad.addColorStop(0.5, '#2a1a0a');
        grad.addColorStop(1, '#3a2a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        // Gold clouds
        for (let i = 0; i < 30; i++) {
            if (Math.random() > 0.98) {
                ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.2})`;
                ctx.beginPath();
                ctx.ellipse((i * 173) % WIDTH, (time + i * 50) % HEIGHT, 40, 20, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // ========== SCREEN SHAKE ==========
    function startScreenShake() {
        if (screenShakeInterval) clearInterval(screenShakeInterval);
        let shakeCount = 0;
        screenShakeInterval = setInterval(() => {
            if (shakeCount >= 15) {
                clearInterval(screenShakeInterval);
                screenShakeInterval = null;
                shakeX = 0;
                shakeY = 0;
                return;
            }
            shakeX = (Math.random() - 0.5) * 12;
            shakeY = (Math.random() - 0.5) * 8;
            shakeCount++;
            playDrumHit();
        }, 50);
    }
    
    // ========== PARTICLES ==========
    function createDiamondBurst() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 30;
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            const vx = Math.cos(angle) * speed * (Math.random() * 1.2);
            const vy = Math.sin(angle) * speed * (Math.random() * 1.0) - 1;
            const size = Math.random() * 8 + 4;
            const life = Math.random() * 150 + 100;
            diamonds.push(new Diamond(centerX, centerY, vx, vy, size, life));
            playSparkle();
        }
    }
    
    function createFireworkBurst() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 20;
        const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF69B4', '#00FFFF'];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = Math.random() * 100 + 80;
            fireworks.push(new Firework(centerX, centerY, vx, vy, color, life));
        }
        playFirework();
    }
    
    function createCoinRain() {
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'jackpot-coin';
                coin.textContent = '🪙';
                coin.style.position = 'fixed';
                coin.style.left = Math.random() * 100 + '%';
                coin.style.top = '-10%';
                coin.style.fontSize = (Math.random() * 30 + 24) + 'px';
                coin.style.zIndex = '999998';
                coin.style.pointerEvents = 'none';
                coin.style.animation = 'coinFallSlow 4s linear forwards';
                coin.style.color = '#FFD700';
                coin.style.textShadow = '0 0 10px orange';
                document.body.appendChild(coin);
                setTimeout(() => coin.remove(), 4000);
                playCoinDrop();
            }, i * 80);
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
                width: 85%;
                max-width: 750px;
                pointer-events: none;
            }
            .jackpot-text-css {
                font-size: 64px;
                font-weight: 900;
                letter-spacing: 8px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                background: linear-gradient(135deg, #FFD700, #FFA500, #FF4500, #FFD700);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-shadow: 0 0 30px rgba(255,100,0,0.8);
                animation: jackpotGlow 0.4s infinite alternate, jackpotShake 0.05s infinite;
            }
            @keyframes jackpotGlow {
                from { filter: drop-shadow(0 0 10px gold); }
                to { filter: drop-shadow(0 0 30px orange) drop-shadow(0 0 20px red); }
            }
            @keyframes jackpotShake {
                0% { transform: translate(0,0); }
                25% { transform: translate(2px,-2px); }
                50% { transform: translate(-2px,2px); }
                75% { transform: translate(2px,2px); }
                100% { transform: translate(0,0); }
            }
            .jackpot-counter {
                display: block;
                font-size: 58px;
                color: #FFD700;
                font-family: 'Bangers', cursive;
                text-shadow: 0 0 20px rgba(255,100,0,0.8), 0 0 10px red;
                margin-top: 20px;
                animation: counterJackpot 0.3s infinite alternate;
            }
            @keyframes counterJackpot {
                from { transform: scale(1); text-shadow: 0 0 20px gold; }
                to { transform: scale(1.1); text-shadow: 0 0 40px orange, 0 0 20px red; }
            }
            .jackpot-coin {
                position: fixed;
                animation: coinFallSlow 4s linear forwards;
                pointer-events: none;
                z-index: 999998;
                text-shadow: 0 0 10px gold;
            }
            @keyframes coinFallSlow {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
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
        let duration = 4500;
        let startTime = null;
        function animateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentVal = Math.floor(progress * (endVal - startVal) + startVal);
            const counterEl = document.getElementById('jackpot-counter');
            if (counterEl) counterEl.innerHTML = currentVal.toLocaleString() + ' KS';
            if (progress < 1) requestAnimationFrame(animateCounter);
            else playFanfare();
        }
        requestAnimationFrame(animateCounter);
        
        setTimeout(() => {
            const c = document.getElementById('jackpot-container');
            if (c) c.remove();
        }, 8000);
    }
    
    // ========== CANVAS SETUP ==========
    function setupCanvas() {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        
        canvas = document.createElement('canvas');
        canvas.id = 'jackpot-canvas';
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.position = 'fixed';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = '999995';
        canvas.style.borderRadius = '16px';
        canvas.style.boxShadow = '0 0 50px rgba(255,100,0,0.8)';
        canvas.style.border = '2px solid gold';
        document.body.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
    }
    
    // ========== ANIMATION LOOP ==========
    function resetAndStart(amount) {
        if (animationId) cancelAnimationFrame(animationId);
        if (burstInterval) clearInterval(burstInterval);
        
        isActive = true;
        currentAmount = amount;
        
        scaleText = 0;
        glowIntensity = 0;
        digitIndex = 0;
        particles = [];
        diamonds = [];
        fireworks = [];
        time = 0;
        
        const amountStr = amount.toLocaleString();
        displayAmount = "";
        
        const animateDigits = () => {
            if (digitIndex <= amountStr.length) {
                displayAmount = amountStr.substring(0, digitIndex);
                digitIndex++;
                setTimeout(animateDigits, 80);
                playTick();
            }
        };
        animateDigits();
        
        // GSAP animations
        if (typeof gsap !== 'undefined') {
            gsap.to({val:0}, {val:1, duration:0.6, ease:"backOut(1.5)", onUpdate:function(){ scaleText = this.targets()[0].val; }});
            gsap.to({g:0}, {g:1, duration:0.8, repeat:6, yoyo:true, onUpdate:function(){ glowIntensity = this.targets()[0].g; }});
            gsap.to({x:0}, {x:Math.PI*2, duration:2.5, repeat:-1, ease:"none", onUpdate:function(){ wobbleX = this.targets()[0].x; }});
            gsap.to({y:0}, {y:Math.PI*2, duration:3, repeat:-1, ease:"none", onUpdate:function(){ wobbleY = this.targets()[0].y; }});
        } else {
            scaleText = 1; glowIntensity = 1;
        }
        
        // Effects
        playDing();
        createDiamondBurst();
        createFireworkBurst();
        createCoinRain();
        startScreenShake();
        addCSSJackpot(amount);
        
        let burstTimes = 0;
        burstInterval = setInterval(() => {
            burstTimes++;
            if (burstTimes < 3) createDiamondBurst();
            if (burstTimes < 2) createFireworkBurst();
            if (burstTimes >= 4) { clearInterval(burstInterval); burstInterval = null; }
        }, 800);
        
        setTimeout(() => {
            if (isActive) {
                if (typeof gsap !== 'undefined') {
                    gsap.to({val:scaleText}, {val:0, duration:0.8, onUpdate:function(){ scaleText = this.targets()[0].val; }, onComplete:()=>{ isActive=false; clearCanvas(); }});
                } else { isActive = false; clearCanvas(); }
            }
        }, 9000);
        
        function animateLoop() {
            if (!isActive && diamonds.length === 0 && fireworks.length === 0) {
                animationId = null;
                return;
            }
            
            drawBackground();
            updateRotatingLights();
            
            if (isActive) {
                const cx = WIDTH/2, cy = HEIGHT/2 - 25;
                drawRotatingLights(cx, cy);
                drawJackpotText(cx, cy, scaleText, wobbleX, wobbleY, glowIntensity);
                if (displayAmount) drawAmount(displayAmount, cx, cy + 70, scaleText, glowIntensity);
            }
            
            // Draw diamonds
            for (let i = 0; i < diamonds.length; i++) {
                const alive = diamonds[i].update();
                if (alive) diamonds[i].draw(ctx);
                else { diamonds.splice(i,1); i--; }
            }
            
            // Draw fireworks
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
        canvas = null; ctx = null;
        if (screenShakeInterval) clearInterval(screenShakeInterval);
        const container = document.getElementById('jackpot-container');
        if (container) container.remove();
        document.querySelectorAll('.jackpot-coin').forEach(el => el.remove());
    }
    
    // ========== PUBLIC API ==========
    function show(amount = 0) {
        addStyles();
        setupCanvas();
        initRotatingLights();
        initAudio();
        // Auto-unlock audio on user interaction
        const unlockAudio = () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        resetAndStart(amount);
    }
    
    return { show: show };
})();
