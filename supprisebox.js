
// ============================================
// 21. SURPRISE BOX SYSTEM (Hidden boxes, pick 5, sequential reveal, robust Firestore update)
// ============================================

let surpriseListener = null;
let pendingBoxSet = null;          
let selectedBoxIndices = [];
let currentBoxSet = null;   
let isRevealing = false;            
let revealTimeout = null;
const MAX_SELECTIONS = 5;
const TOTAL_BOXES = 20;

// ===== GSAP + CANVAS PARTICLE SYSTEM =====
let particleSystem = null;

class ParticleEffectSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }
    
    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animate() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0.2;
            p.life -= 0.02;
            p.rotation += p.rotationSpeed || 0.05;
            
            if (p.life <= 0 || p.y > this.canvas.height + 100) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.font = `${p.size}px "Segoe UI Emoji"`;
            
            if (p.type === 'coin') {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillText('💰', -p.size/2, p.size/2);
            } else if (p.type === 'crown') {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillText('👑', -p.size/2, p.size/2);
            } else if (p.type === 'spin') {
                this.ctx.fillStyle = '#2196f3';
                this.ctx.fillText('🔄', -p.size/2, p.size/2);
            } else if (p.type === 'heart') {
                this.ctx.fillStyle = '#ff69b4';
                this.ctx.fillText('❤️', -p.size/2, p.size/2);
            } else if (p.type === 'star') {
                this.ctx.fillStyle = `hsl(${p.hue || 50}, 100%, 60%)`;
                this.ctx.fillText('✨', -p.size/2, p.size/2);
            }
            
            this.ctx.restore();
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    burst(type, x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            this.particles.push({
                type: type,
                x: x,
                y: y,
                vx: Math.cos(angle) * speed * (Math.random() - 0.5),
                vy: Math.sin(angle) * speed * (Math.random() - 0.8) - 5,
                gravity: 0.3,
                size: Math.random() * 28 + 18,
                life: 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                hue: Math.random() * 360
            });
        }
    }
    
    sparkleAround(x, y) {
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 60;
            this.particles.push({
                type: 'star',
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2 - 3,
                gravity: 0.1,
                size: Math.random() * 18 + 12,
                life: 0.8,
                hue: Math.random() * 360
            });
        }
    }
}

// ===== 3D BOX STYLES (from first code) =====
 // ===== IMPROVED 3D BOX ELEMENT =====
