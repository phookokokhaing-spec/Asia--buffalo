// ============================================ GAME.JS - COMPLETE ULTIMATE 
// VERSION (Version 1 + Version 2 + Version 3 Merged) 
// ============================================

// ============================================
// 1. GAME STATE & CONFIGURATION
// ============================================
window.gameState = window.gameState || {
    displayBalance: 0,
    balance: 0,
    jackpotPool: 0,
    userLossPool: 0,
    adminLossPool: 0,
    maxWin: 0,
    vipLevel: 0,
    totalDeposit: 0,
    nextVipRequirement: 0,
    betAmount: 80,
    betMultiplier: 1,
    betType: '10C',
    betIndex: 2,
    winAmount: 0,
    consecutiveWins: 0,
    admin2Active: false,
    admin2SpinCount: 0,
    ADMIN2_SPINS: 5,
    MAX_CONSECUTIVE_WINS: 2,
    isSpinning: false,
    autoSpin: false,
    autoSpinActive: false,
    jackpot: 100000,
    userLevel: 1,
    pendingGift: null,
    pendingGiftList: [],
    spinCounter: 0,
    freeSpins: 0,
    totalFreeSpins: 0,
    isFreeSpinning: false,
    waitingForWinAnimation: false,
    scatterCount: 0,
    totalScatter: 0,
    pendingGiftSpins: 3,
    spinCount: 0,
    threeMatchCount: 0,
    totalSpinsSinceReset: 0,
    checkInterval: 10,
    targetThreeMatchRate: 0.1,
    threeMatchControl: false,
    reduceThreeMatch: false,
    pendingJackpotSpinsLeft: 0,
    pendingJackpotAmount: 0,
    waitingForJackpotComplete: false,
    // ===== AUTO NO-WIN CYCLE =====
    autoNoWinCycle: {
        enabled: true,
        normalSpins: 0,
        noWinSpins: 0,
        currentPhase: 'normal',
        normalPhaseLength: 10,
        noWinPhaseLength: 10
    }
};

// Firebase

  let currentUser = null;

// ============================================
// 2. UPDATED SYMBOL CONFIGURATION
// ============================================
const ALL_SYMBOLS = {
    normal: [
        'seven', 'jack', 'queen', 'nine',
        'lion', 'buffalo', 'ele', 'tha',
        'zebra', 'ayeaye', 'coin', 'bonus', 'ten'
    ],
    wild: ['wild'],
    special: ['baba', 'free']
};

// Wild မပါတဲ့ symbol pool (Admin Control 2 အတွက် wild မပါ)
window.symbolsWithoutWild = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus'];

// Wild ပါတဲ့ symbol pool
window.symbolsWithWild = [...ALL_SYMBOLS.normal, ...ALL_SYMBOLS.wild];

// ============================================
// 3. REEL STRIPS CONFIGURATION
// ============================================
const REELS = [
    ['seven', 'jack', 'queen', 'nine', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten', 'baba'],
    ['seven', 'jack', 'queen', 'nine', 'tha', 'zebra', 'ayeaye', 'coin', 'tha', 'ten', 'tha'],
    ['seven', 'jack', 'queen', 'nine', 'tha', 'zebra', 'buffalo', 'lion', 'jack', 'ten', 'wild', 'buffalo'],
    ['seven', 'jack', 'queen', 'nine', 'lion', 'wild', 'ele', 'tha', 'buffalo', 'ayeaye', 'coin', 'bonus', 'baba', 'lion'],
    ['seven', 'jack', 'queen', 'nine', 'wild', 'tha', 'zebra', 'ayeaye', 'buffalo', 'lion', 'ten', 'ele']
];


// Free Spin Reel Strips (Bonus နဲ့ အထူးသင်္ကေတတွေ ထည့်ထား)
const FREE_SPIN_REELS = [
    ['seven', 'lion', 'tha', 'ele', 'zebra', 'coin', 'ayeaye', 'jack', 'wild'],
    ['seven', 'lion', 'jack', 'ele', 'zebra', 'coin', 'ayeaye', 'bonus', 'wild'],
    ['seven', 'lion', 'buffalo', 'ele', 'zebra', 'coin', 'ayeaye', 'queen', 'wild'],
    ['seven', 'lion', 'buffalo', 'ele', 'zebra', 'coin', 'ayeaye', 'ten', 'wild'],
    ['seven', 'lion', 'tha', 'ele', 'zebra', 'coin', 'ayeaye', 'nine', 'wild']
];

// ===== Free Spin အတွက် buffalo အထူးနေရာ =====
const FREE_SPIN_BUFFALO_COLS = [1, 2, 3]; // col 1,2,3 မှာ buffalo အထူးထည့်

// Image paths
const IMAGE_PATHS = {
    'seven': 'images/seven.png',
    'jack': 'images/jack.png',
    'queen': 'images/queen.png',
    'nine': 'images/nine.png',
    'lion': 'images/lion.png',
    'buffalo': 'images/buffalo.png',
    'ele': 'images/ele.png',
    'tha': 'images/tha.png',
    'zebra': 'images/zebra.png',
    'ayeaye': 'images/ayeaye.png',
    'wild': 'images/wild.png',
    'baba': 'images/baba.png',
    'bonus': 'images/bonus.png',
    'ten': 'images/ten.png',
    'coin': 'images/coin.png'
};

const PAYTABLE_ORIGINAL = {
    'buffalo': {3: 1.2, 4: 2.4, 5: 16},
    'ele':     {3: 0.6, 4: 2.0, 5: 9.6},
    'lion':    {3: 0.4, 4: 1.6, 5: 8},
    'zebra':   {3: 0.6, 4: 1.2, 5: 4.8},
    'tha':     {3: 0.48, 4: 0.96, 5: 4},
    'seven':   {3: 0.32, 4: 0.8, 5: 3.2},
    'jack':    {3: 0.32, 4: 0.8, 5: 4},
    'queen':   {3: 0.36, 4: 0.88, 5: 4.8},
    'nine':    {3: 0.24, 4: 0.64, 5: 2.8},
    'ten':     {3: 0.32, 4: 0.8, 5: 4},
    'coin':    {3: 0.24, 4: 0.56, 5: 2.4},
    'ayeaye':  {3: 0.16, 4: 0.4, 5: 2.0}
};

window.PAYTABLE = PAYTABLE_ORIGINAL;

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

// ===== VIP CONFIGURATION =====
const VIP_CONFIG = {
    0: { 
        maxWinMultiplier: 500,    // 5x
        minMaxWin: 3000,          // အနည်းဆုံး 3000
        requiredDeposit: 0,
        name: 'Bronze'
    },
    1: { 
        maxWinMultiplier: 1000,   // 10x
        minMaxWin: 5000,          // အနည်းဆုံး 5000
        requiredDeposit: 100000,  // ၁သိန်း
        name: 'Silver'
    },
    2: { 
        maxWinMultiplier: 2000,   // 20x
        minMaxWin: 10000,         // အနည်းဆုံး 10000
        requiredDeposit: 500000,  // ၅သိန်း
        name: 'Gold'
    },
    3: { 
        maxWinMultiplier: 5000,   // 50x
        minMaxWin: 25000,         // အနည်းဆုံး 25000
        requiredDeposit: 1000000, // ၁၀သိန်း
        name: 'Platinum'
    },
    4: { 
        maxWinMultiplier: 10000,  // 100x
        minMaxWin: 50000,         // အနည်းဆုံး 50000
        requiredDeposit: 5000000, // ၅၀သိန်း
        name: 'Diamond'
    },
    5: { 
        maxWinMultiplier: 20000,  // 200x
        minMaxWin: 100000,        // အနည်းဆုံး 100000
        requiredDeposit: 10000000, // ၁၀၀သိန်း
        name: 'Royal'
    }
};


// ============================================
//  CHECK USER CAN PLAY - ENHANCED VERSION (new)
// ============================================
function checkUserCanPlay() {
    // ၁. ငွေရှိမရှိ စစ်
    if (window.gameState.displayBalance <= 0 || window.gameState.balance <= 0) {
        alert('ကျေးဇူးပြု၍ ငွေသွင်းပြီးမှဆော့ပါ');
        return false;
    }

    // ၂. လောင်းကြေးနဲ့ လက်ကျန် လုံလောက်မှု
    if (window.gameState.balance < window.gameState.betAmount) {
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
        return false;
    }

    // ၃. User login ရှိမရှိ (လိုအပ်ရင်)
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('ဝင်ရောက်မှု ပြန်လုပ်ပါ');
        return false;
    }

    // ၄. Game က လှည့်နေတာ မဟုတ်ဘူးဆိုတာ (spin ထဲမှာလည်း စစ်ထားတယ်)
    if (window.gameState.isSpinning) {
        console.log('⚠️ Already spinning, cannot play now');
        return false;
    }

    // ၅. Jackpot animation ကြားခံနေရင် (ခဏစောင့်ခိုင်းနိုင်တယ်)
    if (window.gameState.waitingForJackpotComplete) {
        showNotification('ဂျက်ပေါ့ဆုကြေး ပြီးဆုံးရန် စောင့်ပါ', 'info');
        return false;
    }

    return true;
}

// ============================================
// 5. DOM READY & INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 Game Engine Initialized (Balanced Mode)');

    const savedUserData = localStorage.getItem('currentUser');
    if (savedUserData) {
        currentUser = JSON.parse(savedUserData);
        window.currentUser = currentUser;

       // Initialize new hybrid surprise box system
          initSurpriseListener();
        await loadLossPoolData();
        if (currentUser && currentUser.id) {
            console.log('🟢 Setting up listeners for user:', currentUser.id);
            listenForPendingJackpot(currentUser.id);
            listenToUserData(currentUser.id);
            
            // ✅ ဒီမှာ listenToLossPool ခေါ် (function က အရင်ရှိပြီ)
            if (typeof listenToLossPool === 'function') {
                listenToLossPool();
            } else {
                console.warn('⚠️ listenToLossPool not defined');
            }
        }
    }
    initSlotGrid();
    initBetControls();
    initEventListeners();

    loadCurrentUserData();
    updateBalanceDisplay();
    updateJackpotDisplay();
    loadJackpotFromAdmin();
  
    addPremiumStyles();
});

// ============================================
// 6. PREMIUM GRID INITIALIZATION
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
        background: radial-gradient(circle at 30% 30%,
        rgba(255,215,0,0.15), transparent 70%);
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
        width: 100%;
        height: 100%;
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
        width: 100%;
        height: 100%;
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
// 7. BET CONTROLS
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
// 8. EVENT LISTENERS
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
        window.gameState.balance = currentUser.balance || 0;
       window.gameState.displayBalance = currentUser.displayBalance || currentUser.balance || 0;
        window.gameState.userLevel = currentUser.level || 1;
        window.gameState.vipLevel = currentUser.vip || 0;
        updateBalanceDisplay();
    }
}

// ============================================
// BA BA Control Mode Function
// ============================================
 const BABA_MODE_CONFIG = {
   
    modeA: { 
        cols: [0, 1, 2, 3, 4],
        countPerCol: 1, 
        distribution: 'random' 
    },

   
    modeB: {
  cols: [1, 2, 3],
  countPerCol: 1,
  distribution: 'alternating' 
    },
 
    modeC: {

  cols: [0, 2, 4,5],

  countPerCol: 1,

  distribution: 'random'

  }
};

