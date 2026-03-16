// ============================================
// GAME.JS - COMPLETE ULTIMATE VERSION
// (Version 1 + Version 2 + Version 3 Merged)
// ============================================

// ============================================
// 1. GAME STATE & CONFIGURATION
// ============================================
window.gameState = window.gameState || {
    balance: 10000,
    betAmount: 80,
    betMultiplier: 1,
    betType: '10C',
    betIndex: 2,
    winAmount: 0,
    isSpinning: false,
    autoSpin: false,
    autoSpinActive: false,
    jackpot: 100000,
    vipLevel: 0,
    userLevel: 1,
    pendingGift: null,
    spinCounter: 0,
    freeSpins: 0,
    totalFreeSpins: 0,
    isFreeSpinning: false,
    scatterCount: 0,
    totalScatter: 0,
    pendingGiftSpins: 3,
    spinCount: 0,
    threeMatchCount: 0,
    totalSpinsSinceReset: 0,
    checkInterval: 10,
    targetThreeMatchRate: 0.1,
    threeMatchControl: false,
    reduceThreeMatch: false
};

// Firebase
let currentUser = null;
// Reel Configuration - မြန်မာတိရစ္ဆာန်များ
const REEL_STRIPS_NORMAL = [
    // Reel 0
    [ 'seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ],
    // Reel 1
    [ 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ],
    // Reel 2
    [ 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ],
    // Reel 3
    [ 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ],
    // Reel 4
    [ 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ]
];

const REEL_STRIPS_ADMIN = [
    // Reel 0 – သင်္ကေတတွေကို ပိုကွဲပြားအောင် စီစဉ်
    [ 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'buffalo', 'tha', 'bonus', 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'buffalo', 'tha', 'bonus', 'wild' ],
    // Reel 1
    [ 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'tha', 'buffalo', 'bonus', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'tha', 'buffalo', 'bonus', 'wild' ],
    // Reel 2
    [ 'buffalo', 'tha', 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'bonus', 'buffalo', 'tha', 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ],
    // Reel 3
    [ 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'lion', 'tha', 'buffalo', 'bonus', 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'lion', 'tha', 'buffalo', 'bonus', 'wild' ],
    // Reel 4
    [ 'tha', 'ayeaye', 'coin', 'seven', 'lion', 'ele', 'zebra', 'buffalo', 'bonus', 'tha', 'ayeaye', 'coin', 'seven', 'lion', 'ele', 'zebra', 'buffalo', 'bonus', 'wild' ]
];

// လက်ရှိအသုံးပြုမယ့် Reel Strips (ပုံမှန်အနေနဲ့ Normal ကိုထား)
let currentReelStrips = REEL_STRIPS_NORMAL;

const REEL_STRIPS_REDUCED_THREE = [
    // Reel 0 
    [ 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'buffalo', 'tha', 'bonus', 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'buffalo', 'tha', 'bonus', 'wild' ],
    // Reel 1
    [ 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'tha', 'buffalo', 'bonus', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'tha', 'buffalo', 'bonus', 'wild' ],
    // Reel 2
    [ 'buffalo', 'tha', 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'bonus', 'buffalo', 'tha', 'seven', 'lion', 'ele', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild' ],
    // Reel 3
    [ 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'lion', 'tha', 'buffalo', 'bonus', 'ele', 'zebra', 'ayeaye', 'coin', 'seven', 'lion', 'tha', 'buffalo', 'bonus', 'wild' ],
    // Reel 4
    [ 'tha', 'ayeaye', 'coin', 'seven', 'lion', 'ele', 'zebra', 'buffalo', 'bonus', 'tha', 'ayeaye', 'coin', 'seven', 'lion', 'ele', 'zebra', 'buffalo', 'bonus', 'wild' ]
];
// Image paths
const IMAGE_PATHS = {
    'seven': 'images/seven.png',
    'lion': 'images/lion.png',
    'buffalo': 'images/buffalo.png',
    'ele': 'images/ele.png',
    'tha': 'images/tha.png',
    'zebra': 'images/zebra.png',
    'ayeaye': 'images/ayeaye.png',
    'wild': 'images/wild.png',
    'bonus': 'images/bonus.png',
    'coin': 'images/coin.png'
};


// Paytable (multipliers)
// မူရင်း PAYTABLE ကိုသိမ်းထားမယ်
const PAYTABLE_ORIGINAL = {
    'buffalo': {3: 2.25, 4: 3.0, 5: 20},
    'ele':     {3: 1.5,  4: 2.0, 5: 12},
    'lion':    {3: 1.125,4: 1.5, 5: 10},
    'zebra':   {3: 0.75, 4: 1.0, 5: 6},
    'tha':     {3: 0.6,  4: 0.8, 5: 5},
    'seven':   {3: 0.45, 4: 0.6, 5: 4},
    'coin':    {3: 0.3,  4: 0.4, 5: 3},
    'ayeaye':  {3: 0.15, 4: 0.2, 5: 2} 
};

// လက်ရှိ PAYTABLE (အစပိုင်းမှာ မူရင်းအတိုင်း)
let PAYTABLE = JSON.parse(JSON.stringify(PAYTABLE_ORIGINAL));

window.PAYTABLE = PAYTABLE;


 const ADMIN_PAYTABLE = {
    'buffalo': {3: 0.75, 4: 2.0, 5: 15},
    'ele':     {3: 0.5,  4: 1.5, 5: 9},
    'lion':    {3: 0.4,  4: 1.2, 5: 7.5},
    'zebra':   {3: 0.25, 4: 0.7, 5: 4.5},
    'tha':     {3: 0.2,  4: 0.6, 5: 3.75},
    'seven':   {3: 0.15, 4: 0.45, 5: 3},
    'coin':    {3: 0.1,  4: 0.3, 5: 2.25},
    'ayeaye':  {3: 0.05, 4: 0.15, 5: 1.5}
};

window.ADMIN_PAYTABLE = ADMIN_PAYTABLE;

// C MULTIPLIER
const C_MULTIPLIER_VALUES = {
    "1C": 0.1,
    "5C": 0.5,
    "10C": 1.0,
    "16C": 1.6,
    "20C": 2.0,
    "50C": 3.0
};

// BET TABLE
const BET_TABLE = {
    "1C": [80, 160, 320, 480, 800],
    "5C": [400, 800, 1600, 2400, 4000],
    "10C": [800, 1600, 3200, 4800, 8000],
    "16C": [1280, 2560, 5120, 7680, 12800],
    "20C": [1600, 3200, 6400, 9600, 16000],
    "50C": [4000, 8000, 16000, 24000, 40000]
};

// Grid dimensions
const GRID_ROWS = 4;
const GRID_COLS = 5;

// Animation config
const ANIMATION_CONFIG = {
    SPIN_DURATION: 1500,
    CELL_DELAY: 25,
    WIN_HIGHLIGHT_DURATION: 2000,
    SYMBOL_CHANGE_INTERVAL: 120,
    LIGHTNING_INTERVAL: 3000,
    PARTICLE_COUNT: 30
};


// ============================================
// ADMIN CONTROL MODE (1)- SIMPLE ON/OFF
// ============================================

let adminControlMode = false;  // false = OFF (အစိမ်း), true = ON (အနီ)

// Listen to admin control mode
function listenToAdminControlMode() {
    console.log('🔥 Admin Control 1 listener started');

    if (!firebase.firestore) {
        console.warn('Firebase not available');

        return;
      }

    const db = firebase.firestore();

    db.collection('settings').doc('adminControl')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const newMode = data.enabled === true;

                if (newMode !== adminControlMode) {
                    adminControlMode = newMode;

                    if (adminControlMode) {
                        // ON - Admin Control (Reduced Payouts)
                        PAYTABLE = JSON.parse(JSON.stringify(ADMIN_PAYTABLE));
                        currentReelStrips = REEL_STRIPS_ADMIN;
                        console.log('🔴 ADMIN MODE: ON - ဆုကြေးလျှော့ချ');

                        // Three-match control ကို ဖွင့်မယ် (Admin Mode မှာမှ ထိန်းချုပ်မယ်)
                        if (window.gameState) {
                            window.gameState.threeMatchControl = true;
                            window.gameState.targetThreeMatchRate = 0.05; // Admin မှာ ပိုတင်းကျပ်အောင်
                        }
                    } else {
                        // OFF - Normal (Standard Payouts)
                        PAYTABLE = JSON.parse(JSON.stringify(PAYTABLE_ORIGINAL));
                        currentReelStrips = REEL_STRIPS_NORMAL;
                        console.log('🟢 NORMAL MODE: OFF - ပုံမှန်ဆုကြေး');

                        // Three-match control ကို ပိတ်မယ်
                        if (window.gameState) {
                            window.gameState.threeMatchControl = false;
                        }
                    }
                }
            }
        }, (error) => {
            console.error('Error listening to admin control:', error);
           console.log('🔥 Admin Control 1 listener started');
        });
}

// Update mode indicator (UI မှာမပြချင်ရင် comment ချထားပါ)
function updateModeIndicator() {
    let indicator = document.getElementById('adminModeIndicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'adminModeIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        document.body.appendChild(indicator);
    }

    if (adminControlMode) {
        indicator.style.background = '#ff5252';
        indicator.style.color = 'white';
        indicator.style.border = '2px solid #ff0000';
        indicator.style.boxShadow = '0 0 20px #ff5252';
        indicator.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>ADMIN MODE</span>
            <span style="background:white; color:#ff5252; padding:2px 8px; border-radius:12px;">REDUCED</span>
        `;
    } else {
        indicator.style.background = '#4caf50';
        indicator.style.color = 'white';
        indicator.style.border = '2px solid #00ff00';
        indicator.style.boxShadow = '0 0 20px #4caf50';
        indicator.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>NORMAL MODE</span>
            <span style="background:white; color:#4caf50; padding:2px 8px; border-radius:12px;">STANDARD</span>
        `;
    }
}

// Show notification (UI မှာမပြချင်ရင် comment ချထားပါ)
function showModeNotification(isAdminMode) {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    const iconEl = document.getElementById('notificationIcon');

    if (!notification || !messageEl) return;

    if (isAdminMode) {
        messageEl.textContent = '🔴 ADMIN MODE: ဆုကြေးလျှော့ချထားပါသည်။';
        iconEl.className = 'fas fa-exclamation-triangle';
        notification.style.background = '#ff5252';
    } else {
        messageEl.textContent = '🟢 NORMAL MODE: ပုံမှန်ဆုကြေး';
        iconEl.className = 'fas fa-check-circle';
        notification.style.background = '#4caf50';
    }

    notification.style.display = 'flex';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Admin functions
async function turnOnAdminMode() {
    if (!firebase.firestore) return false;
    const db = firebase.firestore();
    await db.collection('settings').doc('adminControl').set({
        enabled: true,
        updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
}

async function turnOffAdminMode() {
    if (!firebase.firestore) return false;
    const db = firebase.firestore();
    await db.collection('settings').doc('adminControl').set({
        enabled: false,
        updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
}


// ==============================================
// ADMIN CONTROL 2 - UNIQUE MODE (GAME INTEGRATION)
// ==============================================

// ဂိမ်းအတွက် admin control 2 state (Firebase က လက်ခံမယ်)
window.adminControl2 = {
    enabled: false,
    mode: 'normal'
};

// Spin counter for duplicate allowance
let uniqueModeSpinCounter = 0;
let duplicateAllowedThisSpin = false;
const DUPLICATE_INTERVAL = 20; // 20 spins မှာ တစ်ခါ duplicate ခွင့်ပြုမယ်

// Firebase ကို နားထောင်မယ်
function listenToAdminControl2() {
    if (!firebase.firestore) {
        console.warn('Firebase not available');
        return;
    }

    const db = firebase.firestore();

    db.collection('settings').doc('adminControl2')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                window.adminControl2.enabled = data.enabled === true;
                window.adminControl2.mode = data.mode || 'normal';
                console.log('🔥 Admin Control 2 updated:', JSON.stringify(window.adminControl2));
                
                // Reset counter when enabled changes
                if (window.adminControl2.enabled) {
                    uniqueModeSpinCounter = 0;
                    duplicateAllowedThisSpin = false;
                }
            } else {
                console.log('⚠️ No adminControl2 document found');
                window.adminControl2.enabled = false;
                window.adminControl2.mode = 'normal';
            }
        }, (error) => {
            console.error('Error listening to admin control 2:', error);
        });
}

function generateSpinResult() {
    const result = [[], [], [], [], []];
    const symbolsWithoutWild = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus'];
    const symbolsWithWild = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'wild'];

    const adminCtrl = window.adminControl2 || { enabled: false, mode: 'normal' };

    console.log('🎯 Admin Control 2 status:', JSON.stringify(adminCtrl));

    let activeReelStrips;
    if (window.gameState && window.gameState.reduceThreeMatch) {
        activeReelStrips = REEL_STRIPS_REDUCED_THREE;
        console.log('🎯 Using REDUCED THREE-MATCH reel strips');
    } else if (adminControlMode) {
        activeReelStrips = REEL_STRIPS_ADMIN;
    } else {
        activeReelStrips = REEL_STRIPS_NORMAL;
    }

    if (adminCtrl.enabled && adminCtrl.mode === 'always_different') {

        let pool = [...symbolsWithoutWild];
        let selected = [];

        for (let i = 0; i < 8; i++) {
            let randomIndex = Math.floor(Math.random() * pool.length);
            selected.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
        }

        for (let row = 0; row < 4; row++) {
            result[0][row] = selected[row];
        }

        for (let row = 0; row < 4; row++) {
            result[1][row] = selected[row + 4];
        }

        for (let col = 2; col < 5; col++) {
            for (let row = 0; row < 4; row++) {
                result[col][row] = symbolsWithWild[Math.floor(Math.random() * symbolsWithWild.length)];
            }
        }
    }

    else {
        for (let col = 0; col < 5; col++) {
            const reelStrip = activeReelStrips[col];
            const stripLength = reelStrip.length;
            
            const startIndex = Math.floor(Math.random() * stripLength);
            
            for (let row = 0; row < 4; row++) {
                const index = (startIndex + row) % stripLength;
                result[col][row] = reelStrip[index];
            }
        }
    }

    for (let row = 0; row < 4; row++) {
        if (result[0][row] === 'wild') {
            result[0][row] = symbolsWithoutWild[Math.floor(Math.random() * symbolsWithoutWild.length)];
        }
        if (result[1][row] === 'wild') {
            result[1][row] = symbolsWithoutWild[Math.floor(Math.random() * symbolsWithoutWild.length)];
        }
    }

    console.log('🎯 Final Result sample:',
        result[0].map((v,i) => `${v}-${result[1][i]}`).join(', '));

    return result;
}

document.addEventListener('DOMContentLoaded', function() {
    listenToAdminControl2();
});



// ============================================
// 2. DOM READY & INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Game.js Ultimate Version loaded');


    // Get current user
    const savedUserData = localStorage.getItem('currentUser');
    if (savedUserData) {
        currentUser = JSON.parse(savedUserData);
        window.currentUser = currentUser;
        loadUserFromFirebase();
    }
     listenToAdminControlMode();
     // Start listening to Firebase
    listenToAdminControl2();
   // Add click event to dashboard button (if exists)
    const btn = document.getElementById('adminControl2Btn');
    if (btn) {
        btn.addEventListener('click', toggleAdminControl2);
    }
    // Initialize grid
    initSlotGrid();

    // Initialize controls
    initBetControls();
    initEventListeners();

    // Update displays
    loadCurrentUserData();
    updateBalanceDisplay();
    updateJackpotDisplay();

    // Load jackpot
    loadJackpotFromAdmin();

    // Check for user surprise
    setTimeout(checkUserSurprise, 500);
    setInterval(checkUserSurprise, 3000);

    // Add premium styles
    addPremiumStyles();
});