function create3DBoxElement(box, index, isSelected) {
    const boxDiv = document.createElement('div');
    boxDiv.className = 'box-item';
    if (isSelected) boxDiv.classList.add('selected');
    
    // Determine icon based on box type (if revealed)
    let displayIcon = '❓';
    let iconColor = '#ffd700';
    let valueText = '';
    
    if (box.revealed) {
        if (box.type === 'credit') {
            displayIcon = '💰';
            iconColor = '#00c853';
            valueText = formatNumber(box.value) + ' ကျပ်';
        } else if (box.type === 'vip') {
            displayIcon = '👑';
            iconColor = '#ffd700';
            valueText = 'VIP +' + box.value;
        } else if (box.type === 'freespin') {
            displayIcon = '🎰';
            iconColor = '#2196f3';
            valueText = box.value + ' Spins';
        } else if (box.type === 'thankyou') {
            displayIcon = '🙏';
            iconColor = '#9e9e9e';
            valueText = 'ကျေးဇူးတင်ပါတယ်';
        }
    }
    
    // Responsive sizes
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const iconSize = isLandscape ? 'clamp(20px, 4vw, 28px)' : 'clamp(30px, 6vw, 38px)';
    const labelSize = isLandscape ? 'clamp(7px, 1.5vw, 9px)' : 'clamp(9px, 2vw, 11px)';
    const valueSize = isLandscape ? 'clamp(6px, 1.2vw, 8px)' : 'clamp(8px, 1.8vw, 10px)';
    
    boxDiv.innerHTML = `
        <div class="box-inner" style="
            background: linear-gradient(145deg, ${isSelected ? '#2a2a4e' : '#1a1a2e'}, #16213e);
            border: 1px solid rgba(255,215,0,${isSelected ? '0.5' : '0.2'});
        ">
            <!-- Ribbon decoration -->
            <div class="box-ribbon" style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 30px;
                height: 30px;
                background: ${isSelected ? '#ffd700' : 'transparent'};
                clip-path: polygon(0 0, 100% 0, 100% 100%);
                border-radius: 0 12px 0 0;
            "></div>
            
            <div class="box-icon" style="font-size: ${iconSize}; margin-bottom: 4px;">
                ${displayIcon}
            </div>
            <div class="box-label" style="font-size: ${labelSize}; font-weight: 600; color: ${iconColor};">
                Box ${index + 1}
            </div>
            ${valueText ? `<div class="box-value" style="font-size: ${valueSize}; margin-top: 3px;">${valueText}</div>` : ''}
            
            <!-- Shine effect on hover -->
            <div class="box-shine" style="
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                transform: rotate(45deg);
                transition: all 0.5s;
                opacity: 0;
            "></div>
        </div>
    `;
    
    // Add hover shine effect
    boxDiv.addEventListener('mouseenter', () => {
        const shine = boxDiv.querySelector('.box-shine');
        if (shine) {
            shine.style.opacity = '1';
            shine.style.transform = 'rotate(45deg) translateX(50%)';
        }
    });
    
    boxDiv.addEventListener('mouseleave', () => {
        const shine = boxDiv.querySelector('.box-shine');
        if (shine) {
            shine.style.opacity = '0';
            shine.style.transform = 'rotate(45deg) translateX(-50%)';
        }
    });
    
    return boxDiv;
}
// ===== 1. LISTEN FOR SURPRISE BOX FROM FIRESTORE =====
function listenForSurpriseBox(userId) {
    if (!userId || !firebase.firestore) return;
    if (surpriseListener) surpriseListener();

    const db = firebase.firestore();
    surpriseListener = db.collection('sentBoxes')
        .where('userId', '==', userId)
        .where('opened', '==', false)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const docData = change.doc.data();
                    docData.firestoreId = change.doc.id;

                    const spinReq = docData.spinRequirement || 5;

                    pendingBoxSet = {
                        id: docData.firestoreId,
                        spinRequired: spinReq,
                        spinsLeft: spinReq,
                        docData: docData,
                        boxes: docData.boxes || []
                    };
                    savePendingBoxSetToLocal();

                    showNotification(
                        `🎁 Surprise Box Set ရောက်ရှိပါသည်။ နောက် ${spinReq} spin ဆော့ပါက box များကို ရွေးချယ်နိုင်မည်။`,
                        'info'
                    );
                }
            });
        }, (error) => {
            console.error('Error listening to surprise box:', error);
        });
}

// ===== 2. CHECK PENDING BOX SET ON SPIN =====
function checkPendingBoxSetOnSpin() {
    if (!pendingBoxSet) return;

    pendingBoxSet.spinsLeft--;
    if (pendingBoxSet.spinsLeft <= 0) {
        showSurpriseModal();
         SoundManager.boxBG();
    } else {
        savePendingBoxSetToLocal();
        if (pendingBoxSet.spinsLeft <= 3) {
            showNotification(`Surprise Box ပေါ်ရန် နောက် ${pendingBoxSet.spinsLeft} spin သာ ကျန်ပါသည်။`, 'info');
        }
    }
}

// ===== 3. SHOW MODAL (boxes hidden initially) =====
function showSurpriseModal() {
    if (!pendingBoxSet) return;
        SoundManager.noti();

      currentBoxSet = JSON.parse(JSON.stringify(pendingBoxSet.boxes));
    selectedBoxIndices = [];
    
    
     // Add landscape optimization class
    const modal = document.getElementById('userSurpriseModal');
    if (modal) {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        if (isLandscape) {
            modal.classList.add('landscape-mode');
        } else {
            modal.classList.remove('landscape-mode');
        }
    }
    

    const resultDiv = document.getElementById('userSurpriseResult');
    if (resultDiv) resultDiv.style.display = 'none';
    const selectedContainer = document.getElementById('userSelectedBoxes');
    if (selectedContainer) selectedContainer.innerHTML = '<span style="color: rgba(255,255,255,0.5);">Box မရွေးရသေးပါ။</span>';

    const claimBtn = document.getElementById('claimUserSurpriseBtn');
    if (claimBtn) claimBtn.disabled = true;

    renderHiddenBoxGrid();
    updateSelectionDisplay();

    modal.style.display = 'flex';
}