function generateBabaJackpotResult() {
    let result = [[], [], [], [], []];
    const otherSymbols = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'jack', 'queen', 'nine', 'ten'];

    for (let col = 0; col < 5; col++) {
        const babaRow = Math.floor(Math.random() * 4);
        const columnSymbols = [];
        
        for (let row = 0; row < 4; row++) {
            if (row === babaRow) {
                columnSymbols.push('baba');
                if (typeof SoundManager !== 'undefined') SoundManager.boom();
            } else {
                columnSymbols.push(otherSymbols[Math.floor(Math.random() * otherSymbols.length)]);
            }
        }
        result[col] = columnSymbols;
    }

    console.log('🎰 BABA 5 JACKPOT RESULT GENERATED!');
    return result;
}
// ============================================
// 9. MAIN SPIN FUNCTION (CLEAN VERSION)
// ============================================
function spin() {
    console.log('🔥 spin() called');

    if (!checkUserCanPlay()) return;
    if (window.gameState.isSpinning) {
        console.log('⚠️ Already spinning');
        return;
    }
    if (window.gameState.balance < window.gameState.betAmount) {
        console.log('⚠️ Balance too low:', window.gameState.balance, '<', window.gameState.betAmount);
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ', 'error');
        return;
    }

    console.log('🎰 Spinning...');
    window.gameState.isSpinning = true;

    const winEl = document.getElementById('winAmount');
    if (winEl) winEl.textContent = '0';

    clearAllWinHighlights();
    if (typeof SoundManager !== 'undefined') SoundManager.spin();

    if (!window.gameState.isFreeSpinning) {
        window.gameState.balance -= window.gameState.betAmount;
        addJackpotContribution(window.gameState.betAmount);
    }

    window.gameState.spinCount++;
    window.gameState.spinCounter = (window.gameState.spinCounter || 0) + 1;
    updateBalanceDisplay();

    // ===== BABA JACKPOT MODE COUNTER (if enabled) =====
    if (window.gameState.babaJackpotMode?.enabled) {
        window.gameState.babaJackpotMode.currentSpinCount++;
        console.log(`🎯 Baba Jackpot Counter: ${window.gameState.babaJackpotMode.currentSpinCount} / ${window.gameState.babaJackpotMode.targetSpins}`);

        if (window.gameState.babaJackpotMode.currentSpinCount >= window.gameState.babaJackpotMode.targetSpins) {
            window.gameState.babaJackpotMode.isReady = true;
            window.gameState.babaJackpotMode.forceJackpot = true;   // next spin will force jackpot
            console.log('🎯 BABA JACKPOT IS READY!');
        }
    }

    // Legacy pending jackpot spins (if any)
    if (window.gameState.pendingJackpotSpinsLeft > 0) {
        window.gameState.pendingJackpotSpinsLeft--;
        console.log(`🎯 Jackpot pending spins left: ${window.gameState.pendingJackpotSpinsLeft}`);
    }

    // Generate result (forceJackpot will be used inside generateSpinResult)
    const result = generateSpinResult();
    console.log('Final Result:', result);

    animateReelsStaggered(result);

    document.addEventListener('animationComplete', function onAnimationComplete() {
        document.removeEventListener('animationComplete', onAnimationComplete);

        console.log('💰 Calculating winnings...');
        const winResult = calculateWinnings(result);
        const totalWin = winResult.totalWin || 0;

       // ===== WIN HANDLING =====
if (totalWin > 0) {
    if (window.gameState.isFreeSpinning) {
        window.gameState.freeSpinTotalWin = (window.gameState.freeSpinTotalWin || 0) + totalWin;
        console.log(`🎰 Free Spin win accumulated: ${window.gameState.freeSpinTotalWin}`);
        updateWinDisplay(window.gameState.freeSpinTotalWin);

        if (winResult.indices?.length > 0) {
            highlightWinsPremium(winResult.indices, winResult.buffaloIndices || []);
            showWinWithRise(totalWin, winResult.indices);
        }
        window.gameState.waitingForWinAnimation = true;
        setTimeout(() => {
            window.gameState.waitingForWinAnimation = false;
            continueFreeSpinAfterWin();
        }, 2000);
    } else {
        // ✅ Baba Jackpot မဟုတ်ရင်မှ balance ထည့်
        if (!winResult.isBabaJackpot) {
            window.gameState.balance += totalWin;
            window.gameState.displayBalance += totalWin;
            updateBalanceDisplay();
            updateUserBalanceInStorage();
        }
        updateWinDisplay(totalWin);

        if (winResult.indices?.length > 0) {
            highlightWinsPremium(winResult.indices, winResult.buffaloIndices || []);
            showWinWithRise(totalWin, winResult.indices);
        }
        window.gameState.waitingForWinAnimation = false;
    }
}

        updateUserBalanceInStorage();
       // မူရင်း checkScatter ကို ဒီအတိုင်းပြောင်း
checkScatterWithSuspense(result);

        const buffaloCount = countBuffalo(result);
        if (buffaloCount >= 20) {
            if (typeof premiumBuffaloStampede !== 'undefined') {
                premiumBuffaloStampede.startStampede(window.gameState.jackpot, buffaloCount);
            } else if (typeof buffaloStampede !== 'undefined') {
                buffaloStampede.startStampede(window.gameState.jackpot, buffaloCount);
            }
            showBuffaloJackpot(window.gameState.jackpot, buffaloCount);
        }

        window.gameState.isSpinning = false;

        checkPendingGiftOnSpin();
        checkPendingBoxSetOnSpin();

        // Free Spin Handling
        if (window.gameState.isFreeSpinning && window.gameState.freeSpins > 0) {
            window.gameState.freeSpins--;
            updateFreeSpinIndicator();
            if (window.gameState.freeSpins > 0) {
                setTimeout(() => spin(), 2000);
            } else {
                endFreeSpins();
            }
        }

        // Auto Spin Handling
        if (window.gameState.autoSpinActive) {
            handleAutoSpinComplete(totalWin);
        }

        // ===== BABA JACKPOT MODE RESET (after trigger) =====
        if (window.gameState.babaJackpotTriggered) {
               finishJackpotSequence();
            if (window.gameState.babaJackpotMode?.notifId) {
                try {
                    const db = firebase.firestore();
                    db.collection('notifications').doc(window.gameState.babaJackpotMode.notifId).update({
                        read: true,
                        completedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(e) { console.log('Firebase update error:', e); }
            }
            // Reset Baba mode
            window.gameState.babaJackpotMode = {
                enabled: false,
                targetSpins: 0,
                currentSpinCount: 0,
                isReady: false,
                jackpotAmount: 0,
                notifId: null
            };
            window.gameState.babaJackpotTriggered = false;
            window.gameState.pendingJackpotAmount = 0;
            window.gameState.pendingJackpotSpinsLeft = 0;
            console.log('✅ BABA JACKPOT MODE RESET COMPLETED');
        }

        // ===== NORMAL JACKPOT HANDLING (pendingJackpotSpinsLeft === 0) =====
        if (window.gameState.pendingJackpotSpinsLeft === 0 && window.gameState.pendingJackpotAmount > 0) {
            const jackpotAmount = window.gameState.pendingJackpotAmount;
            if (jackpotAmount > 0) {
                window.gameState.balance += jackpotAmount;
                window.gameState.displayBalance += jackpotAmount;
                updateBalanceDisplay();
                updateUserBalanceInStorage();
            }

            finalizeJackpot();

            if (typeof JackpotFX !== 'undefined') {
                document.querySelectorAll('canvas').forEach(c => c.remove());
                JackpotFX.show(jackpotAmount);
                showJackpotAnimation();
                if (typeof GlobalTopManager !== 'undefined') {
                    GlobalTopManager.submitWin(jackpotAmount);
                }
            }
            if (typeof SoundManager !== 'undefined') {
                SoundManager.jackpotSpin();
                SoundManager.jackpot();
                SoundManager.lion();
                SoundManager.congratulations();
                SoundManager.coin();
                SoundManager.coinRain();
                SoundManager.sixCoin();
                SoundManager.boom();
            }

            showNotification(`🎉 ဂျက်ပေါ့ဆုကြေး ${formatNumber(jackpotAmount)} ကျပ် ရရှိပါသည်။`, 'success');
            window.gameState.waitingForJackpotComplete = true;
            setTimeout(() => {
                window.gameState.waitingForJackpotComplete = false;
                console.log('✅ Jackpot completed');
            }, 60000);

            window.gameState.pendingJackpotAmount = 0;
            window.gameState.Lucky_Money = 0;
        }
    });
}
// ============================================
// 10. SHOW NOTIFICATION
// ============================================
function showNotification(msg, type = 'info') {
    console.log('🔔 showNotification called:', msg);
    const n = document.getElementById('notification');
    if (!n) {
        console.log('❌ Notification element not found!');
        return;
    }
    const msgEl = n.querySelector('#notificationMessage');
    if (!msgEl) {
        console.log('❌ Notification message element not found!');
        return;
    }
    msgEl.textContent = msg;
    n.style.background = type === 'success' ? '#00c853' : type === 'error' ? '#ff5252' : '#2196f3';
    n.classList.add('show');  // Add class instead of direct style
    setTimeout(() => {
        n.classList.remove('show');
    }, 3000);
}


// ============================================
// DetectSuspense  FUNCTIONS
// ============================================
function detectSuspenseMode(result) {
    var babaLocations = [];
    var babaColumns = [];

    // result က array အစစ် ဟုတ်၊ မဟုတ် အရင်စစ်
     if (!result || !Array.isArray(result)) return { isSuspense: false, babaCount: 0 };

    for (var col = 0; col < 5; col++) {
        var foundInCol = false;
        for (var row = 0; row < 4; row++) {
            // 🔥 တိတိကျကျ စစ်မယ် - စာလုံးအသေး 'baba' အစစ်ဖြစ်ရမယ်
            if (result[col] && result[col][row] === 'baba') {
                console.log(`🎯 Found REAL Baba at Col: ${col}, Row: ${row}`);
                babaLocations.push({ col: col, row: row });
                foundInCol = true;
            }
        }
        if (foundInCol) {
            babaColumns.push(col);
        }
    }

    if (babaColumns.length >= 3) {
        var columnsToCheck = [];
        for (var i = 0; i < 5; i++) {
            if (babaColumns.indexOf(i) === -1) {
                columnsToCheck.push(i);
            }
        }
        return {
            isSuspense: true,
            babaCount: babaColumns.length,
            babaLocations: babaLocations,
            columnsToCheck: columnsToCheck
        };
    }

    return { isSuspense: false, babaCount: 0, babaLocations: [], columnsToCheck: [] };
}


// ============================================
// COLOR BORDER FUNCTIONS
// ============================================

function addRedBorderToColumn(col) {
    var cells = getColumnCells(col);
    for (var i = 0; i < cells.length; i++) {
        cells[i].classList.add('suspense-glow');
    }
}

// Glow Effect ဖျက်ခြင်း
function removeRedBorderFromColumn(col) {
    var cells = getColumnCells(col);
    for (var i = 0; i < cells.length; i++) {
        cells[i].classList.remove('suspense-glow');
     }
  }
function addYellowBorderToBabaImg(cell) {
    var img = cell.querySelector('img');
    if (!img) return;

    var filename = img.src.split('/').pop().toLowerCase();
    
    if (filename === 'baba.png' || filename === 'baba') {
        img.style.borderRadius = '50%';
        img.style.boxShadow = '0 0 0 4px #ffd700, 0 0 25px #ffd700';
        img.style.padding = '4px';
        img.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        cell.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
        cell.dataset.symbol = 'baba';
    } else {
        img.style.boxShadow = 'none';
        img.style.backgroundColor = 'transparent';
        cell.style.backgroundColor = 'transparent';
        console.log(`🚫 Refused to border: ${filename}`); 
    }
}
function startSuspenseAnimation(finalResult, suspenseInfo) {
    console.log('🎬 SUSPENSE MODE ACTIVATED!');
    
    // ============================================
    // ⭐⭐⭐ အသစ်ထည့်ရန်: 5 BaBa စစ်ဆေးခြင်း ⭐⭐⭐
    // ============================================
    var babaCount = suspenseInfo.babaCount || 0;
    
    // suspenseInfo မှာ babaCount မပါရင် finalResult ကနေ ပြန်ရေတွက်
    if (!babaCount && finalResult) {
        babaCount = 0;
        for (var col = 0; col < finalResult.length; col++) {
            var hasBaba = finalResult[col].some(function(s) { 
                return s === 'baba'; 
            });
            if (hasBaba) babaCount++;
        }
    }
    
    console.log(`📊 BaBa Column Count: ${babaCount}`);
    
    // 5 BaBa ဆိုရင် Jackpot Sequence ကို ခေါ်မယ်
    if (babaCount === 5) {
        console.log("🎰🎰🎰 5 BABA JACKPOT DETECTED! Switching to Jackpot Sequence...");
        
        // BaBa Columns နဲ့ Non-BaBa Columns ခွဲမယ်
        var babaColumns = [];
        var nonBabaColumns = [];
        
        for (var col = 0; col < finalResult.length; col++) {
            var hasBaba = finalResult[col].some(function(s) { 
                return s === 'baba'; 
            });
            if (hasBaba) {
                babaColumns.push(col);
            } else {
                nonBabaColumns.push(col);
            }
        }
        
        // Jackpot Sequence ကို ခေါ်မယ်
        if (typeof startJackpotSequence === 'function') {
            startJackpotSequence(finalResult, babaColumns, nonBabaColumns);
        } else {
            console.error("❌ startJackpotSequence function not found!");
        }
        
        return; // ⭐ မူရင်း Suspense ကို ဆက်မလုပ်တော့ဘူး
    }

// ============================================
    // အောက်က မင်းရဲ့ မူရင်း Code (3-4 BaBa အတွက်)
    // ============================================

    if (suspenseInfo.babaLocations && suspenseInfo.babaLocations.length > 0) {
        suspenseInfo.babaLocations.forEach(loc => {
            var cell = document.querySelector(`.grid-cell[data-col="${loc.col}"][data-row="${loc.row}"]`);
            if (cell) {
                var img = cell.querySelector('img');
                if (img) {
                    img.src = 'images/baba.png';
                    img.style.opacity = '1';
                    addYellowBorderToBabaImg(cell);
                }
            }
        });
    }

    // ၂။ Baba မပါတဲ့တိုင် (columnsToCheck) ကိုပဲ ဆက်စစ်မယ်
    if (suspenseInfo.columnsToCheck.length > 0) {
        // ပထမဆုံး စစ်ရမယ့်တိုင်ကို စတင်မယ်
        checkNextSuspenseColumn(finalResult, suspenseInfo.columnsToCheck, 0);
    } else {
        setTimeout(finishSuspense, 500);
    }
}

// ============================================
// 2. CHECK NEXT COLUMN (The Core Sequence)
// ============================================
function checkNextSuspenseColumn(finalResult, columnsToCheck, index) {
    if (index >= columnsToCheck.length) {
        setTimeout(finishSuspense, 500);
        return;
    }

    var col = columnsToCheck[index];
    var targetSymbols = finalResult[col];

    var hasBabaInThisCol = targetSymbols.some(function(s) {
        return s === 'baba';
    });

    if (hasBabaInThisCol) {
        // ✨ Baba ပါနေရင် ကျော်မယ်
        console.log("⏩ Col " + col + " has Baba, skipping suspense...");
        revealColumnInstantly(col, targetSymbols);

        setTimeout(function() {
            checkNextSuspenseColumn(finalResult, columnsToCheck, index + 1);
        }, 400);
    } else {
        // 🔥 အသံထည့်တဲ့နေရာ (SoundManager ရှိမှ ခေါ်မယ်)
       SoundManager.lion();
      SoundManager.boom();


        // ✨ Baba မပါရင် ၆ စက္ကန့် စစ်မယ်
        console.log("🔍 Col " + col + " is empty, checking for Baba (6s)...");

        addRedBorderToColumn(col);
        var cells = getColumnCells(col);
        cells.forEach(function(cell) {
            cell.classList.add('rise-column');
        });

        // Spin Logic
        fastRandomSpin(col, 6000, function() {
            // Spin ပြီးရင် ပုံဖော်မယ်
            slowRevealColumn(col, targetSymbols, function() {
                removeRedBorderFromColumn(col);
                var currentCells = getColumnCells(col);
                currentCells.forEach(function(c) {
                    c.classList.remove('rise-column');
                });

                // Next one 
                setTimeout(function() {
                    checkNextSuspenseColumn(finalResult, columnsToCheck, index + 1);
                }, 500);
            });
        }); 
    } 
}

function revealColumnInstantly(col, targetSymbols) {
    var cells = getColumnCells(col);
    cells.forEach(function(cell, row) {
        var img = cell.querySelector('img');
        var symbol = targetSymbols[row];
        if (img && symbol) {
            img.src = 'images/' + symbol + '.png';
            img.style.opacity = '1';
            cell.dataset.symbol = symbol;
            if (symbol === 'baba') {
                addYellowBorderToBabaImg(cell);
            }
        }
    });
}


// ============================================
// 3. SLOW REVEAL
// ============================================
function fastRandomSpin(col, duration, onComplete) {
    var cells = getColumnCells(col);
    var symbols = ['seven', 'jack', 'queen', 'nine', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'baba'];
    var startTime = Date.now();

    function spin() {
        var elapsed = Date.now() - startTime;

        if (elapsed >= duration) {
            
            onComplete();
            return;
        }

        // Random 
        for (var i = 0; i < cells.length; i++) {
            var img = cells[i].querySelector('img');
            if (img) {
                var rand = symbols[Math.floor(Math.random() * symbols.length)];
                img.src = 'images/' + rand + '.png';
            }
        }

        setTimeout(spin, 50); 
    }

    spin();
}


function slowRevealColumn(col, targetSymbols, onComplete) {
    var colCells = getColumnCells(col);
    var rowIndex = 0;
    var hasBabaInThisCol = false;

    function revealNextRow() {
        if (rowIndex >= colCells.length) {
            setTimeout(function() {
                if (onComplete) onComplete(hasBabaInThisCol);
            }, 300);
            return;
        }

        var cell = colCells[rowIndex];
        var img = cell.querySelector('img');
        var symbol = targetSymbols[rowIndex];

        if (img && symbol) {
            img.src = 'images/' + symbol + '.png';
            img.style.transition = 'none';
            img.style.opacity = '0';
            img.style.transform = 'translateY(-50px) scale(0.8)';

            (function(targetImg, targetCell, targetSymbol) {
                setTimeout(function() {
                    targetImg.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    targetImg.style.opacity = '1';
                    targetImg.style.transform = 'translateY(0) scale(1)';
                    targetCell.dataset.symbol = targetSymbol;

                    if (targetSymbol === 'baba') {
                        hasBabaInThisCol = true;
                        addYellowBorderToBabaImg(targetCell);
                        
                        if (typeof SoundManager !== 'undefined') {
                            if (SoundManager.boom) {
                                SoundManager.boom();
                            } else if (SoundManager.shortcuts && SoundManager.shortcuts.boom) {
                                SoundManager.shortcuts.boom();
                            }
                        }
                    }
                }, 50);
            })(img, cell, symbol);
        }

        rowIndex++;
        setTimeout(revealNextRow, 150);
    }

    revealNextRow();
}

function finishSuspense() {
    console.log('✅ Suspense Mode Finished');
    removeAllBorders();
    document.dispatchEvent(new CustomEvent('animationComplete'));
}

// ============================================
// LOCK & REVEAL JACKPOT SEQUENCE (REAL CHECK)
// ============================================

let lockedColumns = [];
let pendingColumns = [];
let jackpotFinalResult = null;
let isJackpotMode = false;

// ============================================
// MAIN ENTRY: Spin Result ရလာတဲ့အခါ ခေါ်မယ်
// ============================================
function processSpinResult(finalResult) {
   
    var babaColumns = [];
    var nonBabaColumns = [];
    
    for (var col = 0; col < finalResult.length; col++) {
        var hasBaba = finalResult[col].some(function(symbol) {
            return symbol === 'baba';
        });
        
        if (hasBaba) {
            babaColumns.push(col);
        } else {
            nonBabaColumns.push(col);
        }
    }
    
    var babaCount = babaColumns.length;
    
    console.log(`📊 BaBa Columns: ${babaColumns} (Total: ${babaCount})`);
    console.log(`📊 Non-BaBa Columns: ${nonBabaColumns}`);
    
    // 2. BaBa Count အလိုက် ဆုံးဖြတ်မယ်
    if (babaCount === 5) {
        // 5 Column လုံး BaBa ပါရင် -> Jackpot Mode
        startJackpotSequence(finalResult, babaColumns, nonBabaColumns);
    } else if (babaCount >= 3) {
        // 3-4 BaBa ဆိုရင် Suspense Mode (မင်းရဲ့ မူရင်း Logic)
        startSuspenseAnimation(finalResult, {
            babaLocations: getBabaLocations(finalResult),
            columnsToCheck: nonBabaColumns
        });
    } else {
        // 2 BaBa အောက်ဆိုရင် ပုံမှန် Reveal
        revealAllColumnsInstantly(finalResult);
    }
}

// ============================================
// Get BaBa Locations (Row, Col)
// ============================================
function getBabaLocations(finalResult) {
    var locations = [];
    for (var col = 0; col < finalResult.length; col++) {
        for (var row = 0; row < finalResult[col].length; row++) {
            if (finalResult[col][row] === 'baba') {
                locations.push({ col: col, row: row });
            }
        }
    }
    return locations;
}

// ============================================
// JACKPOT SEQUENCE (5 Columns have BaBa)
// ============================================
function startJackpotSequence(finalResult, babaColumns, nonBabaColumns) {
    isJackpotMode = true;
    lockedColumns = [];
    jackpotFinalResult = finalResult;
    
    console.log("🎰🎰🎰 JACKPOT SEQUENCE STARTED! 🎰🎰🎰");
    

    var firstThreeBabaColumns = babaColumns.slice(0, 3);
    
    firstThreeBabaColumns.forEach(function(col) {
        lockAndRevealColumnWithResult(col, finalResult[col]);
    });
    
  
    pendingColumns = babaColumns.slice(3); // Index 3,4 (4th and 5th BaBa columns)
    
    // အဆင့် ၃: ပထမဆုံး Pending Column ကို စစ်မယ်
    processNextPendingColumn();
}

// ============================================
// Column တစ်ခုကို Result နဲ့ Lock ချပြီး Reveal လုပ်မယ်
// ============================================
function lockAndRevealColumnWithResult(col, targetSymbols) {
    lockedColumns.push(col);
    
    var cells = getColumnCells(col);
    
    // Row တစ်ခုချင်းစီကို သူ့ Symbol အတိုင်း ပြမယ်
    cells.forEach(function(cell, row) {
        var img = cell.querySelector('img');
        var symbol = targetSymbols[row];
        
        if (img && symbol) {
            img.src = 'images/' + symbol + '.png';
            img.style.opacity = '1';
            img.style.transition = 'all 0.3s ease';
            cell.dataset.symbol = symbol;
            
            // BaBa ဆိုရင် Yellow Border
            if (symbol === 'baba') {
                addYellowBorderToBabaImg(cell);
                // BaBa အတွက် Boom အသံ
                if (typeof SoundManager !== 'undefined' && SoundManager.boom) {
                    SoundManager.boom();
                }
            }
        }
    });
    
    // Locked Column Visual Effect
    cells.forEach(function(cell) {
        cell.classList.add('locked-column');
        cell.style.opacity = '0.9';
        cell.style.filter = 'brightness(1.1)';
    });
    
    console.log(`🔒 Column ${col} LOCKED with: ${targetSymbols.join(', ')}`);
}

// ============================================
// နောက်ထပ် Pending Column တစ်ခုကို Suspense နဲ့ စစ်မယ်
// ============================================
function processNextPendingColumn() {
    if (pendingColumns.length === 0) {
        // အကုန်ပြီးပြီ - Jackpot ပေါက်ပြီ
        finishJackpotSequence();
        return;
    }
    
    var col = pendingColumns.shift();
    var isLastColumn = (pendingColumns.length === 0);
    var targetSymbols = jackpotFinalResult[col];
    
    console.log(`🔍 Suspense for Column ${col} ${isLastColumn ? '(FINAL COLUMN!)' : ''}`);
    console.log(`   Target symbols: ${targetSymbols.join(', ')}`);
    
    // Sound Effect
    if (typeof SoundManager !== 'undefined') {
        SoundManager.lion();
        SoundManager.boom();
    }
    
    // Visual Effects
    addRedBorderToColumn(col);
    var cells = getColumnCells(col);
    cells.forEach(function(cell) {
        cell.classList.add('rise-column');
    });
    
    // Spin Duration (နောက်ဆုံး Column ဆိုရင် ပိုကြာမယ်)
    var spinDuration = isLastColumn ? 8000 : 5000;
    
    // Fast Spin လုပ်မယ် (Random Symbols)
    fastRandomSpin(col, spinDuration, function() {
        // Spin ပြီးရင် Slow Reveal
        slowRevealColumnWithResult(col, targetSymbols, function() {
            // Reveal ပြီးသွားပြီ
            removeRedBorderFromColumn(col);
            cells.forEach(function(c) {
                c.classList.remove('rise-column');
            });
            
            // Lock ချမယ်
            lockedColumns.push(col);
            cells.forEach(function(cell) {
                cell.classList.add('locked-column');
                cell.style.opacity = '0.9';
                cell.style.filter = 'brightness(1.1)';
            });
            
            console.log(`🔒 Column ${col} LOCKED after suspense`);
            
            // နောက် Column ကို ဆက်စစ်မယ်
            setTimeout(function() {
                processNextPendingColumn();
            }, isLastColumn ? 1000 : 600);
        });
    });
}

// ============================================
// Slow Reveal (Result အတိုင်း အတိအကျ ပြမယ်)
// ============================================
function slowRevealColumnWithResult(col, targetSymbols, onComplete) {
    var colCells = getColumnCells(col);
    var rowIndex = 0;
    var isLastColumn = (pendingColumns.length === 0);

    function revealNextRow() {
        if (rowIndex >= colCells.length) {
            setTimeout(function() {
                if (onComplete) onComplete();
            }, 300);
            return;
        }

        var cell = colCells[rowIndex];
        var img = cell.querySelector('img');
        var symbol = targetSymbols[rowIndex];

        if (img && symbol) {
            img.src = 'images/' + symbol + '.png';
            img.style.transition = 'none';
            img.style.opacity = '0';
            img.style.transform = 'translateY(-50px) scale(0.8)';

            (function(targetImg, targetCell, targetSymbol, rowIdx) {
                setTimeout(function() {
                    targetImg.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    targetImg.style.opacity = '1';
                    targetImg.style.transform = 'translateY(0) scale(1)';
                    targetCell.dataset.symbol = targetSymbol;
                    
                    // BaBa ဆိုရင် Yellow Border + Boom
                    if (targetSymbol === 'baba') {
                        addYellowBorderToBabaImg(targetCell);
                        if (typeof SoundManager !== 'undefined' && SoundManager.boom) {
                            SoundManager.boom();
                        }
                    }
                    
                    // နောက်ဆုံး Column ရဲ့ နောက်ဆုံး Row မှာ Special Effect
                    if (isLastColumn && rowIdx === colCells.length - 1) {
                        document.body.classList.add('jackpot-flash');
                        setTimeout(function() {
                            document.body.classList.remove('jackpot-flash');
                        }, 500);
                        
                        if (typeof SoundManager !== 'undefined' && SoundManager.lion) {
                            SoundManager.lion();
                        }
                    }
                }, 50);
            })(img, cell, symbol, rowIndex);
        }

        rowIndex++;
        var rowDelay = isLastColumn ? 300 : 200;
        setTimeout(revealNextRow, rowDelay);
    }

    revealNextRow();
}
// ============================================
// Jackpot Sequence ပြီးဆုံးချိန်
// ============================================
function finishJackpotSequence() {
    console.log("🎉🎉🎉 BABA 5 JACKPOT COMPLETE! 🎉🎉🎉");

    const jackpotAmount = window.gameState?.babaJackpotMode?.jackpotAmount ||
                          window.gameState?.pendingJackpotAmount ||
                          800000;

    console.log(`💰 Jackpot Amount: ${jackpotAmount}`);

    // ===== FORCE BALANCE UPDATE =====
    if (window.gameState) {
        let oldBalance = window.gameState.balance;
        window.gameState.balance = (window.gameState.balance || 0) + jackpotAmount;
        window.gameState.displayBalance = window.gameState.balance;
        
        console.log(`💰 OLD Balance: ${oldBalance}`);
        console.log(`💰 NEW Balance: ${window.gameState.balance}`);
        
        // Force UI update - တိုက်ရိုက် DOM ကိုပြောင်း
        const balanceEl = document.getElementById('balanceDisplay');
        if (balanceEl) {
            balanceEl.innerText = window.gameState.balance.toLocaleString();
            console.log("✅ Force updated balance UI:", balanceEl.innerText);
        }
        
        // Storage ကိုလည်း force update
        if (window.currentUser) {
            window.currentUser.balance = window.gameState.balance;
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
            console.log("✅ Force updated localStorage");
        }
        
        updateBalanceDisplay();  // ပုံမှန် update
        updateUserBalanceInStorage();
        
        showNotification(`🎉 ဂျက်ပေါ့ဆုကြေး ${formatNumber(jackpotAmount)} ကျပ် ရရှိပါသည်။`, 'success');
    }

    // Animation & Sound
    if (typeof showJackpotAnimation === 'function') {
        showJackpotAnimation(jackpotAmount, jackpotFinalResult);
    }

    if (typeof GlobalTopManager !== 'undefined') {
        GlobalTopManager.submitWin(jackpotAmount, 'jackpot');
    }

    if (typeof SoundManager !== 'undefined') {
        SoundManager.jackpot();
        SoundManager.lion();
        SoundManager.congratulations();
        SoundManager.coin();
        SoundManager.coinRain();
        SoundManager.sixCoin();
        SoundManager.boom();
    }

    // ============================================
    // 🔥🔥🔥 SPIN FUNCTION ထဲက RESET အတိုင်း လုပ်မယ် 🔥🔥🔥
    // ============================================

    // 1. Firebase Update (လိုအပ်ရင်)
    if (window.gameState.babaJackpotMode?.notifId) {
        try {
            const db = firebase.firestore();
            db.collection('notifications').doc(window.gameState.babaJackpotMode.notifId).update({
                read: true,
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch(e) {
            console.log('Firebase update error:', e);
        }
    }

    // 2. Reset Baba mode
    window.gameState.babaJackpotMode = {
        enabled: false,
        targetSpins: 0,
        currentSpinCount: 0,
        isReady: false,
        jackpotAmount: 0,
        notifId: null
    };
    window.gameState.babaJackpotTriggered = false;
    window.gameState.pendingJackpotAmount = 0;
    window.gameState.pendingJackpotSpinsLeft = 0;

    // 3. ⭐ အရေးကြီးဆုံး - isSpinning ကို false လုပ်
    window.gameState.isSpinning = false;
    window.gameState.waitingForJackpotComplete = false;

    // 4. Internal Flags
    isJackpotMode = false;
    lockedColumns = [];
    pendingColumns = [];
    jackpotFinalResult = null;

    // 5. Ready State
    if (typeof ready !== 'undefined') ready = true;
    if (typeof canSpin !== 'undefined') canSpin = true;
    if (typeof spinLock !== 'undefined') spinLock = false;

    // ============================================
    // 🧹 UI Cleanup
    // ============================================
    console.log("🧹 Cleaning up UI locks...");

    // Column တွေရဲ့ Lock Styles ရှင်း
    for (var col = 0; col < 5; col++) {
        var cells = getColumnCells(col);
        cells.forEach(function(cell) {
            cell.classList.remove('locked-column', 'rise-column', 'suspense-glow');
            cell.style.opacity = '';
            cell.style.filter = '';
            cell.style.boxShadow = '';
            cell.style.border = '';
            
            var img = cell.querySelector('img');
            if (img) {
                img.style.borderRadius = '';
                img.style.boxShadow = '';
                img.style.padding = '';
                img.style.backgroundColor = '';
            }
        });
        
        if (typeof removeRedBorderFromColumn === 'function') {
            removeRedBorderFromColumn(col);
        }
    }

    // Borders အကုန်ဖျက်
    removeAllBorders();  // ⭐ ခေါ်ဖို့ မမေ့နဲ့

    // Body Classes
    document.body.classList.remove('jackpot-flash', 'jackpot-active', 'spin-locked');

    // Spin Button Enable
    var spinButton = document.querySelector('#spin-button, .spin-btn, [data-action="spin"], button.spin');
    if (spinButton) {
        spinButton.disabled = false;
        spinButton.style.opacity = '1';
        spinButton.style.pointerEvents = 'auto';
        spinButton.classList.remove('disabled', 'locked');
        console.log("✅ Spin button enabled");
    }

    console.log('✅ BABA JACKPOT MODE RESET COMPLETED from finishJackpotSequence');
    console.log("✅✅✅ READY FOR NEXT SPIN! ✅✅✅");
}

// အားလုံးဖျက်
function removeAllBorders() {
    var cells = document.querySelectorAll('.grid-cell');
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var img = cell.querySelector('img');

        cell.style.borderRadius = '';
        cell.style.boxShadow = '';
        cell.style.transform = '';
        cell.style.transition = '';
        cell.style.backgroundColor = '';
        cell.classList.remove('red-border-line', 'yellow-border-line', 'locked-column', 'rise-column');

        if (img) {
            img.style.borderRadius = '';
            img.style.boxShadow = '';
            img.style.padding = '';
            img.style.backgroundColor = '';
            img.style.transform = '';
            img.style.opacity = '';
        }
    }
}
// ============================================
// 11. FIXED WIN CALCULATION (COMPLETE WITH BABA 5 JACKPOT)
// ============================================
function calculateWinnings(result) {
    const paytable = window.PAYTABLE || PAYTABLE_ORIGINAL;
    const bet = window.gameState.betAmount;
    const vipLevel = window.gameState.vipLevel || 0;
    const vipConfig = VIP_CONFIG[vipLevel];
    const rows = GRID_ROWS;
    const cols = GRID_COLS;

    let totalWin = 0;
    let buffaloCount = 0;
    let winIndices = [];
    let buffaloIndices = [];
    let winLines = [];

    console.log('🔍 Paytable:', paytable);

    // ===== 🎯 BABA 5 JACKPOT DETECTION =====
    let babaCount = 0;
    let babaIndices = [];

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (result[c] && result[c][r] === 'baba') {
                babaCount++;
                babaIndices.push(r * cols + c);
            }
        }
    }

    console.log(`🎯 BABA count: ${babaCount}/5`);

    // 🔥 Boom အသံ - Jackpot မဟုတ်တဲ့အခါမှသာ မြည်မယ် (သို့) ဖြုတ်ထားလို့ရတယ်
    if (babaCount >= 2 && babaCount < 5) {
        if (typeof SoundManager !== 'undefined') {
            SoundManager.boom();
        }
    }

     if (babaCount === 5) {
        // Admin က သတ်မှတ်ထားတဲ့ Jackpot Amount ကို ဦးစားပေးယူမယ်
        const jackpotAmount = window.gameState?.babaJackpotMode?.jackpotAmount ||
                              window.gameState.pendingJackpotAmount ||
                              0;

        console.log(` BABA 5 JACKPOT! Amount: ${jackpotAmount}`);

        // Premium Animation + Global Top + Sound
        showJackpotAnimation(jackpotAmount, result);
        GlobalTopManager.submitWin(jackpotAmount, 'jackpot');

        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('jackpotSound'); // Jackpot အတွက် သီးသန့်အသံ
        }

        window.gameState.babaJackpotTriggered = true;

        return {
            totalWin: jackpotAmount,
            indices: babaIndices,
            buffaloIndices: [],
            winLines: [{
                symbol: 'baba',
                name: 'BABA JACKPOT',
                count: 5,
                win: jackpotAmount
            }],
            isBabaJackpot: true
        };
    }
    // ===== ကျွဲရေတွက် =====
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (result[c] && result[c][r] === 'buffalo') {
                buffaloCount++;
                buffaloIndices.push(r * cols + c);
            }
        }
    }

    // ===== Helper: get final multiplier based on symbol and count =====
    function getFinalMultiplier(symbol, count) {
        const multiplier = paytable[symbol]?.[count];
        if (!multiplier) return 0;

        const highValueSymbols = ['buffalo', 'ele', 'lion'];
        if (highValueSymbols.includes(symbol) && count > 5) {
            const extra = (count - 5) * 0.5;
            return multiplier * (1 + extra);
        }
        return multiplier;
    }

    // ===== 1024 ways win ရှာ =====
    for (let r0 = 0; r0 < rows; r0++) {
        const symbol0 = result[0][r0];
        if (!symbol0 || symbol0 === 'bonus') continue;

        for (let r1 = 0; r1 < rows; r1++) {
            const sym1 = result[1][r1];
            if (!(sym1 === symbol0 || sym1 === 'wild')) continue;

            for (let r2 = 0; r2 < rows; r2++) {
                const sym2 = result[2][r2];
                if (!(sym2 === symbol0 || sym2 === 'wild')) continue;

                let streak = 3;
                let winRowIndices = [
                    r0 * cols,
                    r1 * cols + 1,
                    r2 * cols + 2
                ];

                for (let r3 = 0; r3 < rows; r3++) {
                    const sym3 = result[3][r3];
                    if (sym3 === symbol0 || sym3 === 'wild') {
                        streak = 4;
                        winRowIndices.push(r3 * cols + 3);
                        break;
                    }
                }

                if (streak === 4) {
                    for (let r4 = 0; r4 < rows; r4++) {
                        const sym4 = result[4][r4];
                        if (sym4 === symbol0 || sym4 === 'wild') {
                            streak = 5;
                            winRowIndices.push(r4 * cols + 4);
                            break;
                        }
                    }
                }

                const finalMultiplier = getFinalMultiplier(symbol0, streak);
                if (finalMultiplier > 0) {
                    const winAmount = Math.floor(bet * finalMultiplier);
                    totalWin += winAmount;

                    winLines.push({
                        symbol: symbol0,
                        count: streak,
                        win: winAmount,
                        multiplier: finalMultiplier
                    });

                    winIndices.push(...winRowIndices);
                    console.log(`✅ Win found: ${symbol0} x${streak} = ${winAmount}`);
                }
            }
        }
    }

    // ===== THREE-MATCH CONTROL =====
    let threeMatchWinCount = 0;
    winLines.forEach(line => {
        if (line.count === 3) threeMatchWinCount++;
    });

    if (window.gameState && window.gameState.threeMatchControl) {
        window.gameState.threeMatchCount += threeMatchWinCount;
        window.gameState.totalSpinsSinceReset++;

        if (window.gameState.totalSpinsSinceReset >= window.gameState.checkInterval) {
            if (typeof checkThreeMatchRate === 'function') {
                checkThreeMatchRate();
            }
        }
    }

    // ===== VIP အဆင့်အလိုက် အနိုင်ကန့်သတ်ချက် =====
    if (vipConfig && totalWin > 0) {
        const maxWinMultiplier = vipConfig.maxWinMultiplier || 500;
        const minMaxWin = vipConfig.minMaxWin || 3000;
        const calculatedMaxWin = Math.max(bet * maxWinMultiplier, minMaxWin);
        if (totalWin > calculatedMaxWin) {
            console.log(`⚠️ VIP limit applied: ${totalWin} → ${calculatedMaxWin}`);
            totalWin = calculatedMaxWin;
        }
    }

    // ===== ကျွဲ ၂၀ ကောင်နဲ့အထက် Jackpot =====
    if (buffaloCount >= 20) {
        totalWin += window.gameState.jackpot;
        winLines.push({
            symbol: 'buffalo',
            name: 'Buffalo Jackpot',
            win: window.gameState.jackpot
        });
        winIndices.push(...buffaloIndices);
        console.log(`🎰 Buffalo Jackpot! Count: ${buffaloCount}, Prize: ${window.gameState.jackpot}`);
    }

    // ===== Global max win cap =====
    const maxWinPerDeposit = window.gameState.maxWin || 500000;
    let cappedWin = Math.min(totalWin, maxWinPerDeposit);
    totalWin = cappedWin;

    // ===== UI updates =====
if (totalWin > 0) {
    window.gameState.consecutiveWins++;
    window.gameState.winAmount = totalWin;

    updateWinDisplay(totalWin);
    if (typeof addWinToHistory === 'function') addWinToHistory(totalWin);
    if (typeof playWinSounds === 'function') playWinSounds(totalWin, winLines);
    if (typeof showWinLinesInfo === 'function') showWinLinesInfo(winLines);

    const winPercentage = (totalWin / bet) * 100;
    
    // Win Type သတ်မှတ်မယ်
    let winType = 'big';
    if (winPercentage >= 1500) winType = 'mega';
    else if (winPercentage >= 1000) winType = 'super';
    else if (winPercentage >= 500) winType = 'big';

    // ⭐⭐⭐ ဒါပဲ ထပ်ထည့်ပေးပါ ⭐⭐⭐
    // History ထဲ ထည့်မယ် (LocalStorage - Stats Cards အတွက်)
    if (typeof GameHistory !== 'undefined') {
        GameHistory.addEntry(bet, totalWin, winType);
    }

    // Win animations & Global Top (ဒါက ရှိပြီးသား ဆက်ထားပါ)
    if (typeof WinAnimation !== 'undefined') {
        if (winPercentage >= 1500) {
            WinAnimation.mega(totalWin);
            GlobalTopManager.submitWin(totalWin, 'mega');
            if (typeof SoundManager !== 'undefined') {
                SoundManager.congratulations();
                SoundManager.lion();
                SoundManager.coin();
            }
        } else if (winPercentage >= 1000) {
            WinAnimation.super(totalWin);
            GlobalTopManager.submitWin(totalWin, 'super');
            if (typeof SoundManager !== 'undefined') {
                SoundManager.congratulations();
                SoundManager.lion();
                SoundManager.coin();
            }
        } else if (winPercentage >= 500) {
            WinAnimation.big(totalWin);
            GlobalTopManager.submitWin(totalWin, 'big');
            if (typeof SoundManager !== 'undefined') {
                SoundManager.congratulations();
                SoundManager.lion();
                SoundManager.coin();
            }
        }
    }

    if (typeof checkLevelUp === 'function') checkLevelUp();
} else {
    window.gameState.consecutiveWins = 0;
    console.log('❌ No win');
}

    // Remove duplicate indices
    winIndices = [...new Set(winIndices)];

    return {
        totalWin: totalWin,
        indices: winIndices,
        buffaloIndices: buffaloIndices,
        winLines: winLines
    };
}


 // ============================================