// ============================================
// 3. PREMIUM GRID INITIALIZATION
// ============================================
function initSlotGrid() {
    const slotGrid = document.getElementById('slotGrid');
    if (!slotGrid) return;

    slotGrid.innerHTML = '';
    slotGrid.className = 'grid-5x4';

    // Premium grid styles
    slotGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: 1px;
        background: linear-gradient(165deg, #1a2f1a, #0a1f0a, #1a2a1a);
        border-radius: 2px;
        box-shadow: 
            inset 0 -4px 0 #2a4a2a,
            0 15px 30px rgba(0,0,0,0.7),
            0 0 0 2px #ffd70022,
            0 0 20px #ffd70033;
        border: 1px solid #ffd70044;
        position: relative;
        z-index: 1;
        overflow: hidden;
    `;

    // Ambient light
    const ambientLight = document.createElement('div');
    ambientLight.style.cssText = `
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at 30% 30%, rgba(255,215,0,0.15), transparent 70%);
        animation: ambientRotate 20s linear infinite;
        pointer-events: none;
        z-index: 0;
    `;
    slotGrid.appendChild(ambientLight);

    // Create cells
    for (let i = 0; i < 20; i++) {
        const cell = createPremiumCell(i);
        slotGrid.appendChild(cell);
    }

    // Corner decorations
    addCornerDecorations(slotGrid);

    console.log('✅ Premium 5x4 grid initialized');
}

function createPremiumCell(index) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell premium-cell';
    cell.dataset.index = index;
    cell.dataset.row = Math.floor(index / 5);
    cell.dataset.col = index % 5;

    cell.style.cssText = `
        background: linear-gradient(145deg, #2d4a2d, #1d3a1d);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1px;
        box-shadow: 
            inset 0 -4px 0 #0a2a0a,
            0 8px 15px rgba(0,0,0,0.5),
            0 0 0 1px #ffd70033;
        border: 2px solid #ffd70022;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        aspect-ratio: 1 / 1;
        position: relative;
        overflow: hidden;
        z-index: 1;
    `;

    // Shine effect
    const shine = document.createElement('div');
    shine.className = 'cell-shine';
    shine.style.cssText = `
        position: absolute;
        top: -100%;
        left: -100%;
        width: 300%;
        height: 300%;
        background: linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.15) 50%, transparent 70%);
        transform: rotate(25deg);
        animation: shineMove 8s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
    `;
    cell.appendChild(shine);

    // Glow effect
    const glow = document.createElement('div');
    glow.className = 'cell-glow';
    glow.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 18px;
        box-shadow: 0 0 20px #ffd70033;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        z-index: 1;
    `;
    cell.appendChild(glow);

    // Image container
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
        position: relative;
        width: 90%;
        height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        transform-style: preserve-3d;
        transition: transform 0.3s;
    `;

    const img = document.createElement('img');
    img.src = 'images/coin.png';
    img.alt = 'slot symbol';
    img.className = 'symbol-image';
    img.loading = 'lazy';
    img.style.cssText = `
        width: 90%;
        height: 90%;
        object-fit: contain;
        filter: drop-shadow(0 0 8px rgba(255,215,0,0.5));
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateZ(10px);
    `;
    img.onerror = function() {
        this.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = getSymbolEmoji('coin');
        fallback.style.cssText = `
            font-size: clamp(24px, 6vw, 40px);
            filter: drop-shadow(0 0 10px gold);
            text-shadow: 0 0 20px rgba(255,215,0,0.5);
        `;
        imgContainer.appendChild(fallback);
    };

    imgContainer.appendChild(img);
    cell.appendChild(imgContainer);

    // Win overlay
    const winOverlay = document.createElement('div');
    winOverlay.className = 'win-overlay';
    winOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 30% 30%, rgba(255,215,0,0.4), rgba(255,215,0,0.1) 70%);
        border-radius: 18px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 4;
        mix-blend-mode: overlay;
    `;
    cell.appendChild(winOverlay);

    // Corner sparkles
    for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'corner-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: #ffd700;
            border-radius: 50%;
            filter: blur(2px);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 5;
            ${i === 0 ? 'top: 5px; left: 5px;' : ''}
            ${i === 1 ? 'top: 5px; right: 5px;' : ''}
            ${i === 2 ? 'bottom: 5px; left: 5px;' : ''}
            ${i === 3 ? 'bottom: 5px; right: 5px;' : ''}
        `;
        cell.appendChild(sparkle);
    }

    return cell;
}

function addCornerDecorations(grid) {
    const positions = [
        { top: '-5px', left: '-5px' },
        { top: '-5px', right: '-5px' },
        { bottom: '-5px', left: '-5px' },
        { bottom: '-5px', right: '-5px' }
    ];

    positions.forEach((pos, i) => {
        const corner = document.createElement('div');
        corner.className = `grid-corner`;
        corner.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            ${Object.entries(pos).map(([k,v]) => `${k}: ${v};`).join('')}
            border-${i === 0 ? 'top' : i === 1 ? 'top' : i === 2 ? 'bottom' : 'bottom'}-left-radius: ${i % 2 === 0 ? '30px' : '0'};
            border-${i === 0 ? 'top' : i === 1 ? 'top' : i === 2 ? 'bottom' : 'bottom'}-right-radius: ${i % 2 === 1 ? '30px' : '0'};
            border-${i < 2 ? 'top' : 'bottom'}: 3px solid #ffd70066;
            border-${i % 2 === 0 ? 'left' : 'right'}: 3px solid #ffd70066;
            filter: drop-shadow(0 0 10px gold);
            z-index: 5;
            pointer-events: none;
        `;
        grid.appendChild(corner);
    });
}

// ============================================
// 4. BET CONTROLS
// ============================================
function initBetControls() {
    const betSelectBtn = document.getElementById('betSelectBtn');
    const betOptions = document.getElementById('betOptions');
    const decreaseBtn = document.getElementById('decreaseBetBtn');
    const increaseBtn = document.getElementById('increaseBetBtn');

    if (betSelectBtn && betOptions) {
        betSelectBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            betOptions.style.display = betOptions.style.display === 'none' ? 'grid' : 'none';
        });

        document.querySelectorAll('.bet-option').forEach(option => {
            option.addEventListener('click', function() {
                const cType = this.dataset.c + 'C';

                document.querySelectorAll('.bet-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');

                window.gameState.betType = cType;
                window.gameState.betMultiplier = parseFloat(this.dataset.c);
                window.gameState.betIndex = 0;
                window.gameState.betAmount = BET_TABLE[cType] ? BET_TABLE[cType][window.gameState.betIndex] : 80;

                updateBetDisplay();
                betOptions.style.display = 'none';
                playButtonSound();
            });
        });

        document.addEventListener('click', function(e) {
            if (!betSelectBtn.contains(e.target) && !betOptions.contains(e.target)) {
                betOptions.style.display = 'none';
            }
        });
    }

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            if (!window.gameState.betType) return;

            const betArray = BET_TABLE[window.gameState.betType];
            if (betArray && window.gameState.betIndex > 0) {
                window.gameState.betIndex--;
                window.gameState.betAmount = betArray[window.gameState.betIndex];
                updateBetDisplay();
                playButtonSound();
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            if (!window.gameState.betType) return;

            const betArray = BET_TABLE[window.gameState.betType];
            if (betArray && window.gameState.betIndex < betArray.length - 1) {
                window.gameState.betIndex++;
                window.gameState.betAmount = betArray[window.gameState.betIndex];
                updateBetDisplay();
                playButtonSound();
            }
        });
    }
}

function updateBetDisplay() {
    const betDisplay = document.getElementById('betAmountDisplay');
    const betSelectBtn = document.getElementById('betSelectBtn');

    if (betDisplay) {
        betDisplay.textContent = window.gameState.betAmount.toLocaleString();
    }

    if (betSelectBtn && window.gameState.betType) {
        betSelectBtn.textContent = window.gameState.betType;
    }

    document.querySelectorAll('.bet-option').forEach(opt => {
        if ((opt.dataset.c + 'C') === window.gameState.betType) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

// ============================================
// 5. EVENT LISTENERS
// ============================================
function initEventListeners() {
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', function() {
            if (!window.gameState.isSpinning && !window.gameState.autoSpinActive) {
                spin();
            }
        });

        // Long press for auto spin
        setupLongPress(spinBtn);
    }

    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    if (gameContainer.style.display === 'flex' || gameContainer.style.display === 'block') {
                        loadCurrentUserData();
                    }
                }
            });
        });
        observer.observe(gameContainer, { attributes: true });
    }
}

function loadCurrentUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        window.gameState.balance = currentUser.balance || 10000;
        window.gameState.userLevel = currentUser.level || 1;
        window.gameState.vipLevel = currentUser.vip || 0;
        updateBalanceDisplay();
    }
}

// ============================================
// 6. SPIN FUNCTION & ANIMATIONS
// ============================================

function spin() {
    console.log('🎰 Spinning...');

    if (window.gameState.isSpinning) {
        console.log('⚠️ Already spinning');
        return;
    }
    
    // အရင် Win တွေကိုရှင်းမယ်
    clearAllWinHighlights();

    // Play spin sound
    if (typeof SoundManager !== 'undefined') {
        SoundManager.spin();
    }

    // Balance check (Free Spin ဆိုရင် မစစ်ဘူး)
    if (!window.gameState.isFreeSpinning && window.gameState.balance < window.gameState.betAmount) {
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ', 'error');
        return;
    }

    window.gameState.isSpinning = true;

    // Deduct bet (Free Spin ဆိုရင် မတူးဘူး)
    if (!window.gameState.isFreeSpinning) {
        window.gameState.balance -= window.gameState.betAmount;
        addJackpotContribution(window.gameState.betAmount);
    }

    window.gameState.spinCount++;
    updateBalanceDisplay();
    updateUserBalanceInStorage();

    // Generate result
    const result = generateSpinResult();
    console.log('Final Result:', result);

    // Start staggered animation
    animateReelsStaggered(result);

   // Listen for animation complete
document.addEventListener('animationComplete', function onAnimationComplete() {
    document.removeEventListener('animationComplete', onAnimationComplete);

    console.log('💰 Calculating winnings...');

    // Calculate wins
    const winResult = calculateWinnings(result);
    const totalWin = winResult.totalWin || 0;

    // Check scatter for free spins
    checkScatter(result);

    // Highlight wins
    if (winResult.indices && winResult.indices.length > 0) {
        highlightWinsPremium(winResult.indices, winResult.buffaloIndices || []);
        showWinWithRise(totalWin, winResult.indices);
    }

    // Check for buffalo jackpot
    const buffaloCount = countBuffalo(result);
    if (buffaloCount >= 12) {
        if (typeof premiumBuffaloStampede !== 'undefined') {
            premiumBuffaloStampede.startStampede(window.gameState.jackpot, buffaloCount);
        } else if (typeof buffaloStampede !== 'undefined') {
            buffaloStampede.startStampede(window.gameState.jackpot, buffaloCount);
        }
        showBuffaloJackpot(window.gameState.jackpot, buffaloCount);
    } else if (buffaloCount >= 5 && typeof buffaloStampede !== 'undefined') {
        buffaloStampede.startStampede(totalWin, buffaloCount);
    }

    window.gameState.isSpinning = false;

    // Check pending gift
    checkPendingGiftOnSpin();

    // FREE SPIN HANDLING
    if (window.gameState.isFreeSpinning && window.gameState.freeSpins > 0) {
        window.gameState.freeSpins--;
        updateFreeSpinIndicator();

        if (window.gameState.freeSpins > 0) {
            setTimeout(() => {
                spin();
            }, 2000);
        } else {
            endFreeSpins();
        }
    }

    // Auto spin handling
    if (window.gameState.autoSpinActive) {
        handleAutoSpinComplete(totalWin);
    }
  }); // <-- ဒီမှာတစ်ခုပဲလိုတယ်
}