// ===== RENDER HIDDEN BOX GRID WITH RESPONSIVE =====
function renderHiddenBoxGrid() {
    const grid = document.getElementById('userBoxGrid');
    if (!grid || !currentBoxSet) return;

    grid.innerHTML = '';
    
    // Check orientation for column count
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
    
    // Set grid columns based on orientation
    if (isLandscape && isTablet) {
        grid.style.gridTemplateColumns = 'repeat(5, minmax(90px, 110px))';
    } else if (isLandscape) {
        grid.style.gridTemplateColumns = 'repeat(5, minmax(65px, 80px))';
    } else {
        grid.style.gridTemplateColumns = 'repeat(4, minmax(80px, 100px))';
    }
    
    currentBoxSet.forEach((box, index) => {
        const isSelected = selectedBoxIndices.includes(index);
        const boxDiv = create3DBoxElement(box, index, isSelected);
        
        if (isSelected) {
            const inner = boxDiv.querySelector('.box-inner');
            if (inner) {
                inner.style.boxShadow = `
                    inset 0 0 15px rgba(255,215,0,0.3),
                    0 0 0 2px #ffd700
                `;
            }
        }
        
        boxDiv.onclick = () => toggleSelection(index);
        grid.appendChild(boxDiv);
    });
    
    // Add resize listener to re-render on orientation change
    if (!window._surpriseBoxResizeListener) {
        window._surpriseBoxResizeListener = () => {
            if (document.getElementById('userSurpriseModal')?.style.display === 'flex') {
                renderHiddenBoxGrid();
            }
        };
        window.addEventListener('resize', window._surpriseBoxResizeListener);
        window.addEventListener('orientationchange', window._surpriseBoxResizeListener);
    }
}
// ===== 5. TOGGLE SELECTION =====
function toggleSelection(index) {
    if (isRevealing) return;
         SoundManager.click();
    if (selectedBoxIndices.includes(index)) {
        selectedBoxIndices = selectedBoxIndices.filter(i => i !== index);
    } else {
        if (selectedBoxIndices.length >= MAX_SELECTIONS) {
            showNotification(`အများဆုံး ${MAX_SELECTIONS} ခုသာ ရွေးနိုင်ပါသည်။`, 'error');
            return;
        }
        selectedBoxIndices.push(index);
    }
    renderHiddenBoxGrid();
    updateSelectionDisplay();
}

// ===== 6. UPDATE SELECTION DISPLAY =====
function updateSelectionDisplay() {
    const remaining = MAX_SELECTIONS - selectedBoxIndices.length;
    const countEl = document.getElementById('userSelectionCount');
    const progressEl = document.getElementById('selectionProgress');
    const selectedContainer = document.getElementById('userSelectedBoxes');

    if (countEl) countEl.textContent = `ကျန် ${remaining} ခု`;
    if (progressEl) {
        const percent = (selectedBoxIndices.length / MAX_SELECTIONS) * 100;
        progressEl.style.width = percent + '%';
    }

    if (selectedContainer) {
        if (selectedBoxIndices.length === 0) {
            selectedContainer.innerHTML = '<span style="color: rgba(255,255,255,0.5);">Box မရွေးရသေးပါ။</span>';
        } else {
            let html = '';
            selectedBoxIndices.forEach(idx => {
                html += `<span style="background: #ffd70020; border:1px solid #ffd700; border-radius:15px; padding:5px 12px;">Box ${idx + 1}</span>`;
            });
            selectedContainer.innerHTML = html;
        }
    }

    const claimBtn = document.getElementById('claimUserSurpriseBtn');
    if (claimBtn) claimBtn.disabled = selectedBoxIndices.length !== MAX_SELECTIONS;
}