// 12. GENERATE SPIN RESULT (REELS ကိုသုံး - FIXED COLUMN 5 BLOCK)
// ============================================
function generateSpinResult() {
    let result = [[], [], [], [], []];

    // ===== 1. 🎯 BABA JACKPOT MODE CHECK =====
    // generateSpinResult ထဲက BABA JACKPOT MODE CHECK အပိုင်း
if (window.gameState.babaJackpotMode?.forceJackpot) {
    const mode = window.gameState.babaJackpotMode.babaMode || 'modeA';
    console.log(`🎰 FORCE BABA JACKPOT! Mode: ${mode}`);

    // 🔥 suspense-ready result ထုတ်မယ် (3 baba + 2 suspense columns)
    result = generateBabaJackpotResult();

    window.gameState.babaJackpotMode.forceJackpot = false;

    // detectSuspenseMode က columnsWithBaba = [0,1,2] နဲ့ columnsToCheck = [3,4] ကို ပြန်ပေးမယ်
    const suspenseInfo = detectSuspenseMode(result);
    window.gameState.suspenseMode = suspenseInfo.isSuspense;
    window.gameState.suspenseColumn = suspenseInfo.isSuspense ? suspenseInfo.columnsToCheck[0] : -1;

    console.log('Suspense Info for Baba Jackpot:', suspenseInfo);
    return result;
}

    // ===== 2. NORMAL သို့မဟုတ် FREE SPIN ရလဒ် ထုတ်မယ် =====
    const currentReels = window.gameState.isFreeSpinning ? FREE_SPIN_REELS : REELS;

    for (let col = 0; col < 5; col++) {
        const reel = currentReels[col];
        const startPos = Math.floor(Math.random() * reel.length);

        for (let row = 0; row < 4; row++) {
            let symbol = reel[(startPos + row) % reel.length];
            result[col].push(symbol);
        }
    }

    // ===== 3. NO-WIN logic =====
    let shouldApplyNoWin = false;

    if (window.gameState.autoNoWinCycle && window.gameState.autoNoWinCycle.enabled) {
        const cycle = window.gameState.autoNoWinCycle;
        if (cycle.currentPhase === 'nowin') {
            shouldApplyNoWin = true;
            cycle.noWinSpins++;
            if (cycle.noWinSpins >= cycle.noWinPhaseLength) {
                cycle.currentPhase = 'normal';
                cycle.normalSpins = 0;
                cycle.noWinSpins = 0;
            }
        } else {
            cycle.normalSpins++;
            if (cycle.normalSpins >= cycle.normalPhaseLength) {
                cycle.currentPhase = 'nowin';
                cycle.normalSpins = 0;
                cycle.noWinSpins = 0;
            }
        }
    } else {
        const adminCtrl2 = window.adminControl2 || { enabled: false };
        shouldApplyNoWin = adminCtrl2.enabled && adminCtrl2.mode === 'always_different';
    }

    if (shouldApplyNoWin) {
        if (window.gameState.autoNoWinCycle && window.gameState.autoNoWinCycle.enabled) {
            forceNoWinByColumns(result);
        } else {
            result = applyAdminControl2(result);
        }
    }

    // ===== 4. ✅ ADMIN CONTROL 1: BUFFALO MODE =====
    const adminCtrl1 = window.adminControl1 || { enabled: false, mode: null };
    if (!window.gameState.isFreeSpinning && adminCtrl1.enabled && adminCtrl1.mode && BUFFALO_MODE_CONFIG[adminCtrl1.mode]) {
        applyBuffaloMode(result, adminCtrl1.mode);
    }

    // ===== 5. 🔍 SUSPENSE MODE DETECTION =====
    const suspenseInfo = detectSuspenseMode(result);
    window.gameState.suspenseMode = suspenseInfo.isSuspense;
    window.gameState.suspenseColumn = suspenseInfo.isSuspense ? suspenseInfo.columnsToCheck[0] : -1;

    console.log("✅ Final Result Ready. Suspense:", window.gameState.suspenseMode);
    return result;
}
function generateNormalResult() {
    const result = [[], [], [], [], []];
    const currentReels = window.gameState.isFreeSpinning ? FREE_SPIN_REELS : REELS;

    for (let col = 0; col < 5; col++) {
        const reel = currentReels[col];
        const startPos = Math.floor(Math.random() * reel.length);

        for (let row = 0; row < 4; row++) {
            let symbol = reel[(startPos + row) % reel.length];

            // Admin Control 2 ရဲ့ Column 5 Block ကို ဒီမှာ ထည့်လို့ရတယ် (လိုအပ်ရင်)
            if (col === 4 && symbol === 'baba') {
                const isAdminAllowed = window.adminControl2 && window.adminControl2.jackpotTrigger;
                if (!isAdminAllowed) {
                    let safeSymbol = symbol;
                    let safetyNet = 0;
                    while ((safeSymbol === 'baba' || safeSymbol === 'bonus') && safetyNet < 10) {
                        safeSymbol = reel[Math.floor(Math.random() * reel.length)];
                        safetyNet++;
                    }
                    symbol = safeSymbol;
                }
            }

            result[col][row] = symbol;
        }
    }
    return result;
}
function forceNoWinByColumns(result) {
    const allSymbols = ['seven', 'jack', 'queen', 'nine', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'ten'];

    for (let row = 0; row < 4; row++) {
        result[0][row] = allSymbols[Math.floor(Math.random() * allSymbols.length)];
    }

    const usedInCol0 = new Set(result[0]);
    let availableForCol1 = allSymbols.filter(s => !usedInCol0.has(s));

    if (availableForCol1.length < 4) {
        availableForCol1 = [...allSymbols];
    }

    for (let row = 0; row < 4; row++) {
        result[1][row] = availableForCol1[Math.floor(Math.random() * availableForCol1.length)];
    }

    for (let row = 0; row < 4; row++) {
        if (result[0][row] === 'wild') result[0][row] = 'nine';
        if (result[1][row] === 'wild') result[1][row] = 'ten';
    }

    console.log('🔧 forceNoWinByColumns: col0 and col1 symbol sets are disjoint → guaranteed no win');
}
// ===== ADMIN CONTROL 2 - NOWIN CONTROL =====
window.adminControl2 = {
    enabled: false,
    mode: 'normal'
};

