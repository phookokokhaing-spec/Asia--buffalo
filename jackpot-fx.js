
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
    let stars = [];
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
        // ဒင်္ဂါးပေါ်က သင်္ကေတ (ကျပန်းရွေး)
        this.symbols = ['🪙', '💫', '✨', '🌟', '⭐', '💎', '🎰', '💰'];
        this.symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
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
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // ဒင်္ဂါးအပြင်ဘက် Gradient
        const grad = ctx.createRadialGradient(-this.size/3, -this.size/3, 0, 0, 0, this.size/2);
        grad.addColorStop(0, this.color);
        grad.addColorStop(0.5, this.color + 'cc');
        grad.addColorStop(1, this.color + '88');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // ဒင်္ဂါးအစွန်း ရွှေရောင်
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2 + 1, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // ဒင်္ဂါးပေါ်က သင်္ကေတ (🪙 💫 ✨ 🌟)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${this.size * 0.65}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.symbol, 0, 0);
        
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
    
     // ========== STAR PARTICLE ==========
class StarFX {
    constructor(x, y, vx, vy, size, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        // Star shapes
        this.starTypes = ['✨', '⭐', '🌟', '💫', '⭐'];
        this.starChar = this.starTypes[Math.floor(Math.random() * this.starTypes.length)];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.vx *= 0.98;
        this.life -= 2;
        this.rotation += this.rotSpeed;
        return this.life > 0;
    }
    
    draw(ctx) {
        const alpha = Math.min(1, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw star emoji
        ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.color;
        ctx.fillText(this.starChar, 0, 0);
        
        ctx.restore();
    }
}
   