// ===== 7. REVEAL SINGLE BOX (UPGRADED WITH GSAP) =====
function revealSingleBox(index, delay, thankyouMessage, isSelected = false) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const box = currentBoxSet[index];
            const grid = document.getElementById('userBoxGrid');
            if (!grid) return resolve();
            const cells = grid.children;
            if (!cells[index]) return resolve();

            const cell = cells[index];
            const rect = cell.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let icon = 'fa-gift';
            let iconColor = '#ffd700';
            let valueText = '';
            let prizeType = box.type;
            let displayIcon = '❓';

            if (box.type === 'credit') {
                icon = 'fa-coins';
                iconColor = '#00c853';
                valueText = formatNumber(box.value) + ' ကျပ်';
                displayIcon = '💰';
            } else if (box.type === 'vip') {
                icon = 'fa-crown';
                iconColor = '#ffd700';
                valueText = 'VIP Level +' + box.value;
                displayIcon = '👑';
            } else if (box.type === 'freespin') {
                icon = 'fa-play-circle';
                iconColor = '#2196f3';
                valueText = box.value + ' Spins';
                displayIcon = '🎰';
            } else if (box.type === 'thankyou') {
                icon = 'fa-smile';
                iconColor = '#9e9e9e';
                valueText = thankyouMessage;
                displayIcon = '🙏';
            }

            // GSAP Float Up
            gsap.to(cell, {
                y: -30,
                duration: 0.4,
                ease: "back.out(1)",
                onComplete: () => {
                    // Play sound based on prize type
                    if (typeof SoundManager !== 'undefined') {
                        if (prizeType === 'credit' && SoundManager.coin) SoundManager.coin();
                        else if (prizeType === 'vip' && SoundManager.congratulations) SoundManager.congratulations();
                        else if (prizeType === 'freespin' && SoundManager.congratulations) SoundManager.congratulations();
                        else if (prizeType === 'thankyou' && SoundManager.thankyouBox) SoundManager.thankyouBox();
                        else if (SoundManager.noti) SoundManager.noti();
                    }
                    
                    // Particle effect
                    if (window.particleSystem) {
                        if (prizeType === 'credit') window.particleSystem.burst('coin', centerX, centerY, 30);
                        else if (prizeType === 'vip') window.particleSystem.burst('crown', centerX, centerY, 25);
                        else if (prizeType === 'freespin') window.particleSystem.burst('spin', centerX, centerY, 25);
                        else if (prizeType === 'thankyou') window.particleSystem.burst('heart', centerX, centerY, 30);
                        window.particleSystem.sparkleAround(centerX, centerY);
                    }
                }
            });
            
            // Inside revealSingleBox, after flip animation