// ✅ GLOBAL SYMBOLS (တစ်နေရာတည်း)
window.symbolsWithoutWild = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus'];

let uniqueModeSpinCounter = 0;
let duplicateAllowedThisSpin = false;
const DUPLICATE_INTERVAL = 20;

function listenToAdminControl2() {
    if (!window.firebase || !window.firebase.firestore) {
        console.warn('⚠️ Firebase not available, admin control 2 disabled');
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

                if (window.adminControl2.enabled) {
                    uniqueModeSpinCounter = 0;
                    duplicateAllowedThisSpin = false;
                }
            } else {
                console.log('⚠️ No adminControl2 document found, using default');
                window.adminControl2.enabled = false;
                window.adminControl2.mode = 'normal';
            }
        }, (error) => {
            console.error('❌ Error listening to admin control 2:', error);
        });
}

function applyAdminControl2(result) {
    const adminCtrl = window.adminControl2 || { enabled: false, mode: 'normal' };

    if (!adminCtrl.enabled || adminCtrl.mode !== 'always_different') {
        return result;
    }

    console.log('🎯 Admin Control 2 ACTIVE: Making Col 0 and Col 1 different');
    
    // ✅ global symbolsWithoutWild ကိုသုံးမယ်
    const symbols = window.symbolsWithoutWild;
    let pool = [...symbols];
    let selectedCol0 = [];
    let selectedCol1 = [];

    for (let i = 0; i < 4; i++) {
        if (pool.length === 0) pool = [...symbols];
        let randomIndex = Math.floor(Math.random() * pool.length);
        selectedCol0.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }

    for (let i = 0; i < 4; i++) {
        if (pool.length === 0) {
            const remaining = symbols.filter(s => !selectedCol0.includes(s));
            pool = remaining.length > 0 ? [...remaining] : [...symbols];
        }
        let randomIndex = Math.floor(Math.random() * pool.length);
        selectedCol1.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }

    for (let row = 0; row < 4; row++) {
        result[0][row] = selectedCol0[row];
        result[1][row] = selectedCol1[row];
    }

    for (let row = 0; row < 4; row++) {
        if (result[0][row] === 'wild') {
            result[0][row] = symbols[Math.floor(Math.random() * symbols.length)];
        }
        if (result[1][row] === 'wild') {
            result[1][row] = symbols[Math.floor(Math.random() * symbols.length)];
        }
    }

    console.log('🎯 Admin Control 2 Applied - Sample:',
        result[0].map((v,i) => `${v}-${result[1][i]}`).join(', '));

    return result;
}

