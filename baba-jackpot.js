// ============================================
// BABA JACKPOT ANIMATION - v6.5 (Secret Win + Rolling Reveal)
// Animation ပြီးမှ Win Amount + Balance ထွက်ပေါ်
// ============================================
(function(global) {
    'use strict';

    const CONFIG = {
        WIN_TYPES: {
            mega: { primary: '#ffd700', secondary: '#ff8c00', glow: 'rgba(255,215,0,0.6)', text: 'MEGA' },
            big: { primary: '#00ff88', secondary: '#00cc66', glow: 'rgba(0,255,136,0.6)', text: 'BIG' },
            super: { primary: '#00ccff', secondary: '#0099ff', glow: 'rgba(0,204,255,0.6)', text: 'SUPER' }
        },
        
        TIMING: {
            FLY: 5000,
            ORBIT: 30000,
            GATHER: 3000,
            EXPLODE: 8000,
            DISPLAY: 15000
        },
        
        SOUND_SYNC: true,
        SOUND_RATIO: {
            FLY: 0.08,
            ORBIT: 0.50,
            GATHER: 0.05,
            EXPLODE: 0.12,
            DISPLAY: 0.25
        },
        
        ROLLING: {
            DURATION: 4000,      // 4s rolling (ပိုကြာ)
            SEPARATOR: ',',
            SUFFIX: ' ကျပ်'
        },
        
        ORBIT_RADIUS: 250,
        PARTICLE_COUNT: 100,
        RAIN_COUNT: 80
    };

    class BabaJackpotAnim {
        constructor() {
            this.isPlaying = false;
            this.elements = [];
            this.timing = { ...CONFIG.TIMING };
            this.audio = null;
            this.styleId = 'baba-jackpot-v6-5';
            
            // Win amount (secret until animation ends)
            this.secretWinAmount = 0;
            this.originalBalance = 0;
            
            // External elements
            this.winBoxEl = null;
            this.userBalanceEl = null;
            
            this.initStyles();
        }

        initStyles() {
            if (document.getElementById(this.styleId)) return;
            
            const css = `
                /* ===== CORE ===== */
                .bja65-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    pointer-events: none;
                    display: none;
                }
                .bja65-overlay.active { display: block; }

                /* ===== FLYING BABA ===== */
                .bja65-baba {
                    position: fixed;
                    width: 100px;
                    height: 100px;
                    z-index: 10000;
                    pointer-events: none;
                    will-change: transform;
                    filter: drop-shadow(0 0 20px gold);
                }
                .bja65-baba img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    border-radius: 50%;
                }
                .bja65-baba .emoji {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    background: radial-gradient(circle, rgba(255,215,0,0.3), transparent);
                    border-radius: 50%;
                }

                /* ===== ANIMATIONS ===== */
                @keyframes bja65-wobble {
                    0%, 100% { transform: rotate(-5deg) scale(1); }
                    25% { transform: rotate(5deg) scale(1.05); }
                    50% { transform: rotate(-3deg) scale(0.95); }
                    75% { transform: rotate(3deg) scale(1.02); }
                }
                @keyframes bja65-bob {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    25% { transform: translateY(-8px) rotate(5deg); }
                    50% { transform: translateY(0) rotate(-3deg); }
                    75% { transform: translateY(8px) rotate(3deg); }
                }
                @keyframes bja65-tiltFly {
                    0% { transform: rotate(0deg) scale(0.8); }
                    25% { transform: rotate(-15deg) scale(1.1); }
                    50% { transform: rotate(10deg) scale(0.95); }
                    75% { transform: rotate(-5deg) scale(1.05); }
                    100% { transform: rotate(0deg) scale(1); }
                }
                @keyframes bja65-pulseGlow {
                    0%, 100% { filter: drop-shadow(0 0 15px gold) brightness(1); }
                    50% { filter: drop-shadow(0 0 40px orange) brightness(1.3); }
                }
                @keyframes bja65-gatherShake {
                    0% { transform: translate(0,0) scale(1.2); }
                    20% { transform: translate(-5px,-5px) scale(1.3); }
                    40% { transform: translate(5px,5px) scale(1.2); }
                    60% { transform: translate(-5px,5px) scale(1.4); }
                    80% { transform: translate(5px,-5px) scale(1.3); }
                    100% { transform: translate(0,0) scale(1.5); }
                }
                @keyframes bja65-flashAnim {
                    0% { opacity: 0; }
                    20% { opacity: 0.95; }
                    100% { opacity: 0; }
                }
                @keyframes bja65-wave {
                    0% { width: 0; height: 0; opacity: 1; border-width: 6px; }
                    100% { width: 200vmax; height: 200vmax; opacity: 0; border-width: 0; }
                }
                @keyframes bja65-sparkFade {
                    0% { opacity: 0.8; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0) translateY(20px); }
                }
                @keyframes bja65-particleFly {
                    0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
                    100% { opacity: 0; transform: var(--bja65-end-transform); }
                }
                @keyframes bja65-rainFall {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(100vh) scale(0.3); }
                }
                @keyframes bja65-jackpotIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes bja65-textPulse {
                    0%, 100% { transform: scale(1); letter-spacing: 10px; }
                    50% { transform: scale(1.05); letter-spacing: 15px; }
                }
                @keyframes bja65-rainbow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
                @keyframes bja65-amountPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 30px var(--bja65-glow); }
                    50% { transform: scale(1.05); box-shadow: 0 0 60px var(--bja65-glow); }
                }
                @keyframes bja65-shake {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-5px, -5px); }
                    20% { transform: translate(5px, 5px); }
                    30% { transform: translate(-5px, 5px); }
                    40% { transform: translate(5px, -5px); }
                    50% { transform: translate(-3px, 3px); }
                    60% { transform: translate(3px, -3px); }
                    70% { transform: translate(-2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    90% { transform: translate(-1px, 1px); }
                }
                @keyframes bja65-countUp {
                    0% { transform: scale(1.5); filter: brightness(2); }
                    100% { transform: scale(1); filter: brightness(1); }
                }

                /* ===== COMPONENTS ===== */
                .bja65-flash {
                    position: fixed;
                    inset: 0;
                    background: white;
                    opacity: 0;
                    z-index: 9990;
                }
                .bja65-flash.active { animation: bja65-flashAnim 0.3s ease-out; }
                
                .bja65-vignette {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%);
                    opacity: 0;
                    z-index: 9980;
                    transition: opacity 0.5s;
                }
                .bja65-vignette.active { opacity: 1; }
                
                .bja65-shockwave {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    border: 4px solid;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    z-index: 9994;
                }
                .bja65-shockwave.active { animation: bja65-wave 1s ease-out forwards; }
                
                .bja65-spark {
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9997;
                    opacity: 0.8;
                    animation: bja65-sparkFade 0.4s ease-out forwards;
                }
                
                .bja65-particle {
                    position: fixed;
                    width: 40px;
                    height: 40px;
                    z-index: 9995;
                    pointer-events: none;
                    font-size: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    will-change: transform;
                    opacity: 0;
                }
                .bja65-particle.active { animation: bja65-particleFly 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
                
                .bja65-rain {
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: radial-gradient(circle, #ffd700, #ff8c00);
                    border-radius: 50%;
                    z-index: 9996;
                    box-shadow: 0 0 8px gold;
                    opacity: 0;
                }
                .bja65-rain.active { animation: bja65-rainFall 2s ease-in forwards; }
                
                /* ===== JACKPOT CONTAINER ===== */
                .bja65-jackpot {
                    position: fixed;
                    inset: 0;
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                    background: radial-gradient(ellipse at center, rgba(0,0,0,0.9), #000);
                    pointer-events: none;
                }
                .bja65-jackpot.active {
                    display: flex;
                    animation: bja65-jackpotIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .bja65-win-text {
                    font-size: 80px;
                    font-weight: 900;
                    font-family: 'Arial Black', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 10px;
                    background: linear-gradient(135deg, var(--bja65-primary), var(--bja65-secondary));
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: bja65-textPulse 1s ease-in-out infinite;
                }
                
                .bja65-jackpot-label {
                    font-size: 40px;
                    font-weight: bold;
                    margin-top: 10px;
                    background: linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: bja65-rainbow 2s linear infinite;
                }
                
                /* ===== WIN AMOUNT (Secret → Reveal) ===== */
                .bja65-amount {
                    font-size: 64px;
                    font-weight: bold;
                    margin-top: 20px;
                    padding: 20px 50px;
                    background: linear-gradient(135deg, #1a1a2e, #0f0f23);
                    border-radius: 25px;
                    border: 3px solid var(--bja65-primary);
                    color: var(--bja65-primary);
                    animation: bja65-amountPulse 1s ease-in-out infinite;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 3px;
                    min-width: 300px;
                    text-align: center;
                }
                .bja65-amount.counting {
                    animation: bja65-amountPulse 0.2s ease-in-out infinite, bja65-countUp 0.3s ease-out;
                    text-shadow: 0 0 30px var(--bja65-glow);
                }
                .bja65-amount-placeholder {
                    font-size: 48px;
                    color: rgba(255,255,255,0.3);
                    letter-spacing: 10px;
                }
                
                .bja65-shake { animation: bja65-shake 0.5s ease-in-out; }

                /* ===== MOBILE ===== */
                @media (max-width: 768px) {
                    .bja65-win-text { font-size: 50px; letter-spacing: 6px; }
                    .bja65-jackpot-label { font-size: 28px; }
                    .bja65-amount { font-size: 40px; padding: 12px 30px; min-width: 200px; }
                    .bja65-baba { width: 70px; height: 70px; }
                    .bja65-baba .emoji { font-size: 45px; }
                    .bja65-particle { width: 30px; height: 30px; font-size: 22px; }
                }
            `;
            
            const style = document.createElement('style');
            style.id = this.styleId;
            style.textContent = css;
            document.head.appendChild(style);
        }

        // ============================================
        // HELPERS
        // ============================================
        createEl(className, parent = document.body) {
            const el = document.createElement('div');
            el.className = className;
            parent.appendChild(el);
            this.elements.push(el);
            return el;
        }

        cleanup() {
            this.elements.forEach(el => {
                if (el.parentNode) el.remove();
            });
            this.elements = [];
            document.body.classList.remove('bja65-shake');
            
            if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.audio = null;
            }
            
            this.isPlaying = false;
            this.timing = { ...CONFIG.TIMING };
            this.secretWinAmount = 0;
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        createSpark(x, y, color) {
            const spark = this.createEl('bja65-spark');
            spark.style.left = (x + Math.random() * 40 - 20) + 'px';
            spark.style.top = (y + Math.random() * 40 - 20) + 'px';
            spark.style.background = `radial-gradient(circle, ${color}, transparent)`;
            spark.style.boxShadow = `0 0 6px ${color}`;
        }

        // ============================================
        // NUMBER FORMATTING
        // ============================================
        formatNumber(num) {
            let str = Math.floor(num).toString();
            str = str.replace(/\B(?=(\d{3})+(?!\d))/g, CONFIG.ROLLING.SEPARATOR);
            return str + CONFIG.ROLLING.SUFFIX;
        }

        parseNumber(text) {
            return parseInt(text.replace(/[^0-9]/g, '')) || 0;
        }

        easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        // ============================================
        // ROLLING NUMBER (0 → target)
        // ============================================
        async rollNumber(element, startValue, endValue, duration) {
            const startTime = performance.now();
            
            if (element) element.classList.add('counting');
            
            return new Promise(resolve => {
                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = this.easeOutExpo(progress);
                    const currentValue = startValue + (endValue - startValue) * eased;
                    
                    if (element) {
                        element.textContent = this.formatNumber(currentValue);
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        if (element) {
                            element.classList.remove('counting');
                            element.textContent = this.formatNumber(endValue);
                        }
                        resolve(endValue);
                    }
                };
                
                requestAnimationFrame(animate);
            });
        }

        // ============================================
        // REVEAL ALL (Jackpot + WinBox + Balance)
        // ============================================
        async revealWinAmount(winAmount, options) {
            const {
                winBoxSelector = null,
                userBalanceSelector = null
            } = options;

            this.winBoxEl = winBoxSelector ? document.querySelector(winBoxSelector) : null;
            this.userBalanceEl = userBalanceSelector ? document.querySelector(userBalanceSelector) : null;

            const duration = CONFIG.ROLLING.DURATION;
            
            // Get starting values
            const winBoxStart = this.winBoxEl ? this.parseNumber(this.winBoxEl.textContent) : 0;
            const balanceStart = this.userBalanceEl ? this.parseNumber(this.userBalanceEl.textContent) : this.originalBalance;
            const finalBalance = balanceStart + winAmount;

            // Animate all three simultaneously
            const promises = [];

            // 1. Jackpot overlay amount
            const jackpotAmountEl = document.querySelector('.bja65-amount');
            if (jackpotAmountEl) {
                promises.push(this.rollNumber(jackpotAmountEl, 0, winAmount, duration));
            }

            // 2. WinBox (game container)
            if (this.winBoxEl) {
                promises.push(this.rollNumber(this.winBoxEl, winBoxStart, winBoxStart + winAmount, duration));
            }

            // 3. UserBalance
            if (this.userBalanceEl) {
                promises.push(this.rollNumber(this.userBalanceEl, balanceStart, finalBalance, duration));
            }

            await Promise.all(promises);
            
            return finalBalance;
        }

        // ============================================
        // SOUND SYNC
        // ============================================
        async syncWithSound(soundUrl) {
            return new Promise((resolve) => {
                const audio = new Audio();
                
                audio.addEventListener('loadedmetadata', () => {
                    const duration = audio.duration * 1000;
                    console.log(`🎵 Sound duration: ${(duration/1000).toFixed(1)}s`);
                    
                    if (CONFIG.SOUND_SYNC && duration > 10000) {
                        this.timing = {
                            FLY: Math.floor(duration * CONFIG.SOUND_RATIO.FLY),
                            ORBIT: Math.floor(duration * CONFIG.SOUND_RATIO.ORBIT),
                            GATHER: Math.floor(duration * CONFIG.SOUND_RATIO.GATHER),
                            EXPLODE: Math.floor(duration * CONFIG.SOUND_RATIO.EXPLODE),
                            DISPLAY: Math.floor(duration * CONFIG.SOUND_RATIO.DISPLAY)
                        };
                        
                        CONFIG.ROLLING.DURATION = Math.min(4000, this.timing.DISPLAY * 0.35);
                    }
                    
                    resolve();
                });
                
                audio.addEventListener('error', () => resolve());
                setTimeout(() => resolve(), 2000);
                
                audio.src = soundUrl;
                audio.load();
            });
        }

        // ============================================
        // PHASES
        // ============================================
        
        async phaseFly(babaCells, winType, centerX, centerY, orbitRadius) {
            const colors = CONFIG.WIN_TYPES[winType];
            const babas = [];
            const count = Math.max(babaCells.length, 5);

            for (let i = 0; i < count; i++) {
                const cell = babaCells[i] || this.createDummyCell(i);
                const rect = cell.getBoundingClientRect();
                
                const baba = this.createEl('bja65-baba');
                baba.style.left = rect.left + 'px';
                baba.style.top = rect.top + 'px';

                const img = cell.querySelector('img');
                if (img?.src) {
                    const clone = img.cloneNode();
                    clone.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:50%;';
                    baba.appendChild(clone);
                } else {
                    baba.innerHTML = `<div class="emoji" style="color:${colors.primary}">👳</div>`;
                }

                const angle = (i / count) * Math.PI * 2;
                const targetX = centerX + Math.cos(angle) * orbitRadius - 50;
                const targetY = centerY + Math.sin(angle) * orbitRadius - 50;

                baba.style.animation = `
                    bja65-tiltFly ${this.timing.FLY}ms ease-in-out,
                    bja65-wobble 0.3s ease-in-out infinite,
                    bja65-pulseGlow 0.5s ease-in-out infinite
                `;

                requestAnimationFrame(() => {
                    baba.style.transition = `left ${this.timing.FLY}ms cubic-bezier(0.34, 1.3, 0.64, 1), 
                                            top ${this.timing.FLY}ms cubic-bezier(0.34, 1.3, 0.64, 1)`;
                    baba.style.left = targetX + 'px';
                    baba.style.top = targetY + 'px';
                });

                const sparkInterval = setInterval(() => {
                    if (!baba.parentNode) {
                        clearInterval(sparkInterval);
                        return;
                    }
                    const r = baba.getBoundingClientRect();
                    this.createSpark(r.left + 50, r.top + 50, colors.primary);
                }, 80);

                setTimeout(() => clearInterval(sparkInterval), this.timing.FLY);

                babas.push({ el: baba, angle, sparkInterval });
                cell.style.opacity = '0';
            }

            await this.delay(this.timing.FLY + 200);
            return babas;
        }

        createDummyCell(index) {
            const el = document.createElement('div');
            el.style.cssText = `position:fixed;left:${80 + index * 140}px;top:150px;width:100px;height:100px;z-index:9998;`;
            el.innerHTML = '👳';
            document.body.appendChild(el);
            this.elements.push(el);
            return el;
        }

        async phaseOrbit(babas, centerX, centerY, orbitRadius, winType) {
            const colors = CONFIG.WIN_TYPES[winType];

            babas.forEach((baba, i) => {
                const startAngle = (i / babas.length) * 360;
                
                baba.el.style.animation = 'none';
                baba.el.offsetHeight;
                
                baba.el.style.animation = `
                    bja65-orbit-${i} ${this.timing.ORBIT}ms linear infinite,
                    bja65-bob 0.4s ease-in-out infinite,
                    bja65-pulseGlow 0.6s ease-in-out infinite
                `;

                const keyframe = `
                    @keyframes bja65-orbit-${i} {
                        from { transform: rotate(${startAngle}deg) translateX(${orbitRadius}px) rotate(-${startAngle}deg); }
                        to { transform: rotate(${startAngle + 360}deg) translateX(${orbitRadius}px) rotate(-${startAngle + 360}deg); }
                    }
                `;
                
                const style = document.createElement('style');
                style.textContent = keyframe;
                document.head.appendChild(style);
                this.elements.push(style);
            });

            await this.delay(this.timing.ORBIT);
            
            babas.forEach(baba => {
                baba.el.style.animation = 'none';
                const rect = baba.el.getBoundingClientRect();
                baba.el.style.transition = 'none';
                baba.el.style.left = rect.left + 'px';
                baba.el.style.top = rect.top + 'px';
                baba.el.style.transform = 'none';
            });
        }

        async phaseExplode(babas, winType, centerX, centerY) {
            const colors = CONFIG.WIN_TYPES[winType];

            const flash = this.createEl('bja65-flash');
            flash.classList.add('active');
            document.body.classList.add('bja65-shake');

            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const wave = this.createEl('bja65-shockwave');
                    wave.style.borderColor = i === 0 ? colors.primary : colors.glow;
                    wave.classList.add('active');
                }, i * 150);
            }

            babas.forEach((baba, i) => {
                baba.el.style.transition = `all ${this.timing.GATHER}ms cubic-bezier(0.6, -0.3, 0.7, 0)`;
                baba.el.style.left = (centerX - 50) + 'px';
                baba.el.style.top = (centerY - 50) + 'px';
                baba.el.style.animation = `bja65-gatherShake ${this.timing.GATHER}ms ease-in-out`;
                baba.el.style.opacity = '0';
            });

            await this.delay(this.timing.GATHER);

            babas.forEach(b => {
                if (b.sparkInterval) clearInterval(b.sparkInterval);
                b.el.remove();
            });

            const particles = ['💰', '🪙', '💎', '✨', '⭐', '🌟', '💛', '🎉', '🏆', '👑', '🔮', '💍'];
            
            for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
                const p = this.createEl('bja65-particle');
                p.textContent = particles[Math.floor(Math.random() * particles.length)];
                p.style.left = centerX + 'px';
                p.style.top = centerY + 'px';
                p.style.color = ['💰', '🪙'].includes(p.textContent) ? colors.primary : 
                               ['⭐', '🌟', '✨'].includes(p.textContent) ? '#ffff00' : colors.secondary;

                const angle = Math.random() * Math.PI * 2;
                const dist = 200 + Math.random() * 400;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                const rot = Math.random() * 720;
                
                p.style.setProperty('--bja65-end-transform', 
                    `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(0.3)`);
                
                requestAnimationFrame(() => p.classList.add('active'));
            }

            for (let i = 0; i < CONFIG.RAIN_COUNT; i++) {
                setTimeout(() => {
                    const rain = this.createEl('bja65-rain');
                    rain.style.left = (centerX + (Math.random() - 0.5) * 300) + 'px';
                    rain.style.top = (centerY - 100) + 'px';
                    rain.classList.add('active');
                }, i * 20);
            }

            await this.delay(this.timing.EXPLODE);
        }

        // ============================================
        // PHASE 4: JACKPOT (Secret → Reveal)
        // ============================================
        async phaseJackpot(winAmount, winType, options) {
            const colors = CONFIG.WIN_TYPES[winType];
            
            const container = this.createEl('bja65-jackpot');
            container.style.setProperty('--bja65-primary', colors.primary);
            container.style.setProperty('--bja65-secondary', colors.secondary);
            container.style.setProperty('--bja65-glow', colors.glow);
            
            // Initially show ??? (secret)
            container.innerHTML = `
                <div class="bja65-win-text">${colors.text} WIN</div>
                <div class="bja65-jackpot-label">JACKPOT</div>
                <div class="bja65-amount">
                    <span class="bja65-amount-placeholder">? ? ? ? ? ?</span>
                </div>
            `;
            
            requestAnimationFrame(() => container.classList.add('active'));
            
            // Wait a bit then start revealing
            await this.delay(500);
            
            // Replace placeholder with counting number
            const amountEl = container.querySelector('.bja65-amount');
            amountEl.innerHTML = '0 ကျပ်';
            
            // Start rolling all numbers simultaneously
            await this.revealWinAmount(winAmount, options);
            
            // Keep showing for remaining time
            const remainingTime = this.timing.DISPLAY - CONFIG.ROLLING.DURATION - 500;
            await this.delay(Math.max(remainingTime, 2000));
            
            container.style.transition = 'opacity 0.5s';
            container.style.opacity = '0';
            await this.delay(500);
        }

        // ============================================
        // MAIN PLAY
        // ============================================
        async play(babaCells, winAmount, winType = 'mega', options = {}) {
            if (this.isPlaying) return;
            this.isPlaying = true;

            const {
                soundUrl = null,
                winBoxSelector = null,
                userBalanceSelector = null,
                startBalance = 0
            } = options;

            // Store secret win amount (don't reveal yet!)
            this.secretWinAmount = winAmount;
            this.originalBalance = startBalance;

            if (soundUrl) {
                await this.syncWithSound(soundUrl);
            }

            try {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const orbitRadius = Math.min(CONFIG.ORBIT_RADIUS, Math.min(window.innerWidth, window.innerHeight) * 0.3);

                const vignette = this.createEl('bja65-vignette');
                requestAnimationFrame(() => vignette.classList.add('active'));

                if (soundUrl) {
                    this.audio = new Audio(soundUrl);
                    this.audio.play().catch(e => console.log('Audio play failed:', e));
                }

                // Animation phases (win amount is still secret!)
                const babas = await this.phaseFly(babaCells, winType, centerX, centerY, orbitRadius);
                await this.phaseOrbit(babas, centerX, centerY, orbitRadius, winType);
                await this.phaseExplode(babas, winType, centerX, centerY);
                
                // NOW reveal win amount with rolling animation!
                await this.phaseJackpot(winAmount, winType, {
                    winBoxSelector,
                    userBalanceSelector
                });

            } finally {
                this.cleanup();
            }
        }

        stop() {
            this.cleanup();
        }

        test(winAmount = 5000000, winType = 'mega', options = {}) {
            // Create test win box (hidden amount initially)
            const winBox = document.createElement('div');
            winBox.id = 'test-winbox';
            winBox.style.cssText = 'position:fixed;top:50%;left:20px;padding:15px 25px;background:#1a1a2e;border:2px solid #ffd700;border-radius:15px;color:#ffd700;font-size:24px;font-family:monospace;z-index:9999;';
            winBox.textContent = 'WIN: 0 ကျပ်';
            document.body.appendChild(winBox);

            // Create test user balance
            const balanceEl = document.createElement('div');
            balanceEl.id = 'test-balance';
            balanceEl.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 25px;background:#1a1a2e;border:2px solid #00ff88;border-radius:15px;color:#00ff88;font-size:20px;font-family:monospace;z-index:9999;';
            balanceEl.textContent = '1,000,000 ကျပ်';
            document.body.appendChild(balanceEl);

            // Create test baba cells
            const cells = [];
            for (let i = 0; i < 5; i++) {
                const cell = document.createElement('div');
                cell.style.cssText = `position:fixed;left:${60 + i * 120}px;top:120px;width:80px;height:80px;background:#ffd70033;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:50px;z-index:9998;`;
                cell.innerHTML = '👳';
                document.body.appendChild(cell);
                cells.push(cell);
            }
            
            this.play(cells, winAmount, winType, {
                ...options,
                winBoxSelector: '#test-winbox',
                userBalanceSelector: '#test-balance',
                startBalance: 1000000
            });
            
            setTimeout(() => {
                cells.forEach(c => c.remove());
                winBox.remove();
                balanceEl.remove();
            }, 90000);
        }
    }

    const instance = new BabaJackpotAnim();

    global.BabaJackpot = {
        show: (cells, amount, type = 'mega', options = {}) => instance.play(cells, amount, type, options),
        mega: (cells, amount, options = {}) => instance.play(cells, amount, 'mega', options),
        big: (cells, amount, options = {}) => instance.play(cells, amount, 'big', options),
        super: (cells, amount, options = {}) => instance.play(cells, amount, 'super', options),
        stop: () => instance.stop(),
        isPlaying: () => instance.isPlaying,
        test: (amount, type, options) => instance.test(amount, type, options)
    };

    console.log('%c✅ Baba Jackpot v6.5 ready! (Secret Win + Rolling Reveal)', 'color: #00ff00; font-size: 14px;');
    console.log('%c🔒 Secret: Win amount hidden until animation ends', 'color: #ff4444;');
    console.log('%c💰 Reveal: 0 → target rolling on Jackpot + WinBox + Balance', 'color: #00ff88;');

})(window);