gsap.to(cell, {
    rotationY: 90,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
        const inner = cell.querySelector('.box-inner');
        if (inner) {
            // Responsive sizes
            const iconSize = 'clamp(20px, 5vw, 38px)';
            const labelSize = 'clamp(8px, 2vw, 10px)';
            const valueSize = 'clamp(7px, 1.8vw, 9px)';
            
            inner.style.background = prizeType === 'credit' ? 'linear-gradient(135deg, #00c85320, #00c85340)' :
                                       prizeType === 'vip' ? 'linear-gradient(135deg, #ffd70020, #ffd70040)' :
                                       prizeType === 'freespin' ? 'linear-gradient(135deg, #2196f320, #2196f340)' :
                                       'linear-gradient(135deg, #9e9e9e20, #9e9e9e40)';
             inner.innerHTML = `
                <div class="rope" style="
                    position: absolute;
                    width: 75%;
                    height: clamp(3px, 1.5vw, 6px);
                    background: repeating-linear-gradient(90deg, #8b7355 0px, #8b7355 3px, #a0826d 3px, #a0826d 6px);
                    top: 18%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-radius: 3px;
                    z-index: 2;
                "></div>
                <div class="bow" style="position: absolute; width: 100%; height: 100%; z-index: 3; pointer-events: none;">
                    <div class="bow-left" style="position: absolute; width: clamp(12px, 3vw, 22px); height: clamp(7px, 1.8vw, 13px); background: linear-gradient(90deg, #ff6b9d, #ff85b3); border-radius: 50% 50% 0 0; top: 14%; left: 28%;"></div>
                    <div class="bow-right" style="position: absolute; width: clamp(12px, 3vw, 22px); height: clamp(7px, 1.8vw, 13px); background: linear-gradient(90deg, #ff85b3, #ffa0c8); border-radius: 50% 50% 0 0; top: 14%; right: 28%;"></div>
                    <div class="bow-center" style="position: absolute; width: clamp(8px, 2vw, 14px); height: clamp(8px, 2vw, 14px); background: linear-gradient(135deg, #ff1493, #ff69b4); border-radius: 50%; top: 16%; left: 50%; transform: translateX(-50%); z-index: 4;"></div>
                </div>
                <div class="box-icon" style="font-size: ${iconSize}; margin-bottom: 2px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); z-index: 5; position: relative;">
                    ${displayIcon}
                </div>
                <div class="box-label" style="font-size: ${labelSize}; font-weight: 700; color: ${iconColor}; z-index: 5; position: relative; text-shadow: 0 1px 1px rgba(0,0,0,0.5);">
                    Box ${index + 1}
                </div>
                <div class="box-value" style="font-size: ${valueSize}; color: ${iconColor}; margin-top: 2px; font-weight: 800; z-index: 5; position: relative;">
                    ${valueText}
                </div>
            `;
        } 
           
        
       gsap.to(cell, {
           rotationY: 0,
           duration: 0.3,
           ease: "back.out(0.6)",
           onComplete: () => {
           if (isSelected) {
          gsap.to(cell, {
         boxShadow: `0 0 20px #ffd700`,
        duration: 0.3,
        repeat: 2,
           yoyo: true
        });
      }
      resolve();
     }
  });
   }
  });
 }, delay);
});
}
// ===== 8. CONFIRM SELECTION – start sequential reveal =====
async function claimUserSurprise() {
    if (selectedBoxIndices.length !== MAX_SELECTIONS || isRevealing) return;
    
    // 🔒 DISABLE ALL UI ELEMENTS BEFORE STARTING
    isRevealing = true;
    
    // Disable all interactive elements
    const claimBtn = document.getElementById('claimUserSurpriseBtn');
    if (claimBtn) claimBtn.disabled = true;
    
    const grid = document.getElementById('userBoxGrid');
    if (grid) grid.style.pointerEvents = 'none';
    
    // Disable any spin buttons or balance controls
    const spinBtns = document.querySelectorAll('.spin-btn, .bet-btn, .auto-spin-btn');
    spinBtns.forEach(btn => btn.disabled = true);
    
    // Disable balance adjustment controls
    const balanceControls = document.querySelectorAll('.balance-control, .bet-selector, .coin-selector');
    balanceControls.forEach(ctrl => ctrl.style.pointerEvents = 'none');
    
    // Add loading overlay or visual feedback
    const overlay = document.createElement('div');
    overlay.id = 'revealOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    const thankyouMessage = pendingBoxSet?.docData?.thankyouMessage || 'ကျေးဇူးတင်ပါတယ်။';
    
    try {
        // Reveal selected boxes
        for (let i = 0; i < selectedBoxIndices.length; i++) {
            const idx = selectedBoxIndices[i];
            await revealSingleBox(idx, i * 800, thankyouMessage, true);
        }

        // Reveal remaining boxes
        const allIndices = Array.from({ length: currentBoxSet.length }, (_, i) => i);
        const remainingIndices = allIndices.filter(idx => !selectedBoxIndices.includes(idx));
        for (let i = 0; i < remainingIndices.length; i++) {
            await revealSingleBox(remainingIndices[i], (selectedBoxIndices.length + i) * 300, thankyouMessage, false);
        }

        // Calculate rewards
        const selectedBoxes = selectedBoxIndices.map(i => currentBoxSet[i]);
        let totalCredits = 0, totalSpins = 0, vipUpgrade = 0, thankyouCount = 0;
        selectedBoxes.forEach(box => {
            if (box.type === 'credit') totalCredits += box.value;
            else if (box.type === 'freespin') totalSpins += box.value;
            else if (box.type === 'vip') vipUpgrade += box.value;
            else if (box.type === 'thankyou') thankyouCount++;
        });

        // Get currentUser
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // ✅ Ensure currentUser has default values
        if (!currentUser) {
            currentUser = {
                balance: 0,
                displayBalance: 0,
                freeSpins: 0,
                vip: 0
            };
        }
        
        if (totalCredits > 0) {
            currentUser.balance = (currentUser.balance || 0) + totalCredits;
            currentUser.displayBalance = (currentUser.displayBalance || 0) + totalCredits;
        }
        if (totalSpins > 0) {
            currentUser.freeSpins = (currentUser.freeSpins || 0) + totalSpins;
        }
        if (vipUpgrade > 0) {
            currentUser.vip = (currentUser.vip || 0) + vipUpgrade;
            console.log(`👑 VIP upgraded: +${vipUpgrade}, new VIP level: ${currentUser.vip}`);
        }

        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update global gameState
        if (window.gameState) {
            window.gameState.balance = currentUser.balance;
            window.gameState.displayBalance = currentUser.displayBalance;
            window.gameState.vipLevel = currentUser.vip;
            window.gameState.freeSpins = currentUser.freeSpins;
        }
        
        // Update UI
        if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay();
        if (typeof updateVIPDisplay === 'function') updateVIPDisplay();
        if (window.gameState?.freeSpins > 0 && typeof updateFreeSpinIndicator === 'function') updateFreeSpinIndicator();

        // Win Animation
       // Win Animation (compact version)
if (totalCredits > 0 && typeof WinAnimation !== 'undefined') {
    let winType = '';
    
    if (totalCredits >= 50000) winType = 'mega';
    else if (totalCredits >= 15000) winType = 'super';
    else if (totalCredits >= 5000) winType = 'big';
    
    if (winType) {
        WinAnimation[winType](totalCredits);
        SoundManager.lion();
        SoundManager.coin();
        SoundManager.congratulations();
    }
}

        // Celebration notification
        showCelebrationNotification(totalCredits, totalSpins, vipUpgrade, thankyouCount);

        // Firestore update for sentBoxes
        let updateSuccess = false;
        let retryCount = 0;
        const maxRetries = 3;
        const db = firebase.firestore();
        const docRef = db.collection('sentBoxes').doc(pendingBoxSet.id);

        while (!updateSuccess && retryCount < maxRetries) {
            try {
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    const currentData = docSnap.data();
                    const boxes = currentData.boxes ? [...currentData.boxes] : [];

                    selectedBoxIndices.forEach(idx => {
                        if (boxes[idx] && !boxes[idx].opened) {
                            boxes[idx].opened = true;
                        }
                    });

                    await docRef.update({
                        boxes: boxes,
                        opened: true,
                        openedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        openedCount: firebase.firestore.FieldValue.increment(1),
                        totalSelectors: firebase.firestore.FieldValue.increment(1)
                    });

                    updateSuccess = true;
                    console.log('✅ Firestore updated: opened=true');
                } else {
                    console.error('Document does not exist!');
                    break;
                }
            } catch (err) {
                console.error(`Firestore update attempt ${retryCount + 1} failed:`, err);
                retryCount++;
                if (retryCount < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000));
                } else {
                    console.error('All retries failed.');
                    showNotification('ဆုကို သိမ်းဆည်းရာတွင် ချို့ယွင်းမှုရှိသည်။', 'error');
                }
            }
        }

        // 🔥 FIXED: Update user document in Firestore with safe values
        if (currentUser && currentUser.id) {
            try {
                const userRef = db.collection('users').doc(currentUser.id);
                
                // Make sure all values are numbers, not undefined
                const updateData = {
                    balance: currentUser.balance || 0,
                    vip: currentUser.vip || 0,
                    freeSpins: currentUser.freeSpins || 0,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Add displayBalance if it exists
                if (currentUser.displayBalance !== undefined) {
                    updateData.displayBalance = currentUser.displayBalance;
                }
                
                await userRef.update(updateData);
                console.log('✅ User document updated with:', updateData);
            } catch (err) {
                console.error('Error updating user document:', err);
                // Don't throw - user already got rewards locally
                showNotification('ဆုကို ရရှိပါသည်။ သို့သော် database save ချိန်တွင် အဆင်မပြေပါ။', 'warning');
            }
        }

        // Start free spins if any
        if (totalSpins > 0) {
            // Ensure freeSpins is updated in currentUser
            if (currentUser) {
                currentUser.freeSpins = (currentUser.freeSpins || 0) + totalSpins;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                if (window.gameState) window.gameState.freeSpins = currentUser.freeSpins;
                if (typeof updateFreeSpinIndicator === 'function') updateFreeSpinIndicator();
            }
            if (typeof startFreeSpins === 'function') {
                startFreeSpins(totalSpins);
            }
        }
        
    } catch (error) {
        console.error('Error in claimUserSurprise:', error);
        showNotification('အမှားတစ်ခုဖြစ်သွားပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်စတင်ပါ။', 'error');
    } finally {
        // 🔓 ENABLE ALL UI ELEMENTS AFTER FREE SPINS START
        setTimeout(() => {
            // Re-enable interactive elements
            if (grid) grid.style.pointerEvents = 'auto';
            
            const spinBtns = document.querySelectorAll('.spin-btn, .bet-btn, .auto-spin-btn');
            spinBtns.forEach(btn => btn.disabled = false);
            
            const balanceControls = document.querySelectorAll('.balance-control, .bet-selector, .coin-selector');
            balanceControls.forEach(ctrl => ctrl.style.pointerEvents = 'auto');
            
            // Remove overlay
            const overlayEl = document.getElementById('revealOverlay');
            if (overlayEl) overlayEl.remove();
            
        }, 500);
        
        // Close modal and cleanup
        closeUserSurpriseModal();
        isRevealing = false;
        pendingBoxSet = null;
        currentBoxSet = null;
        selectedBoxIndices = [];
        removePendingBoxSetFromLocal();
    }
}