document.addEventListener('DOMContentLoaded', function() {
    listenToAdminControl2();
    console.log('🎮 Admin Control 2 listener started');
  });

// ============================================
// STAGGERED ANIMATION WITH SUSPENSE (FIXED)
// ============================================
function animateReelsStaggered(finalResult) {
    var cells = document.querySelectorAll('.grid-cell');
    if (cells.length === 0) return;

    console.log('🎰 Real slot machine animation started');

    // Reset all cells
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var img = cell.querySelector('img');
        if (img) {
            img.style.transition = '';
            img.style.transform = '';
            img.style.opacity = '';
            img.style.filter = '';
        }
        cell.classList.remove('reel-shake', 'baba-glow', 'rise-column', 'fall-column', 'red-border-line', 'yellow-border-line', 'spin-column');
        cell.style.boxShadow = '';
        cell.style.borderRadius = '';
    }

    // Check for suspense mode
    var suspenseInfo = detectSuspenseMode(finalResult);
    
    if (suspenseInfo.isSuspense && suspenseInfo.babaCount >= 3) {
        console.log('🎬 SUSPENSE MODE ACTIVATED! Baba count: ' + suspenseInfo.babaCount);
        // Start suspense animation - it will dispatch animationComplete when done
        startSuspenseAnimation(finalResult, suspenseInfo);
    } else {
        // Normal animation
        startGravityDropAnimation(finalResult);
    }
}