// ============================================
// CLEAR ALL WIN HIGHLIGHTS
// ============================================
function clearAllWinHighlights() {
    const cells = document.querySelectorAll('.grid-cell');
    
    cells.forEach(cell => {
        // Win class တွေဖြုတ်
        cell.classList.remove('win', 'win-pulse', 'buffalo-win', 'mega-win');
        
        // Win overlay ကိုဖျောက်
        const overlay = cell.querySelector('.win-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
        }
        
        // Corner sparkles တွေဖျောက်
        cell.querySelectorAll('.corner-sparkle').forEach(s => {
            s.style.opacity = '0';
            s.style.animation = 'none';
        });
    });
    
    // Floating win numbers တွေဖျက်
    document.querySelectorAll('.floating-win-number').forEach(el => el.remove());
    
    console.log('🧹 All win highlights cleared');
}

// ============================================
// 7. STAGGERED ANIMATION WITH DROP EFFECT (No Disappear)
// ============================================
function animateReelsStaggered(finalResult) {
    const cells = document.querySelectorAll('.grid-cell');
    if (cells.length === 0) return;

    console.log('✨ Staggered drop animation started (no disappear)');

    // Animation class အဟောင်းတွေ ဖြုတ်
    cells.forEach(cell => {
        const img = cell.querySelector('img');
        if (img) {
            img.classList.remove('symbol-drop', 'symbol-glow');
            // Opacity ကို မပြောင်းဘူး
        }
    });

    // တစ်ခုချင်းစီ ကျလာအောင် လုပ်
    cells.forEach((cell, index) => {
        setTimeout(() => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const symbol = finalResult[col][row];
            const img = cell.querySelector('img');

            if (img && symbol) {
                // ပုံအသစ်ထည့်
                img.src = `images/${symbol}.png`;
                
                // Animation class ထည့် (ကျလာမယ်)
                img.classList.add('symbol-drop');
                cell.classList.add('symbol-glow');
                
                // Animation ပြီးရင် class ဖြုတ်
                setTimeout(() => {
                    img.classList.remove('symbol-drop');
                    cell.classList.remove('symbol-glow');
                }, 800);
            }
            cell.dataset.symbol = symbol;
            
        }, 100 + (index * 40)); // တစ်ခုနဲ့တစ်ခု 40ms ခြား
    });

    // Animation ပြီးတဲ့ Event ကို ပြန်ခေါ်
    setTimeout(() => {
        cells.forEach(cell => {
            const img = cell.querySelector('img');
            if (img) {
                img.classList.remove('symbol-drop', 'symbol-glow');
            }
        });
        document.dispatchEvent(new CustomEvent('animationComplete'));
        console.log('✅ Drop animation complete');
    }, 100 + (cells.length * 40) + 800);
}


function checkThreeMatchRate() {
    const state = window.gameState;
    const expectedCount = Math.floor(state.checkInterval * state.targetThreeMatchRate); // 10 * 0.2 = 2
    
    console.log(`🎯 Three-match check: ${state.threeMatchCount}/${expectedCount} in last ${state.checkInterval} spins`);
    
    if (state.threeMatchCount > expectedCount) {
        // သတ်မှတ်ချက်ထက် ပိုနေရင် နောက် spin တွေမှာ ၃ ကောင်တူတာကို လျှော့ချမယ်
        state.reduceThreeMatch = true;
        console.log('⚠️ Reducing three-match probability for next spins');
    } else {
        state.reduceThreeMatch = false;
    }
    
    // Counter တွေကို ပြန် Reset လုပ်မယ်
    state.threeMatchCount = 0;
    state.totalSpinsSinceReset = 0;
}

// ============================================
// 8. WIN CALCULATION (1024 WAYS)
// ============================================
function calculateWinnings(result) {
    console.log('🔥 calculateWinnings called');
    console.log('🎮 threeMatchControl status:', window.gameState?.threeMatchControl);
    const paytable = window.PAYTABLE;
    let totalWin = 0;
    let buffaloCount = 0;
    let winIndices = [];
    let buffaloIndices = [];
    let winLines = [];
    const bet = window.gameState.betAmount;
    const rows = 4;
    const cols = 5;

    // Count buffalo for jackpot
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (result[c][r] === 'buffalo') {
                buffaloCount++;
                buffaloIndices.push(r * 5 + c);
            }
        }
    }

    // 1024 ways to win - check all combinations
    for (let r0 = 0; r0 < rows; r0++) {
        const symbol0 = result[0][r0];
        if (!symbol0) continue;

        for (let r1 = 0; r1 < rows; r1++) {
            if (result[1][r1] !== symbol0 && result[1][r1] !== 'wild') continue;

            for (let r2 = 0; r2 < rows; r2++) {
                const sym2 = result[2][r2];
                if (!(sym2 === symbol0 || sym2 === 'wild')) continue;

                let streak = 3;
                let winRowIndices = [r0 * 5, r1 * 5 + 1, r2 * 5 + 2];

                // Check col 3
                for (let r3 = 0; r3 < rows; r3++) {
                    const sym3 = result[3][r3];
                    if (sym3 === symbol0 || sym3 === 'wild') {
                        streak = 4;
                        winRowIndices.push(r3 * 5 + 3);
                        break;
                    }
                }

                // Check col 4
                if (streak === 4) {
                    for (let r4 = 0; r4 < rows; r4++) {
                        const sym4 = result[4][r4];
                        if (sym4 === symbol0 || sym4 === 'wild') {
                            streak = 5;
                            winRowIndices.push(r4 * 5 + 4);
                            break;
                        }
                    }
                }

                if (PAYTABLE[symbol0] && PAYTABLE[symbol0][streak]) {
                    const win = bet * PAYTABLE[symbol0][streak];
                    totalWin += win;

                    winLines.push({
                        symbol: symbol0,
                        count: streak,
                        win: win,
                        multiplier: PAYTABLE[symbol0][streak]
                    });

                    winIndices.push(...winRowIndices);
                }
            }
        }
    }

    // ******************* THREE-MATCH CONTROL  *******************

let threeMatchWinCount = 0;
winLines.forEach(line => {
    console.log(`🔍 Win line - symbol: ${line.symbol}, count: ${line.count}, type: ${typeof line.count}`);
    if (line.count === 3) {
        threeMatchWinCount++;
    }
});
console.log(`📊 threeMatchWinCount: ${threeMatchWinCount}`);

 if (window.gameState && window.gameState.threeMatchControl) {
    console.log('⚙️ Inside threeMatchControl block');
    window.gameState.threeMatchCount += threeMatchWinCount;
    window.gameState.totalSpinsSinceReset++;
  
    console.log(`📊 Counters - ThreeMatch: ${window.gameState.threeMatchCount}, TotalSpins: ${window.gameState.totalSpinsSinceReset}, Interval: ${window.gameState.checkInterval}`);

    if (window.gameState.totalSpinsSinceReset >= window.gameState.checkInterval) {
        console.log('⏰ Check interval reached! Calling checkThreeMatchRate...');
        checkThreeMatchRate();
    }
}

    // *******************************************************************************

    // Jackpot for 12+ buffalo
    if (buffaloCount >= 12) {
        totalWin += window.gameState.jackpot;
        winLines.push({
            line: 'JACKPOT',
            name: 'Buffalo Jackpot',
            win: window.gameState.jackpot
        });
        winIndices.push(...buffaloIndices);
    }

    if (totalWin > 0) {
        window.gameState.balance += totalWin;
        window.gameState.winAmount = totalWin;
        updateBalanceDisplay();
        updateWinDisplay(totalWin);
        addWinToHistory(totalWin);
        playWinSounds(totalWin, winLines);
        showWinLinesInfo(winLines);

        // Win animations based on amount
        if (typeof WinAnimations !== 'undefined') {
            if (totalWin >= 50000) {
                WinAnimations.super();
                // Super Win ဆိုရင် congratulations ခေါ်
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.congratulations();
                }
            } else if (totalWin >= 15000) {
                WinAnimations.mega();
                // Mega Win ဆိုရင် congratulations ခေါ်
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.congratulations();
                }
            } else if (totalWin >= 5000) {
                WinAnimations.big();
                // Big Win ဆိုရင် congratulations ခေါ်
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.congratulations();
                }
            }
        }

        checkLevelUp();
    } else {
        window.gameState.winAmount = 0;
        updateWinDisplay(0);
    }

    // Remove duplicates from winIndices
    winIndices = [...new Set(winIndices)];

    return {
        totalWin: totalWin,
        indices: winIndices,
        buffaloIndices: buffaloIndices,
        winLines: winLines
    };
}

function countBuffalo(result) {
    let count = 0;
    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 4; r++) {
            if (result[c][r] === 'buffalo') count++;
        }
    }
    return count;
}
// ============================================
// 9. WIN HIGHLIGHT & RISE ANIMATIONS
// ============================================
function highlightWinsPremium(winIndices, buffaloIndices = []) {
    const cells = document.querySelectorAll('.grid-cell');

    cells.forEach(cell => {
        cell.classList.remove('win', 'win-pulse', 'buffalo-win', 'mega-win');
        const overlay = cell.querySelector('.win-overlay');
        if (overlay) overlay.style.opacity = '0';

        cell.querySelectorAll('.corner-sparkle').forEach(s => {
            s.style.opacity = '0';
        });
    });

    if (!winIndices || winIndices.length === 0) return;

    const winType = winIndices.length > 12 ? 'mega' :
                   winIndices.length > 8 ? 'super' :
                   winIndices.length > 4 ? 'big' : 'normal';

    winIndices.forEach((index, i) => {
        setTimeout(() => {
            const cell = cells[index];
            if (!cell) return;

            cell.classList.add('win');
            if (winType === 'mega') cell.classList.add('mega-win');

            const overlay = cell.querySelector('.win-overlay');
            if (overlay) overlay.style.opacity = '1';

            cell.querySelectorAll('.corner-sparkle').forEach(s => {
                s.style.opacity = '1';
                s.style.animation = `sparkleFlicker ${0.5 + Math.random()}s infinite`;
            });

            if (buffaloIndices.includes(index)) {
                cell.classList.add('buffalo-win');
            }

            createRippleEffect(cell);
        }, i * 50);
    });
}