// ===== 9. CELEBRATION NOTIFICATION (UPGRADED) =====
function showCelebrationNotification(credits, spins, vip, thankyouCount) {
    const notification = document.getElementById('celebrationNotification');
    if (!notification) return;

    const titleEl = document.getElementById('celebrationTitle');
    const messageEl = document.getElementById('celebrationMessage');
    const amountEl = document.getElementById('celebrationAmount');

    let message = '';
    if (credits > 0) message += `💰 ${credits.toLocaleString()} ကျပ် `;
    if (spins > 0) message += `🎰 ${spins} Spins `;
    if (vip > 0) message += `👑 VIP +${vip} `;
    if (thankyouCount > 0) message += `🙏 ကျေးဇူးတင်ပါတယ် `;

    titleEl.textContent = '🎁 Surprise Box ဆုလက်ဆောင် 🎁';
    messageEl.textContent = message;
    if (amountEl) amountEl.textContent = (credits > 0 ? credits.toLocaleString() + ' ကျပ်' : '');

    // GSAP animation for notification
    gsap.set(notification, { scale: 0, opacity: 0, display: 'flex' });
    gsap.to(notification, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(0.8)"
    });

    // Particle celebration
    if (window.particleSystem && (credits > 0 || vip > 0)) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        if (credits >= 50000) {
            window.particleSystem.burst('coin', centerX, centerY, 80);
        } else if (credits >= 15000) {
            window.particleSystem.burst('coin', centerX, centerY, 50);
        } else if (credits > 0) {
            window.particleSystem.burst('coin', centerX, centerY, 30);
        }
        if (vip > 0) {
            window.particleSystem.burst('crown', centerX, centerY, 40);
        }
    }

    setTimeout(() => {
        gsap.to(notification, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "back.in",
            onComplete: () => {
                notification.style.display = 'none';
            }
        });
    }, 5000);
}