function startGravityDropAnimation(finalResult) {
    const cells = document.querySelectorAll('.grid-cell');
    const cols = 5;
    const rows = 4;
    
    // ===== အချိန်သတ်မှတ်ချက်များ (မြန်ဆန်စေရန် လျှော့ထားသည်) =====
    const colDelay = 60;
    const rowDelay = 30;
    const dropDuration = 350;
    // ============================================
    
    cells.forEach(cell => {
        const img = cell.querySelector('img');
        if (img) {
            img.style.transition = '';
            img.style.transform = '';
            img.style.opacity = '';
        }
        cell.classList.remove('reel-shake', 'baba-glow');
    });
    
    for (let col = 0; col < cols; col++) {
        const columnCells = Array.from(cells).filter(cell => parseInt(cell.dataset.col) === col);
        
        setTimeout(() => {
            columnCells.forEach((cell, row) => {
                const img = cell.querySelector('img');
                if (!img) return;
                
                const symbol = finalResult[col][row];
                if (!symbol) return;
                
                img.src = `images/${symbol}.png`;
                cell.dataset.symbol = symbol;
                
                img.style.transition = 'none';
                img.style.transform = 'translateY(-250px)';
                img.style.opacity = '0';
                
                setTimeout(() => {
                    // 🔥 Gravity Curve (cubic-bezier) - အရှိန်နဲ့ကျပြီး အောက်မှာ နည်းနည်းခုန်တဲ့ Effect
                    img.style.transition = `transform ${dropDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1.2), opacity 150ms`;
                    img.style.transform = 'translateY(0)';
                    img.style.opacity = '1';
                    
                    setTimeout(() => {
                        img.style.transition = '';
                        if (symbol === 'baba') {
                            cell.classList.add('baba-glow');
                        }
                    }, dropDuration + 20);
                }, row * rowDelay);
            });
            
            if (col === cols - 1) {
                const totalDelay = (rows - 1) * rowDelay + dropDuration + 50;
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('animationComplete'));
                    console.log('✅ Gravity Drop Animation Complete (Fast)');
                }, totalDelay);
            }
        }, col * colDelay);
    }
}
// ===== CELEBRATE BABA IN COLUMN =====
function celebrateBabaInColumn(col) {
    const colCells = getColumnCells(col);
    
    colCells.forEach(cell => {
        const img = cell.querySelector('img');
        if (img && img.src && img.src.includes('baba')) {
            cell.classList.add('baba-glow');
            
            // Sparkle effects
            const rect = cell.getBoundingClientRect();
            for (let i = 0; i < 8; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                    position: fixed;
                    left: ${rect.left + rect.width/2 + (Math.random() - 0.5) * 40}px;
                    top: ${rect.top + rect.height/2 + (Math.random() - 0.5) * 40}px;
                    font-size: ${16 + Math.random() * 12}px;
                    animation: sparklePop 0.5s ease-out forwards;
                    pointer-events: none;
                    z-index: 99998;
                `;
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 500);
            }
        }
    });
    
    // ဂုဏ်ပြုအသံ
    if (typeof SoundManager !== 'undefined') {
        SoundManager.lion();
       SoundManager.boom();
    }
}

// ===== GET COLUMN CELLS HELPER =====
function getColumnCells(col) {
    return Array.from(document.querySelectorAll('.grid-cell'))
        .filter(cell => parseInt(cell.dataset.col) === col);
}

// ===== CHECK THREE MATCH RATE =====
function checkThreeMatchRate() {
    const state = window.gameState;
    const expectedCount = Math.floor(state.checkInterval * state.targetThreeMatchRate);

    console.log(`🎯 Three-match check: ${state.threeMatchCount}/${expectedCount} in last ${state.checkInterval} spins`);

    if (state.threeMatchCount > expectedCount) {
        state.reduceThreeMatch = true;
        console.log('⚠️ Reducing three-match probability for next spins');
    } else {
        state.reduceThreeMatch = false;
    }

    state.threeMatchCount = 0;
    state.totalSpinsSinceReset = 0;
}

const suspenseStyles = document.createElement('style');
suspenseStyles.textContent = `
    @keyframes columnShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    @keyframes sparklePop {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
    }
    @keyframes babaHop {
        0% { transform: translateY(0) scale(1); }
        30% { transform: translateY(-15px) scale(1.2); }
        60% { transform: translateY(5px) scale(1.05); }
        100% { transform: translateY(0) scale(1); }
    }
    @keyframes colRise {
        0% { transform: translateY(0); }
        100% { transform: translateY(-20px); }
    }
    @keyframes babaJackpotPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    @keyframes babaWave {
        0% { transform: translateY(0); }
        100% { transform: translateY(-20px); }
    }
    
    /* မီးလောင်နေတဲ့ Glow Effect */
.suspense-glow {
    box-shadow: 0 0 15px #ff4500, 0 0 30px #ff8c00, inset 0 0 15px #ff4500 !important;
    border: 3px solid #ffd700 !important;
    border-radius: 15px;
    animation: fireGlow 1.5s infinite alternate;
    z-index: 10;
}

@keyframes fireGlow {
    0% {
        box-shadow: 0 0 10px #ff4500, 0 0 20px #ff8c00;
        filter: brightness(1);
    }
    100% {
        box-shadow: 0 0 25px #ff0000, 0 0 50px #ff4500, 0 0 10px #ffff00;
        filter: brightness(1.3);
    }
}

/* Column ကြွတက်တဲ့အခါ ပိုလှအောင် */
.rise-column {
    transform: translateY(-20px) scale(1.05);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

    
    .yellow-border-line {
        box-shadow: 0 0 0 3px #ffd700, 0 0 20px #ffd700 !important;
        border-radius: 50%;
        transition: all 0.2s;
    }
    
    .fall-column {
        animation: colRiseReverse 0.3s ease-in forwards !important;
    }
    
    @keyframes colRiseReverse {
        0% { transform: translateY(-20px); }
        100% { transform: translateY(0); }
    }
    
    .spin-column {
        animation: columnSpin 0.15s linear infinite !important;
    }
    
    @keyframes columnSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .radius-active {
        border-radius: 20px !important;
        border: 2px solid #ffd700 !important;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5) !important;
    }
    
    .col-rise {
        animation: colRise 0.3s ease-out forwards !important;
    }
    
    .baba-radius {
        border-radius: 50% !important;
        box-shadow: 0 0 20px rgba(255, 68, 68, 0.8) !important;
    }
`;
document.head.appendChild(suspenseStyles);

// ============================================
// 15. CLEAR ALL WIN HIGHLIGHTS
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
// 16. COUNT BUFFALO FUNCTION
// ============================================
function countBuffalo(result) {
    let count = 0;
    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 4; r++) {
            if (result[c] && result[c][r] === 'buffalo') {
                count++;
            }
        }
    }
    return count;
}

// ============================================
// 17. WIN HIGHLIGHT & RISE ANIMATIONS
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
// 31. ADD PREMIUM STYLES
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
        @keyframes coinFountain {
            0% {
                bottom: 0%;
                transform: scale(0.6) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            30% {
                bottom: 50%;
                transform: scale(1.2) rotate(180deg);
            }
            50% {
                bottom: 65%;
                transform: scale(1.1) rotate(360deg);
            }
            70% {
                bottom: 40%;
                transform: scale(0.9) rotate(480deg);
            }
            100% {
                bottom: -10%;
                transform: scale(0.5) rotate(720deg);
                opacity: 0;
            }
        }

        @keyframes sparkleRain {
            0% {
                transform: translateY(0) scale(0);
                opacity: 0;
            }
            20% {
                transform: translateY(-20px) scale(1);
                opacity: 1;
            }
            80% {
                transform: translateY(-60px) scale(0.8);
                opacity: 0.8;
            }
            100% {
                transform: translateY(-100px) scale(0);
                opacity: 0;
            }
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
        @keyframes jackpotAwardPop {
            0% { transform: translate(-50%, -50%) scale(0.1) rotate(-180deg); opacity: 0; }
            60% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
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
// FREE SPIN SUSPENSE MODE (Jackpot Mode Style)
// ============================================

// ===== MAIN ENTRY: Bonus စစ်တဲ့အခါ ဒီ function ကိုသုံးမယ် =====
function checkScatterWithSuspense(result) {
    let bonusColumns = [];
    let nonBonusColumns = [];
    
    for (let col = 0; col < 5; col++) {
        let hasBonus = false;
        for (let row = 0; row < 4; row++) {
            if (result[col][row] === 'bonus') {
                hasBonus = true;
                break;
            }
        }
        if (hasBonus) {
            bonusColumns.push(col);
        } else {
            nonBonusColumns.push(col);
        }
    }
    
    let bonusCount = bonusColumns.length;
    console.log(`📊 Bonus Columns: ${bonusColumns} (Total: ${bonusCount})`);
    
    // ===== FREE SPIN အတွင်း BONUS ထပ်ကျရင် (Bonus 2 လုံးကျရင်တောင် ရမယ်) =====
    if (window.gameState.isFreeSpinning && bonusCount >= 2) {
        let extraSpins = calculateExtraSpins(bonusCount);
        window.gameState.freeSpins += extraSpins;
        window.gameState.totalFreeSpins += extraSpins;
        updateFreeSpinIndicator();
        showNotification(`✨ Bonus ${bonusCount} လုံးကျပါသည်။ အပို Free Spin ${extraSpins} ကြိမ် ထပ်ရရှိပါသည်။`, 'success');
        showExtraFreeSpinAnimation(extraSpins);
        return bonusCount;
    }
    
    // ===== ပုံမှန် Suspense Mode (Bonus 2 လုံးကျရင် စမယ်) =====
    if (!window.gameState.isFreeSpinning && bonusCount >= 2) {
        startFreeSpinSuspense(result, bonusColumns, nonBonusColumns, bonusCount);
    }
    
    return bonusCount;
}
// ===== FREE SPIN SUSPENSE SEQUENCE START =====
function startFreeSpinSuspense(finalResult, bonusColumns, nonBonusColumns, bonusCount) {
    console.log('🎬 FREE SPIN SUSPENSE MODE ACTIVATED!');
    
    // Bonus ပါတဲ့ Column တွေကို ချက်ချင်း Lock+Reveal
    bonusColumns.forEach(col => {
        lockAndRevealBonusColumn(col, finalResult[col]);
    });
    
    // Bonus မပါတဲ့ Column တွေကို Suspense နဲ့ ဆက်စစ်မယ်
    if (nonBonusColumns.length > 0) {
        // Free Spin ပမာဏကို ကြိုသိမ်းထား
        let freeSpinCount = calculateFreeSpinCount(bonusCount);
        
        // Suspense စမယ်
        startFreeSpinSuspenseSequence(finalResult, nonBonusColumns, 0, bonusCount, freeSpinCount);
    } else {
        // အကုန်လုံး Bonus ပါရင် ချက်ချင်း Free Spin စ
        initializeFreeSpinsDirect(bonusCount, calculateFreeSpinCount(bonusCount));
    }
}
// ===== SUSPENSE SEQUENCE: Column တစ်ခုချင်းစီ စစ်မယ် =====
function startFreeSpinSuspenseSequence(finalResult, columnsToCheck, index, bonusCount, freeSpinCount) {
    if (index >= columnsToCheck.length) {
        // အကုန်စစ်ပြီးရင် - စုစုပေါင်း Bonus အရေအတွက် ပြန်ရေတွက်မယ်
        let totalBonusCount = countTotalBonuses(finalResult);
        console.log(`📊 Total Bonus Count after suspense: ${totalBonusCount}`);
        
        if (totalBonusCount >= 3) {
            // Bonus 3 လုံးနဲ့အထက်ဆိုရင် Free Spin ပေးမယ်
            let finalFreeSpinCount = calculateFreeSpinCount(totalBonusCount);
            finishFreeSpinSuspense(totalBonusCount, finalFreeSpinCount);
        } else {
            // Bonus 2 လုံးပဲရှိရင် Free Spin မပေးဘူး
            console.log('⚠️ Only 2 bonuses total → NO free spins');
            removeAllBorders();
            disableButtons(false);
            window.gameState.isSpinning = false;
        }
        return;
    }
   

    // ===== Bonus စုစုပေါင်း အရေအတွက် ပြန်ရေတွက်မယ် =====
function countTotalBonuses(result) {
    let count = 0;
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 4; row++) {
            if (result[col][row] === 'bonus') {
                count++;
            }
        }
    }
    return count;
} 
    let col = columnsToCheck[index];
    let isLastColumn = (index === columnsToCheck.length - 1);
    let targetSymbols = finalResult[col];
    let hasBonusInThisCol = targetSymbols.some(s => s === 'bonus');
    
    if (hasBonusInThisCol) {
        // Bonus ပါရင် ချက်ချင်းပြ
        console.log(`⏩ Column ${col} has Bonus, revealing instantly...`);
        revealColumnInstantly(col, targetSymbols);
        lockColumn(col);
        
        setTimeout(() => {
            startFreeSpinSuspenseSequence(finalResult, columnsToCheck, index + 1, bonusCount, freeSpinCount);
        }, 400);
    } else {
        // Bonus မပါရင် Suspense နဲ့ စစ်မယ်
        console.log(`🔍 Column ${col} suspense check...`);
        
        // Visual Effect
        addRedBorderToColumn(col);
        let cells = getColumnCells(col);
        cells.forEach(cell => cell.classList.add('rise-column'));
        
        // Sound Effect (Jackpot Mode အတိုင်း)
        if (typeof SoundManager !== 'undefined') {
            SoundManager.lion();
            SoundManager.boom();
        }
        
        // Spin Duration (နောက်ဆုံး Column ဆိုရင် ပိုကြာ)
        let spinDuration = isLastColumn ? 7000 : 5000;
        
        // Fast Random Spin
        fastRandomSpin(col, spinDuration, () => {
            // Slow Reveal
            slowRevealColumn(col, targetSymbols, (hasBonus) => {
                removeRedBorderFromColumn(col);
                cells.forEach(c => c.classList.remove('rise-column'));
                
                if (hasBonus) {
                    lockColumn(col);
                }
                
                setTimeout(() => {
                    startFreeSpinSuspenseSequence(finalResult, columnsToCheck, index + 1, bonusCount, freeSpinCount);
                }, 500);
            });
        });
    }
}

// ===== BONUS COLUMN ကို ချက်ချင်း Lock + Reveal =====
function lockAndRevealBonusColumn(col, targetSymbols) {
    let cells = getColumnCells(col);
    
    cells.forEach((cell, row) => {
        let img = cell.querySelector('img');
        let symbol = targetSymbols[row];
        
        if (img && symbol) {
            img.src = 'images/' + symbol + '.png';
            img.style.opacity = '1';
            img.style.transition = 'all 0.3s ease';
            cell.dataset.symbol = symbol;
            
            if (symbol === 'bonus') {
                addBonusGlow(cell);
                if (typeof SoundManager !== 'undefined' && SoundManager.boom) {
                    SoundManager.boom();
                }
            }
        }
    });
    
    // Lock Column Visual
    cells.forEach(cell => {
        cell.classList.add('locked-column');
        cell.style.opacity = '0.9';
        cell.style.filter = 'brightness(1.1)';
    });
    
    console.log(`🔒 Bonus Column ${col} LOCKED`);
}

// ===== COLUMN ကို Lock ချမယ် =====
function lockColumn(col) {
    let cells = getColumnCells(col);
    cells.forEach(cell => {
        cell.classList.add('locked-column');
        cell.style.opacity = '0.9';
        cell.style.filter = 'brightness(1.1)';
    });
}

// ===== SLOW REVEAL (Row by Row) =====
function slowRevealColumn(col, targetSymbols, onComplete) {
    let colCells = getColumnCells(col);
    let rowIndex = 0;
    let hasBonus = false;
    
    function revealNextRow() {
        if (rowIndex >= colCells.length) {
            setTimeout(() => {
                if (onComplete) onComplete(hasBonus);
            }, 300);
            return;
        }
        
        let cell = colCells[rowIndex];
        let img = cell.querySelector('img');
        let symbol = targetSymbols[rowIndex];
        
        if (img && symbol) {
            img.src = 'images/' + symbol + '.png';
            img.style.transition = 'none';
            img.style.opacity = '0';
            img.style.transform = 'translateY(-50px) scale(0.8)';
            
            setTimeout(() => {
                img.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                img.style.opacity = '1';
                img.style.transform = 'translateY(0) scale(1)';
                cell.dataset.symbol = symbol;
                
                if (symbol === 'bonus') {
                    hasBonus = true;
                    addBonusGlow(cell);
                    if (typeof SoundManager !== 'undefined' && SoundManager.boom) {
                        SoundManager.boom();
                    }
                }
            }, 50);
        }
        
        rowIndex++;
        setTimeout(revealNextRow, 150);
    }
    
    revealNextRow();
}
function addBonusGlow(cell) {
    const img = cell.querySelector('img');
    if (img) {
        // Inline styles
        img.style.borderRadius = '50%';
        img.style.boxShadow = '0 0 0 4px #ffd700, 0 0 25px #ffd700';
        img.style.padding = '4px';
        img.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        
        // Cell background
        cell.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
        cell.dataset.symbol = 'bonus';
        
        // Add a class for easier cleanup
        cell.classList.add('bonus-glow-cell');
        img.classList.add('bonus-glow-img');
    }
}
function finishFreeSpinSuspense(bonusCount, freeSpinCount) {
    console.log('✅ Free Spin Suspense Finished!');
    
    // ⭐ Borders အကုန်ရှင်းမယ်
    removeAllBorders();
    
    // ⭐ နောက်ထပ် သေချာအောင် ထပ်ရှင်းမယ်
    setTimeout(() => {
        removeAllBorders();  // ထပ်ခေါ်
    }, 100);
    
    if (bonusCount >= 3) {
        initializeFreeSpinsDirect(bonusCount, freeSpinCount);
    } else {
        disableButtons(false);
        window.gameState.isSpinning = false;
        removeAllBorders();  // ထပ်ရှင်း
    }
}
// ===== FREE SPIN ပမာဏ တွက်မယ် =====
function calculateFreeSpinCount(bonusCount) {
    let freeSpinCount = 10;  // Bonus 3 လုံးအတွက် 10 ကြိမ်
    if (bonusCount >= 4) freeSpinCount = 15;
    if (bonusCount >= 5) freeSpinCount = 20;
    if (bonusCount >= 6) freeSpinCount = 25;
    if (bonusCount >= 7) freeSpinCount = 30;
    if (bonusCount >= 8) freeSpinCount = 40;
    if (bonusCount >= 9) freeSpinCount = 50;
    if (bonusCount >= 10) freeSpinCount = 60;
    return freeSpinCount;
}

// ===== EXTRA SPINS တွက်မယ် =====
function calculateExtraSpins(bonusCount) {
    let extraSpins = 5;
    if (bonusCount >= 4) extraSpins = 8;
    if (bonusCount >= 5) extraSpins = 12;
    if (bonusCount >= 6) extraSpins = 15;
    return extraSpins;
}

// ===== DIRECT FREE SPIN INIT (Suspense မပါ) =====
function initializeFreeSpinsDirect(bonusCount, freeSpinCount) {
    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = freeSpinCount;
    window.gameState.totalFreeSpins = freeSpinCount;
    window.gameState.freeSpinBonusCount = bonusCount;
    
    disableButtons(true);
    showFreeSpinIndicator();
    showFreeSpinStartAnimation(freeSpinCount);
    showNotification(`✨ Free Spin ${freeSpinCount} ကြိမ် ရရှိပါသည်။ (Bonus ${bonusCount} လုံး)`, 'success');
    
    setTimeout(() => {
        spin();
    }, 1500);
}

// ===== HELPER FUNCTIONS =====
function getColumnCells(col) {
    let cells = [];
    for (let row = 0; row < 4; row++) {
        let cell = document.querySelector(`.grid-cell[data-col="${col}"][data-row="${row}"]`);
        if (cell) cells.push(cell);
    }
    return cells;
}

function addRedBorderToColumn(col) {
    const cells = getColumnCells(col);
    cells.forEach(cell => {
        cell.classList.add('suspense-glow');
        // ဒါ့အပြင် inline style ထပ်ထည့်မယ်
        cell.style.boxShadow = '0 0 0 3px #ff0000, 0 0 20px rgba(255,0,0,0.5)';
        cell.style.border = '2px solid #ff0000';
        cell.style.borderRadius = '8px';
    });
}

function removeRedBorderFromColumn(col) {
    const cells = getColumnCells(col);
    cells.forEach(cell => {
        cell.classList.remove('suspense-glow');
        // Inline style တွေကို ရှင်းမယ်
        cell.style.boxShadow = '';
        cell.style.border = '';
        cell.style.borderRadius = '';
    });
}
function removeAllBorders() {
    console.log('🧹 Removing all borders, glows, and bonus effects...');
    
    const allCells = document.querySelectorAll('.grid-cell');
    
    allCells.forEach(cell => {
        // Remove all CSS classes
        cell.classList.remove(
            'suspense-glow', 'locked-column', 'rise-column', 
            'red-border-line', 'yellow-border-line', 'bonus-glow-cell'
        );
        
        // Reset cell inline styles
        cell.style.border = '';
        cell.style.borderRadius = '';
        cell.style.boxShadow = '';
        cell.style.transform = '';
        cell.style.transition = '';
        cell.style.backgroundColor = '';
        cell.style.opacity = '';
        cell.style.filter = '';
        cell.style.outline = '';
        cell.dataset.symbol = '';
        
        // 🔥 Reset image styles (THIS IS KEY FOR BONUS GLOW)
        const img = cell.querySelector('img');
        if (img) {
            img.style.borderRadius = '';
            img.style.boxShadow = '';
            img.style.padding = '';
            img.style.backgroundColor = '';
            img.style.transform = '';
            img.style.opacity = '';
            img.style.transition = '';
            img.style.border = '';
            img.style.outline = '';
            img.classList.remove('bonus-glow-img');
        }
    });
    
    console.log('✅ All borders, glows, and bonus effects removed');
}
// Bonus Glow ပျောက်သွားလား စစ်ဖို့
function checkForRemainingBonusGlow() {
    const allImages = document.querySelectorAll('.grid-cell img');
    let hasGlow = false;
    
    allImages.forEach(img => {
        if (img.style.borderRadius === '50%' || img.style.boxShadow.includes('ffd700')) {
            console.warn('⚠️ Bonus glow still present on:', img);
            hasGlow = true;
        }
    });
    
    if (!hasGlow) {
        console.log('✅ No bonus glow found - clean!');
    }
}

// Suspense ပြီးတိုင်း ဒီလိုခေါ်ပါ
removeAllBorders();
checkForRemainingBonusGlow();
// ============================================
// 18. FREE SPIN FUNCTIONS (FIXED - NO SUSPENSE)
// ============================================

function startFreeSpins(bonusCount) {
    // Bonus အရေအတွက်အလိုက် Free Spin ပမာဏ
    let freeSpinCount = 10;  // Bonus 3 ခုအတွက် 10 ကြိမ်

    if (bonusCount >= 4) freeSpinCount = 15;
    if (bonusCount >= 5) freeSpinCount = 20;
    if (bonusCount >= 6) freeSpinCount = 25;
    if (bonusCount >= 7) freeSpinCount = 30;
    if (bonusCount >= 8) freeSpinCount = 40;
    if (bonusCount >= 9) freeSpinCount = 50;
    if (bonusCount >= 10) freeSpinCount = 60;

    console.log(`🎰 Starting Free Spins! Bonus: ${bonusCount}, Free Spins: ${freeSpinCount}`);

    // Set game state
    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = freeSpinCount;
    window.gameState.totalFreeSpins = freeSpinCount;
    window.gameState.freeSpinBonusCount = bonusCount;

    // Disable buttons
    disableButtons(true);

    // Show indicator
    showFreeSpinIndicator();

    // Show start animation
    showFreeSpinStartAnimation(freeSpinCount);

    // Show notification
    showNotification(`✨ Free Spin ${freeSpinCount} ကြိမ် ရရှိပါသည်။ (Bonus ${bonusCount} လုံး)`, 'success');

    // Start first free spin
    setTimeout(() => {
        spin();
    }, 1500);
}

// ===== HANDLE FREE SPIN AFTER EACH SPIN =====
function handleFreeSpin() {
    if (!window.gameState.isFreeSpinning) return;

    // ✅ Win Animation ပြနေရင် စောင့်မယ်
    if (window.gameState.waitingForWinAnimation) {
        console.log('⏳ Waiting for win animation to finish...');
        setTimeout(() => handleFreeSpin(), 500);
        return;
    }

    if (window.gameState.freeSpins > 0) {
        window.gameState.freeSpins--;
        updateFreeSpinIndicator();

        console.log(`🎰 Free Spins left: ${window.gameState.freeSpins} / ${window.gameState.totalFreeSpins}`);

        if (window.gameState.freeSpins > 0) {
            // ✅ Animation ပြီးမှ နောက် Free Spin ကိုဆက်မယ်
            setTimeout(() => {
                spin();
            }, 1500);
        } else {
            endFreeSpins();
        }
    } else {
        endFreeSpins();
    }
}

// ===== CONTINUE FREE SPIN AFTER WIN (တစ်ခုတည်းသာ ထားမယ် - duplicate ဖျက်ပြီး) =====
function continueFreeSpinAfterWin() {
    if (!window.gameState.isFreeSpinning) return;

    if (window.gameState.freeSpins > 0) {
        window.gameState.freeSpins--;
        updateFreeSpinIndicator();

        console.log(`🎰 Free Spins left after win: ${window.gameState.freeSpins} / ${window.gameState.totalFreeSpins}`);

        if (window.gameState.freeSpins > 0) {
            setTimeout(() => {
                spin();
            }, 500);
        } else {
            endFreeSpins();
        }
    } else {
        endFreeSpins();
    }
}

// ===== END FREE SPINS =====
function endFreeSpins() {
    console.log('🎰 Free Spins ended');

    const totalWin = window.gameState.freeSpinTotalWin || 0;

    // Add total win to balance
    if (totalWin > 0) {
        window.gameState.balance += totalWin;
        window.gameState.displayBalance += totalWin;
        updateBalanceDisplay();

        // Win Box မှာ စုစုပေါင်းကို ပြပြီးမှ ပြန်ရှင်းမယ်
        updateWinDisplay(totalWin);

        // Show big win animation
        if (typeof WinAnimations !== 'undefined') {
            if (totalWin >= 50000) {
                WinAnimations.mega(totalWin);
            } else if (totalWin >= 15000) {
                WinAnimations.super(totalWin);
            } else if (totalWin >= 5000) {
                WinAnimations.big(totalWin);
            }
        }

        showNotification(`🎉 Free Spin ပြီးဆုံးပါသည်။ စုစုပေါင်း ${formatNumber(totalWin)} ကျပ် ရရှိပါသည်။`, 'success');
    }

    // Reset free spin state
    window.gameState.isFreeSpinning = false;
    window.gameState.freeSpins = 0;
    window.gameState.totalFreeSpins = 0;
    window.gameState.freeSpinTotalWin = 0;
    window.gameState.freeSpinBonusCount = 0;

    // Hide indicator
    hideFreeSpinIndicator();

    // Enable buttons
    disableButtons(false);

    // Show end animation
    showFreeSpinEndAnimation(totalWin);

    // Clear win display after 3 seconds
    setTimeout(() => {
        updateWinDisplay(0);
    }, 3000);

    // Update Firestore
    updateUserBalanceInStorage();
}

// ===== CHECK SCATTER (BONUS) - UPDATED: 3 BONUS = START =====
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

    // ===== FREE SPIN အတွင်း BONUS ထပ်ကျရင် =====
    if (window.gameState.isFreeSpinning && bonusCount >= 3) {
        // အပို Free Spin ထပ်ထည့်
        let extraSpins = 5;
        
        if (bonusCount >= 4) extraSpins = 8;
        if (bonusCount >= 5) extraSpins = 12;
        if (bonusCount >= 6) extraSpins = 15;
        
        window.gameState.freeSpins += extraSpins;
        window.gameState.totalFreeSpins += extraSpins;

        console.log(`🎰 Extra Free Spins! +${extraSpins} (Total left: ${window.gameState.freeSpins})`);

        // Update indicator
        updateFreeSpinIndicator();

        // Show notification
        showNotification(`✨ Bonus ${bonusCount} လုံးကျပါသည်။ အပို Free Spin ${extraSpins} ကြိမ် ထပ်ရရှိပါသည်။`, 'success');

        // Show extra spins animation
        showExtraFreeSpinAnimation(extraSpins);

        return bonusCount;
    }

    // ===== ပုံမှန် Free Spin စတာ (၃ လုံးကျမှ) =====
    if (!window.gameState.isFreeSpinning && bonusCount >= 3) {
        startFreeSpins(bonusCount);
    }

    return bonusCount;
}

// ===== UPDATE FREE SPIN INDICATOR =====
function showFreeSpinIndicator() {
    let indicator = document.getElementById('freeSpinIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'freeSpinIndicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #0a2a1a, #1a3a2a);
            border-left: 4px solid #00ffaa;
            border-radius: 16px;
            padding: 12px 20px;
            font-weight: 900;
            z-index: 99999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 20px rgba(0,255,170,0.3);
            text-align: left;
            min-width: 150px;
            backdrop-filter: blur(8px);
        `;
        document.body.appendChild(indicator);
    }

    indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 32px;">🎰</div>
            <div>
                <div style="font-size: 10px; color: #00ffaa; letter-spacing: 2px;">FREE SPINS ACTIVE</div>
                <div style="font-size: 32px; font-weight: 900; color: #ffffff; line-height: 1; text-shadow: 0 0 10px #00ffaa;">
                    ${window.gameState.freeSpins}
                </div>
                <div style="font-size: 10px; color: #88ffaa;">out of ${window.gameState.totalFreeSpins}</div>
            </div>
        </div>
    `;
}

function updateFreeSpinIndicator() {
    const indicator = document.getElementById('freeSpinIndicator');
    if (indicator) {
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 32px;">🎰</div>
                <div>
                    <div style="font-size: 10px; color: #00ffaa; letter-spacing: 2px;">FREE SPINS ACTIVE</div>
                    <div style="font-size: 32px; font-weight: 900; color: #ffffff; line-height: 1; text-shadow: 0 0 10px #00ffaa;">
                        ${window.gameState.freeSpins}
                    </div>
                    <div style="font-size: 10px; color: #88ffaa;">out of ${window.gameState.totalFreeSpins}</div>
                </div>
            </div>
        `;
    }
}

function hideFreeSpinIndicator() {
    const indicator = document.getElementById('freeSpinIndicator');
    if (indicator) {
        indicator.remove();
    }
}
// Add keyframe animation for indicator
if (!document.querySelector('#indicator-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'indicator-animation-styles';
    style.textContent = `
        @keyframes indicatorGlow {
            0% {
                box-shadow: 0 0 20px rgba(0,212,255,0.3), 0 0 5px rgba(0,212,255,0.2);
                border-color: rgba(0,212,255,0.5);
            }
            100% {
                box-shadow: 0 0 40px rgba(0,212,255,0.8), 0 0 20px rgba(0,212,255,0.5);
                border-color: rgba(0,212,255,1);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== FREE SPIN ANIMATIONS =====
function showFreeSpinStartAnimation(spins) {
    const overlay = document.createElement('div');
    overlay.className = 'freespin-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000000dd, #ff6b6baa, #4ecdc4aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; animation: spinPop 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);">
            <div style="font-size: 100px; margin-bottom: 20px; animation: bounce 0.5s infinite alternate;">🎰</div>
            <div style="font-size: 80px; font-weight: 900; color: #ffd700;
                        text-shadow: 0 0 30px #ffaa00, 0 0 60px #ff5500;
                        margin-bottom: 20px;
                        background: linear-gradient(45deg, #ffd700, #ffaa00, #ff6600);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;">
                FREE SPINS
            </div>
            <div style="font-size: 120px; font-weight: 900; color: #00ff00;
                        text-shadow: 0 0 40px #00ff00, 0 0 80px #00aa00;
                        margin-bottom: 30px;
                        animation: pulse 1s infinite;">
                ${spins}
            </div>
            <div style="font-size: 40px; color: white; background: rgba(0,0,0,0.5); padding: 10px 30px; border-radius: 50px;">
                ကြိမ် ရရှိပါသည်။
            </div>
        </div>
    `;

    // Add floating particles
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                width: ${5 + Math.random() * 15}px;
                height: ${5 + Math.random() * 15}px;
                background: ${['#ffd700', '#ffaa00', '#ff6600', '#ff3300'][Math.floor(Math.random() * 4)]};
                border-radius: 50%;
                filter: blur(3px);
                animation: fadeOut 1s ease-out forwards;
                pointer-events: none;
                z-index: 1000001;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }, i * 30);
    }

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

function showExtraFreeSpinAnimation(extraSpins) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffd700, #ffaa00, #ff6600);
        color: black;
        padding: 20px 40px;
        border-radius: 60px;
        font-weight: 900;
        font-size: 36px;
        z-index: 1000001;
        text-align: center;
        animation: popIn 0.3s, fadeOut 0.5s 1.5s forwards;
        box-shadow: 0 0 50px gold;
        white-space: nowrap;
        font-family: 'Bangers', cursive;
        letter-spacing: 2px;
    `;
    overlay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 50px;">✨</span>
            +${extraSpins} FREE SPINS
            <span style="font-size: 50px;">✨</span>
        </div>
    `;
    document.body.appendChild(overlay);

    // Add confetti
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                width: ${8 + Math.random() * 12}px;
                height: ${8 + Math.random() * 12}px;
                background: ${['#ffd700', '#ffaa00', '#ff6600', '#ff3300'][Math.floor(Math.random() * 4)]};
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall 1s ease-out forwards;
                pointer-events: none;
                z-index: 1000002;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 1000);
        }, i * 30);
    }

    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