    // ========== ROTATING LIGHTS ==========
  function initRotatingLights() {
    rotatingLights = [];
    const djColors = ['#ff66cc', '#ff44aa', '#c154c1', '#8a2be2', '#ff00ff', '#ff88dd'];
    for (let i = 0; i < 16; i++) {
        rotatingLights.push({
            angle: (i / 16) * Math.PI * 2,
            radius: 170 + Math.sin(i) * 15,
            color: djColors[i % djColors.length],
            size: 8 + Math.random() * 8,
            speed: 0.01 + Math.random() * 0.008,
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
    const text = "JACKPOT";
    const fontSize = 64 * (0.7 + scale * 0.4);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${fontSize}px "Poppins", "Arial Black", "Impact"`;
    
    // Bounce/Wobble effect - ကနေသလို
    const bounceY = Math.sin(wobbleX * 2.5) * 8;  // အတက်အကျ
    const bounceX = Math.sin(wobbleY * 2) * 4;    // ဘယ်ညာ
    const offsetX = bounceX;
    const offsetY = bounceY;
    
    // 3D layers (အရောင်ပြောင်း)
    const layers = [
        { offset: 6, color: '#4a0e4e' },  // ခရမ်းရင့်
        { offset: 4, color: '#7b1e7b' },  // ခရမ်း
        { offset: 2, color: '#c154c1' },  // ခရမ်းဖျော့
        { offset: 0, color: '#ff66cc' }   // ပန်းရောင်
    ];
    
    for (const layer of layers) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff44aa';
        ctx.fillStyle = layer.color;
        ctx.fillText(text, x + layer.offset + offsetX + shakeX, y + layer.offset + offsetY + shakeY);
    }
    
    // Main gradient - DJ စတိုင် (ပန်းရောင်/ခရမ်း/အပြာ)
    const grad = ctx.createLinearGradient(x - 80, y - 40, x + 80, y + 40);
    grad.addColorStop(0, '#ff66cc');      // ပန်းရောင်
    grad.addColorStop(0.3, '#ff44aa');    // ပန်းခရမ်း
    grad.addColorStop(0.6, '#c154c1');    // ခရမ်း
    grad.addColorStop(1, '#8a2be2');      // ခရမ်းရင့်
    ctx.fillStyle = grad;
    
    // Neon Glow effect
    ctx.shadowBlur = 35 * (1 + glowIntensity);
    ctx.shadowColor = `rgba(255, 68, 170, ${0.8 + glowIntensity * 0.5})`;
    ctx.fillText(text, x + offsetX + shakeX, y + offsetY + shakeY);
    
    // Extra sparkle overlay
    ctx.fillStyle = 'rgba(255, 200, 255, 0.4)';
    ctx.fillText(text, x + offsetX - 1 + shakeX, y + offsetY - 1 + shakeY);
    
    ctx.restore();
}
    
    function drawAmount(amountStr, x, y, scale, glowIntensity) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = 48 * (0.8 + scale * 0.3);
    ctx.font = `bold ${fontSize}px "Poppins", "Arial Black", monospace`;
    
    // ကနေသလို effect
    const bounceY = Math.sin(wobbleX * 3) * 3;
    
    // Shadow layers
    ctx.fillStyle = '#4a0e4e';
    ctx.fillText(amountStr, x + 4 + shakeX, y + 4 + bounceY + shakeY);
    ctx.fillStyle = '#c154c1';
    ctx.fillText(amountStr, x + 2 + shakeX, y + 2 + bounceY + shakeY);
    
    // Main gradient
    const grad = ctx.createLinearGradient(x - 50, y - 15, x + 50, y + 15);
    grad.addColorStop(0, '#ff66cc');
    grad.addColorStop(0.5, '#ff44aa');
    grad.addColorStop(1, '#c154c1');
    ctx.fillStyle = grad;
    ctx.shadowBlur = 20 * (1 + glowIntensity);
    ctx.shadowColor = `rgba(255, 68, 170, 0.8)`;
    ctx.fillText(amountStr, x + shakeX, y + bounceY + shakeY);
    
    ctx.restore();
}
    
    // ========== BACKGROUND ==========
    function drawBackground() {
    // DJ style - ပြောင်းလဲနေတဲ့ gradient
    const hue1 = (time * 0.5) % 360;
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;
    
    const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    grad.addColorStop(0, `hsl(${hue1}, 70%, 8%)`);
    grad.addColorStop(0.5, `hsl(${hue2}, 60%, 12%)`);
    grad.addColorStop(1, `hsl(${hue3}, 80%, 6%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Dancing stars
    for (let i = 0; i < 80; i++) {
        if (Math.random() > 0.98) {
            const starHue = (time * 2 + i * 15) % 360;
            ctx.fillStyle = `hsla(${starHue}, 100%, 70%, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc((i * 137) % WIDTH, (time * 0.5 + i * 83) % HEIGHT, 2 + Math.sin(time * 0.02 + i) * 1, 0, Math.PI * 2);
            ctx.fill();
        }
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
    // ရောင်စုံ ဒင်္ဂါးအရောင်များ 🪙💫✨🌟
    const rainbowColors = [
        '#FF66CC',  // ပန်းရောင်
        '#FF44AA',  // ပန်းခရမ်း
        '#FF00FF',  // ပန်းရောင်တောက်
        '#CC33FF',  // ခရမ်း
        '#9933FF',  // ခရမ်းရင့်
        '#6666FF',  // အပြာ
        '#33CCFF',  // အပြာဖျော့
        '#00FFFF',  // စိမ်းပြာ
        '#33FF99',  // အစိမ်းဖျော့
        '#66FF66',  // အစိမ်း
        '#FFFF33',  // အဝါ
        '#FFCC33',  // လိမ္မော်ဝါ
        '#FF9933',  // လိမ္မော်
        '#FF6633'   // လိမ္မော်ရင့်
    ];
    
    for (let i = 0; i < intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 10;
        const vx = Math.cos(angle) * speed * (Math.random() * 1.4);
        const vy = Math.sin(angle) * speed * (Math.random() * 1.2) - 4;
        const size = 10 + Math.random() * 18;
        // ရောင်စုံကနေ ကျပန်းရွေး
        const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
        const rotSpeed = (Math.random() - 0.5) * 0.2;
        coins.push(new CoinFX(centerX, centerY, vx, vy, size, color, rotSpeed));
       
    }
}
    
   function createFireworkBurst(x, y, intensity = 40) {
    const djColors = ['#ff66cc', '#ff44aa', '#ff00ff', '#c154c1', '#8a2be2', '#ff88dd', '#ffaaff'];
    for (let i = 0; i < intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 2;
        const color = djColors[Math.floor(Math.random() * djColors.length)];
        const life = 60 + Math.random() * 100;
        fireworks.push(new FireworkFX(x, y, vx, vy, color, life));
    }
    playFirework();
}
   
    // ========== STAR BURST ==========
function createStarBurst(x, y, intensity = 30) {
    const starColors = ['#FFD700', '#FF66CC', '#FF44AA', '#33CCFF', '#66FF66', '#FF9933', '#FFFFFF'];
    for (let i = 0; i < intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 6;
        const vx = Math.cos(angle) * speed * (Math.random() * 1.2);
        const vy = Math.sin(angle) * speed * (Math.random() * 1.2) - 3;
        const size = 16 + Math.random() * 12;
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const life = 40 + Math.random() * 60;
        stars.push(new StarFX(x, y, vx, vy, size, color, life));
    }
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
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 68, 170, 0.4)';  // ပန်းရောင်တောက်
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '999997';
    flash.style.animation = 'jackpotFXFlash 0.4s ease-out forwards';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
}
    
    // ========== CSS STYLES ==========
    function addStyles() {
        if (document.getElementById('jackpotfx-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'jackpotfx-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Bangers&display=swap');
            
            @keyframes jackpotFXFlash {
              0% { opacity: 0.8; backdrop-filter: blur(3px); background-color: rgba(255, 68, 170, 0.5); }
              100% { opacity: 0; backdrop-filter: blur(0px); background-color: rgba(255, 68, 170, 0); }
           }
            
            @keyframes coinFallFX {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            @keyframes coinFallFX {
                0% { 
                 transform: translateY(0) rotate(0deg); 
                 opacity: 1; 
                   filter: blur(0px);
             }
                    25% {
                   transform: translateY(25vh) rotate(180deg);
             }
                      50% {
                      transform: translateY(50vh) rotate(360deg);
                     filter: blur(1px);
              }
                       75% {
                       transform: translateY(75vh) rotate(540deg);
              }
                       100% { 
                        transform: translateY(110vh) rotate(720deg); 
                         opacity: 0;
                       filter: blur(2px);
              }
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
    const items = ['🪙', '💫', '✨', '🌟', '⭐', '💎', '🎰', '💰', '💛', '💜', '💚', '💙', '🧡'];
    const rainbowColors = ['#FF66CC', '#FF44AA', '#CC33FF', '#6666FF', '#33FF99', '#FFFF33', '#FF9933', '#FFD700'];
    
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const itemEl = document.createElement('div');
            itemEl.className = 'jackpotfx-coin';
            // ကျပန်း emoji (coin or star)
            itemEl.textContent = items[Math.floor(Math.random() * items.length)];
            itemEl.style.left = Math.random() * 100 + '%';
            itemEl.style.top = '-10%';
            itemEl.style.fontSize = (Math.random() * 32 + 20) + 'px';
            itemEl.style.textShadow = `0 0 15px ${rainbowColors[Math.floor(Math.random() * rainbowColors.length)]}`;
            itemEl.style.color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
            document.body.appendChild(itemEl);
            setTimeout(() => itemEl.remove(), 4000);
        }, i * 50);
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
    }
    
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
    
    // ===== PHASE 1: Initial Burst (0 sec) =====
    playDing();
    createMultipleCoinBursts();
    createMultipleFireworks();
    createStarBurst(WIDTH/2, HEIGHT/2, 40);
    createFallingCoins();
    addScreenFlash();
    startScreenShake();
    
    // ===== PHASE 2: Mid Celebration (15 sec) =====
    setTimeout(() => {
        if (isActive) {
            createCoinBurst(WIDTH/2, HEIGHT/2 + 40, 45);
            createFireworkBurst(WIDTH/2, HEIGHT/2, 40);
            createStarBurst(WIDTH/2, HEIGHT/2 - 30, 35);
            createFireworkBurst(WIDTH * 0.3, HEIGHT * 0.4, 30);
            createFireworkBurst(WIDTH * 0.7, HEIGHT * 0.4, 30);
            addScreenFlash();
        }
    }, 15000);
    
    // ===== PHASE 3: Grand Finale (30 sec) =====
    setTimeout(() => {
        if (isActive) {
            createCoinBurst(WIDTH/2, HEIGHT/2 + 40, 80);
            createCoinBurst(WIDTH * 0.2, HEIGHT * 0.6, 40);
            createCoinBurst(WIDTH * 0.8, HEIGHT * 0.6, 40);
            createFireworkBurst(WIDTH/2, HEIGHT/2 - 30, 70);
            createStarBurst(WIDTH/2, HEIGHT/2 - 30, 35);
            createFireworkBurst(WIDTH * 0.25, HEIGHT * 0.5, 45);
            createFireworkBurst(WIDTH * 0.75, HEIGHT * 0.5, 45);
            addScreenFlash();
            setTimeout(() => addScreenFlash(), 200);
        }
    }, 30000);
    
    // ===== PHASE 4: Fade Out (45 sec) =====
    setTimeout(() => {
        if (isActive) {
            createCoinBurst(WIDTH/2, HEIGHT/2 + 30, 35);
            createFireworkBurst(WIDTH/2, HEIGHT/2, 30);
            createStarBurst(WIDTH/2, HEIGHT/2 - 20, 25);
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
        // 👇 Draw stars (ထည့်မယ်)
    for (let i = 0; i < stars.length; i++) {
        const alive = stars[i].update();
        if (alive) stars[i].draw(ctx);
        else { stars.splice(i, 1); i--; }
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