// ===== 10. CLOSE MODAL =====
function closeUserSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (modal) modal.style.display = 'none';
    if (revealTimeout) clearTimeout(revealTimeout);
    isRevealing = false;
    const grid = document.getElementById('userBoxGrid');
    if (grid) grid.style.pointerEvents = 'auto';
}

// ===== 11. LOCAL STORAGE HELPERS =====
function savePendingBoxSetToLocal() {
    if (!pendingBoxSet) return;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const key = `pendingBoxSet_${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(pendingBoxSet));
}

function loadPendingBoxSetFromLocal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const key = `pendingBoxSet_${currentUser.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
        pendingBoxSet = JSON.parse(stored);
    }
}

function removePendingBoxSetFromLocal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const key = `pendingBoxSet_${currentUser.id}`;
    localStorage.removeItem(key);
}

// ===== 12. SURPRISE BOX ANIMATION (UPGRADED) =====
function showSurpriseBoxAnimation(boxType, boxValue) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        z-index: 10000000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    let icon = 'fa-gift';
    let color = '#ffd700';
    let title = '🎁 SURPRISE BOX! 🎁';
    let message = '';

    if (boxType === 'credit') {
        icon = 'fa-coins';
        color = '#00c853';
        title = '💰 CREDIT REWARD! 💰';
        message = `${formatNumber(boxValue)} ကျပ်`;
    } else if (boxType === 'vip') {
        icon = 'fa-crown';
        color = '#ffd700';
        title = '👑 VIP UPGRADE! 👑';
        message = `VIP Level ${boxValue}`;
    } else if (boxType === 'freespin') {
        icon = 'fa-play-circle';
        color = '#2196f3';
        title = '🎰 FREE SPINS! 🎰';
        message = `${boxValue} Spins`;
    }

    const card = document.createElement('div');
    card.style.cssText = `
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 3px solid ${color};
        border-radius: 40px;
        padding: 50px;
        text-align: center;
        box-shadow: 0 0 30px ${color};
    `;
    
    card.innerHTML = `
        <div style="font-size: 100px; margin-bottom: 20px;">
            <i class="fas ${icon}" style="color: ${color};"></i>
        </div>
        <h2 style="font-size: 42px; font-weight: 900; color: ${color}; margin-bottom: 20px; text-shadow: 0 0 20px ${color};">
            ${title}
        </h2>
        <div style="font-size: 56px; font-weight: bold; color: white; margin-bottom: 20px;">
            ${message}
        </div>
        <div style="font-size: 20px; color: #aaa;">
            🎉 ဂုဏ်ယူပါသည်။ 🎉
        </div>
    `;
    
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    
    // GSAP Animation
    gsap.set(card, { scale: 0, rotation: -180, opacity: 0 });
    gsap.to(card, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
    });
    
    // Particle burst
    if (window.particleSystem) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        if (boxType === 'credit') {
            window.particleSystem.burst('coin', centerX, centerY, 60);
        } else if (boxType === 'vip') {
            window.particleSystem.burst('crown', centerX, centerY, 50);
            window.particleSystem.burst('star', centerX, centerY, 40);
        } else if (boxType === 'freespin') {
            window.particleSystem.burst('spin', centerX, centerY, 50);
        }
    }
    
    setTimeout(() => {
        gsap.to(card, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "back.in"
        });
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => overlay.remove()
        });
    }, 5000);
}

// ===== 13. INIT =====
function initSurpriseListener() {
    // Initialize particle system
    if (!window.particleSystem) {
        window.particleSystem = new ParticleEffectSystem();
        window.particleSystem.init();
    }
    
    if (!firebase.auth) return;
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            listenForSurpriseBox(user.uid);
            loadPendingBoxSetFromLocal();
        }
    });
}

// ===== EXPORT GLOBALS =====
window.initSurpriseListener = initSurpriseListener;
window.checkPendingBoxSetOnSpin = checkPendingBoxSetOnSpin;
window.claimUserSurprise = claimUserSurprise;
window.closeUserSurpriseModal = closeUserSurpriseModal;
window.showSurpriseBoxAnimation = showSurpriseBoxAnimation;