function showFreeSpinEndAnimation(totalWin) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000dd, #4caf50aa, #2196f3aa);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; animation: popIn 0.8s;">
            <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 0.3s infinite alternate;">🎁</div>
            <div style="font-size: 60px; font-weight: 900; color: #ffd700; margin-bottom: 20px;
                        text-shadow: 0 0 30px gold;">
                FREE SPINS ENDED
            </div>
            <div style="font-size: 80px; font-weight: 900; color: #00ff00;
                        text-shadow: 0 0 40px #00ff00, 0 0 80px #00aa00;
                        animation: pulse 0.8s infinite alternate;">
                +${formatNumber(totalWin)} ကျပ်
            </div>
            <div style="font-size: 30px; color: white; margin-top: 20px;">
                ဂုဏ်ယူပါသည်။
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 3500);
}

// ===== DISABLE BUTTONS DURING FREE SPIN =====
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

// Add missing keyframes if not already in style
if (!document.querySelector('#free-spin-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'free-spin-animation-styles';
    style.textContent = `
        @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-20px); }
        }
        @keyframes confettiFall {
            0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
}
// ===== DIRECT FREE SPIN INIT (Suspense မပါ - ဒါပေမယ့် Free Spin စဖို့သုံးတယ်) =====
function initializeFreeSpinsDirect(bonusCount, freeSpinCount) {
    console.log(`🎰 Initializing Free Spins: ${freeSpinCount} spins for ${bonusCount} bonuses`);
    
    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = freeSpinCount;
    window.gameState.totalFreeSpins = freeSpinCount;
    window.gameState.freeSpinBonusCount = bonusCount;
    
    disableButtons(true);
    showFreeSpinIndicator();
    showFreeSpinStartAnimation(freeSpinCount);
    showNotification(`✨ Free Spin ${freeSpinCount} ကြိမ် ရရှိပါသည်။ (Bonus ${bonusCount} လုံး)`, 'success');
    
    setTimeout(() => {
        spin();
    }, 1500);
}
// ============================================
// 20. AUTO SPIN (LONG PRESS) WITH INDICATOR
// ============================================
let pressTimer;
let isLongPress = false;
let autoSpinCount = 0;
let autoSpinMax = 0;
let autoSpinInterval;
let isWaitingForWin = false;
const longPressDuration = 500;

function setupLongPress(btn) {
    // Mouse Events (passive မလို)
    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', cancelPress);
    btn.addEventListener('mouseleave', cancelPress);
    
    // Touch Events (passive: false လို)
    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', cancelPress, { passive: false });
    btn.addEventListener('touchcancel', cancelPress, { passive: false });
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

    // ✅ Auto Spin Indicator ပြမယ်
    showAutoSpinIndicator(count);

    showNotification(`Auto Spin စတင်ပါပြီ။ (${count} ကြိမ်)`, 'info');

    performAutoSpin();
}

// ✅ Auto Spin Indicator ပြမယ်
function showAutoSpinIndicator(total) {
    let indicator = document.getElementById('autoSpinIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSpinIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #0a2a1a, #1a3a2a);
            border: 1px solid #00ffaa;
            border-radius: 30px;
            padding: 8px 20px;
            font-weight: 900;
            z-index: 99999;
            box-shadow: 0 0 20px rgba(0,255,170,0.3);
            text-align: center;
            min-width: 180px;
            backdrop-filter: blur(8px);
            animation: indicatorPulse 1s infinite;
        `;
        document.body.appendChild(indicator);
    }

    indicator.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span style="font-size: 18px;">🔄</span>
            <span style="font-size: 14px; color: #00ffaa;">AUTO SPIN</span>
            <span style="font-size: 20px; font-weight: 900; color: white;">${autoSpinCount}/${total}</span>
        </div>
    `;
}

// ✅ Auto Spin Indicator Update လုပ်မယ်
function updateAutoSpinIndicator() {
    const indicator = document.getElementById('autoSpinIndicator');
    if (indicator) {
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 18px;">🔄</span>
                <span style="font-size: 14px; color: #00ffaa;">AUTO SPIN</span>
                <span style="font-size: 20px; font-weight: 900; color: white;">${autoSpinCount}/${autoSpinMax}</span>
            </div>
        `;
    }
}

