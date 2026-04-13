// ============================================
// 17. BABA ANIMATIONS - CLEAN VERSION
// ============================================
function showJackpotAnimation(winAmount = 5000000, finalResult = null) {
    
    const styleId = 'premium-jackpot-animation-styles';
    if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
            /* ===== PREMIUM JACKPOT ANIMATION CSS ===== */
            .pja-stars { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9990; }
            .pja-star { position: absolute; background: white; border-radius: 50%; animation: pja-twinkle 3s ease-in-out infinite; }
            @keyframes pja-twinkle { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
            
            .pja-lightning { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); opacity: 0; pointer-events: none; z-index: 10000; }
            .pja-lightning.active { animation: pja-flash 0.2s ease-out; }
            @keyframes pja-flash { 0%,100%{opacity:0} 10%,30%,50%{opacity:0.8} 20%,40%{opacity:0.3} }
            
            .pja-flying-baba { position: fixed; width: 100px; height: 100px; z-index: 9999; transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55); filter: drop-shadow(0 0 30px rgba(255,215,0,0.9)); display: flex; align-items: center; justify-content: center; }
            .pja-baba-inner { font-size: 70px; animation: pja-babaGlow 1s ease-in-out infinite alternate; }
            @keyframes pja-babaGlow { from { filter: drop-shadow(0 0 20px gold) drop-shadow(0 0 40px orange); } to { filter: drop-shadow(0 0 40px gold) drop-shadow(0 0 80px red) drop-shadow(0 0 120px purple); } }
            .pja-flying-baba.spinning { animation: pja-orbit 2.5s linear infinite; }
            @keyframes pja-orbit { 0% { transform: rotate(0deg) translateX(180px) rotate(0deg) scale(1); } 25% { transform: rotate(90deg) translateX(180px) rotate(-90deg) scale(1.2); } 50% { transform: rotate(180deg) translateX(180px) rotate(-180deg) scale(1); } 75% { transform: rotate(270deg) translateX(180px) rotate(-270deg) scale(1.2); } 100% { transform: rotate(360deg) translateX(180px) rotate(-360deg) scale(1); } }
            
            .pja-baba-trail { position: fixed; width: 100px; height: 100px; font-size: 70px; display: flex; align-items: center; justify-content: center; opacity: 0.3; filter: blur(2px); pointer-events: none; z-index: 9998; }
            .pja-explosion-ring { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; border: 8px solid transparent; opacity: 0; pointer-events: none; z-index: 9995; }
            .pja-explosion-ring.active { animation: pja-ringExpand 1.5s ease-out forwards; }
            @keyframes pja-ringExpand { 0% { width: 0; height: 0; opacity: 1; border-color: #ffd700; box-shadow: 0 0 50px #ffd700; } 50% { border-color: #ff6b6b; box-shadow: 0 0 100px #ff6b6b; } 100% { width: 150vw; height: 150vw; opacity: 0; border-color: #4ecdc4; } }
            
            .pja-shockwave-multi { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; border: 5px solid; opacity: 0; pointer-events: none; z-index: 9994; }
            .pja-shockwave-multi.active { animation: pja-multiWave 2s ease-out forwards; }
            @keyframes pja-multiWave { 0% { width: 0; height: 0; opacity: 1; border-color: #ffd700; box-shadow: 0 0 50px #ffd700; } 100% { width: 200vw; height: 200vw; opacity: 0; border-color: transparent; } }
            
            /* Premium Jackpot Text - Main */
            .pja-mega-text {
                font-size: 120px;
                font-weight: 900;
                font-family: 'Arial Black', 'Impact', 'Montserrat', sans-serif;
                text-transform: uppercase;
                letter-spacing: 20px;
                position: relative;
                transform-style: preserve-3d;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 20%, #ffd700 40%, #ffa502 60%, #ffd700 80%, #ffed4e 100%);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-shadow: 0 2px 0 #b8860b, 0 4px 0 #b8860b, 0 6px 0 #b8860b, 0 8px 0 #b8860b, 0 10px 0 #b8860b, 0 12px 0 #b8860b, 0 14px 0 #b8860b, 0 16px 0 #b8860b, 0 20px 30px rgba(0,0,0,0.5);
                animation: pja-gradientShift 2s ease infinite, pja-textPulse 1s ease-in-out infinite;
            }
            
            @keyframes pja-textPulse {
                0%, 100% { text-shadow: 0 20px 30px rgba(0,0,0,0.5); letter-spacing: 20px; }
                50% { text-shadow: 0 25px 40px rgba(255,215,0,0.6); letter-spacing: 25px; }
            }
            
            @keyframes pja-gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            @keyframes pja-megaFloat {
                0%, 100% { transform: translateY(0) rotateY(0deg); }
                50% { transform: translateY(-20px) rotateY(5deg); }
            }
            
            /* Jackpot Subtext */
            .pja-jackpot-subtext {
                font-size: 70px;
                font-weight: bold;
                font-family: 'Arial Black', sans-serif;
                text-transform: uppercase;
                letter-spacing: 15px;
                background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
                background-size: 400% 400%;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                animation: pja-rainbowShift 3s linear infinite;
                margin-top: 20px;
                text-shadow: 0 0 20px rgba(255,0,0,0.5), 0 0 40px rgba(255,165,0,0.3), 0 0 60px rgba(255,255,0,0.2);
                position: relative;
            }
            
            @keyframes pja-rainbowShift {
                0% { background-position: 0% 50%; }
                100% { background-position: 400% 50%; }
            }
            
            /* Win Amount */
            .pja-win-amount-mega {
                font-size: 80px;
                font-weight: 900;
                font-family: 'Arial Black', 'Impact', monospace;
                margin-top: 30px;
                padding: 20px 40px;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border-radius: 20px;
                display: inline-block;
                border: 3px solid #ffd700;
                box-shadow: 0 0 20px rgba(255,215,0,0.3), inset 0 0 20px rgba(255,215,0,0.1);
                animation: pja-amountPulse 1s ease-in-out infinite;
                position: relative;
                overflow: hidden;
            }
            
            .pja-win-amount-mega::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,215,0,0.1), transparent);
                transform: rotate(45deg);
                animation: pja-shimmer 3s linear infinite;
            }
            
            @keyframes pja-shimmer {
                0% { transform: translateX(-100%) rotate(45deg); }
                100% { transform: translateX(100%) rotate(45deg); }
            }
            
            .pja-win-amount-mega span {
                background: linear-gradient(135deg, #ffd700, #ffed4e, #ffa502, #ffd700);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                font-size: 80px;
                text-shadow: 0 0 30px rgba(255,215,0,0.5);
                animation: pja-goldShine 2s ease infinite;
            }
            
            @keyframes pja-goldShine {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            @keyframes pja-amountPulse {
                0%, 100% { transform: scale(1); text-shadow: 0 0 20px #ffd700; }
                50% { transform: scale(1.05); text-shadow: 0 0 40px #ffd700, 0 0 80px #ff6b6b; }
            }
            
            /* Container */
            .pja-mega-jackpot-container {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                display: none; justify-content: center; align-items: center; flex-direction: column;
                z-index: 10001; background: radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%);
                perspective: 1000px;
            }
            .pja-mega-jackpot-container.active {
                display: flex;
                animation: pja-containerEntry 1s ease-out;
            }
            @keyframes pja-containerEntry {
                0% { opacity: 0; transform: scale(0.3) rotateX(45deg); }
                60% { transform: scale(1.1) rotateX(-10deg); }
                100% { opacity: 1; transform: scale(1) rotateX(0); }
            }
            
            /* Particles */
            .pja-coin-3d { position: fixed; width: 40px; height: 40px; z-index: 9997; transform-style: preserve-3d; animation: pja-coinFlip 0.5s linear infinite, pja-coinFly 2s ease-out forwards; }
            .pja-coin-3d::before, .pja-coin-3d::after { content: '$'; position: absolute; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #ffed4e, #ffd700, #b8860b); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #8b6914; font-size: 20px; border: 3px solid #b8860b; backface-visibility: hidden; }
            .pja-coin-3d::after { transform: rotateY(180deg); background: radial-gradient(circle at 30% 30%, #b8860b, #8b6914); }
            @keyframes pja-coinFlip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
            @keyframes pja-coinFly { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; } }
            
            .pja-gem-particle { position: fixed; width: 25px; height: 25px; z-index: 9996; animation: pja-gemFly 1.5s ease-out forwards; }
            @keyframes pja-gemFly { 0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) rotate(720deg) scale(0); opacity: 0; } }
            
            .pja-fire-particle { position: fixed; width: 30px; height: 30px; z-index: 9995; animation: pja-fireFly 1.2s ease-out forwards; }
            @keyframes pja-fireFly { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
            
            .pja-premium-confetti { position: fixed; z-index: 10000; animation: pja-confettiFall 4s ease-out forwards; }
            @keyframes pja-confettiFall { 0% { transform: translateY(-100px) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(1080deg) scale(0.5); opacity: 0; } }
            
            .pja-epic-firework { position: fixed; width: 10px; height: 10px; border-radius: 50%; z-index: 9999; }
            
            .pja-sound-bars { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10002; opacity: 0; }
            .pja-sound-bars.active { opacity: 1; animation: pja-barsAppear 0.5s ease-out; }
            @keyframes pja-barsAppear { from { transform: translateX(-50%) translateY(50px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
            
            .pja-bar { width: 12px; background: linear-gradient(to top, #ffd700, #ff6b6b, #4ecdc4); border-radius: 6px; animation: pja-barDance 0.5s ease-in-out infinite; }
            .pja-bar:nth-child(1) { height: 40px; animation-delay: 0s; }
            .pja-bar:nth-child(2) { height: 70px; animation-delay: 0.1s; }
            .pja-bar:nth-child(3) { height: 100px; animation-delay: 0.2s; }
            .pja-bar:nth-child(4) { height: 70px; animation-delay: 0.3s; }
            .pja-bar:nth-child(5) { height: 40px; animation-delay: 0.4s; }
            @keyframes pja-barDance { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.3)} }
            
            /* Landscape Mode */
@media (orientation: landscape) {
    .pja-mega-text { font-size: 45px; letter-spacing: 8px; }
    .pja-jackpot-subtext { font-size: 28px; letter-spacing: 5px; margin-top: 5px; }
    .pja-win-amount-mega { font-size: 30px; padding: 8px 20px; margin-top: 10px; }
    .pja-win-amount-mega span { font-size: 30px; }
    
    /* Particles သေးအောင် */
    .pja-coin-3d { width: 25px; height: 25px; }
    .pja-gem-particle { width: 18px; height: 18px; font-size: 14px; }
    .pja-fire-particle { width: 20px; height: 20px; font-size: 16px; }
}

/* Portrait Mode */
@media (orientation: portrait) {
    .pja-mega-text { font-size: 60px; letter-spacing: 10px; }
    .pja-jackpot-subtext { font-size: 35px; letter-spacing: 8px; margin-top: 15px; }
    .pja-win-amount-mega { font-size: 40px; padding: 12px 25px; margin-top: 20px; }
    .pja-win-amount-mega span { font-size: 40px; }
}

/* Very Small Landscape (ဖုန်းသေး) */
@media (orientation: landscape) and (max-height: 380px) {
    .pja-mega-text { font-size: 30px; letter-spacing: 5px; }
    .pja-jackpot-subtext { font-size: 20px; letter-spacing: 3px; }
    .pja-win-amount-mega { font-size: 22px; padding: 5px 15px; }
    .pja-win-amount-mega span { font-size: 22px; }
}
        `;
        document.head.appendChild(styleEl);
    }
    
        // ===== 2. HTML Element တွေ Dynamic ဖန်တီးမယ် =====
    function createElements() {
        const elements = {};
        
        // Stars Container
        elements.stars = document.createElement('div');
        elements.stars.className = 'pja-stars';
        
        // Lightning
        elements.lightning = document.createElement('div');
        elements.lightning.className = 'pja-lightning';
        
        // Explosion Ring
        elements.explosionRing = document.createElement('div');
        elements.explosionRing.className = 'pja-explosion-ring';
        
        // Mega Jackpot Container
        elements.megaJackpot = document.createElement('div');
        elements.megaJackpot.className = 'pja-mega-jackpot-container';
        // Mega Jackpot Container HTML ကို ဒီလိုပြင်ပါ
        elements.megaJackpot.innerHTML = `
        <div class="pja-mega-text">MEGA</div>
        <div class="pja-jackpot-subtext">JACKPOT</div>
        <div class="pja-win-amount-mega">
        <span>${winAmount.toLocaleString()} ကျပ်</span>
        </div>
      `;
        
        // Sound Bars
        elements.soundBars = document.createElement('div');
        elements.soundBars.className = 'pja-sound-bars';
        for (let i = 0; i < 5; i++) {
            elements.soundBars.appendChild(document.createElement('div')).className = 'pja-bar';
        }
        
        // Append to body
        document.body.appendChild(elements.stars);
        document.body.appendChild(elements.lightning);
        document.body.appendChild(elements.explosionRing);
        document.body.appendChild(elements.megaJackpot);
        document.body.appendChild(elements.soundBars);
        
        return elements;
    }
    const elements = createElements();
    
    // ===== 3. Stars ဖန်တီးမယ် =====
    function createStars() {
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'pja-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.width = (Math.random() * 3 + 1) + 'px';
            star.style.height = star.style.width;
            elements.stars.appendChild(star);
        }
    }
    createStars();
    // ===== 4. Baba Cell  =====
    function getBabaCells() {
        return document.querySelectorAll('.grid-cell[data-symbol="baba"], .slot-cell.baba');
    }
    async function runAnimation() {
    // Step 1: Lightning Escape (2 seconds)
await new Promise(resolve => {
    elements.lightning.classList.add('active');
    setTimeout(() => elements.lightning.classList.remove('active'), 200);
    document.body.style.animation = 'pja-shake 0.5s ease-out';
    
    const babas = getBabaCells();
    babas.forEach((cell, index) => {
        const rect = cell.getBoundingClientRect();
        
        // Flying Baba ဖန်တီးခြင်း
        const flyingBaba = document.createElement('div');
        flyingBaba.className = 'pja-flying-baba';
        flyingBaba.style.zIndex = '99999';
        
        const originalImg = cell.querySelector('img');
        
        if (originalImg) {
           
            const clonedImg = originalImg.cloneNode(true);
            clonedImg.style.width = '100%';
            clonedImg.style.height = '100%';
            clonedImg.style.objectFit = 'contain';
            clonedImg.style.filter = 'drop-shadow(0 0 20px gold)';
            flyingBaba.appendChild(clonedImg);
        } else {
            console.warn('⚠️ No img found in Baba cell, using IMAGE_PATHS fallback');
            const babaImg = document.createElement('img');
            babaImg.src = 'images/baba.png'; // IMAGE_PATHS['baba'] အတိုင်း
            babaImg.alt = 'BABA';
            babaImg.style.width = '100%';
            babaImg.style.height = '100%';
            babaImg.style.objectFit = 'contain';
            babaImg.style.filter = 'drop-shadow(0 0 20px gold)';
            
            babaImg.onerror = () => {
                babaImg.remove();
                flyingBaba.innerHTML = '<div class="pja-baba-inner" style="font-size:70px; color: gold;">👳</div>';
            };
            
            flyingBaba.appendChild(babaImg);
        }
        
        flyingBaba.style.left = rect.left + 'px';
        flyingBaba.style.top = rect.top + 'px';
        document.body.appendChild(flyingBaba);
        
        cell.style.transition = 'all 0.3s';
        cell.style.transform = 'scale(1.5)';
        cell.style.opacity = '0';
        
        const angle = (index * 72) * (Math.PI / 180);
        const radius = 220;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const targetX = centerX + Math.cos(angle) * radius - 50;
        const targetY = centerY + Math.sin(angle) * radius - 50;
        
        setTimeout(() => {
            flyingBaba.style.left = targetX + 'px';
            flyingBaba.style.top = targetY + 'px';
            flyingBaba.classList.add('spinning');
        }, 300 + index * 150);
    });
    setTimeout(resolve, 2000);
});
        // Step 2: Orbit with Trails (8 seconds)
        await new Promise(resolve => {
            const babas = document.querySelectorAll('.pja-flying-baba');
            const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff'];
            const trailInterval = setInterval(() => {
                babas.forEach((baba, index) => {
                    const rect = baba.getBoundingClientRect();
                    const trail = document.createElement('div');
                    trail.className = 'pja-baba-trail';
                    trail.textContent = '👳';
                    trail.style.left = rect.left + 'px';
                    trail.style.top = rect.top + 'px';
                    trail.style.color = colors[index];
                    trail.style.filter = `drop-shadow(0 0 10px ${colors[index]})`;
                    document.body.appendChild(trail);
                    setTimeout(() => trail.remove(), 800);
                });
            }, 150);
            
            setTimeout(() => { 
                clearInterval(trailInterval); 
                resolve(); 
            }, 8000);
        });
        
        // Step 3: Gather and Implode (3 seconds)
        await new Promise(resolve => {
            const babas = document.querySelectorAll('.pja-flying-baba');
            const centerX = window.innerWidth / 2 - 50;
            const centerY = window.innerHeight / 2 - 50;
            babas.forEach(baba => baba.classList.add('trail'));
            babas.forEach((baba, index) => {
                baba.style.transition = 'all 1.2s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
                const spiralX = centerX + (Math.random() - 0.5) * 30;
                const spiralY = centerY + (Math.random() - 0.5) * 30;
                setTimeout(() => {
                    baba.style.left = spiralX + 'px';
                    baba.style.top = spiralY + 'px';
                    baba.style.transform = 'scale(2) rotate(720deg)';
                }, index * 200);
            });
            setTimeout(resolve, 3000);
        });
        
        // Step 4: Mega Explosion (4 seconds)
        await new Promise(resolve => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            elements.lightning.classList.add('active');
            
            // Shockwaves
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const wave = document.createElement('div');
                    wave.className = 'pja-shockwave-multi active';
                    wave.style.animationDelay = (i * 0.4) + 's';
                    document.body.appendChild(wave);
                    setTimeout(() => wave.remove(), 3000);
                }, i * 300);
            }
            
            elements.explosionRing.classList.add('active');
            
            document.querySelectorAll('.pja-flying-baba').forEach((baba, i) => {
                setTimeout(() => {
                    baba.style.transform = 'scale(4)';
                    baba.style.opacity = '0';
                    setTimeout(() => baba.remove(), 500);
                }, i * 80);
            });
            
            // Helper functions
            const createCoins = () => {
                for (let i = 0; i < 100; i++) {
                    setTimeout(() => {
                        const coin = document.createElement('div');
                        coin.className = 'pja-coin-3d';
                        const angle = Math.random() * Math.PI * 2;
                        const velocity = 200 + Math.random() * 400;
                        coin.style.left = (centerX - 20) + 'px';
                        coin.style.top = (centerY - 20) + 'px';
                        coin.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
                        coin.style.setProperty('--ty', Math.sin(angle) * velocity + 300 + 'px');
                        document.body.appendChild(coin);
                        setTimeout(() => coin.remove(), 2000);
                    }, i * 15);
                }
            };
            const createGems = () => {
                const gems = ['💎', '🔮', '💍', '👑', '⭐', '✨'];
                for (let i = 0; i < 50; i++) {
                    const gem = document.createElement('div');
                    gem.className = 'pja-gem-particle';
                    gem.textContent = gems[Math.floor(Math.random() * gems.length)];
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 150 + Math.random() * 300;
                    gem.style.left = centerX + 'px';
                    gem.style.top = centerY + 'px';
                    gem.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
                    gem.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
                    document.body.appendChild(gem);
                    setTimeout(() => gem.remove(), 1500);
                }
            };
            const createFire = () => {
                for (let i = 0; i < 40; i++) {
                    const fire = document.createElement('div');
                    fire.className = 'pja-fire-particle';
                    fire.textContent = '🔥';
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 100 + Math.random() * 200;
                    fire.style.left = centerX + 'px';
                    fire.style.top = centerY + 'px';
                    fire.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
                    fire.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
                    document.body.appendChild(fire);
                    setTimeout(() => fire.remove(), 1200);
                }
            };
            const createStreamers = () => {
                const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
                for (let i = 0; i < 30; i++) {
                    const streamer = document.createElement('div');
                    streamer.className = 'pja-streamer';
                    streamer.style.background = `linear-gradient(to bottom, ${colors[i % colors.length]}, transparent)`;
                    const angle = (Math.PI * 2 * i) / 30;
                    const distance = 300 + Math.random() * 200;
                    streamer.style.left = centerX + 'px';
                    streamer.style.top = centerY + 'px';
                    streamer.style.setProperty('--sx', Math.cos(angle) * distance + 'px');
                    streamer.style.setProperty('--sy', Math.sin(angle) * distance + 'px');
                    document.body.appendChild(streamer);
                    setTimeout(() => streamer.remove(), 2000);
                }
            };
            
            createCoins(); 
            createGems(); 
            createFire(); 
            createStreamers();
            
            setTimeout(() => {
                elements.lightning.classList.remove('active');
                elements.explosionRing.classList.remove('active');
                resolve();
            }, 4000);
        });
        
        // Step 5: Show Mega Jackpot
        elements.megaJackpot.classList.add('active');
        elements.soundBars.classList.add('active');
        
        // Confetti & Fireworks
        (function confetti() {
            const types = ['ribbon', 'star', 'coin'];
            const colors = [['#ffd700','#ffed4e'],['#ff6b6b','#ff8e8e'],['#4ecdc4','#7eddd8'],['#45b7d1','#74c5e0'],['#f9ca24','#f0b90b']];
            for (let i = 0; i < 200; i++) {
                setTimeout(() => {
                    const c = document.createElement('div');
                    const type = types[Math.floor(Math.random()*types.length)];
                    const cp = colors[Math.floor(Math.random()*colors.length)];
                    c.className = `pja-premium-confetti confetti-${type}`;
                    c.style.left = Math.random()*100 + 'vw';
                    c.style.setProperty('--color1', cp[0]);
                    c.style.setProperty('--color2', cp[1]);
                    c.style.animationDuration = (3+Math.random()*2)+'s';
                    c.style.animationDelay = Math.random()+'s';
                    if(type==='ribbon') c.style.cssText += 'width:15px;height:30px;background:linear-gradient(45deg,var(--color1),var(--color2));border-radius:0 0 50% 50%;';
                    else if(type==='star') c.innerHTML = '⭐';
                    else c.innerHTML = '💰';
                    document.body.appendChild(c);
                    setTimeout(() => c.remove(), 5000);
                }, i*25);
            }
        })();
        
        (function fireworks() {
            const colors = ['#ffd700','#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#ff00ff'];
            for (let burst=0; burst<8; burst++) {
                setTimeout(() => {
                    const x=10+Math.random()*80, y=10+Math.random()*40, color=colors[Math.floor(Math.random()*colors.length)];
                    const core=document.createElement('div'); core.className='pja-epic-firework'; core.style.left=x+'%'; core.style.top=y+'%'; core.style.background=color; core.style.boxShadow=`0 0 50px ${color}`; document.body.appendChild(core); setTimeout(()=>core.remove(),500);
                    for(let i=0;i<36;i++) {
                        const p=document.createElement('div'); p.className='pja-epic-firework'; p.style.left=(x*window.innerWidth/100)+'px'; p.style.top=(y*window.innerHeight/100)+'px'; p.style.background=color; p.style.boxShadow=`0 0 10px ${color}`;
                        const angle=(Math.PI*2*i)/36, v=80+Math.random()*40;
                        p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(angle)*v}px,${Math.sin(angle)*v}px) scale(0)`,opacity:0}],{duration:1000,easing:'ease-out'});
                        document.body.appendChild(p); setTimeout(()=>p.remove(),1000);
                    }
                }, burst*600);
            }
        })();
        
        setTimeout(() => {
            elements.megaJackpot.classList.remove('active');
            elements.soundBars.classList.remove('active');
            document.querySelectorAll('.pja-stars, .pja-lightning, .pja-explosion-ring, .pja-mega-jackpot-container, .pja-sound-bars, .pja-flying-baba, .pja-baba-trail, .pja-coin-3d, .pja-gem-particle, .pja-fire-particle, .pja-streamer, .pja-premium-confetti, .pja-epic-firework, .pja-shockwave-multi').forEach(el => el.remove());
            document.querySelectorAll('.grid-cell, .slot-cell').forEach(cell => {
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            });
            document.body.style.animation = '';
        }, 43000);
    }
    
    runAnimation();
}

window.showJackpotAnimation = showJackpotAnimation;