function createRippleEffect(cell) {
    const rect = cell.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        top: ${rect.top + rect.height/2}px;
        left: ${rect.left + rect.width/2}px;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: rippleExpand 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 99997;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function showWinWithRise(amount, winIndices) {
    highlightWinsPremium(winIndices);

    const winEl = document.getElementById('winAmount');
    if (winEl) {
        winEl.textContent = amount.toLocaleString();
        winEl.classList.add('win-flash');
        setTimeout(() => {
            winEl.classList.remove('win-flash');
        }, 500);
    }

    createFloatingWinNumbers(amount, winIndices);
}

function createFloatingWinNumbers(amount, indices) {
    const cells = document.querySelectorAll('.grid-cell');

    indices.forEach((index, i) => {
        setTimeout(() => {
            const cell = cells[index];
            if (!cell) return;

            const rect = cell.getBoundingClientRect();
            const floating = document.createElement('div');
            floating.className = 'floating-win-number';
            floating.textContent = '+' + amount.toLocaleString();
            floating.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top}px;
                transform: translate(-50%, -50%);
                color: #ffd700;
                font-size: 24px;
                font-weight: 900;
                text-shadow: 0 0 20px gold;
                z-index: 10000;
                pointer-events: none;
                animation: floatUp 1s ease-out forwards;
            `;
            document.body.appendChild(floating);

            setTimeout(() => {
                if (floating.parentNode) floating.remove();
            }, 1000);
        }, i * 150);
    });
}

// ============================================
// 10. FREE SPIN SYSTEM (SCATTER)
//=============================================

 function startFreeSpins(bonusCount) {
    console.log('🎰 Starting Free Spins!');

    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = 10;           // ကျန်တဲ့အရေအတွက်
    window.gameState.totalFreeSpins = 10;      // စုစုပေါင်း

    // Buttons တွေကိုပိတ်မယ်
    disableButtons(true);
    
    // Indicator ပြမယ်
    showFreeSpinIndicator();
    
    // Animation ပြမယ်
    showFreeSpinStartAnimation(window.gameState.freeSpins);
    
    showNotification(`✨ Free Spin ${window.gameState.freeSpins} ကြိမ် ရရှိပါသည်။`, 'success');
    
    // ပထမဆုံး Free Spin ကို စက်ချက်ချင်းစမယ်
    setTimeout(() => {
        spin();
    }, 1500);
}

// Free Spin တစ်ချက်စီအတွက် Handler
function handleFreeSpin() {
    if (!window.gameState.isFreeSpinning) return;
    
    if (window.gameState.freeSpins > 0) {
        // ကျန်တဲ့အရေအတွက်ကို လျှော့မယ်
        window.gameState.freeSpins--;
        
        // Indicator ကို Update လုပ်မယ်
        updateFreeSpinIndicator();
        
        console.log(`🎰 Free Spin left: ${window.gameState.freeSpins}`);
        
        // နောက်ထပ် Free Spin ကျန်သေးရင် ဆက်ခေါ်မယ်
        if (window.gameState.freeSpins > 0) {
            setTimeout(() => {
                spin();
            }, 2000);  // ၂ စက္ကန့်စောင့်ပြီး နောက် Spin ကိုဆက်မယ်
        } else {
            // Free Spin အကုန်ပြီးရင်
            endFreeSpins();
        }
    } else {
        endFreeSpins();
    }
}

// Free Spin ပြီးဆုံးခြင်း
function endFreeSpins() {
    console.log('🎰 Free Spins ended');

    // Indicator ဖျောက်မယ်
    hideFreeSpinIndicator();

    // Free Spin အခြေအနေတွေကို Reset လုပ်မယ်
    window.gameState.isFreeSpinning = false;
    window.gameState.freeSpins = 0;
    window.gameState.totalFreeSpins = 0;

    // Buttons တွေကိုပြန်ဖွင့်မယ်
    disableButtons(false);
    
    // အဆုံးသတ် Animation ပြမယ်
    showFreeSpinEndAnimation(0);
    
    showNotification('Free Spin ပြီးဆုံးပါသည်။', 'info');
}

// Bonus စစ်တဲ့ Function
function checkScatter(result) {
    let bonusCount = 0;

    for (let reel = 0; reel < 5; reel++) {
        for (let row = 0; row < 4; row++) {
            if (result[reel][row] === 'bonus') {
                bonusCount++;
            }
        }
    }

    console.log(`🎰 Bonus count: ${bonusCount}`);

    // FREE SPIN အတွင်း BONUS ကျရင် ဘာမှမလုပ်တော့ဘူး
    if (window.gameState.isFreeSpinning) {
        if (bonusCount > 0) {
            showNotification(`💰 Bonus ကျပါသည်။ (အပိုမရတော့ပါ)`, 'info');
        }
        return bonusCount;
    }

    // ပုံမှန် Free Spin စတာ (၆ လုံးကျမှ)
    if (!window.gameState.isFreeSpinning && bonusCount >= 6) {
        startFreeSpins(bonusCount);
    }

    return bonusCount;
}

function disableButtons(disable) {
    const spinBtn = document.getElementById('spinBtn');
    const betButtons = document.querySelectorAll('.bet-option, #decreaseBetBtn, #increaseBetBtn');

    if (spinBtn) {
        spinBtn.disabled = disable;
        spinBtn.style.opacity = disable ? '0.5' : '1';
        spinBtn.style.pointerEvents = disable ? 'none' : 'auto';
    }

    betButtons.forEach(btn => {
        btn.disabled = disable;
        btn.style.opacity = disable ? '0.5' : '1';
        btn.style.pointerEvents = disable ? 'none' : 'auto';
    });
}

// ============================================
// FREE SPIN START ANIMATION
// ============================================
function showFreeSpinStartAnimation(spins) {
    const overlay = document.createElement('div');
    overlay.className = 'freespin-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000000dd, #2196f3aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; animation: spinPop 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);">
            <div style="font-size: 100px; margin-bottom: 20px;">🎰</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffd700;
                        text-shadow: 0 0 30px #ffaa00, 0 0 60px #ff5500;
                        margin-bottom: 20px;">
                FREE SPINS
            </div>
            <div style="font-size: 120px; font-weight: 900; color: #00ff00;
                        text-shadow: 0 0 40px #00ff00, 0 0 80px #00aa00;
                        margin-bottom: 30px;
                        animation: pulse 1s infinite;">
                ${spins}
            </div>
            <div style="font-size: 40px; color: white;">
                ကြိမ် ရရှိပါသည်။
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

// ============================================
// INDICATOR FUNCTIONS
// ============================================
function showFreeSpinIndicator() {
    let indicator = document.getElementById('freeSpinIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'freeSpinIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700, #ffaa00);
            color: black;
            padding: 15px 25px;
            border-radius: 50px;
            font-weight: 900;
            font-size: 20px;
            z-index: 99999;
            box-shadow: 0 0 30px gold;
            animation: indicatorPulse 1s infinite;
            text-align: center;
            min-width: 120px;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = `
        <div style="font-size: 14px; opacity: 0.9;">✨ FREE SPINS</div>
        <div style="font-size: 32px; font-weight: 900; line-height: 1.2;">${window.gameState.freeSpins}</div>
        <div style="font-size: 12px; opacity: 0.8;">Total: ${window.gameState.totalFreeSpins}</div>
    `;
}

function updateFreeSpinIndicator() {
    const indicator = document.getElementById('freeSpinIndicator');
    if (indicator) {
        indicator.innerHTML = `
            <div style="font-size: 14px; opacity: 0.9;">✨ FREE SPINS</div>
            <div style="font-size: 32px; font-weight: 900; line-height: 1.2;">${window.gameState.freeSpins}</div>
            <div style="font-size: 12px; opacity: 0.8;">Total: ${window.gameState.totalFreeSpins}</div>
        `;
    }
}

function hideFreeSpinIndicator() {
    const indicator = document.getElementById('freeSpinIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function showFreeSpinEndAnimation(totalWin) {
    const overlay = document.createElement('div');
    overlay.id = 'freeSpinEndOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000dd, #4caf50aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; animation: popIn 0.8s;">
            <div style="font-size: 80px; margin-bottom: 20px;">🎁</div>
            <div style="font-size: 60px; font-weight: 900; color: #ffd700; margin-bottom: 20px;">
                FREE SPINS ENDED
            </div>
            <div style="font-size: 80px; font-weight: 900; color: #00ff00;">
                +${formatNumber(totalWin)} ကျပ်
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

// ============================================
// 11. PREMIUM BUFFALO STAMPEDE
// ============================================
class PremiumBuffaloStampede {
    constructor() {
        this.container = null;
        this.stampedeCount = 0;
        this.maxStampedes = 3;
        this.interval = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'premiumBuffaloStampede';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99999;
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    startStampede(winAmount, buffaloCount) {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.stampedeCount = 0;
        this.winAmount = winAmount;
        this.buffaloCount = buffaloCount;

        this.runPremiumStampede();

        this.interval = setInterval(() => {
            this.stampedeCount++;
            if (this.stampedeCount < this.maxStampedes) {
                this.runPremiumStampede();
            } else {
                clearInterval(this.interval);
            }
        }, 2500);
    }

    runPremiumStampede() {
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        const stampedeNumber = this.stampedeCount + 1;
        const totalBuffalo = Math.min(this.buffaloCount + this.stampedeCount * 2, 20);

        // Dust clouds
        for (let i = 0; i < 20; i++) {
            this.createDustCloud(i);
        }

        // Buffalo herd
        for (let i = 0; i < totalBuffalo; i++) {
            this.createBuffalo(i, stampedeNumber);
        }

        // Ground shake
        this.createGroundShake();

        // Stampede message
        this.showStampedeMessage(stampedeNumber);

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    createBuffalo(index, stampedeNumber) {
        const buffalo = document.createElement('div');
        const size = 80 + Math.random() * 40;
        const bottom = 20 + (index * 4) % 150;
        const delay = index * 0.08;
        const duration = 2 + Math.random() * 1.5;

        const colors = stampedeNumber === 3 ? ['#DAA520', '#FFD700', '#F4A460'] :
                      stampedeNumber === 2 ? ['#8B4513', '#A0522D', '#CD853F'] :
                      ['#654321', '#8B4513', '#A0522D'];

        buffalo.style.cssText = `
            position: absolute;
            left: -200px;
            bottom: ${bottom}px;
            width: ${size}px;
            height: ${size * 0.6}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50% 20% 20% 10%;
            animation: buffaloRun ${duration}s linear ${delay}s forwards;
            opacity: ${0.7 + Math.random() * 0.3};
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            transform: scaleX(${Math.random() > 0.5 ? 1 : -1});
            filter: drop-shadow(0 0 10px rgba(255,215,0,0.3));
        `;

        buffalo.innerHTML = `
            <div style="position:absolute; top:-10px; left:15px; width:20px; height:25px; background:${colors[0]}; border-radius:50% 50% 0 0; transform:rotate(-20deg);"></div>
            <div style="position:absolute; top:-10px; right:15px; width:20px; height:25px; background:${colors[0]}; border-radius:50% 50% 0 0; transform:rotate(20deg);"></div>
            <div style="position:absolute; bottom:5px; left:20px; width:12px; height:12px; background:black; border-radius:50%;"></div>
            <div style="position:absolute; bottom:5px; right:20px; width:12px; height:12px; background:black; border-radius:50%;"></div>
        `;

        this.container.appendChild(buffalo);
    }

    createDustCloud(index) {
        const dust = document.createElement('div');
        const size = 30 + Math.random() * 60;
        const left = Math.random() * 100;

        dust.style.cssText = `
            position: absolute;
            left: ${left}%;
            bottom: 30px;
            width: ${size}px;
            height: ${size * 0.4}px;
            background: rgba(139, 69, 19, ${0.2 + Math.random() * 0.4});
            border-radius: 50%;
            filter: blur(${5 + Math.random() * 10}px);
            animation: dustFloat ${3 + Math.random() * 2}s ease-out forwards;
            transform: scale(${0.5 + Math.random()});
        `;
        this.container.appendChild(dust);
    }

    createGroundShake() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = `groundShake_${this.stampedeCount} 0.2s linear`;
            setTimeout(() => {
                gameContainer.style.animation = '';
            }, 2000);
        }
    }

    showStampedeMessage(stampedeNumber) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100000;
            animation: messagePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        const stampedeText = ['၁ ကြိမ်', '၂ ကြိမ်', '၃ ကြိမ်'][stampedeNumber - 1];

        message.innerHTML = `
            <div style="font-size: 70px; font-weight: 900; color: #ffd700; 
                        text-shadow: 0 0 30px #ffaa00, 0 0 60px #ff5500;
                        margin-bottom: 10px;">
                🐃 BUFFALO STAMPEDE! 🐃
            </div>
            <div style="font-size: 50px; font-weight: 700; color: white; margin-bottom: 10px;">
                ${stampedeText}
            </div>
            <div style="font-size: 40px; color: #00ff00; text-shadow: 0 0 20px #00ff00;">
                +${formatNumber(this.winAmount)} ကျပ်
            </div>
        `;
        this.container.appendChild(message);
    }

    stopStampede() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.container) {
            this.container.style.display = 'none';
            this.container.innerHTML = '';
        }
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = '';
        }
    }
}

const premiumBuffaloStampede = new PremiumBuffaloStampede();

// Legacy buffalo stampede for compatibility
class BuffaloStampede {
    constructor() {
        this.container = null;
        this.stampedeCount = 0;
        this.maxStampedes = 3;
        this.interval = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'buffaloStampede';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99999;
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    startStampede(winAmount, buffaloCount) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.stampedeCount = 0;
        this.winAmount = winAmount;
        this.buffaloCount = buffaloCount;

        this.runStampede();

        this.interval = setInterval(() => {
            this.stampedeCount++;
            if (this.stampedeCount < this.maxStampedes) {
                this.runStampede();
            } else {
                clearInterval(this.interval);
                this.interval = null;
            }
        }, 3000);
    }

    runStampede() {
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        const stampedeNumber = this.stampedeCount + 1;
        const totalBuffalo = Math.min(this.buffaloCount + this.stampedeCount, 12);

        const herd = document.createElement('div');
        herd.style.cssText = `
            position: absolute;
            bottom: 50px;
            left: 0;
            width: 100%;
            height: 200px;
            overflow: hidden;
        `;
        this.container.appendChild(herd);

        for (let i = 0; i < totalBuffalo; i++) {
            const buffalo = document.createElement('div');
            const size = 70 + Math.random() * 30;
            const bottom = 10 + (i * 6);
            const delay = i * 0.1;
            const duration = 2 + Math.random() * 1.5;

            buffalo.style.cssText = `
                position: absolute;
                left: -150px;
                bottom: ${bottom}px;
                width: ${size}px;
                height: ${size * 0.7}px;
                background: ${this.stampedeCount === 2 ? '#DAA520' : '#8B4513'};
                border-radius: 50% 20% 20% 10%;
                animation: buffaloRun_${Date.now()}_${i} ${duration}s linear ${delay}s forwards;
                opacity: ${0.9 - (i * 0.03)};
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            `;

            buffalo.innerHTML = `
                <div style="position:absolute; top:-8px; left:15px; width:20px; height:25px; background:#654321; border-radius:50% 50% 0 0; transform:rotate(-20deg);"></div>
                <div style="position:absolute; top:-8px; right:15px; width:20px; height:25px; background:#654321; border-radius:50% 50% 0 0; transform:rotate(20deg);"></div>
                <div style="position:absolute; bottom:5px; left:20px; width:12px; height:12px; background:black; border-radius:50%;"></div>
                <div style="position:absolute; bottom:5px; right:20px; width:12px; height:12px; background:black; border-radius:50%;"></div>
            `;

            herd.appendChild(buffalo);

            const style = document.createElement('style');
            style.textContent = `
                @keyframes buffaloRun_${Date.now()}_${i} {
                    0% { left: -150px; transform: scale(0.8); }
                    100% { left: 120%; transform: scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }

        const dustCount = 30 + (this.stampedeCount * 10);
        for (let i = 0; i < dustCount; i++) {
            const dust = document.createElement('div');
            const size = 20 + Math.random() * 50;
            const left = Math.random() * 100;

            dust.style.cssText = `
                position: absolute;
                left: ${left}%;
                bottom: 30px;
                width: ${size}px;
                height: ${size * 0.5}px;
                background: rgba(139, 69, 19, ${0.2 + Math.random() * 0.5});
                border-radius: 50%;
                filter: blur(${3 + Math.random() * 8}px);
                animation: dustFloat_${Date.now()} ${1 + Math.random()}s ease-out forwards;
            `;
            this.container.appendChild(dust);
        }

        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100000;
            animation: messagePop 0.5s ease;
        `;

        let stampedeText = '';
        if (stampedeNumber === 1) stampedeText = '၁ ကြိမ်';
        else if (stampedeNumber === 2) stampedeText = '၂ ကြိမ်';
        else stampedeText = '၃ ကြိမ်';

        message.innerHTML = `
            <div style="font-size: 50px; font-weight: 900; color: #ffd700; text-shadow: 0 0 30px #ffaa00;">
                🐃 STAMPEDE! x${stampedeNumber}
            </div>
            <div style="font-size: 40px; font-weight: 700; color: white; margin-top: 10px;">
                +${formatNumber(this.winAmount)} ကျပ်
            </div>
            <div style="font-size: 24px; color: #ffd700; margin-top: 5px;">
                ${stampedeText} ပြေး
            </div>
        `;
        this.container.appendChild(message);

        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = `gameShake_${stampedeNumber} 0.2s linear`;
        }

        if (typeof SoundManager !== 'undefined') {
            SoundManager.buffalo();
            if (stampedeNumber === 2 && SoundManager.coinRain) SoundManager.coinRain();
            if (stampedeNumber === 3) {
                if (SoundManager.victory) SoundManager.victory();
                if (SoundManager.sixCoin) SoundManager.sixCoin();
            }
        }

        setTimeout(() => {
            if (this.container) {
                this.container.innerHTML = '';
            }
        }, 2000);
    }

    stopStampede() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.container) {
            this.container.style.display = 'none';
            this.container.innerHTML = '';
        }
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = '';
        }
    }
}

const buffaloStampede = new BuffaloStampede();

// ============================================
// 12. AUTO SPIN (LONG PRESS)
// ============================================
let pressTimer;
let isLongPress = false;
let autoSpinCount = 0;
let autoSpinMax = 0;
let autoSpinInterval;
let isWaitingForWin = false;
const longPressDuration = 500;

function setupLongPress(btn) {
    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', cancelPress);
    btn.addEventListener('mouseleave', cancelPress);
    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', cancelPress);
    btn.addEventListener('touchcancel', cancelPress);
}

function startPress(e) {
    e.preventDefault();

    if (window.gameState.autoSpinActive) return;
    if (window.gameState.isSpinning) return;

    isLongPress = false;

    if (pressTimer) clearTimeout(pressTimer);

    pressTimer = setTimeout(() => {
        isLongPress = true;
        showAutoSpinModal();
    }, longPressDuration);
}

function cancelPress(e) {
    clearTimeout(pressTimer);

    if (!isLongPress && !window.gameState.autoSpinActive && !window.gameState.isSpinning && !isWaitingForWin) {
        spin();
    }

    isLongPress = false;
}

function showAutoSpinModal() {
    let modal = document.getElementById('autoSpinModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'autoSpinModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-sync-alt"></i> Auto Spin</h3>
                    <button class="close-btn" onclick="closeModal('autoSpinModal')">×</button>
                </div>
                <div class="modal-body">
                    <p style="color: white; margin-bottom: 20px;">အကြိမ်ရေ ရွေးချယ်ပါ</p>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                        <button class="auto-spin-option" onclick="startAutoSpin(10)">၁၀ ကြိမ်</button>
                        <button class="auto-spin-option" onclick="startAutoSpin(25)">၂၅ ကြိမ်</button>
                        <button class="auto-spin-option" onclick="startAutoSpin(50)">၅၀ ကြိမ်</button>
                        <button class="auto-spin-option" onclick="startAutoSpin(100)">၁၀၀ ကြိမ်</button>
                    </div>
                    <button class="secondary-btn" onclick="closeModal('autoSpinModal')">မလုပ်တော့ပါ</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
}

function startAutoSpin(count) {
    closeModal('autoSpinModal');

    if (window.gameState.autoSpinActive) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.balance < window.gameState.betAmount) {
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
        return;
    }

    window.gameState.autoSpinActive = true;
    autoSpinCount = 0;
    autoSpinMax = count;
    isWaitingForWin = false;

    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.innerHTML = '<i class="fas fa-stop"></i> STOP';
        spinBtn.classList.add('stop-mode');
        spinBtn.onclick = stopAutoSpin;
    }

    showNotification(`Auto Spin စတင်ပါပြီ။ (${count} ကြိမ်)`, 'info');

    performAutoSpin();
}

function performAutoSpin() {
    if (!window.gameState.autoSpinActive) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.balance < window.gameState.betAmount) {
        stopAutoSpin('balance');
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။ Auto Spin ရပ်ဆိုင်းလိုက်သည်။', 'error');
        return;
    }

    if (window.gameState.isSpinning) {
        setTimeout(performAutoSpin, 500);
        return;
    }

    if (isWaitingForWin) {
        setTimeout(performAutoSpin, 500);
        return;
    }
        clearAllWinHighlights();

    isWaitingForWin = true;
    spin();
}

function handleAutoSpinComplete(winAmount) {
    if (!window.gameState.autoSpinActive) {
        isWaitingForWin = false;
        return;
    }

    autoSpinCount++;

    if (autoSpinCount >= autoSpinMax) {
        stopAutoSpin('completed');
        showNotification(`Auto Spin ပြီးဆုံးပါသည်။ (${autoSpinCount} ကြိမ်)`, 'success');
    } else {
        let delay = 2000;

        if (winAmount >= 50000) {
            delay = 6000;
        } else if (winAmount >= 15000) {
            delay = 5000;
        } else if (winAmount >= 5000) {
            delay = 4000;
        } else if (winAmount > 0) {
            delay = 3000;
        }

        if (autoSpinInterval) clearTimeout(autoSpinInterval);

        autoSpinInterval = setTimeout(() => {
            isWaitingForWin = false;
            performAutoSpin();
        }, delay);
    }
}

function stopAutoSpin(reason = 'manual') {
    window.gameState.autoSpinActive = false;
    isWaitingForWin = false;

    if (autoSpinInterval) {
        clearTimeout(autoSpinInterval);
        autoSpinInterval = null;
    }

    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN';
        spinBtn.classList.remove('stop-mode');
        spinBtn.onclick = null;
        spinBtn.addEventListener('click', function() {
            if (!window.gameState.isSpinning && !window.gameState.autoSpinActive) {
                spin();
            }
        });
    }

    if (reason === 'manual') {
        showNotification('Auto Spin ရပ်ဆိုင်းလိုက်သည်။', 'info');
    }
}

// ============================================
// 13. USER SURPRISE BOX
// ============================================
let userSurpriseData = null;
let selectedBoxIndices = [];
const MAX_USER_SELECTIONS = 5;

function checkUserSurprise() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const userSurpriseKey = `userSurprise_${currentUser.id}`;
    const surpriseJson = localStorage.getItem(userSurpriseKey);

    if (surpriseJson) {
        try {
            const data = JSON.parse(surpriseJson);
            if (data.status === 'pending') {
                userSurpriseData = data;
                showUserSurpriseModal();
            }
        } catch(e) {
            console.error('Error parsing surprise data:', e);
        }
    }
}

function showUserSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (!modal || !userSurpriseData) return;

    selectedBoxIndices = [];
    document.getElementById('userSurpriseResult').style.display = 'none';
    document.getElementById('claimUserSurpriseBtn').disabled = true;

    renderUserBoxGrid();
    updateUserSelectionDisplay();

    modal.style.display = 'flex';
}

function renderUserBoxGrid() {
    const grid = document.getElementById('userBoxGrid');
    if (!grid || !userSurpriseData) return;

    let html = '';

    userSurpriseData.boxes.forEach((box, index) => {
        const isSelected = selectedBoxIndices.includes(index);
        const isOpened = box.opened;

        let bgColor = '#9e9e9e20';
        let borderColor = '#9e9e9e';
        let icon = 'fa-box';
        let iconColor = '#9e9e9e';

        if (box.type === 'credit') {
            bgColor = '#00c85320';
            borderColor = '#00c853';
            icon = 'fa-coins';
            iconColor = '#00c853';
        } else if (box.type === 'vip') {
            bgColor = '#ffd70020';
            borderColor = '#ffd700';
            icon = 'fa-crown';
            iconColor = '#ffd700';
        } else if (box.type === 'freespin') {
            bgColor = '#2196f320';
            borderColor = '#2196f3';
            icon = 'fa-play-circle';
            iconColor = '#2196f3';
        } else {
            bgColor = '#9e9e9e20';
            borderColor = '#9e9e9e';
            icon = 'fa-smile';
            iconColor = '#9e9e9e';
        }

        html += `
            <div onclick="${!isOpened ? `selectUserBox(${index})` : ''}"
                 style="background: ${bgColor};
                        border: 2px solid ${borderColor};
                        border-radius: 12px;
                        padding: 10px 5px;
                        text-align: center;
                        cursor: ${!isOpened ? 'pointer' : 'default'};
                        opacity: ${isOpened ? '0.5' : '1'};
                        ${isSelected ? 'box-shadow: 0 0 15px ' + borderColor + '; transform: scale(1.05);' : ''}
                        transition: all 0.2s;">
                <i class="fas ${icon}" style="color: ${iconColor}; font-size: 24px;"></i>
                <div style="color: white; font-size: 12px; margin-top: 5px;">Box ${index + 1}</div>
                ${isOpened ? '<div style="color: #ff5252; font-size: 10px;"><i class="fas fa-check-circle"></i> ဖွင့်ပြီး</div>' : ''}
                ${isSelected ? '<div style="color: #ffd700; font-size: 10px;"><i class="fas fa-check"></i> ရွေးပြီး</div>' : ''}
            </div>
        `;
    });

    grid.innerHTML = html;
}

function selectUserBox(index) {
    if (selectedBoxIndices.includes(index)) {
        selectedBoxIndices = selectedBoxIndices.filter(i => i !== index);
    } else {
        if (selectedBoxIndices.length >= MAX_USER_SELECTIONS) {
            showNotification(`သင်ရွေးချယ်ခွင့် အများဆုံး ${MAX_USER_SELECTIONS} ခုသာရှိပါသည်။`, 'error');
            return;
        }
        selectedBoxIndices.push(index);
    }

    renderUserBoxGrid();
    updateUserSelectionDisplay();

    document.getElementById('claimUserSurpriseBtn').disabled = selectedBoxIndices.length === 0;
}

function updateUserSelectionDisplay() {
    const remaining = MAX_USER_SELECTIONS - selectedBoxIndices.length;
    const countEl = document.getElementById('userSelectionCount');
    const progressEl = document.getElementById('selectionProgress');
    const selectedContainer = document.getElementById('userSelectedBoxes');

    if (countEl) {
        countEl.textContent = `သင်ရွေးချယ်ရန် ကျန် ${remaining} ခု`;
    }

    if (progressEl) {
        const percent = (selectedBoxIndices.length / MAX_USER_SELECTIONS) * 100;
        progressEl.style.width = percent + '%';
    }

    if (selectedContainer) {
        if (selectedBoxIndices.length === 0) {
            selectedContainer.innerHTML = '<span style="color: rgba(255,255,255,0.5);">Box မရွေးရသေးပါ။</span>';
        } else {
            let html = '';
            selectedBoxIndices.forEach(idx => {
                const box = userSurpriseData.boxes[idx];
                let color = '#9e9e9e';
                if (box.type === 'credit') color = '#00c853';
                else if (box.type === 'vip') color = '#ffd700';
                else if (box.type === 'freespin') color = '#2196f3';
                html += `
                    <span style="background: ${color}20; border: 1px solid ${color}; border-radius: 15px; padding:5px 12px; color: white; font-size: 13px;">
                        Box ${idx + 1}
                    </span>
                `;
            });
            selectedContainer.innerHTML = html;
        }
    }
}

function claimUserSurprise() {
    if (selectedBoxIndices.length === 0 || !userSurpriseData) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('User data not found!', 'error');
        return;
    }

    let totalCredits = 0;
    let vipUpgrade = 0;
    let totalSpins = 0;
    let thankYouCount = 0;

    selectedBoxIndices.forEach(index => {
        const box = userSurpriseData.boxes[index];

        if (!box.opened) {
            box.opened = true;
            box.openedBy = currentUser.username;
            box.openedAt = new Date().toISOString();

            if (box.type === 'credit') {
                totalCredits += box.amount;
                currentUser.balance = (currentUser.balance || 0) + box.amount;
            } else if (box.type === 'vip') {
                vipUpgrade++;
                currentUser.vip = (currentUser.vip || 0) + 1;
            } else if (box.type === 'freespin') {
                totalSpins += box.spins;
                currentUser.freeSpins = (currentUser.freeSpins || 0) + box.spins;
            } else {
                thankYouCount++;
            }
        }
    });

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInUsersList(currentUser);

    userSurpriseData.status = 'completed';
    userSurpriseData.completedAt = new Date().toISOString();
    userSurpriseData.selectedBoxes = selectedBoxIndices;

    saveUserSurpriseHistory(currentUser, userSurpriseData, selectedBoxIndices);

    const userSurpriseKey = `userSurprise_${currentUser.id}`;
    localStorage.removeItem(userSurpriseKey);

    window.gameState.balance = currentUser.balance;
    updateBalanceDisplay();

    showUserSurpriseResult(totalCredits, vipUpgrade, totalSpins, thankYouCount);

    document.getElementById('claimUserSurpriseBtn').disabled = true;
}

function updateUserInUsersList(updatedUser) {
    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('slotUsers', JSON.stringify(users));
    }
}

function saveUserSurpriseHistory(user, surpriseData, selectedIndices) {
    const history = JSON.parse(localStorage.getItem('surpriseHistory')) || [];

    const selectedPrizes = selectedIndices.map(index => {
        const box = surpriseData.boxes[index];
        return {
            boxNumber: index + 1,
            type: box.type,
            value: box.amount || box.spins || 0
        };
    });

    history.push({
        time: new Date().toISOString(),
        username: user.username,
        userId: user.id,
        type: 'user_claimed',
        selectedBoxes: selectedIndices.map(i => i + 1),
        prizes: selectedPrizes,
        totalCredits: selectedPrizes.filter(p => p.type === 'credit').reduce((sum, p) => sum + p.value, 0),
        totalSpins: selectedPrizes.filter(p => p.type === 'freespin').reduce((sum, p) => sum + p.value, 0),
        vipUpgrades: selectedPrizes.filter(p => p.type === 'vip').length
    });

    localStorage.setItem('surpriseHistory', JSON.stringify(history));
}

function showUserSurpriseResult(credits, vip, spins, thankYou) {
    const resultDiv = document.getElementById('userSurpriseResult');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');

    resultDiv.style.display = 'block';

    if (credits > 0) {
        icon.className = 'fas fa-coins';
        icon.style.color = '#00c853';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = `ငွေ ${formatNumber(credits)} ကျပ် ရရှိပါသည်။`;
    } else if (vip > 0) {
        icon.className = 'fas fa-crown';
        icon.style.color = '#ffd700';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = 'VIP အဆင့်တိုးပါသည်။';
    } else if (spins > 0) {
        icon.className = 'fas fa-play-circle';
        icon.style.color = '#2196f3';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = `Free Spin ${spins} ကြိမ် ရရှိပါသည်။`;
    } else {
        icon.className = 'fas fa-smile';
        icon.style.color = '#9e9e9e';
        title.textContent = 'ကံကောင်းပါစေ။';
        message.textContent = 'ကျေးဇူးတင်ပါတယ်။ နောက်တစ်ကြိမ် ကံစမ်းပါ။';
    }

    renderUserBoxGrid();

    setTimeout(() => {
        if (resultDiv.style.display === 'block') {
            closeUserSurpriseModal();
        }
    }, 5000);
}

function closeUserSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (modal) {
        modal.style.display = 'none';
    }

    if (userSurpriseData && userSurpriseData.boxes.every(b => b.opened)) {
        userSurpriseData = null;
    }
}

// ============================================
// 14. BALANCE & JACKPOT FUNCTIONS
// ============================================
function updateBalanceDisplay() {
    const balanceEl = document.getElementById('balanceAmount');
    const creditDisplay = document.getElementById('credit-display');

    if (balanceEl) {
        balanceEl.textContent = formatNumber(window.gameState.balance);
    }
    if (creditDisplay) {
        creditDisplay.textContent = formatNumber(window.gameState.balance);
    }
}

function updateWinDisplay(amount) {
    const winEl = document.getElementById('winAmount');
    if (winEl) {
        winEl.textContent = formatNumber(amount);
        winEl.classList.add('win-animation');
        setTimeout(() => {
            winEl.classList.remove('win-animation');
        }, 500);
    }
}

function updateUserBalanceInStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        currentUser.balance = window.gameState.balance;
        currentUser.level = window.gameState.userLevel;
        currentUser.vip = window.gameState.vipLevel;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.currentUser = currentUser;

        if (db && currentUser.id) {
            db.collection('users').doc(currentUser.id).update({
                balance: window.gameState.balance,
                level: window.gameState.userLevel,
                vip: window.gameState.vipLevel,
                lastSpin: new Date().toISOString()
            }).catch(e => console.log('Firebase update error:', e));
        }
    }
}

function addJackpotContribution(amount) {
    try {
        const contribution = Math.floor(amount * 0.02);
        window.gameState.jackpot += contribution;

        const jackpotState = JSON.parse(localStorage.getItem('jackpotState')) || {
            totalPool: window.gameState.jackpot
        };
        jackpotState.totalPool = window.gameState.jackpot;
        localStorage.setItem('jackpotState', JSON.stringify(jackpotState));

        updateJackpotDisplay();
    } catch(e) {
        console.error('Error adding jackpot contribution:', e);
    }
}

function updateJackpotDisplay() {
    const jackpotEl = document.getElementById('jackpot-val');
    if (jackpotEl) {
        jackpotEl.textContent = formatNumber(window.gameState.jackpot);
    }
}

function loadJackpotFromAdmin() {
    try {
        const jackpotState = JSON.parse(localStorage.getItem('jackpotState'));
        if (jackpotState) {
            window.gameState.jackpot = jackpotState.totalPool || 100000;
            updateJackpotDisplay();
        }
    } catch(e) {
        console.error('Error loading jackpot:', e);
    }
}

function updateJackpotStats(winAmount) {
    try {
        const jackpotState = JSON.parse(localStorage.getItem('jackpotState')) || {
            totalPool: window.gameState.jackpot,
            mini: 50000,
            major: 200000,
            mega: 500000,
            todayWins: 0,
            todayContributions: 0,
            avgWin: 0,
            biggestWin: 0
        };

        jackpotState.totalPool = (jackpotState.totalPool || 0) - winAmount;
        jackpotState.todayWins = (jackpotState.todayWins || 0) + 1;
        jackpotState.todayContributions = (jackpotState.todayContributions || 0) + winAmount;

        const currentAvg = jackpotState.avgWin || 0;
        const currentCount = jackpotState.todayWins || 1;
        jackpotState.avgWin = Math.floor((currentAvg * (currentCount - 1) + winAmount) / currentCount);

        if (winAmount > (jackpotState.biggestWin || 0)) {
            jackpotState.biggestWin = winAmount;
        }

        localStorage.setItem('jackpotState', JSON.stringify(jackpotState));
    } catch(e) {
        console.error('Error updating jackpot stats:', e);
    }
}

function showBuffaloJackpot(amount, count) {
    const overlay = document.createElement('div');
    overlay.className = 'jackpot-overlay';
    overlay.id = 'buffaloJackpotOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000dd, #8B4513aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div class="jackpot-content" style="text-align: center; animation: popIn 0.8s;">
            <div style="font-size: 80px; margin-bottom: 20px;">🐃</div>
            <h2 style="font-size: 60px; color: #ffd700; margin-bottom: 20px;">JACKPOT!</h2>
            <div class="jackpot-buffaloes" style="font-size: 40px; margin-bottom: 20px;">🐃🐃🐃</div>
            <div class="jackpot-amount" style="font-size: 80px; font-weight: 900; color: #00ff00; margin-bottom: 20px;">${formatNumber(amount)} ကျပ်</div>
            <div class="jackpot-message" style="font-size: 30px; color: white; margin-bottom: 30px;">ကျွဲ ${count} ကောင် ဆုကြီးရရှိပါသည်။</div>
            <button class="jackpot-button" onclick="closeBuffaloJackpot()" style="padding: 15px 40px; font-size: 20px; background: #ffd700; border: none; border-radius: 50px; cursor: pointer;">ဝမ်းသာပါတယ်</button>
        </div>
    `;

    document.body.appendChild(overlay);
    createBuffaloConfetti();
}

function closeBuffaloJackpot() {
    const overlay = document.getElementById('buffaloJackpotOverlay');
    if (overlay) {
        overlay.classList.add('hide');
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }
}

function createBuffaloConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-explosion';
    container.id = 'buffaloConfetti';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
    `;

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece-buffalo';
        confetti.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: ${10 + Math.random() * 15}px;
            height: ${10 + Math.random() * 15}px;
            background: ${['#8B4513', '#DAA520', '#FFD700', '#CD853F'][Math.floor(Math.random() * 4)]};
            transform: rotate(${Math.random() * 360}deg);
            animation: buffaloConfettiFall ${3 + Math.random() * 4}s linear forwards;
            opacity: 0.8;
        `;
        container.appendChild(confetti);
    }

    document.body.appendChild(container);

    setTimeout(() => {
        const confettiEl = document.getElementById('buffaloConfetti');
        if (confettiEl) confettiEl.remove();
    }, 5000);
}

// ============================================
// 15. WIN HISTORY & CELEBRATION
// ============================================
function addWinToHistory(amount) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (historyList.innerHTML.includes('No wins')) {
        historyList.innerHTML = '';
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const winItem = document.createElement('div');
    winItem.className = 'history-item';
    winItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255,215,0,0.1);
        border-radius: 8px;
        margin-bottom: 5px;
        animation: slideIn 0.3s;
        color: white;
    `;
    winItem.innerHTML = `<span>${time}</span><span style="color: #00ff00;">+${formatNumber(amount)}</span>`;

    historyList.prepend(winItem);

    while (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

function showCelebration(type, amount, username = 'Admin') {
    const notification = document.getElementById('celebrationNotification');
    const icon = document.getElementById('celebrationIcon').querySelector('i');
    const title = document.getElementById('celebrationTitle');
    const message = document.getElementById('celebrationMessage');
    const amountEl = document.getElementById('celebrationAmount');

    let iconClass = 'fa-gift';
    let iconColor = '#ffd700';
    let titleText = 'ဆုလက်ဆောင်';
    let messageText = '';
    let amountText = '';

    switch(type) {
        case 'credit':
            iconClass = 'fa-coins';
            iconColor = '#00c853';
            titleText = 'ငွေလက်ဆောင်';
            messageText = `${username} ထံမှ`;
            amountText = `${formatNumber(amount)} ကျပ်`;
            break;
        case 'vip':
            iconClass = 'fa-crown';
            iconColor = '#ffd700';
            titleText = 'VIP လက်ဆောင်';
            messageText = `${username} က သင့်အား`;
            amountText = 'VIP အဆင့်တိုးပေးခဲ့သည်';
            break;
        case 'freespin':
            iconClass = 'fa-play-circle';
            iconColor = '#2196f3';
            titleText = 'Free Spin လက်ဆောင်';
            messageText = `${username} ထံမှ`;
            amountText = `Free Spin ${amount} ကြိမ်`;
            break;
    }

    icon.className = 'fas ' + iconClass;
    icon.style.color = iconColor;
    title.textContent = titleText;
    title.style.color = iconColor;
    message.textContent = messageText;
    amountEl.textContent = amountText;
    amountEl.style.color = iconColor;

    notification.classList.add('show');
    createConfetti();

    if (type === 'credit') {
        createFloatingNumbers(amount);
    }

    setTimeout(() => {
        closeCelebration();
    }, 5000);
}

function createConfetti() {
    const container = document.getElementById('celebrationConfetti');
    if (!container) return;

    container.innerHTML = '';
    const colors = ['#ffd700', '#00c853', '#2196f3', '#ff5252', '#ffaa00'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: absolute;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            transform: rotate(${Math.random() * 360}deg);
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `;
        container.appendChild(confetti);
    }
}

function createFloatingNumbers(amount) {
    const container = document.getElementById('floatingNumbers');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 10; i++) {
        const num = document.createElement('div');
        num.className = 'floating-number';
        num.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            color: #ffd700;
            font-size: ${20 + Math.random() * 30}px;
            font-weight: 900;
            text-shadow: 0 0 20px gold;
            animation: floatNumber ${1 + Math.random()}s ease-out forwards;
            pointer-events: none;
        `;
        num.textContent = '+' + formatNumber(amount);
        container.appendChild(num);

        setTimeout(() => {
            num.remove();
        }, 2000);
    }
}

function closeCelebration() {
    const notification = document.getElementById('celebrationNotification');
    if (notification) {
        notification.classList.remove('show');
    }
    const confetti = document.getElementById('celebrationConfetti');
    if (confetti) {
        confetti.innerHTML = '';
    }
}

// ============================================
// 16. PENDING GIFT FUNCTIONS
// ============================================
function checkPendingGiftOnSpin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const pendingGiftKey = `pendingGift_${currentUser.id}`;
    const pendingGiftJson = localStorage.getItem(pendingGiftKey);

    if (pendingGiftJson) {
        try {
            const pendingGift = JSON.parse(pendingGiftJson);

            window.gameState.spinCounter = (window.gameState.spinCounter || 0) + 1;
            console.log(`Spin counter: ${window.gameState.spinCounter}/${window.gameState.pendingGiftSpins}`);

            if (window.gameState.spinCounter >= window.gameState.pendingGiftSpins) {
                if (typeof showCelebration === 'function') {
                    showCelebration(pendingGift.type, pendingGift.amount, 'Admin');
                }
                localStorage.removeItem(pendingGiftKey);
                window.gameState.spinCounter = 0;
            } else {
                const remaining = window.gameState.pendingGiftSpins - window.gameState.spinCounter;
                if (remaining === 2 || remaining === 1) {
                    showNotification(`လက်ဆောင်ပေါ်ရန် နောက်ထပ် ${remaining} ချက်`, 'info');
                }
            }
        } catch(e) {
            console.error('Error checking pending gift:', e);
        }
    } else {
        window.gameState.spinCounter = 0;
    }
}

// ============================================
// 17. LEVEL UP FUNCTIONS
// ============================================
function checkLevelUp() {
    if (window.gameState.spinCount > 0 && window.gameState.spinCount % 100 === 0) {
        window.gameState.userLevel++;

        const levelEl = document.getElementById('userLevel');
        if (levelEl) {
            levelEl.textContent = window.gameState.userLevel;
        }

        showNotification('✨ Level Up! Level ' + window.gameState.userLevel + ' သို့တက်ရောက်ပါသည်။ ✨', 'success');

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            currentUser.level = window.gameState.userLevel;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
}

// ============================================
// 18. FIREBASE FUNCTIONS
// ============================================
async function loadUserFromFirebase() {
    if (!db || !currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.id).get();
        if (userDoc.exists) {
            const fbUser = userDoc.data();

            window.gameState.balance = fbUser.balance || 10000;
            window.gameState.userLevel = fbUser.level || 1;
            window.gameState.vipLevel = fbUser.vip || 0;

            currentUser.balance = fbUser.balance;
            currentUser.level = fbUser.level;
            currentUser.vip = fbUser.vip;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.currentUser = currentUser;

            updateBalanceDisplay();
        }
    } catch (error) {
        console.error('Error loading user from Firebase:', error);
    }
}

// ============================================
// 19. WIN ANIMATIONS
// ============================================
// ============================================
// 20. UTILITY FUNCTIONS
// ============================================
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    const iconEl = document.getElementById('notificationIcon');

    if (notification && messageEl) {
        messageEl.textContent = message;

        if (type === 'success') {
            iconEl.className = 'fas fa-check-circle';
            iconEl.style.color = '#00c853';
        } else if (type === 'error') {
            iconEl.className = 'fas fa-exclamation-circle';
            iconEl.style.color = '#ff5252';
        } else {
            iconEl.className = 'fas fa-info-circle';
            iconEl.style.color = '#2196f3';
        }

        notification.classList.add('show');
        notification.style.display = 'flex';

        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.display = 'none';
        }, 3000);
    }
}

function playButtonSound() {
    if (typeof SoundManager !== 'undefined') {
        SoundManager.button();
    }
}

function playWinSounds(totalWin, winLines) {
    if (typeof SoundManager === 'undefined') return;

    SoundManager.win();

    if (totalWin > window.gameState.betAmount * 50) {
        SoundManager.victory();
    }

    // Buffalo Line တွေထဲက အများဆုံးအရေအတွက်ကိုရှာ
    let maxBuffaloCount = 0;
    let hasCoin = false;
    let hasJackpot = false;

    winLines.forEach(line => {
        if (line.symbol === 'buffalo') {
            maxBuffaloCount = Math.max(maxBuffaloCount, line.count);
        }
        if (line.symbol === 'coin') {
            hasCoin = true;
        }
        if (line.line === 'JACKPOT') {
            hasJackpot = true;
        }
    });

    // Buffalo Sound ခေါ်မယ်
    if (maxBuffaloCount > 0) {
        if (adminControlMode) {
            // Admin Mode: 4 ကောင်အထက်မှသာ
            if (maxBuffaloCount >= 4) {
                SoundManager.buffalo();
            }
        } else {
            // Normal Mode: 3 ကောင်အထက်ဆို အကုန်
            SoundManager.buffalo();
        }
    }

    if (hasCoin) {
        SoundManager.coin();
    }

    if (hasJackpot) {
        SoundManager.sixCoin();
        SoundManager.victory();
    }
}

function showWinLinesInfo(winLines) {
    if (winLines.length === 0) return;

    let message = ' အနိုင်ရလိုင်းများ:\n';
    winLines.forEach(line => {
        if (line.line === 'JACKPOT') {
            message += ` 🎰 ${line.name}: ${formatNumber(line.win)} ကျပ်\n`;
        } else {
            message += ` ${getSymbolEmoji(line.symbol)} ${line.symbol} ${line.count} လုံး = ${formatNumber(line.win)} ကျပ် (${line.multiplier}x)\n`;
        }
    });

    const winAmount = document.getElementById('winAmount');
    if (winAmount) {
        winAmount.setAttribute('title', message);
    }
}

function getSymbolEmoji(symbol) {
    const emojiMap = {
        'seven': '7️⃣',
        'lion': '🦁',
        'buffalo': '🐃',
        'ele': '🐘',
        'tha': '🐅',
        'zebra': '🦓',
        'ayeaye': '👁️',
        'bonus': '🎁',
        'wild': '⭐',
        'coin': '🪙'
    };
    return emojiMap[symbol] || '🎰';
}

function getElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`⚠️ Element "${id}" not found`);
        return null;
    }
    return el;
}

function setStyle(id, property, value) {
    const el = getElement(id);
    if (el) {
        el.style[property] = value;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============================================
// 21. ADD PREMIUM STYLES
// ============================================
function addPremiumStyles() {
    if (document.getElementById('premium-styles')) return;

    const style = document.createElement('style');
    style.id = 'premium-styles';
    style.textContent = `
        @keyframes ambientRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes shineMove {
            0% { transform: translateX(-100%) translateY(-100%) rotate(25deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(25deg); }
        }

        @keyframes winPulse {
            0%, 100% { border-color: #ffd700; box-shadow: 0 0 20px #ffd700; }
            50% { border-color: #00c853; box-shadow: 0 0 40px #00c853; }
        }

        @keyframes buffaloRun {
            0% { left: -200px; transform: scale(0.8); }
            100% { left: 120%; transform: scale(1.1); }
        }

        @keyframes dustFloat {
            0% { opacity: 0.8; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-150px) scale(2); }
        }

        @keyframes messagePop {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes groundShake_0 {
            0%,100% { transform: translate(0,0); }
            25% { transform: translate(-5px,-2px); }
            75% { transform: translate(5px,2px); }
        }

        @keyframes groundShake_1 {
            0%,100% { transform: translate(0,0); }
            25% { transform: translate(-8px,-4px); }
            75% { transform: translate(8px,4px); }
        }

        @keyframes groundShake_2 {
            0%,100% { transform: translate(0,0); }
            25% { transform: translate(-12px,-6px); }
            75% { transform: translate(12px,6px); }
        }

        @keyframes rippleExpand {
            0% { width: 20px; height: 20px; opacity: 1; }
            100% { width: 200px; height: 200px; opacity: 0; }
        }

        @keyframes sparkleFlicker {
            0%,100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.5); }
        }

        @keyframes floatUp {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
        }

        @keyframes bannerPop {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes bannerFadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes indicatorPulse {
            0%,100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        @keyframes spinPop {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes buffaloConfettiFall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        @keyframes confettiFall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        @keyframes floatNumber {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-100px) scale(2); opacity: 0; }
        }

        @keyframes winFlash {
            0%,100% { transform: scale(1); color: #00d4ff; }
            50% { transform: scale(1.5); color: #ffd700; }
        }

        .stagger-spin {
            animation: staggeredSpin 0.15s linear infinite;
        }

        @keyframes staggeredSpin {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(3deg) scale(1.1); }
            50% { transform: rotate(-3deg) scale(1.1); }
            75% { transform: rotate(3deg) scale(1.1); }
            100% { transform: rotate(0deg) scale(1); }
        }

        .grid-cell.win {
            border-color: #ffd700 !important;
            box-shadow: 0 0 30px #ffd700, inset 0 0 20px #ffd700 !important;
        }

        .grid-cell.buffalo-win {
            border-color: #8B4513 !important;
            box-shadow: 0 0 40px #8B4513, inset 0 0 20px #DAA520 !important;
        }

        .grid-cell.mega-win {
            border-color: #ff00ff !important;
            box-shadow: 0 0 50px #ff00ff, inset 0 0 30px #ff00ff !important;
        }

        .spin-btn.stop-mode {
            background: linear-gradient(145deg, #ff4444, #cc0000) !important;
            box-shadow: 0 10px 0 #880000 !important;
        }

        /* Drop Animation */
        @keyframes dropFromSky {
            0% {
                transform: translateY(-500px) rotate(0deg) scale(1.5);
                opacity: 0;
                filter: blur(10px) brightness(2);
            }
            30% {
                transform: translateY(20px) rotate(360deg) scale(1.1);
                opacity: 1;
                filter: blur(2px) brightness(1.5);
            }
            50% {
                transform: translateY(-10px) rotate(720deg) scale(1);
                opacity: 1;
                filter: blur(0) brightness(1.2);
            }
            70% {
                transform: translateY(5px) rotate(1080deg) scale(1);
                opacity: 1;
                filter: blur(0) brightness(1);
            }
            100% {
                transform: translateY(0) rotate(1440deg) scale(1);
                opacity: 1;
                filter: blur(0) brightness(1);
            }
        }

        @keyframes trailGlow {
            0% {
                text-shadow: 0 0 30px #ffd700, 0 0 60px #ffaa00;
                transform: scale(1.2);
            }
            100% {
                text-shadow: 0 0 10px #ffd70033;
                transform: scale(1);
            }
        }

        /* Bounce effect */
        @keyframes bounceLand {
            0% { transform: translateY(-500px) scale(1.5); }
            70% { transform: translateY(10px) scale(1.1); }
            80% { transform: translateY(-5px) scale(1); }
            90% { transform: translateY(2px) scale(1); }
            100% { transform: translateY(0) scale(1); }
        }

        @keyframes dropGlow {
            0% {
                box-shadow: 0 0 50px #ffd700, 0 0 100px #ffaa00;
            }
            50% {
                box-shadow: 0 0 30px #6c5ce7, 0 0 60px #00c853;
            }
            100% {
                box-shadow: 0 0 20px #ffd70033;
            }
        }

        .symbol-drop {
            animation: dropFromSky 0.8s cubic-bezier(0.25, 0.1, 0.15, 1.2) forwards !important;
        }

        .symbol-glow {
            animation: dropGlow 0.8s ease-out forwards !important;
        }

        .auto-spin-option {
            padding: 15px;
            background: linear-gradient(145deg, #ffd700, #ffaa00);
            border: none;
            border-radius: 15px;
            color: #000;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .auto-spin-option:active {
            transform: scale(0.95);
        }

        .notification.show {
            display: flex !important;
        }
    `;
    document.head.appendChild(style);
}


// ============================================
// WIN ANIMATIONS - BIG WIN, MEGA WIN, SUPER WIN
// ============================================

const WinAnimations = (function() {
    
    // ၁။ CSS ကို ထည့်မယ်
    function addWinStyles() {
        if (document.getElementById('win-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'win-animation-styles';
        style.textContent = `
            /* ========== FONTS ========== */
            @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Bangers&family=Rubik+Glitch&display=swap');

            /* ========== BASE STYLES ========== */
            .win-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 999999;
                width: 100%;
                perspective: 1000px;
                pointer-events: none;
            }

            /* ========== BIG WIN ========== */
            .big-win-text {
                font-size: 140px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 20px;
                display: inline-block;
                padding: 30px 60px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                color: #ff6600;
                text-shadow: 
                    1px 1px 0 #993300,
                    2px 2px 0 #993300,
                    3px 3px 0 #993300,
                    4px 4px 0 #993300,
                    5px 5px 0 #993300,
                    6px 6px 0 #993300,
                    7px 7px 0 #993300,
                    8px 8px 0 #993300,
                    9px 9px 0 #993300,
                    10px 10px 0 #993300,
                    11px 11px 0 #993300,
                    12px 12px 0 #993300,
                    13px 13px 0 #663300,
                    14px 14px 0 #663300,
                    15px 15px 0 #663300,
                    16px 16px 0 #663300,
                    17px 17px 0 #663300,
                    18px 18px 0 #663300,
                    19px 19px 0 #663300,
                    20px 20px 0 #663300,
                    0 0 30px #ff6600,
                    0 0 60px #ff3300,
                    0 0 90px #ff0000;
                animation: bigSpinAndStop 4s ease-in-out forwards;
            }

            @keyframes bigSpinAndStop {
                0% { transform: rotate(0deg) scale(1); filter: brightness(1); }
                10% { transform: rotate(360deg) scale(1.2); filter: brightness(1.5); }
                20% { transform: rotate(720deg) scale(1.1); filter: brightness(1.3); }
                30% { transform: rotate(1080deg) scale(1.2); filter: brightness(1.5); }
                40% { transform: rotate(1440deg) scale(1.1); filter: brightness(1.3); }
                50% { transform: rotate(1800deg) scale(1.2); filter: brightness(1.5); }
                60% { transform: rotate(2160deg) scale(1.1); filter: brightness(1.3); }
                70% { transform: rotate(2520deg) scale(1); filter: brightness(1); }
                80%, 100% { transform: rotate(2520deg) scale(1); filter: brightness(1); }
            }

            /* ========== MEGA WIN ========== */
            .mega-win-text {
                font-size: 140px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 25px;
                display: inline-block;
                padding: 30px 60px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                color: #00ffcc;
                text-shadow: 
                    1px 1px 0 #0088aa,
                    2px 2px 0 #0088aa,
                    3px 3px 0 #0088aa,
                    4px 4px 0 #0088aa,
                    5px 5px 0 #0088aa,
                    6px 6px 0 #0088aa,
                    7px 7px 0 #0088aa,
                    8px 8px 0 #0088aa,
                    9px 9px 0 #0088aa,
                    10px 10px 0 #0088aa,
                    11px 11px 0 #006688,
                    12px 12px 0 #006688,
                    13px 13px 0 #006688,
                    14px 14px 0 #006688,
                    15px 15px 0 #006688,
                    16px 16px 0 #006688,
                    17px 17px 0 #006688,
                    18px 18px 0 #006688,
                    19px 19px 0 #006688,
                    20px 20px 0 #006688,
                    21px 21px 0 #004466,
                    22px 22px 0 #004466,
                    23px 23px 0 #004466,
                    24px 24px 0 #004466,
                    25px 25px 0 #004466,
                    26px 26px 0 #004466,
                    27px 27px 0 #004466,
                    28px 28px 0 #004466,
                    29px 29px 0 #004466,
                    30px 30px 0 #004466,
                    0 0 30px #00ffff,
                    0 0 60px #ff00ff,
                    0 0 90px #00ffff,
                    0 0 120px #ff00ff,
                    0 0 150px #ffff00;
                animation: megaColorChange 3s linear forwards, megaMove 0.2s ease-in-out 3, megaPulse 0.5s ease-in-out 3;
            }

            @keyframes megaColorChange {
                0% { color: #00ffcc; }
                20% { color: #ff00ff; }
                40% { color: #ffff00; }
                60% { color: #00ff00; }
                80% { color: #ff6600; }
                100% { color: #00ffcc; }
            }

            @keyframes megaMove {
                0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                25% { transform: translate(2px, -2px) rotate(0.5deg) scale(1.02); }
                50% { transform: translate(-2px, 2px) rotate(-0.5deg) scale(0.98); }
                75% { transform: translate(2px, 2px) rotate(0.5deg) scale(1.01); }
                100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            }

            @keyframes megaPulse {
                0%, 100% { filter: brightness(1) contrast(1); }
                50% { filter: brightness(1.5) contrast(1.2); }
            }

            /* ========== SUPER WIN ========== */
            .super-win-text {
                font-size: 140px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 25px;
                display: inline-block;
                padding: 30px 60px;
                font-family: 'Black Ops One', 'Bangers', cursive;
                color: #00ffcc;
                text-shadow: 
                    1px 1px 0 #0088aa,
                    2px 2px 0 #0088aa,
                    3px 3px 0 #0088aa,
                    4px 4px 0 #0088aa,
                    5px 5px 0 #0088aa,
                    6px 6px 0 #0088aa,
                    7px 7px 0 #0088aa,
                    8px 8px 0 #0088aa,
                    9px 9px 0 #0088aa,
                    10px 10px 0 #0088aa,
                    11px 11px 0 #006688,
                    12px 12px 0 #006688,
                    13px 13px 0 #006688,
                    14px 14px 0 #006688,
                    15px 15px 0 #006688,
                    16px 16px 0 #006688,
                    17px 17px 0 #006688,
                    18px 18px 0 #006688,
                    19px 19px 0 #006688,
                    20px 20px 0 #006688,
                    21px 21px 0 #004466,
                    22px 22px 0 #004466,
                    23px 23px 0 #004466,
                    24px 24px 0 #004466,
                    25px 25px 0 #004466,
                    26px 26px 0 #004466,
                    27px 27px 0 #004466,
                    28px 28px 0 #004466,
                    29px 29px 0 #004466,
                    30px 30px 0 #004466,
                    0 0 30px #00ffff,
                    0 0 60px #ff00ff,
                    0 0 90px #00ffff,
                    0 0 120px #ff00ff,
                    0 0 150px #ffff00;
                animation: superColorChange 2.5s linear forwards, superMove 0.15s ease-in-out 3, superPulse 0.4s ease-in-out 3;
            }

            @keyframes superColorChange {
                0% { color: #00ffcc; }
                20% { color: #ff00ff; }
                40% { color: #ffff00; }
                60% { color: #00ff00; }
                80% { color: #ff6600; }
                100% { color: #00ffcc; }
            }

            @keyframes superMove {
                0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                25% { transform: translate(3px, -3px) rotate(0.8deg) scale(1.03); }
                50% { transform: translate(-3px, 3px) rotate(-0.8deg) scale(0.97); }
                75% { transform: translate(3px, 3px) rotate(0.8deg) scale(1.02); }
                100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            }

            @keyframes superPulse {
                0%, 100% { filter: brightness(1) contrast(1); }
                50% { filter: brightness(1.6) contrast(1.3); }
            }

            /* ========== COINS & PARTICLES ========== */
            .coin-particle {
                position: fixed;
                top: -10vh;
                font-size: 35px;
                pointer-events: none;
                z-index: 999998;
                animation: coinFall linear forwards;
                text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
            }

            @keyframes coinFall {
                0% {
                    transform: translateY(0) rotate(0deg) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(110vh) rotate(1080deg) scale(0.1);
                    opacity: 0;
                }
            }

            /* ========== SPLASH EFFECT ========== */
            .splash-effect {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999997;
            }

            .splash {
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: splashExpand 1.5s ease-out forwards;
                filter: blur(15px);
                mix-blend-mode: screen;
            }

            @keyframes splashExpand {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(5);
                    opacity: 0;
                }
            }

            /* ========== DJ LIGHTS ========== */
            .dj-lights {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999996;
                pointer-events: none;
            }

            .light-beam {
                position: absolute;
                width: 30%;
                height: 30%;
                filter: blur(40px);
                animation: beamMove 8s ease-in-out infinite;
                opacity: 0.5;
                mix-blend-mode: screen;
            }

            @keyframes beamMove {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.5; }
                50% { transform: translate(10%, 10%) rotate(180deg) scale(1.3); opacity: 0.8; }
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Win animation CSS added');
    }

    // ၂။ Container ဖန်တီးမယ်
    function createContainer() {
        let container = document.getElementById('win-animation-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'win-animation-container';
            container.className = 'win-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // ၃။ ပိုက်ဆံပြားတွေ ဖန်တီးမယ်
    function createCoins(count = 50) {
        const symbols = ['🪙', '💰', '💎', '👑', '⭐', '✨', '💫', '🌟', '🔮', '🌀'];
        const colors = ['#00ffcc', '#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600', '#ff3388'];
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'coin-particle';
                coin.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                coin.style.color = colors[Math.floor(Math.random() * colors.length)];
                coin.style.left = Math.random() * 100 + '%';
                coin.style.animationDuration = (Math.random() * 4 + 2) + 's';
                coin.style.fontSize = (Math.random() * 40 + 20) + 'px';
                coin.style.opacity = Math.random() * 0.9 + 0.1;
                document.body.appendChild(coin);
                
                setTimeout(() => coin.remove(), 6000);
            }, i * 30);
        }
    }

    // ၄။ ရေပန်းပက်တာ ဖန်တီးမယ်
    function createSplash(count = 30) {
        let splashContainer = document.getElementById('splash-container');
        if (!splashContainer) {
            splashContainer = document.createElement('div');
            splashContainer.id = 'splash-container';
            splashContainer.className = 'splash-effect';
            document.body.appendChild(splashContainer);
        }
        
        const colors = [
            'rgba(0, 255, 255, 0.9)',
            'rgba(255, 0, 255, 0.9)',
            'rgba(255, 255, 0, 0.9)',
            'rgba(0, 255, 0, 0.9)',
            'rgba(255, 102, 0, 0.9)',
            'rgba(255, 51, 153, 0.9)'
        ];
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const splash = document.createElement('div');
                splash.className = 'splash';
                
                const color = colors[Math.floor(Math.random() * colors.length)];
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                const size = Math.random() * 400 + 200;
                
                splash.style.background = `radial-gradient(circle, ${color} 0%, transparent 80%)`;
                splash.style.left = x + 'px';
                splash.style.top = y + 'px';
                splash.style.width = size + 'px';
                splash.style.height = size + 'px';
                splash.style.marginLeft = -size/2 + 'px';
                splash.style.marginTop = -size/2 + 'px';
                
                splashContainer.appendChild(splash);
                
                setTimeout(() => splash.remove(), 1500);
            }, i * 40);
        }
    }

    // ၅။ DJ မီးတန်းတွေ ဖန်တီးမယ်
    function createDJLights() {
        let lightsContainer = document.getElementById('dj-lights-container');
        if (lightsContainer) {
            lightsContainer.remove();
        }
        
        lightsContainer = document.createElement('div');
        lightsContainer.id = 'dj-lights-container';
        lightsContainer.className = 'dj-lights';
        document.body.appendChild(lightsContainer);
        
        const positions = [
            { top: '10%', left: '10%', bg: 'rgba(0, 255, 255, 0.7), rgba(255, 0, 255, 0.4)' },
            { top: '60%', right: '10%', bg: 'rgba(255, 0, 255, 0.7), rgba(0, 255, 255, 0.4)' },
            { bottom: '20%', left: '20%', bg: 'rgba(255, 255, 0, 0.7), rgba(0, 255, 255, 0.4)' },
            { top: '30%', right: '30%', bg: 'rgba(0, 255, 0, 0.7), rgba(255, 0, 255, 0.4)' },
            { bottom: '40%', right: '40%', bg: 'rgba(255, 165, 0, 0.7), rgba(255, 0, 255, 0.4)' }
        ];
        
        positions.forEach((pos, index) => {
            const beam = document.createElement('div');
            beam.className = 'light-beam';
            beam.style.background = `radial-gradient(ellipse at center, ${pos.bg}, transparent 80%)`;
            beam.style.animation = `beamMove ${8 + index * 2}s ease-in-out infinite`;
            
            Object.keys(pos).forEach(key => {
                if (key !== 'bg') {
                    beam.style[key] = pos[key];
                }
            });
            
            lightsContainer.appendChild(beam);
        });
    }

    // ၆။ Container ကိုရှင်းမယ်
    function clearAll() {
        // Container ကိုဖျက်မယ်
        const container = document.getElementById('win-animation-container');
        if (container) {
            container.remove();
        }
        
        // Coins တွေကိုရှင်းမယ်
        document.querySelectorAll('.coin-particle').forEach(el => el.remove());
        
        // Splash container ကိုဖျက်မယ်
        const splashContainer = document.getElementById('splash-container');
        if (splashContainer) {
            splashContainer.remove();
        }
        
        // DJ lights container ကိုဖျက်မယ်
        const lightsContainer = document.getElementById('dj-lights-container');
        if (lightsContainer) {
            lightsContainer.remove();
        }
    }

    // ၇။ BIG WIN ပြမယ်
    function showBigWin() {
        addWinStyles();
        clearAll();
        const container = createContainer();
        
        const div = document.createElement('div');
        div.className = 'big-win-text';
        div.textContent = 'BIG WIN';
        container.appendChild(div);
        
        createCoins(60);
        createSplash(25);
        
        console.log('🎰 BIG WIN animation started');
        
        // 4 စက္ကန့်အကြာမှာ ဖျက်မယ်
        setTimeout(() => {
            clearAll();
            console.log('🎰 BIG WIN animation ended');
        }, 4000);
    }

    // ၈။ MEGA WIN ပြမယ်
    function showMegaWin() {
        addWinStyles();
        clearAll();
        const container = createContainer();
        
        const div = document.createElement('div');
        div.className = 'mega-win-text';
        div.textContent = 'MEGA WIN';
        container.appendChild(div);
        
        createDJLights();
        createCoins(80);
        createSplash(30);
        
        console.log('🎰 MEGA WIN animation started');
        
        // 4 စက္ကန့်အကြာမှာ ဖျက်မယ်
        setTimeout(() => {
            clearAll();
            console.log('🎰 MEGA WIN animation ended');
        }, 4000);
    }

    // ၉။ SUPER WIN ပြမယ်
    function showSuperWin() {
        addWinStyles();
        clearAll();
        const container = createContainer();
        
        const div = document.createElement('div');
        div.className = 'super-win-text';
        div.textContent = 'SUPER WIN';
        container.appendChild(div);
        
        createDJLights();
        createCoins(100);
        createSplash(40);
        
        console.log('🎰 SUPER WIN animation started');
        
        // 4 စက္ကန့်အကြာမှာ ဖျက်မယ်
        setTimeout(() => {
            clearAll();
            console.log('🎰 SUPER WIN animation ended');
        }, 4000);
    }

    // Public API
    return {
        big: showBigWin,
        mega: showMegaWin,
        super: showSuperWin,
        clear: clearAll
    };

})();


// ============================================
// 23. EXPORT GLOBALS
// ============================================
window.adminControlMode = adminControlMode;
window.turnOnAdminMode = turnOnAdminMode;
window.turnOffAdminMode = turnOffAdminMode;
window.spin = spin;
window.closeUserSurpriseModal = closeUserSurpriseModal;
window.selectUserBox = selectUserBox;
window.claimUserSurprise = claimUserSurprise;
window.closeBuffaloJackpot = closeBuffaloJackpot;
window.showCelebration = showCelebration;
window.closeModal = closeModal;
window.stopAutoSpin = stopAutoSpin;
window.startAutoSpin = startAutoSpin;
window.WinAnimations = WinAnimations;
window.premiumBuffaloStampede = premiumBuffaloStampede;
window.buffaloStampede = buffaloStampede;
window.highlightWinsPremium = highlightWinsPremium;
window.WinAnimations = WinAnimations;
console.log('✅ Game.js ULTIMATE VERSION fully loaded with all features!');