// ✅ Auto Spin Indicator ဖျောက်မယ်
function hideAutoSpinIndicator() {
    const indicator = document.getElementById('autoSpinIndicator');
    if (indicator) {
        indicator.remove();
    }
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

    // ✅ Win Animation ပြနေရင် စောင့်မယ်
    if (window.gameState.waitingForWinAnimation || isWaitingForWin) {
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
    updateAutoSpinIndicator();

    if (autoSpinCount >= autoSpinMax) {
        stopAutoSpin('completed');
        showNotification(`Auto Spin ပြီးဆုံးပါသည်။ (${autoSpinCount} ကြိမ်)`, 'success');
    } else {
        let delay = 2000;

        if (winAmount >= 50000) {
            delay = 6000;  // 6 စက္ကန့်
        } else if (winAmount >= 15000) {
            delay = 5000;  // 5 စက္ကန့်
        } else if (winAmount >= 5000) {
            delay = 4000;  // 4 စက္ကန့်
        } else if (winAmount > 0) {
            delay = 3000;  // 3 စက္ကန့်
        }

        // ✅ Win Animation ပြီးရင် ဆက်ဖို့
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

    // ✅ Auto Spin Indicator ဖျောက်မယ်
    hideAutoSpinIndicator();

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
// 22. BALANCE & JACKPOT FUNCTIONS
// ============================================
function updateBalanceDisplay() {
    const balanceEl = document.getElementById('balanceAmount');
    const creditDisplay = document.getElementById('credit-display');
    
    const actualAmount = window.gameState.balance;
    
    if (balanceEl) {
        balanceEl.textContent = formatNumber(actualAmount);
    }
    if (creditDisplay) {
        creditDisplay.textContent = formatNumber(actualAmount);
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
        currentUser.displayBalance = window.gameState.displayBalance || window.gameState.balance;
        currentUser.level = window.gameState.userLevel;
        currentUser.vip = window.gameState.vipLevel;

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.currentUser = currentUser;

        if (db && currentUser.id) {
            db.collection('users').doc(currentUser.id).update({
                balance: window.gameState.balance,
                displayBalance: window.gameState.displayBalance || window.gameState.balance,
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
// 23. Loss Pool Jackpot Functions
// ============================================
async function loadLossPoolData() {
    if (!firebase || !firebase.firestore) return;
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const db = firebase.firestore();
        const doc = await db.collection('admin').doc('lossPool').get();
        
        if (doc.exists) {
            const data = doc.data();
            const contributions = data.contributions || {};
            const userContribution = contributions[user.uid] || 0;
            
            console.log('🎯 Loaded user contribution:', userContribution);
            
            window.gameState.userLossPool = userContribution;
            window.gameState.totalLossPool = data.totalAmount || 0;
        } else {
            window.gameState.userLossPool = 0;
            window.gameState.totalLossPool = 0;
        }
        
        updateJackpotPoolDisplay();
        
    } catch (error) {
        console.error('Error loading loss pool:', error);
    }
}

function updateJackpotPoolDisplay() {
    const jackpotEl = document.getElementById('jackpotPoolAmount');
    console.log('🎯 updateJackpotPoolDisplay called');
    console.log('🎯 jackpotEl:', jackpotEl);
    console.log('🎯 userLossPool:', window.gameState.userLossPool);
    
    if (jackpotEl && window.gameState) {
        const value = window.gameState.userLossPool || 0;
        console.log('🎯 Setting to:', value);
        jackpotEl.textContent = formatNumber(value);
    }
}

// ===== listenToLossPool - loss pool data နားထောင်ရန် =====
function listenToLossPool() {
    if (!firebase || !firebase.firestore) return;
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Loss pool အတွက် real-time listener
    const lossPoolRef = db.collection('admin').doc('lossPool');
    return lossPoolRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const contributions = data.contributions || {};
            const userContribution = contributions[user.uid] || 0;
            window.gameState.userLossPool = userContribution;
            window.gameState.totalLossPool = data.totalAmount || 0;
            updateJackpotPoolDisplay();
            console.log('🔄 Loss pool updated:', userContribution);
        }
    }, (error) => {
        console.error('Error listening to loss pool:', error);
    });
}

// ============================================
// 24. PENDING GIFT FUNCTIONS
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
// 25. LISTEN FOR PENDING JACKPOT (WITH BABA MODE)
// ============================================
function listenForPendingJackpot(userId) {
    if (!userId || !db) {
        console.warn('⚠️ listenForPendingJackpot: userId or db missing');
        return;
    }
    console.log('🟢 Jackpot Listener Started for User:', userId);

    // 🔥 နားထောင်မယ့် collection: notifications
    // type က jackpot သို့မဟုတ် baba_jackpot နှစ်မျိုးလုံး
    const notificationsRef = db.collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .where('type', 'in', ['jackpot', 'baba_jackpot']);   // 🔥 အဓိကပြင်ဆင်ချက်

    return notificationsRef.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                const amount = data.amount || 0;
                const spinReq = data.spinRequirement || 10;
                const docId = change.doc.id;
                const notifType = data.type;   // 'jackpot' သို့ 'baba_jackpot'

                if (amount > 0) {
                    // ===== ပုံမှန် Pending Jackpot State =====
                    window.gameState.pendingJackpotAmount = amount;
                    window.gameState.pendingJackpotSpinsLeft = spinReq;
                    window.gameState.Lucky_Money = amount;
                    window.gameState.Lucky_MoneySpinReq = spinReq;
                    window.gameState.currentNotifId = docId;

                    // ===== ✅ BABA JACKPOT MODE ကို ACTIVATE လုပ်မယ် (type baba_jackpot အတွက်) =====
                    if (notifType === 'baba_jackpot') {
                        const babaMode = data.babaMode || 'modeA';   // Admin က သတ်မှတ်ထားတဲ့ Mode
                        window.gameState.babaJackpotMode = {
                            enabled: true,
                            targetSpins: spinReq,
                            currentSpinCount: 0,
                            isReady: false,
                            jackpotAmount: amount,
                            babaMode: babaMode,      // 🔥 Mode A / B / C
                            notifId: docId
                        };
                        console.log(`🎉 BABA JACKPOT MODE ACTIVATED! Mode: ${babaMode}, Amount: ${amount}, Required Spins: ${spinReq}`);
                    } else {
                        // သာမန် jackpot (အဟောင်း) အတွက်
                        window.gameState.babaJackpotMode = {
                            enabled: false,
                            targetSpins: 0,
                            currentSpinCount: 0,
                            isReady: false,
                            jackpotAmount: 0,
                            babaMode: 'modeA',
                            notifId: null
                        };
                        console.log(`🎉 Normal Jackpot Pending: ${amount} in ${spinReq} spins`);
                    }
                }
            }
        });
    }, (error) => {
        console.error('🔥 Error listening to notifications:', error);
    });
}
// ============================================
// 26. JACKPOT ပြီးဆုံးကြောင်း FIRESTORE မှာ သွားမှတ်မည့် FUNCTION
// ============================================
async function finalizeJackpot() {
    const docId = window.gameState.currentNotifId;
    if (!docId) return;

    try {
        await db.collection('notifications').doc(docId).update({
            read: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Jackpot notification marked as read.');

        window.gameState.currentNotifId = null;
        window.gameState.pendingJackpotAmount = 0;
        window.gameState.pendingJackpotSpinsLeft = 0;
        
        // Baba mode ကိုလည်း သေချာ reset လုပ်မယ်
        if (window.gameState.babaJackpotMode) {
            window.gameState.babaJackpotMode.enabled = false;
            window.gameState.babaJackpotMode.isReady = false;
        }
    } catch (err) {
        console.error('❌ Error finalizing jackpot noti:', err);
    }
}

// ============================================
// 27. LISTEN FOR USER BALANCE (REAL-TIME)
// ============================================
function listenToUserData(userId) {
    if (!userId || !db) return;

    const userRef = db.collection('users').doc(userId);
    return userRef.onSnapshot((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            window.gameState.balance = userData.balance || 0;
            window.gameState.displayBalance = userData.displayBalance || userData.balance || 0;
            updateBalanceDisplay();
            console.log('🔄 Balance updated from Firebase:', window.gameState.balance);
        }
    }, (error) => {
        console.error('Error listening to user data:', error);
    });
}

// ============================================
// 29. LEVEL UP FUNCTIONS
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

// ===== UPDATE VIP DISPLAY =====
function updateVIPDisplay() {
    const vipLevel = window.gameState.vipLevel || 0;
    const totalDeposit = window.gameState.totalDeposit || 0;
    const config = VIP_CONFIG[vipLevel];
    
    const levelEl = document.getElementById('vipLevelDisplay');
    if (levelEl) {
        levelEl.textContent = vipLevel;
    }
    
    const nameEl = document.getElementById('vipName');
    if (nameEl) {
        nameEl.textContent = config.name;
        nameEl.style.color = getVIPColor(vipLevel);
    }
    
    const nextLevel = vipLevel + 1;
    if (nextLevel <= 5) {
        const required = VIP_CONFIG[nextLevel].requiredDeposit;
        const need = required - totalDeposit;
        
        const nextEl = document.getElementById('vipNextDisplay');
        if (nextEl) {
            nextEl.textContent = `နောက် VIP: ${formatNumber(need)} ကျပ်`;
        }
        
        const progress = (totalDeposit / required) * 100;
        const barEl = document.getElementById('vipProgressBar');
        if (barEl) {
            barEl.style.width = Math.min(progress, 100) + '%';
        }
    } else {
        const nextEl = document.getElementById('vipNextDisplay');
        if (nextEl) {
            nextEl.textContent = 'MAX VIP';
        }
        const barEl = document.getElementById('vipProgressBar');
        if (barEl) {
            barEl.style.width = '100%';
        }
    }
}

// ============================================
// 30. LOAD USER FROM FIREBASE
// ============================================
async function loadUserFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;
        
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            window.gameState.balance = data.balance || 0;
            window.gameState.userLevel = data.level || 1;
            window.gameState.vipLevel = data.vip || 0;
            window.currentUser = { uid: user.uid, ...data };
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
            updateBalanceDisplay();
            listenToLossPool();
        }
    } catch (error) {
        console.error('Firebase load error:', error);
    }
}

function playWinSounds(totalWin, winLines) {
    if (typeof SoundManager === 'undefined') return;

    SoundManager.win();

    if (totalWin > window.gameState.betAmount * 50) {
        SoundManager.victory();
    }

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

    if (maxBuffaloCount > 0) {
        SoundManager.buffalo();
    }

    if (hasCoin) {
        SoundManager.coin();
    }

    if (hasJackpot) {
        SoundManager.sixCoin();
        SoundManager.victory();
    }
}

// ============================================
// 32. EXPORT GLOBALS
// ============================================
window.spin = spin;
window.closeModal = closeModal;
window.startFreeSpins = startFreeSpins;
window.endFreeSpins = endFreeSpins;
window.stopAutoSpin = stopAutoSpin;
window.startAutoSpin = startAutoSpin;
window.highlightWinsPremium = highlightWinsPremium;
console.log('✅ Game.js ULTIMATE VERSION fully loaded with all features!');
