// ============================================
// GAME.JS - COMPLETE ULTIMATE VERSION
// (Version 1 + Version 2 + Version 3 Merged)
// ============================================

// ============================================
// 1. GAME STATE & CONFIGURATION
// ============================================
 window.gameState = window.gameState || {
    displayBalance: 0,
    balance: 0,
    jackpotPool: 0,
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
    reduceThreeMatch: false,
    pendingJackpotSpinsLeft: 0,
    pendingJackpotAmount: 0,
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
// UPDATED SYMBOL CONFIGURATION
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

 //Wild မပါတဲ့ symbol pool
const symbolsWithoutWild = ALL_SYMBOLS.normal;

// Wild ပါတဲ့ symbol pool
const symbolsWithWild = [...ALL_SYMBOLS.normal, ...ALL_SYMBOLS.wild];


// ============================================
// REEL STRIPS CONFIGURATION
// ============================================


const REELS = [
    // Reel 1 (Column 0) - normal symbols only
    ['seven', 'jack', 'queen', 'nine', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten'],
    
    // Reel 2 (Column 1) - normal symbols only
   ['seven', 'jack', 'queen', 'nine',  'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten'],
    
    // Reel 3 (Column 2) - with wild
    ['seven', 'jack', 'queen', 'nine',  'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten'],
    
    // Reel 4 (Column 3) - with wild
   ['seven', 'jack', 'queen', 'nine', 'lion', 'wild', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten'],
    
    // Reel 5 (Column 4) - with wild
    ['seven', 'jack', 'queen', 'nine',  'wild', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten']
];
// ===== Free Spin Mode အထူး symbols =====
const FREE_SPIN_SYMBOLS = {
    wild: 'wild',
    baba: 'baba',
    free: 'free'
};

// ===== Free Spin အတွက် buffalo အထူးနေရာ =====
const FREE_SPIN_BUFFALO_COLS = [1, 2, 3]; // col 1,2,3 မှာ buffalo အထူးထည့်


// Image paths
const IMAGE_PATHS = {
    'seven': 'images/seven.png',
    'jack': 'images/jack.png',      // အသစ်
    'queen': 'images/queen.png',    // အသစ်
    'nine': 'images/nine.png',      // အသစ်
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
// CHECK USER CAN PLAY
// ============================================
function checkUserCanPlay() {
    if (window.gameState.displayBalance <= 0) {
        alert('ကျေးဇူးပြု၍ ငွေသွင်းပြီးမှဆော့ပါ');
        return false;
    }
    return true;
}

// ============================================
// BUFFALO MODE (၂/၃ လုံးပါအောင်)
// ============================================

const BUFFALO_MODE_CONFIG = {
    // Mode A: Column 0,1,2 မှာ buffalo ၂ လုံးစီထည့်
    modeA: {
        cols: [0, 1, 2],
        countPerCol: 2,        // တစ် column ကို buffalo ၂ လုံး
        distribution: 'random' // ကျပန်းထည့်
    },
    
    // Mode B: Column 1,2,3 မှာ buffalo ၃ လုံးစီထည့်
    modeB: {
        cols: [1, 2, 3],
        countPerCol: 3,
        distribution: 'alternating' // တစ်လှည့်စီထည့်
    },
    
    // Mode C: Column 0,2,4 မှာ buffalo ၂ လုံးစီ
    modeC: {
        cols: [0, 2, 4],
        countPerCol: 2,
        distribution: 'random'
    }
};

// Buffalo mode ကိုခေါ်မယ့် function
function applyBuffaloMode(result, modeName) {
    const mode = BUFFALO_MODE_CONFIG[modeName];
    if (!mode) return result;
    
    const { cols, countPerCol, distribution } = mode;
    
    for (let col of cols) {
        // ဒီ column မှာ buffalo ဘယ်နှစ်လုံးထည့်ရမလဲ
        let buffaloCount = 0;
        
        // ကျပန်းနေရာတွေရွေးပြီး buffalo ထည့်
        const positions = [];
        while (positions.length < countPerCol) {
            const pos = Math.floor(Math.random() * 4);
            if (!positions.includes(pos)) {
                positions.push(pos);
            }
        }
        
        // ရွေးထားတဲ့နေရာတွေမှာ buffalo ထည့်
        for (let row = 0; row < 4; row++) {
            if (positions.includes(row)) {
                result[col][row] = 'buffalo';
            }
        }
    }
    return result;
}

// ============================================
// 2. DOM READY & INITIALIZATION (CLEAN)
// ============================================

 document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 Game Engine Initialized (Balanced Mode)');

    const savedUserData = localStorage.getItem('currentUser');
    if (savedUserData) {
        currentUser = JSON.parse(savedUserData);
        window.currentUser = currentUser;

        await loadUserFromFirebase();
        await checkUserSurprise();

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
        window.gameState.balance = currentUser.balance || 0;
        window.gameState.displayBalance = currentUser.displayBalance || currentUser.balance || 0;  // 👈 ဒီစာကြောင်း ထည့်
        window.gameState.userLevel = currentUser.level || 1;
        window.gameState.vipLevel = currentUser.vip || 0;
        updateBalanceDisplay();
    }
}

// ============================================
// MAIN SPIN FUNCTION
// ============================================

  function spin() {
    console.log('🔥 spin() called');
    
    // 1. Spin မလုပ်နိုင်တဲ့အခြေအနေတွေကိုစစ်
    if (!checkUserCanPlay()) {
        return;
    }
    if (window.gameState.isSpinning) {
        console.log('⚠️ Already spinning');
        return;
    }
    
      if (window.gameState.balance < window.gameState.betAmount) {
    showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ', 'error');
    return;
   }


    // 2. Spin စတဲ့အချက်ပြမှုများ
    console.log('🎰 Spinning...');
    window.gameState.isSpinning = true;

    // Win display ကို 0 ပြန်ထား
    const winEl = document.getElementById('winAmount');
    if (winEl) winEl.textContent = '0';

    // အရင် win highlights တွေကိုရှင်း
    clearAllWinHighlights();

    // အသံဖွင့်
    if (typeof SoundManager !== 'undefined') SoundManager.spin();

    // ===== 3. လောင်းကြေးနုတ် (Free Spin မဟုတ်ရင်) =====
    if (!window.gameState.isFreeSpinning) {
        window.gameState.balance -= window.gameState.betAmount;
        
        // REAL BALANCE ကို မနုတ်ရ
        // window.gameState.balance ကို မထိပါနဲ့
        
        addJackpotContribution(window.gameState.betAmount);
    }

    // 4. Spin ရေတွက်
    window.gameState.spinCount++;
    window.gameState.spinCounter = (window.gameState.spinCounter || 0) + 1;
    updateBalanceDisplay();

    // 5. Spin Result ထုတ်
    const result = generateSpinResult();
    console.log('Final Result:', result);

    // 6. Animation စတင်
    animateReelsStaggered(result);

    // 7. Animation ပြီးတဲ့အခါ အနိုင်တွက်
    document.addEventListener('animationComplete', function onAnimationComplete() {
        document.removeEventListener('animationComplete', onAnimationComplete);

        console.log('💰 Calculating winnings...');
        const winResult = calculateWinnings(result);
        const totalWin = winResult.totalWin || 0;
        
        // ===== WIN ရှိရင် Balance နှစ်ခုလုံးထည့် =====
        if (totalWin > 0) {
            // REAL BALANCE ထည့်
            window.gameState.balance += totalWin;
            // DISPLAY BALANCE ထည့်
            window.gameState.displayBalance += totalWin;
            updateBalanceDisplay();
            updateWinDisplay(totalWin);
        }
        
        updateUserBalanceInStorage();
        
        // Free Spin အတွက် Scatter စစ်
        checkScatter(result);

        // Win တွေကို Highlight လုပ်
        if (winResult.indices && winResult.indices.length > 0) {
            highlightWinsPremium(winResult.indices, winResult.buffaloIndices || []);
            showWinWithRise(totalWin, winResult.indices);
        }

        // Buffalo Jackpot စစ်
        const buffaloCount = countBuffalo(result);
        if (buffaloCount >= 20) {
            if (typeof premiumBuffaloStampede !== 'undefined') {
                premiumBuffaloStampede.startStampede(window.gameState.jackpot, buffaloCount);
            } else if (typeof buffaloStampede !== 'undefined') {
                buffaloStampede.startStampede(window.gameState.jackpot, buffaloCount);
            }
            showBuffaloJackpot(window.gameState.jackpot, buffaloCount);
        }

        // Spin ပြီးဆုံးကြောင်းမှတ်
        window.gameState.isSpinning = false;

        // Pending Gift စစ်
        checkPendingGiftOnSpin();

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

        // ===== JACKPOT HANDLING (FIXED) =====
        if (window.gameState.pendingJackpotSpinsLeft > 0) {
            window.gameState.pendingJackpotSpinsLeft--;
            console.log(`🎯 Jackpot pending spins left: ${window.gameState.pendingJackpotSpinsLeft}`);

            if (window.gameState.pendingJackpotSpinsLeft === 0) {
                const jackpotAmount = window.gameState.pendingJackpotAmount || 0;

                // ===== JACKPOT: Balance နှစ်ခုလုံးထည့် =====
                if (jackpotAmount > 0) {
                    window.gameState.balance += jackpotAmount;
                    window.gameState.displayBalance += jackpotAmount;
                    updateBalanceDisplay();
                }
                
                finalizeJackpot();

                // အသံဖွင့်
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.jackpotSpin();
                    SoundManager.jackpot();
                    SoundManager.lion();
                }

                // Jackpot Animation ပြမယ်
                if (typeof JackpotAnimation !== 'undefined') {
                    JackpotAnimation.show(jackpotAmount);
                } else if (typeof WinAnimation !== 'undefined') {
                    WinAnimation.mega(jackpotAmount);
                }

                showNotification(`🎉 ဂျက်ပေါ့ဆုကြေး ${formatNumber(jackpotAmount)} ကျပ် ရရှိပါသည်။`, 'success');
                
                window.gameState.pendingJackpotAmount = 0;
                window.gameState.Lucky_Money = 0;
            }
        }
    });
}

// ============================================
// FIXED WIN CALCULATION (COMPLETE)
// ============================================
function calculateWinnings(result) {
    // paytable ကိုသေချာအောင်လုပ်
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
        // base multiplier from 5-match (or highest defined)
        let baseMultiplier = paytable[symbol]?.[5];
        if (!baseMultiplier) return 0;

        const highValueSymbols = ['buffalo', 'ele', 'lion'];

        if (highValueSymbols.includes(symbol) && count > 5) {
            // တစ်လုံးပိုတိုင်း multiplier 0.5 တိုး (စိတ်ကြိုက်ပြင်နိုင်)
            const extra = (count - 5) * 0.5;
            return baseMultiplier * (1 + extra);
        } else {
            // သာမန်သင်္ကေတ ဒါမှမဟုတ် count <=5 ဆို base multiplier အတိုင်း
            return baseMultiplier;
        }
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

                // ကော်လံ ၃ စစ်
                for (let r3 = 0; r3 < rows; r3++) {
                    const sym3 = result[3][r3];
                    if (sym3 === symbol0 || sym3 === 'wild') {
                        streak = 4;
                        winRowIndices.push(r3 * cols + 3);
                        break;
                    }
                }

                // ကော်လံ ၄ စစ်
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

                // အနိုင်ရရင် ထည့် (NEW: use getFinalMultiplier)
                if (paytable[symbol0] && paytable[symbol0][streak]) {
                    const finalMultiplier = getFinalMultiplier(symbol0, streak);
                    const winAmount = bet * finalMultiplier;
                    totalWin += winAmount;

                    winLines.push({
                        symbol: symbol0,
                        count: streak,
                        win: winAmount,
                        multiplier: finalMultiplier
                    });

                    winIndices.push(...winRowIndices);

                    console.log(`✅ Win found: ${symbol0} x${streak} = ${winAmount} (multiplier ${finalMultiplier})`);
                } else {
                    console.log(`❌ No paytable entry for ${symbol0} x${streak}`);
                }
            }
        }
    }

    // ===== THREE-MATCH CONTROL =====
    let threeMatchWinCount = 0;
    winLines.forEach(line => {
        if (line.count === 3) threeMatchWinCount++;
    });
    console.log(`📊 threeMatchWinCount: ${threeMatchWinCount}`);

    if (window.gameState && window.gameState.threeMatchControl) {
        window.gameState.threeMatchCount += threeMatchWinCount;
        window.gameState.totalSpinsSinceReset++;

        if (window.gameState.totalSpinsSinceReset >= window.gameState.checkInterval) {
            console.log('⏰ Check interval reached! Calling checkThreeMatchRate...');
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

    // ===== ဂျက်ပေါ့စစ် (ကျွဲ ၂၀ ကောင်နဲ့အထက်) =====
   if (buffaloCount >= 20) {
    totalWin += window.gameState.jackpot;
    winLines.push({
        symbol: 'buffalo',
        name: 'Buffalo Jackpot',
        win: window.gameState.jackpot
    });
    winIndices.push(...buffaloIndices);
    console.log(`🎰 JACKPOT! Buffalo count: ${buffaloCount}, Prize: ${window.gameState.jackpot}`);
}

    // ===== Apply global max win cap (per deposit) =====
const maxWinPerDeposit = window.gameState.maxWin || 50000;
let cappedWin = Math.min(totalWin, maxWinPerDeposit);
totalWin = cappedWin;   // use capped amount from here on

// ===== UI updates (but don't modify displayBalance here if spin() already does) =====
if (totalWin > 0) {
    window.gameState.consecutiveWins++;
    console.log('✅ Win! Consecutive wins:', window.gameState.consecutiveWins);

    // REMOVED: displayBalance update – spin() will add totalWin to balance and displayBalance
    window.gameState.winAmount = totalWin;

    updateWinDisplay(totalWin);          // show win amount on screen
    if (typeof addWinToHistory === 'function') addWinToHistory(totalWin);
    if (typeof playWinSounds === 'function') playWinSounds(totalWin, winLines);
    if (typeof showWinLinesInfo === 'function') showWinLinesInfo(winLines);

    const winPercentage = (totalWin / bet) * 100;

    // Win animations (same as before)
    if (typeof WinAnimation !== 'undefined') {
        if (winPercentage >= 1500) {
            WinAnimation.mega(totalWin);
            if (typeof SoundManager !== 'undefined') SoundManager.congratulations();
            if (typeof SoundManager !== 'undefined') SoundManager.lion();
            if (typeof SoundManager !== 'undefined') SoundManager.coin();
        } else if (winPercentage >= 1000) {
            WinAnimation.super(totalWin);
            if (typeof SoundManager !== 'undefined') SoundManager.congratulations();
            if (typeof SoundManager !== 'undefined') SoundManager.lion();
            if (typeof SoundManager !== 'undefined') SoundManager.coin();
        } else if (winPercentage >= 500) {
            WinAnimation.big(totalWin);
            if (typeof SoundManager !== 'undefined') SoundManager.congratulations();
            if (typeof SoundManager !== 'undefined') SoundManager.lion();
            if (typeof SoundManager !== 'undefined') SoundManager.coin();
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
    totalWin: totalWin,          // returns the capped win amount
    indices: winIndices,
    buffaloIndices: buffaloIndices,
    winLines: winLines
  };
}
// ============================================
// GENERATE SPIN RESULT (REELS ကိုသုံး)
// ============================================
function generateSpinResult() {
    const result = [[], [], [], [], []];

    // ===== NORMAL SPIN =====
    if (!window.gameState.isFreeSpinning) {
        for (let col = 0; col < 5; col++) {
            const reel = REELS[col];
            const startPos = Math.floor(Math.random() * reel.length);
            for (let row = 0; row < 4; row++) {
                result[col][row] = reel[(startPos + row) % reel.length];
            }
        }

        // ===== ADMIN CONTROL 1: Apply Buffalo Mode (Normal Spin) =====
        const adminCtrl1 = window.adminControl1 || { enabled: false, mode: null };
        if (adminCtrl1.enabled && adminCtrl1.mode && BUFFALO_MODE_CONFIG[adminCtrl1.mode]) {
            applyBuffaloMode(result, adminCtrl1.mode);
        }
    }

    // ===== FREE SPIN MODE =====
    else {
        for (let col = 0; col < 5; col++) {
            let enhancedReel = [...REELS[col]];

            enhancedReel.push(FREE_SPIN_SYMBOLS.wild);
            enhancedReel.push(FREE_SPIN_SYMBOLS.baba);
            enhancedReel.push(FREE_SPIN_SYMBOLS.free);

            const adminCtrl1 = window.adminControl1 || { enabled: false, freeSpinBuffaloEnabled: false };
            if (adminCtrl1.enabled && adminCtrl1.freeSpinBuffaloEnabled) {
                if (FREE_SPIN_BUFFALO_COLS.includes(col)) {
                    enhancedReel.push('buffalo');
                    enhancedReel.push('buffalo');
                }
            } else {
                if (FREE_SPIN_BUFFALO_COLS.includes(col)) {
                    enhancedReel.push('buffalo');
                    enhancedReel.push('buffalo');
                }
            }

            const startPos = Math.floor(Math.random() * enhancedReel.length);
            for (let row = 0; row < 4; row++) {
                const index = (startPos + row) % enhancedReel.length;
                result[col][row] = enhancedReel[index];
            }
        }
    }

    // =========================================================
    // AUTO NO-WIN CYCLE (using column-based no-win)
    // =========================================================
    let shouldApplyNoWin = false;

    if (window.gameState.autoNoWinCycle && window.gameState.autoNoWinCycle.enabled) {
        const cycle = window.gameState.autoNoWinCycle;

        if (cycle.currentPhase === 'nowin') {
            shouldApplyNoWin = true;
            cycle.noWinSpins++;
            console.log(`🔄 NO-WIN spin #${cycle.noWinSpins}`);
            if (cycle.noWinSpins >= cycle.noWinPhaseLength) {
                cycle.currentPhase = 'normal';
                cycle.normalSpins = 0;
                cycle.noWinSpins = 0;
                console.log('🔄 Switching to NORMAL phase');
            }
        } else {
            // normal phase
            shouldApplyNoWin = false;
            cycle.normalSpins++;
            console.log(`🔄 NORMAL spin #${cycle.normalSpins}`);
            if (cycle.normalSpins >= cycle.normalPhaseLength) {
                cycle.currentPhase = 'nowin';
                cycle.normalSpins = 0;
                cycle.noWinSpins = 0;
                console.log('🔄 Switching to NO-WIN phase');
            }
        }
    } else {
        // auto cycle disabled → use manual adminControl2 (original)
        const adminCtrl2 = window.adminControl2 || { enabled: false };
        shouldApplyNoWin = adminCtrl2.enabled && adminCtrl2.mode === 'always_different';
    }

    // ===== APPLY NO-WIN =====
    if (shouldApplyNoWin) {
        if (window.gameState.autoNoWinCycle && window.gameState.autoNoWinCycle.enabled) {
            forceNoWinByColumns(result);   // auto cycle method
        } else {
            applyAdminControl2(result);      // manual admin method
        }
    }

    // ===== REMOVE WILD FROM COL 0 & COL 1 (extra safety) =====
    const symbolsWithoutWild = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus'];
    for (let row = 0; row < 4; row++) {
        if (result[0][row] === 'wild') {
            result[0][row] = symbolsWithoutWild[Math.floor(Math.random() * symbolsWithoutWild.length)];
        }
        if (result[1][row] === 'wild') {
            result[1][row] = symbolsWithoutWild[Math.floor(Math.random() * symbolsWithoutWild.length)];
        }
    }

    return result;
}

function forceNoWinByColumns(result) {
    const allSymbols = ['seven', 'jack', 'queen', 'nine', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'ten'];
    
    // 1. col0 အတွက် random symbols (ထပ်တူဖြစ်ခွင့်ရှိတယ်)
    for (let row = 0; row < 4; row++) {
        result[0][row] = allSymbols[Math.floor(Math.random() * allSymbols.length)];
    }
    
    // 2. col0 မှာသုံးထားတဲ့ symbol set ကို ဖော်ထုတ်
    const usedInCol0 = new Set(result[0]);
    
    // 3. col1 အတွက် သုံးလို့ရတဲ့ symbol pool (col0 မှာမရှိတဲ့ symbol တွေ)
    let availableForCol1 = allSymbols.filter(s => !usedInCol0.has(s));
    
    // လုံလောက်တဲ့ symbol မရှိရင် (ဖြစ်ခဲ) allSymbols ကနေ ပြန်ရွေးပေမယ့် wild မပါအောင်
    if (availableForCol1.length < 4) {
        availableForCol1 = [...allSymbols];
    }
    
    for (let row = 0; row < 4; row++) {
        result[1][row] = availableForCol1[Math.floor(Math.random() * availableForCol1.length)];
    }
    
    // 4. wild ပါလာရင် ဖယ် (safety)
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

    const symbolsWithoutWild = ['seven', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus'];
    let pool = [...symbolsWithoutWild];
    let selectedCol0 = [];
    let selectedCol1 = [];

    for (let i = 0; i < 4; i++) {
        if (pool.length === 0) pool = [...symbolsWithoutWild];
        let randomIndex = Math.floor(Math.random() * pool.length);
        selectedCol0.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }

    for (let i = 0; i < 4; i++) {
        if (pool.length === 0) {
            const remaining = symbolsWithoutWild.filter(s => !selectedCol0.includes(s));
            pool = remaining.length > 0 ? [...remaining] : [...symbolsWithoutWild];
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
            result[0][row] = symbolsWithoutWild[Math.floor(Math.random() * symbolsWithoutWild.length)];
        }
        if (result[1][row] === 'wild') {
            result[1][row] = symbolsWithoutWild[Math.floor(Math.random() * symbolsWithoutWild.length)];
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
// 7. STAGGERED ANIMATION WITH DROP EFFECT (No Disappear)
// ============================================

function animateReelsStaggered(finalResult) {
    const cells = document.querySelectorAll('.grid-cell');
    if (cells.length === 0) return;

    console.log('🎰 Real slot machine animation started');

    // Animation class အဟောင်းတွေ ဖြုတ်
    cells.forEach(cell => {
        const img = cell.querySelector('img');
        if (img) {
            img.classList.remove('symbol-drop', 'symbol-glow', 'reel-spin');
        }
        cell.classList.remove('reel-shake');
    });

    // Reel တစ်ခုစီအတွက် သီးခြား animation
    for (let col = 0; col < 5; col++) {
        const reelCells = Array.from(cells).filter(cell => parseInt(cell.dataset.col) === col);
        
        // Reel တစ်ခုလုံးကို လှည့်နေတဲ့ပုံပေါ်အောင်
        reelCells.forEach(cell => {
            cell.classList.add('reel-shake');
            const img = cell.querySelector('img');
            if (img) {
                img.classList.add('reel-spin');
            }
        });
        
        // Reel အလိုက် ရပ်မယ် (ကော်လံ 0 ကနေ 4 အထိ စဉ်တန်းရပ်)
        setTimeout(() => {
            reelCells.forEach((cell, row) => {
                // လှည့်တာ ရပ်
                cell.classList.remove('reel-shake');
                const img = cell.querySelector('img');
                if (img) {
                    img.classList.remove('reel-spin');
                }
                
                // Final symbol ထည့်
                const symbol = finalResult[col][row];
                if (img && symbol) {
                    img.src = `images/${symbol}.png`;
                    // ရပ်တဲ့အခါ အနည်းငယ် bounce
                    img.classList.add('symbol-bounce');
                    setTimeout(() => {
                        img.classList.remove('symbol-bounce');
                    }, 300);
                }
                cell.dataset.symbol = symbol;
            });
            
            // နောက်ဆုံး reel ရပ်ပြီးရင် event လွှတ်
            if (col === 4) {
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('animationComplete'));
                    console.log('✅ All reels stopped');
                }, 300);
            }
        }, 400 + (col * 200)); // col 0: 400ms, col1: 600ms, col2: 800ms, etc
    }
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
// WIN ANIMATIONS - BIG WIN, MEGA WIN, SUPER WIN
//=============================================
const WinAnimation = (function() {
    
    // ========== PRIVATE VARIABLES ==========
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let isActive = false;
    let currentType = 'mega';
    let currentAmount = 0;
    
    let particles = [];
    let rotatingLights = [];
    let time = 0;
    let lightAngleOffset = 0;
    let scaleBig = 0;
    let glowIntensity = 0;
    let wobbleX = 0, wobbleY = 0;
    let amountScale = 0;
    let displayAmount = "";
    let digitIndex = 0;
    let burstInterval = null;
    let shakeOffset = { x: 0, y: 0 };
    let shakeTimer = null;
    let backgroundStars = [];
    
    const WIDTH = 800;
    const HEIGHT = 450;
    const LIGHT_COUNT = 16;
    
    // ========== PARTICLE CLASS (optimized) ==========
    class Particle {
        constructor(x, y, vx, vy, size, color, life, shape = 'circle') {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.shape = shape;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05;
            this.vx *= 0.99;
            this.life -= 2;
            return this.life > 0;
        }
        draw(ctx) {
            const alpha = Math.min(1, this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha * 0.9;
            if (this.shape === 'star') {
                ctx.font = `${this.size * 1.5}px "Segoe UI Emoji", "Apple Color Emoji"`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const starEmoji = Math.random() > 0.6 ? "✨" : "⭐";
                ctx.fillStyle = this.color;
                ctx.fillText(starEmoji, this.x, this.y);
            } 
            else if (this.shape === 'coin') {
                ctx.font = `${this.size * 1.4}px "Segoe UI Emoji", "Apple Color Emoji"`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = this.color;
                ctx.fillText("🪙", this.x, this.y);
            } 
            else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.restore();
        }
    }
    
    // ========== ROTATING LIGHTS ==========
    function initRotatingLights() {
        rotatingLights = [];
        const colors = ['#ff0040', '#ff8000', '#ffff00', '#80ff00', '#00ff80', '#00ffff', '#0080ff', '#ff00ff', '#ff0080', '#ff4400', '#ff66cc', '#ffaa33', '#33ffaa', '#ff3366', '#ff99cc', '#ffcc33'];
        for (let i = 0; i < LIGHT_COUNT; i++) {
            rotatingLights.push({
                angle: (i / LIGHT_COUNT) * Math.PI * 2,
                radius: 170 + Math.random() * 20,
                color: colors[i % colors.length],
                size: 5 + Math.random() * 4,
                speed: 0.008 + Math.random() * 0.003,
                pulse: 0
            });
        }
    }
    
    function updateRotatingLights() {
        lightAngleOffset += 0.01;
        for (let i = 0; i < rotatingLights.length; i++) {
            const light = rotatingLights[i];
            light.angle += light.speed;
            light.pulse = 0.6 + Math.sin(time * 0.01 + i) * 0.4;
        }
    }
    
    function drawRotatingLights(centerX, centerY) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        for (const light of rotatingLights) {
            const x = centerX + Math.cos(light.angle + lightAngleOffset) * light.radius;
            const y = centerY + Math.sin(light.angle + lightAngleOffset) * light.radius;
            ctx.beginPath();
            ctx.arc(x, y, light.size * light.pulse, 0, Math.PI * 2);
            ctx.fillStyle = light.color;
            ctx.fill();
        }
        ctx.restore();
    }
    
    function drawLightRays(centerX, centerY, intensity) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + time * 0.005;
            const x1 = centerX + Math.cos(angle) * 25;
            const y1 = centerY + Math.sin(angle) * 25;
            const x2 = centerX + Math.cos(angle) * 170;
            const y2 = centerY + Math.sin(angle) * 170;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 6;
            ctx.strokeStyle = `rgba(255, 200, 80, 0.4)`;
            ctx.stroke();
        }
        ctx.restore();
    }
    
    // ========== 3D TEXT ==========
    function draw3DWinText(x, y, scale, wobbleX, wobbleY, glowIntensity) {
        const text = currentType === 'big' ? "BIG WIN" : (currentType === 'super' ? "SUPER WIN" : "MEGA WIN");
        const fontSize = 72 * (0.7 + scale * 0.6);
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `900 ${fontSize}px "Poppins", "Arial Black", "Impact"`;
        
        const offsetX = Math.sin(wobbleX) * 2.5;
        const offsetY = Math.sin(wobbleY) * 2;
        
        const depths = [
            { dx: 8, dy: 8, color: '#2a1a00', blur: 0 },
            { dx: 6, dy: 6, color: '#3a2800', blur: 1 },
            { dx: 4, dy: 4, color: '#4a2a00', blur: 2 },
            { dx: 3, dy: 2.5, color: '#5a3a00', blur: 3 },
            { dx: 1.5, dy: 1, color: '#7a5200', blur: 4 }
        ];
        for (let i = 0; i < depths.length; i++) {
            const d = depths[i];
            ctx.shadowBlur = d.blur;
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.fillStyle = d.color;
            ctx.fillText(text, x + d.dx + offsetX, y + d.dy + offsetY);
        }
        
        const grad = ctx.createLinearGradient(x - 90, y - 35, x + 90, y + 35);
        const gradPos = (time * 0.012) % 1;
        grad.addColorStop(gradPos, '#FDB827');
        grad.addColorStop(gradPos + 0.2, '#FFE484');
        grad.addColorStop(gradPos + 0.4, '#FFD966');
        grad.addColorStop(gradPos + 0.6, '#F79F1A');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 24 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 180, 30, ${0.5 + glowIntensity * 0.6})`;
        ctx.fillText(text, x + offsetX, y + offsetY);
        
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFEAA0';
        ctx.strokeText(text, x + offsetX, y + offsetY);
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255, 255, 220, 0.3)';
        ctx.fillText(text, x + offsetX - 2, y + offsetY - 2);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }
    
    function draw3DAmount(amountStr, x, y, scale, glowIntensity) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 52 * (0.8 + scale * 0.4);
        ctx.font = `bold ${fontSize}px "Poppins", "Arial Black", monospace`;
        
        ctx.fillStyle = '#3a2800';
        ctx.fillText(amountStr, x + 3, y + 3);
        ctx.fillStyle = '#5a3c00';
        ctx.fillText(amountStr, x + 2, y + 2);
        ctx.fillStyle = '#7a5200';
        ctx.fillText(amountStr, x + 1, y + 1);
        
        const grad = ctx.createLinearGradient(x - 60, y - 20, x + 60, y + 20);
        grad.addColorStop(0, '#FFB347');
        grad.addColorStop(0.5, '#FFD966');
        grad.addColorStop(1, '#FFA500');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 16 * (1 + glowIntensity);
        ctx.shadowColor = `rgba(255, 100, 0, ${0.5 + glowIntensity * 0.5})`;
        ctx.fillText(amountStr, x, y);
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,255,200,0.2)';
        ctx.fillText(amountStr, x - 1, y - 1);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }
    
    // ========== BURST – 360° all directions ==========
    function doBurst() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 20;
        
        const colorsGold = ['#FFD966', '#FFB347', '#FFA500', '#FFD700', '#FF6B35', '#F4C542'];
        const colorsStar = ['#FF3366', '#33FF66', '#FF33CC', '#FF6600', '#00FFFF', '#FF00FF'];
        
        // main burst: 170 particles, all directions
        for (let i = 0; i < 170; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            const vx = Math.cos(angle) * speed * (Math.random() * 1.2);
            const vy = Math.sin(angle) * speed * (Math.random() * 1.1);
            const size = Math.random() * 7 + 2.5;
            
            let color, shape;
            const typeRand = Math.random();
            if (typeRand < 0.5) {
                shape = 'coin';
                color = `hsl(${45 + Math.random() * 20}, 100%, 60%)`;
            } else if (typeRand < 0.8) {
                shape = 'star';
                color = colorsStar[Math.floor(Math.random() * colorsStar.length)];
            } else {
                shape = 'circle';
                color = colorsGold[Math.floor(Math.random() * colorsGold.length)];
            }
            
            const life = Math.random() * 120 + 80;
            particles.push(new Particle(centerX, centerY, vx, vy, size, color, life, shape));
        }
        
        // floating particles around the text (random positions near text)
        for (let i = 0; i < 60; i++) {
            const randX = centerX + (Math.random() - 0.5) * 180;
            const randY = centerY + (Math.random() - 0.5) * 120;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() * 4 + 1.5;
            const color = colorsStar[Math.floor(Math.random() * colorsStar.length)];
            particles.push(new Particle(randX, randY, vx, vy, size, color, 70 + Math.random() * 50, Math.random() > 0.6 ? 'star' : 'circle'));
        }
    }
    
    // ========== COIN RAIN – spread widely above text ==========
    function startCoinRain() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2 - 20;
        for (let i = 0; i < 70; i++) {
            setTimeout(() => {
                const x = centerX + (Math.random() - 0.5) * 220;   // wide spread
                const y = centerY - 50 + Math.random() * 50;
                const vx = (Math.random() - 0.5) * 2.2;
                const vy = Math.random() * 5 + 3;
                const size = Math.random() * 7 + 4;
                const color = `hsl(${45 + Math.random() * 20}, 100%, 60%)`;
                particles.push(new Particle(x, y, vx, vy, size, color, 130, 'coin'));
            }, i * 30);
        }
    }
    
    // ========== SCREEN SHAKE ==========
    function startScreenShake() {
        if (shakeTimer) clearTimeout(shakeTimer);
        const duration = 350;
        const startTime = performance.now();
        function shake() {
            const elapsed = performance.now() - startTime;
            if (elapsed >= duration) {
                shakeOffset = { x: 0, y: 0 };
                if (canvas) canvas.style.transform = `translate(-50%, -50%)`;
                return;
            }
            const intensity = (1 - elapsed / duration) * 6;
            shakeOffset.x = (Math.random() - 0.5) * intensity;
            shakeOffset.y = (Math.random() - 0.5) * intensity;
            if (canvas) canvas.style.transform = `translate(calc(-50% + ${shakeOffset.x}px), calc(-50% + ${shakeOffset.y}px))`;
            requestAnimationFrame(shake);
        }
        shake();
    }
    
    // ========== CANVAS SETUP ==========
    function setupCanvas() {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = document.createElement('canvas');
        canvas.id = 'win-animation-canvas';
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.position = 'fixed';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = '999995';
        canvas.style.borderRadius = '16px';
        canvas.style.boxShadow = '0 0 30px rgba(0,0,0,0.8)';
        canvas.style.cursor = 'pointer';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        canvas.onclick = () => { if (isActive) resetAndStart(currentAmount); };
        
        // pre‑generate background stars
        backgroundStars = [];
        for (let i = 0; i < 80; i++) {
            backgroundStars.push({
                x: Math.random() * WIDTH,
                y: Math.random() * HEIGHT,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    function drawBackground() {
           if (!ctx) return;
        const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.5, '#12122a');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        for (let s of backgroundStars) {
            ctx.fillStyle = `rgba(255,200,100,${s.alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function drawParticlesAndUpdate() {
        for (let i = 0; i < particles.length; i++) {
            const alive = particles[i].update();
            if (alive) particles[i].draw(ctx);
            else { particles.splice(i, 1); i--; }
        }
    }
    
    // ========== RESET & START ==========
    function resetAndStart(amount) {
        if (animationId) cancelAnimationFrame(animationId);
        if (burstInterval) clearInterval(burstInterval);
        
        isActive = true;
        currentAmount = amount;
        
        scaleBig = 0;
        amountScale = 0;
        glowIntensity = 0;
        digitIndex = 0;
        particles = [];
        time = 0;
        
        const amountStr = amount.toLocaleString();
        displayAmount = "";
        const animateDigits = () => {
            if (digitIndex <= amountStr.length) {
                displayAmount = amountStr.substring(0, digitIndex);
                digitIndex++;
                setTimeout(animateDigits, 80);
            }
        };
        animateDigits();
        
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            tl.to({val:0}, {val:1, duration:0.5, ease:"backOut(1.2)", onUpdate:function(){ scaleBig = this.targets()[0].val; }})
              .to({val:0}, {val:1, duration:0.8, delay:0.2, ease:"elastic.out(1,0.4)", onUpdate:function(){ amountScale = this.targets()[0].val; }}, "<")
              .to({g:0}, {g:1, duration:0.7, repeat:3, yoyo:true, ease:"power1.inOut", onUpdate:function(){ glowIntensity = this.targets()[0].g; }}, "<0.2")
              .to({x:0}, {x:Math.PI*2, duration:2.5, repeat:-1, ease:"none", onUpdate:function(){ wobbleX = this.targets()[0].x; }})
              .to({y:0}, {y:Math.PI*2, duration:3, repeat:-1, ease:"none", onUpdate:function(){ wobbleY = this.targets()[0].y; }}, "<");
        } else {
            scaleBig = 1; amountScale = 1; glowIntensity = 1;
        }
        
        doBurst();
        startCoinRain();
        startScreenShake();
        
        let burstTimes = 0;
        burstInterval = setInterval(() => {
            burstTimes++;
            if (burstTimes < 3) doBurst();
            else { clearInterval(burstInterval); burstInterval = null; }
        }, 600);
        
        setTimeout(() => {
            if (isActive) {
                if (typeof gsap !== 'undefined') {
                    gsap.to({val:scaleBig}, {val:0, duration:0.6, ease:"power2.in", onUpdate:function(){ scaleBig = this.targets()[0].val; amountScale = this.targets()[0].val; }, onComplete:()=>{ isActive=false; clearCanvas(); }});
                } else {
                    isActive = false;
                    clearCanvas();
                }
            }
        }, 5500);
        
        function animateLoop() {
            if (!ctx) {   // if context lost, stop animation
        if (animationId) cancelAnimationFrame(animationId);
        animationId = null;
        return;
    }
            if (!isActive && particles.length === 0) { animationId = null; return; }
            drawBackground();
            updateRotatingLights();
            if (isActive) {
                const cx = WIDTH/2, cy = HEIGHT/2 - 20;
                drawRotatingLights(cx, cy);
                drawLightRays(cx, cy, glowIntensity);
                draw3DWinText(cx, cy, scaleBig, wobbleX, wobbleY, glowIntensity);
                if (displayAmount) draw3DAmount(displayAmount, cx, cy + 68, amountScale, glowIntensity);
                drawParticlesAndUpdate();
            } else {
                drawParticlesAndUpdate();
            }
            time++;
            animationId = requestAnimationFrame(animateLoop);
        }
        animateLoop();
    }
    
    function clearCanvas() {
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = null; ctx = null;
        if (shakeTimer) clearTimeout(shakeTimer);
        shakeOffset = { x: 0, y: 0 };
    }
    
    // ========== PUBLIC API ==========
    function showMegaWin(amount = 0) {
        setupCanvas();
        currentType = 'mega';
        resetAndStart(amount);
    }
    function showBigWin(amount = 0) {
        setupCanvas();
        currentType = 'big';
        resetAndStart(amount);
    }
    function showSuperWin(amount = 0) {
        setupCanvas();
        currentType = 'super';
        resetAndStart(amount);
    }
    function clear() {
        if (animationId) cancelAnimationFrame(animationId);
        if (burstInterval) clearInterval(burstInterval);
        isActive = false;
        clearCanvas();
        const container = document.getElementById('win-animation-container');
        if (container) container.remove();
        const canvasEl = document.getElementById('win-animation-canvas');
        if (canvasEl) canvasEl.remove();
    }
    
    initRotatingLights();
    
    return { mega: showMegaWin, big: showBigWin, super: showSuperWin, clear: clear };
})();

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
// COUNT BUFFALO FUNCTION
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
// ULTIMATE PREMIUM BUFFALO STAMPEDE (V3)
// ============================================
class UltimatePremiumBuffaloStampede {
    constructor() {
        this.container = null;
        this.stampedeCount = 0;
        this.maxStampedes = 3;
        this.interval = null;
        this.imageBasePath = '/images/'; // မင်းရဲ့ image folder လမ်းကြောင်း
        this.setupStyles();
        this.createContainer();
    }

    setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes buffaloRun {
            0% {
                transform: translate(-50%, -50%) translateZ(-800px) scale(0.3);
                opacity: 0;
            }
            20% {
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) translateZ(400px) scale(2);
                opacity: 0;
            }
        }
            @keyframes dustRise {
                0% { transform: translateY(0) scale(1); opacity: 0.5; }
                100% { transform: translateY(-150px) scale(3); opacity: 0; }
            }
            @keyframes sparklePop {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
            @keyframes groundShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-15px); }
                75% { transform: translateX(15px); }
            }
            @keyframes messagePop {
                0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            @keyframes buffaloEnter {
                0% { transform: translateX(-100%) scale(0.5); opacity: 0; }
                100% { transform: translateX(0) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'ultimatePremiumBuffaloStampede';
    this.container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 150%;
        height: 150%;
        z-index: 999999;
        pointer-events: none;
        display: none;
        overflow: hidden;
        perspective: 1200px;
        transform-style: preserve-3d;
    `;
    document.body.appendChild(this.container);
}

    startStampede(winAmount, baseCount) {
        this.stop();
        this.stampedeCount = 0;
        this.winAmount = winAmount;
        this.baseCount = baseCount;
        
        const triggerCycle = () => {
            this.runCycle();
            this.stampedeCount++;
            
            if (this.stampedeCount < this.maxStampedes) {
                this.interval = setTimeout(triggerCycle, 2800);
            }
        };
        triggerCycle();
    }

    runCycle() {
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        const count = this.baseCount + (this.stampedeCount * 5);
        const isFinal = (this.stampedeCount === 2);

        // 1. ဖုန်မှုန့်များ (Premium ကုဒ်မှ)
        for (let i = 0; i < 25; i++) {
            this.createDustCloud();
        }

        // 2. ကျွဲအုပ်စု (Layers ၃ ထပ် - Ultimate ကုဒ်မှ)
        const layerCounts = [
            Math.floor(count * 0.3), // အနောက် - ၃၀%
            Math.floor(count * 0.4), // အလယ် - ၄၀%
            Math.floor(count * 0.3)  // အရှေ့ - ၃၀%
        ];

      this.spawnBuffaloLayer(layerCounts[2], 30, 1.2, 6.0); // အရှေ့ဆုံး
this.spawnBuffaloLayer(layerCounts[1], 20, 0.9, 8.0); // အလယ်
this.spawnBuffaloLayer(layerCounts[0], 10, 0.6, 10.0); // အနောက်ဆုံး
        // 3. ရွှေရောင်အမှုန်များ (နောက်ဆုံးအကြိမ်ဆိုပိုထည့်)
        if (isFinal) {
            for (let i = 0; i < 40; i++) {
                this.createSparkle();
            }
            
            // နောက်ဆုံးအကြိမ်ဆို Vibration ပိုရှည်
            if (navigator.vibrate) {
                navigator.vibrate([300, 100, 300, 100, 300]);
            }
        } else {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        }

        // 4. မြေငလျင် (Premium ကုဒ်မှ)
        this.createGroundShake();

        // 5. Message ပြမယ်
        this.showMessage(isFinal);

        // 6. Sound Effects (Premium ကုဒ်မှ)
        this.playSounds(isFinal);
    }

    spawnBuffaloLayer(count, zIndex, scale, speed) {
        for (let i = 0; i < count; i++) {
            this.createBuffaloImage(zIndex, scale, speed);
        }
    }

    createBuffaloImage(zIndex, scale, speed) {
    const buffalo = document.createElement('div');
    const buffaloType = Math.floor(Math.random() * 3) + 1;
// ပုံနာမည်တွေက running_bull1.png, running_bull2.png, running_bull3.png ဆိုရင်
const imageUrl = `${this.imageBasePath}running_bull${buffaloType}.png`;
    
    // ကျွဲတွေကို မျက်နှာပြင်အလယ်မှာထားပြီး Z-axis နဲ့ရွှေ့မယ်
    buffalo.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${120 * scale}px;
        height: ${80 * scale}px;
        margin-left: -${60 * scale}px;  // တစ်ဝက်ပြန်နှုတ်
        margin-top: -${40 * scale}px;    // တစ်ဝက်ပြန်နှုတ်
        z-index: ${zIndex};
        background-image: url('${imageUrl}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        animation: buffaloRun ${speed}s ease-out forwards;
        filter: drop-shadow(0 0 20px rgba(255,215,0,0.3));
        transform-style: preserve-3d;
        will-change: transform;
    `;

    this.container.appendChild(buffalo);
}

    createDustCloud() {
        const dust = document.createElement('div');
        const size = 30 + Math.random() * 80;
        const left = Math.random() * 100;
        const duration = 2 + Math.random() * 2;
        const delay = Math.random() * 1;

        dust.style.cssText = `
            position: absolute;
            left: ${left}%;
            bottom: 30px;
            width: ${size}px;
            height: ${size * 0.5}px;
            background: rgba(139, 69, 19, ${0.2 + Math.random() * 0.5});
            border-radius: 50%;
            filter: blur(${5 + Math.random() * 15}px);
            animation: dustRise ${duration}s ease-out ${delay}s forwards;
            transform: scale(${0.5 + Math.random()});
        `;
        this.container.appendChild(dust);
    }

    createSparkle() {
        const sparkle = document.createElement('div');
        const size = 10 + Math.random() * 30;
        const left = Math.random() * 100;
        const top = 20 + Math.random() * 60;

        sparkle.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            background: #FFD700;
            border-radius: 50%;
            filter: blur(2px);
            animation: sparklePop 1.5s ease-out forwards;
            box-shadow: 0 0 20px #FFA500;
        `;
        this.container.appendChild(sparkle);
    }

    createGroundShake() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = 'groundShake 0.3s linear';
            setTimeout(() => {
                gameContainer.style.animation = '';
            }, 2000);
        }

        // Body ကိုပါ လှုပ်မယ် (Ultimate ကုဒ်မှ)
        const body = document.body;
        body.style.transition = 'transform 0.1s';
        let shakes = 0;
        const shakeIntensity = 10 + (this.stampedeCount * 5);
        const interval = setInterval(() => {
            const x = (Math.random() - 0.5) * shakeIntensity;
            const y = (Math.random() - 0.5) * shakeIntensity;
            body.style.transform = `translate(${x}px, ${y}px)`;
            shakes++;
            if (shakes > 12) {
                clearInterval(interval);
                body.style.transform = '';
            }
        }, 40);
    }

    showMessage(isFinal) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100001;
            animation: messagePop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            text-shadow: 3px 3px 0 #000, 5px 5px 0 #444;
        `;

        const stampedeNumber = this.stampedeCount + 1;
        const stampedeText = ['FIRST WAVE', 'MEGA RUSH', 'ULTIMATE STAMPEDE'][stampedeNumber - 1];
        const stampedeMyan = ['၁ ကြိမ်', '၂ ကြိမ်', '၃ ကြိမ်'][stampedeNumber - 1];
        const color = isFinal ? '#FFD700' : (stampedeNumber === 2 ? '#FFA500' : '#FFF');

        message.innerHTML = `
            <div style="font-size: ${isFinal ? 90 : 70}px; font-weight: 900; color: ${color}; 
                        text-shadow: 0 0 30px #ffaa00, 0 0 60px #ff5500;
                        margin-bottom: 10px;">
                ${stampedeText}!
            </div>
            <div style="font-size: 60px; font-weight: 700; color: white; margin-bottom: 15px;">
                ${stampedeMyan}
            </div>
            <div style="font-size: 50px; color: #00ff00; text-shadow: 0 0 20px #00ff00;">
                +${this.winAmount.toLocaleString()} ကျပ်
            </div>
        `;
        this.container.appendChild(message);
       setTimeout(() => {
        if (message && message.parentNode) {
            message.style.transition = 'opacity 0.5s';
            message.style.opacity = '0';
            setTimeout(() => {
                if (message && message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 500);
        }
    }, 2000);
}

    playSounds(isFinal) {
        if (typeof SoundManager === 'undefined') return;

        // Buffalo sound
        if (SoundManager.buffalo) SoundManager.buffalo();

        // ဒုတိယအကြိမ်ဆို coin rain
        if (this.stampedeCount === 1 && SoundManager.coinRain) {
            SoundManager.coinRain();
        }

        // နောက်ဆုံးအကြိမ်ဆို victory + six coin
        if (isFinal) {
            if (SoundManager.victory) SoundManager.victory();
            if (SoundManager.sixCoin) SoundManager.sixCoin();
            if (SoundManager.congratulations) SoundManager.congratulations();
        }
    }

    stop() {
        clearTimeout(this.interval);
        if (this.container) {
            this.container.style.display = 'none';
            this.container.innerHTML = '';
        }
        
        // Game container shake ကိုပြန်ဖြုတ်
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.animation = '';
        }
        
        // Body transform ကိုပြန်ဖြုတ်
        document.body.style.transform = '';
    }
}

// Global instance ဆောက်မယ်
const buffaloStampede = new UltimatePremiumBuffaloStampede();

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
// SURPRISE BOX SYSTEM (FIRESTORE VERSION)
// ============================================
// ===== SURPRISE BOX STATE =====
let userSurpriseData = null;
let selectedBoxIndices = [];
let surpriseListener = null;  // 👈 ဒါထည့်
const MAX_SELECTIONS = 5;
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
                    const boxData = change.doc.data();
                    boxData.firestoreId = change.doc.id;
                    
                    // Save to localStorage
                    saveSurpriseToLocalStorage(boxData);
                    
                    // Check if user is in game
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser && currentUser.id === userId) {
                        checkUserSurprise();
                    }
                }
            });
        }, (error) => {
            console.error('Error listening to surprise box:', error);
        });
}

// ===== 2. SAVE TO LOCAL STORAGE =====
function saveSurpriseToLocalStorage(boxData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.id !== boxData.userId) return;

    const surpriseKey = `userSurprise_${currentUser.id}`;
    let surpriseData = JSON.parse(localStorage.getItem(surpriseKey));

    if (!surpriseData || surpriseData.status !== 'pending') {
        // Create new surprise box set
        surpriseData = {
            id: boxData.firestoreId,
            status: 'pending',
            boxes: [],
            createdAt: new Date().toISOString()
        };
    }

    // Add box to the set
    surpriseData.boxes.push({
        id: boxData.id,
        type: boxData.type,
        amount: boxData.value,
        spins: boxData.value,
        opened: false,
        firestoreId: boxData.firestoreId
    });

    localStorage.setItem(surpriseKey, JSON.stringify(surpriseData));
}

// ===== 3. CHECK PENDING SURPRISE =====
function checkUserSurprise() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const surpriseKey = `userSurprise_${currentUser.id}`;
    const surpriseJson = localStorage.getItem(surpriseKey);

    if (surpriseJson) {
        try {
            const data = JSON.parse(surpriseJson);
            if (data.status === 'pending' && data.boxes && data.boxes.length > 0) {
                userSurpriseData = data;
                showSurpriseModal();
            }
        } catch(e) {
            console.error('Error parsing surprise:', e);
        }
    }
}

// ===== 4. SHOW MODAL =====
function showSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (!modal || !userSurpriseData) return;

    selectedBoxIndices = [];
    document.getElementById('userSurpriseResult').style.display = 'none';
    document.getElementById('claimUserSurpriseBtn').disabled = true;

    renderBoxGrid();
    updateSelectionDisplay();

    modal.style.display = 'flex';
}

// ===== 5. RENDER BOX GRID =====
function renderBoxGrid() {
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
            icon = 'fa-smile';
            iconColor = '#9e9e9e';
        }

        html += `
            <div onclick="${!isOpened ? `selectBox(${index})` : ''}"
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
                ${isOpened ? '<div style="color: #ff5252; font-size: 10px;">✓ ဖွင့်ပြီး</div>' : ''}
                ${isSelected ? '<div style="color: #ffd700; font-size: 10px;">✓ ရွေးပြီး</div>' : ''}
            </div>
        `;
    });

    grid.innerHTML = html;
}

// ===== SELECT USER BOX =====
// ===== SELECT BOX =====
window.selectBox = function(index) {
    console.log('selectBox called with index:', index);
    
    if (!userSurpriseData) {
        console.error('userSurpriseData is null');
        return;
    }
    
    if (selectedBoxIndices.includes(index)) {
        selectedBoxIndices = selectedBoxIndices.filter(i => i !== index);
    } else {
        if (selectedBoxIndices.length >= MAX_SELECTIONS) {
            showNotification(`အများဆုံး ${MAX_SELECTIONS} ခုသာရွေးနိုင်ပါသည်။`, 'error');
            return;
        }
        selectedBoxIndices.push(index);
    }
    
    renderBoxGrid();
    updateSelectionDisplay();
    
    const claimBtn = document.getElementById('claimUserSurpriseBtn');
    if (claimBtn) claimBtn.disabled = selectedBoxIndices.length === 0;
};

// ===== 7. UPDATE SELECTION DISPLAY =====
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
                const box = userSurpriseData.boxes[idx];
                let color = '#9e9e9e';
                if (box.type === 'credit') color = '#00c853';
                else if (box.type === 'vip') color = '#ffd700';
                else if (box.type === 'freespin') color = '#2196f3';
                html += `<span style="background: ${color}20; border:1px solid ${color}; border-radius:15px; padding:5px 12px;">Box ${idx + 1}</span>`;
            });
           selectedContainer.innerHTML = html;
        }
    }
} 

    // ===== CLAIM SURPRISE =====
async function claimSurprise() {
    if (selectedBoxIndices.length === 0 || !userSurpriseData) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('User data not found!', 'error');
        return;
    }

     let totalCredits = 0;
let vipUpgrade = 0;
let totalSpins = 0;
const openedBoxes = [];

selectedBoxIndices.forEach(index => {
    const box = userSurpriseData.boxes[index];
    if (!box.opened) {
        box.opened = true;
        box.openedBy = currentUser.username;
        box.openedAt = new Date().toISOString();
        openedBoxes.push(box);

        if (box.type === 'credit') {
            totalCredits += box.amount || 0;
            currentUser.balance = (currentUser.balance || 0) + (box.amount || 0);
            currentUser.displayBalance = (currentUser.displayBalance || 0) + (box.amount || 0);  // 👈 ဒါထည့်
        } else if (box.type === 'vip') {
            vipUpgrade++;
            currentUser.vip = (currentUser.vip || 0) + 1;
        } else if (box.type === 'freespin') {
            const spins = box.spins || box.value || 0;
            totalSpins += spins;
            currentUser.freeSpins = (currentUser.freeSpins || 0) + spins;
        }
    }
});

// ===== SHOW ANIMATION =====
if (totalCredits > 0) {
    showSurpriseBoxAnimation('credit', totalCredits);
} else if (vipUpgrade > 0) {
    showSurpriseBoxAnimation('vip', vipUpgrade);
} else if (totalSpins > 0) {
    showSurpriseBoxAnimation('freespin', totalSpins);
}

    // Update Firestore with valid numbers
    const db = firebase.firestore();
    const batch = db.batch();

    openedBoxes.forEach(box => {
        if (box.firestoreId) {
            const boxRef = db.collection('sentBoxes').doc(box.firestoreId);
            batch.update(boxRef, {
                opened: true,
                openedBy: currentUser.username,
                openedAt: new Date().toISOString()
            });
        }
    });

    const userRef = db.collection('users').doc(currentUser.id);
    const updateData = {
        balance: currentUser.balance || 0,
        vip: currentUser.vip || 0,
        freeSpins: currentUser.freeSpins || 0  // 👈 undefined မဖြစ်အောင် || 0 ထည့်
    };
    batch.update(userRef, updateData);

    await batch.commit();
    

    // ===== UPDATE LOCAL STORAGE =====
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem('slotUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) users[userIndex] = currentUser;
    localStorage.setItem('slotUsers', JSON.stringify(users));

    // Mark surprise as completed
    userSurpriseData.status = 'completed';
    userSurpriseData.completedAt = new Date().toISOString();
    userSurpriseData.selectedBoxes = selectedBoxIndices;

    const surpriseKey = `userSurprise_${currentUser.id}`;
    localStorage.removeItem(surpriseKey);

    // Update game state
    window.gameState.balance = currentUser.balance;
    updateBalanceDisplay();

    // Show result
    showSurpriseResult(totalCredits, vipUpgrade, totalSpins);
    document.getElementById('claimUserSurpriseBtn').disabled = true;
}

// ===== 9. SHOW RESULT =====
function showSurpriseResult(credits, vip, spins) {
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
        message.textContent = `VIP အဆင့် ${vip} တိုးပါသည်။`;
    } else if (spins > 0) {
        icon.className = 'fas fa-play-circle';
        icon.style.color = '#2196f3';
        title.textContent = 'ဂုဏ်ယူပါတယ်။';
        message.textContent = `Free Spin ${spins} ကြိမ် ရရှိပါသည်။`;
    } else {
        icon.className = 'fas fa-smile';
        icon.style.color = '#9e9e9e';
        title.textContent = 'ကံကောင်းပါစေ။';
        message.textContent = 'ကျေးဇူးတင်ပါတယ်။';
    }

    renderBoxGrid();

    setTimeout(() => {
        if (resultDiv.style.display === 'block') closeSurpriseModal();
    }, 5000);
}

// ===== 10. CLOSE MODAL =====
function closeUserSurpriseModal() {
    const modal = document.getElementById('userSurpriseModal');
    if (modal) modal.style.display = 'none';
    if (userSurpriseData && userSurpriseData.boxes.every(b => b.opened)) userSurpriseData = null;
}

// ===== 11. INIT LISTENER ON AUTH =====
function initSurpriseListener() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            listenForSurpriseBox(user.uid);
            checkUserSurprise();
        }
    });
}

// ===== EXPORT =====
window.checkUserSurprise = checkUserSurprise;
window.claimUserSurprise = claimUserSurprise;
window.closeUserSurpriseModal = closeUserSurpriseModal;
window.initSurpriseListener = initSurpriseListener;

// Auto init if firebase is ready
if (typeof firebase !== 'undefined' && firebase.auth) {
    initSurpriseListener();
}


// ===== SURPRISE BOX ANIMATION =====
function showSurpriseBoxAnimation(boxType, boxValue) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s;
    `;

    let icon = 'fa-gift';
    let color = '#ffd700';
    let title = 'SURPRISE BOX!';
    let message = '';

    if (boxType === 'credit') {
        icon = 'fa-coins';
        color = '#00c853';
        title = 'CREDIT REWARD!';
        message = `${formatNumber(boxValue)} ကျပ်`;
    } else if (boxType === 'vip') {
        icon = 'fa-crown';
        color = '#ffd700';
        title = 'VIP UPGRADE!';
        message = `VIP Level ${boxValue}`;
    } else if (boxType === 'freespin') {
        icon = 'fa-play-circle';
        color = '#2196f3';
        title = 'FREE SPINS!';
        message = `${boxValue} Spins`;
    }

    overlay.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border: 3px solid ${color};
            border-radius: 30px;
            padding: 40px;
            text-align: center;
            animation: popIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
            box-shadow: 0 0 50px ${color};
        ">
            <div style="font-size: 80px; margin-bottom: 20px;">
                <i class="fas ${icon}" style="color: ${color};"></i>
            </div>
            <h2 style="
                font-size: 40px;
                font-weight: 900;
                color: ${color};
                margin-bottom: 20px;
                text-shadow: 0 0 20px ${color};
            ">
                ${title}
            </h2>
            <div style="
                font-size: 48px;
                font-weight: bold;
                color: white;
                margin-bottom: 20px;
            ">
                ${message}
            </div>
            <div style="font-size: 20px; color: #aaa;">
                ဂုဏ်ယူပါသည်။
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Create floating particles
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                width: ${10 + Math.random() * 20}px;
                height: ${10 + Math.random() * 20}px;
                background: ${color};
                border-radius: 50%;
                filter: blur(3px);
                animation: fadeOut 1s ease-out forwards;
                pointer-events: none;
                z-index: 10000001;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }, i * 50);
    }

    // Remove after 3 seconds
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => overlay.remove(), 500);
    }, 7000);
}

// ============================================
// 14. BALANCE & JACKPOT FUNCTIONS
// ============================================

function updateBalanceDisplay() {
    const balanceEl = document.getElementById('balanceAmount');
    const creditDisplay = document.getElementById('credit-display');
    
    // ယခုကစားလို့ရတဲ့ balance ကိုပြမယ်
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
// Loss Pool Jackpot Functions (defined early)
// ============================================
function listenToLossPool() {
    if (!firebase || !firebase.firestore) {
        console.warn('Firebase not available for loss pool');
        return;
    }
    const db = firebase.firestore();
    db.collection('admin').doc('lossPool').onSnapshot((doc) => {
        if (doc.exists) {
            const total = doc.data().totalAmount || 0;
            window.gameState.jackpotPool = total;
        } else {
            window.gameState.jackpotPool = 0;
        }
        updateJackpotPoolDisplay();
        console.log('🔄 LossPool updated:', window.gameState.jackpotPool);
    }, (err) => {
        console.error('LossPool listener error:', err);
    });
}

function updateJackpotPoolDisplay() {
    const jackpotEl = document.getElementById('jackpotPool');
    if (jackpotEl) {
        jackpotEl.textContent = formatNumber(window.gameState.jackpotPool || 0);
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
// LISTEN FOR PENDING JACKPOT (SAFE VERSION)
// ============================================
function listenForPendingJackpot(userId) {
    if (!userId || !db) {
        console.warn('⚠️ listenForPendingJackpot: userId or db missing');
        return;
    }
    console.log('🟢 Jackpot Listener Started for User:', userId);

    const notificationsRef = db.collection('notifications')
        .where('userId', '==', userId)
        .where('type', '==', 'jackpot')
        .where('read', '==', false);

    return notificationsRef.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                const amount = data.amount || 0;
                const spinReq = data.spinRequirement || 10;
                const docId = change.doc.id; 

                if (amount > 0) {
                    window.gameState.pendingJackpotAmount = amount;
                    window.gameState.pendingJackpotSpinsLeft = spinReq;
                    window.gameState.Lucky_Money = amount;
                    window.gameState.Lucky_MoneySpinReq = spinReq;
                    window.gameState.currentNotifId = docId; 

                    console.log(`🎉 Jackpot Loaded: ${amount} (${spinReq} spins left)`);
                }
            }
        });
    }, (error) => {
        console.error('🔥 Error listening to notifications:', error);
    });
}

// ============================================
// JACKPOT ပြီးဆုံးကြောင်း FIRESTORE မှာ သွားမှတ်မည့် FUNCTION
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
        
        // Reset local pending state
        window.gameState.currentNotifId = null;
        window.gameState.pendingJackpotAmount = 0;
        window.gameState.pendingJackpotSpinsLeft = 0;
    } catch (err) {
        console.error('❌ Error finalizing jackpot noti:', err);
    }
}


// ============================================
// LISTEN FOR USER BALANCE (REAL-TIME)
// ============================================
function listenToUserData(userId) {
    if (!userId || !db) return;

    const userRef = db.collection('users').doc(userId);
    return userRef.onSnapshot((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            // Balance ကို update လုပ်မယ်
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
// Jackpot anmation
// ============================================

function showJackpotAwardAnimation(amount) {
    // ===== 1. Inject dynamic styles =====
    if (!document.getElementById('jackpot-award-styles')) {
        const style = document.createElement('style');
        style.id = 'jackpot-award-styles';
        style.innerHTML = `
            @keyframes jpPopIn {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
                40% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
            }
            @keyframes jpGlowPulse {
                0% { box-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff; }
                50% { box-shadow: 0 0 60px #ff44ff, 0 0 100px #44ffff; }
                100% { box-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff; }
            }
            @keyframes coinFountainLandscape {
                0% {
                    bottom: 0%;
                    transform: scale(0.6) rotate(0deg);
                    opacity: 0;
                }
                10% { opacity: 1; }
                35% {
                    bottom: 40%;
                    transform: scale(1.2) rotate(220deg);
                }
                55% {
                    bottom: 55%;
                    transform: scale(1.1) rotate(440deg);
                }
                75% {
                    bottom: 30%;
                    transform: scale(0.9) rotate(600deg);
                }
                100% {
                    bottom: -15%;
                    transform: scale(0.5) rotate(780deg);
                    opacity: 0;
                }
            }
            @keyframes jpNumberCount {
                0% { transform: scale(0.5); opacity: 0; letter-spacing: 10px; }
                100% { transform: scale(1); opacity: 1; letter-spacing: normal; }
            }
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
            }
            @keyframes jpScreenFlash {
                0% { background: radial-gradient(circle, transparent, transparent); }
                50% { background: radial-gradient(circle, rgba(255,215,0,0.6), rgba(255,0,255,0.4)); }
                100% { background: radial-gradient(circle, transparent, transparent); }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 2. Screen Flash (ပိုသေးအောင်) =====
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,215,0,0.5), rgba(255,0,255,0.3));
        z-index: 9999990;
        pointer-events: none;
        animation: jpScreenFlash 0.4s ease-out forwards;
    `;
    document.body.appendChild(flashOverlay);
    setTimeout(() => flashOverlay.remove(), 400);

    // ===== 3. Main Container (Landscape အတွက် သေးအောင်) =====
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000000;
        text-align: center;
        pointer-events: none;
        width: 70vw;
        max-width: 600px;
        animation: jpPopIn 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
    `;

    container.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a0a2a, #2a0a3a);
            border: 2px solid rgba(255,100,200,0.6);
            border-radius: 50px;
            padding: 20px 25px;
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
        ">
            <!-- JACKPOT Title (သေးအောင်) -->
            <div style="
                font-size: 42px;
                font-weight: 900;
                font-family: 'Bangers', 'Impact', cursive;
                background: linear-gradient(135deg, #ffaa44, #ff44aa, #44aaff);
                background-size: 200% auto;
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                animation: gradientShift 1s ease infinite;
                letter-spacing: 4px;
                margin-bottom: 10px;
            ">
                🎰 JACKPOT! 🎰
            </div>
            
            <!-- Amount Display (သေးအောင်) -->
            <div id="jpAmountDisplay" style="
                font-size: 64px;
                font-weight: 900;
                font-family: 'Black Ops One', 'Impact', monospace;
                background: linear-gradient(135deg, #ffaa44, #ff44aa, #44aaff);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                margin: 15px 0;
                animation: jpNumberCount 0.5s ease-out;
            ">
                0
            </div>
            
            <!-- Message (သေးအောင်) -->
            <div style="
                background: rgba(0,0,0,0.6);
                display: inline-block;
                padding: 8px 25px;
                border-radius: 40px;
                font-size: 20px;
                color: #ffd700;
                font-weight: bold;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255,215,0,0.5);
            ">
                🎉 ဂုဏ်ယူပါသည်။ 🎉
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // ===== 4. Count-up Effect =====
    const amountDisplay = document.getElementById('jpAmountDisplay');
    const finalAmount = amount;
    let current = 0;
    const duration = 1800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = finalAmount / steps;
    let counter = 0;
    
    const timer = setInterval(() => {
        counter++;
        current = Math.min(finalAmount, Math.floor(increment * counter));
        amountDisplay.textContent = formatNumber(current);
        if (current >= finalAmount) {
            clearInterval(timer);
            amountDisplay.innerHTML = `<span style="animation: jpNumberCount 0.3s;">${formatNumber(finalAmount)}</span>`;
        }
    }, stepTime);

    // ===== 5. Coin Fountain (Landscape အတွက် အနိမ့်ပိုင်းကနေ) =====
    createCoinFountainLandscape();

    // ===== 6. Screen Shake (နည်းနည်းသာ) =====
    let shakes = 0;
    const shakeInterval = setInterval(() => {
        const x = (Math.random() - 0.5) * 8;
        const y = (Math.random() - 0.5) * 5;
        document.body.style.transform = `translate(${x}px, ${y}px)`;
        shakes++;
        if (shakes > 12) {
            clearInterval(shakeInterval);
            document.body.style.transform = '';
        }
    }, 40);

    // ===== 7. Vibration =====
    if (navigator.vibrate) {
        navigator.vibrate([150, 80, 150, 80, 200]);
    }
      if (typeof SoundManager !== 'undefined') {
        if (SoundManager.congratulations) SoundManager.congratulations();
        if (SoundManager.coin) setTimeout(() => SoundManager.coin(), 300);
        if (SoundManager.fireworks) setTimeout(() => SoundManager.fireworks(), 600);
    }

    // ===== 8. Remove after animation =====
    setTimeout(() => {
        container.style.transition = 'opacity 0.5s, transform 0.3s';
        container.style.opacity = '0';
        container.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            container.remove();
        }, 500);
    }, 8500);
}

function createCoinFountainLandscape() {
    const fountainContainer = document.createElement('div');
    fountainContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999995;  /* စာတန်းအောက်မှာ ထား */
        overflow: visible;
    `;
    document.body.appendChild(fountainContainer);
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            const symbols = ['💰', '🪙', '💎', '⭐', '💫'];
            coin.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            
            const startX = 15 + Math.random() * 70;
            const duration = 1.8 + Math.random() * 1.2;
            const delay = i * 20;
            
            coin.style.cssText = `
                position: absolute;
                bottom: 0%;
                left: ${startX}%;
                font-size: ${28 + Math.random() * 40}px;
                filter: drop-shadow(0 0 10px gold);
                color: ${['#ffaa44', '#ff66cc', '#44aaff', '#88ff88'][Math.floor(Math.random() * 4)]};
                z-index: 9999996;
                text-shadow: 0 0 5px currentColor;
                animation: coinFountainLandscape ${duration}s ease-out ${delay}ms forwards;
            `;
            
            fountainContainer.appendChild(coin);
            setTimeout(() => coin.remove(), (delay + duration * 1000) + 500);
        }, i * 20);
    }
    
    setTimeout(() => {
        fountainContainer.remove();
    }, 9500);
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


// ===== UPDATE VIP DISPLAY =====
function updateVIPDisplay() {
    const vipLevel = window.gameState.vipLevel || 0;
    const totalDeposit = window.gameState.totalDeposit || 0;
    const config = VIP_CONFIG[vipLevel];
    
    // VIP Level ပြမယ်
    const levelEl = document.getElementById('vipLevelDisplay');
    if (levelEl) {
        levelEl.textContent = vipLevel;
    }
    
    // VIP Name ပြမယ်
    const nameEl = document.getElementById('vipName');
    if (nameEl) {
        nameEl.textContent = config.name;
        nameEl.style.color = getVIPColor(vipLevel);
    }
    
    // နောက် VIP Level အတွက်လိုအပ်ချက်
    const nextLevel = vipLevel + 1;
    if (nextLevel <= 5) {
        const required = VIP_CONFIG[nextLevel].requiredDeposit;
        const need = required - totalDeposit;
        
        const nextEl = document.getElementById('vipNextDisplay');
        if (nextEl) {
            nextEl.textContent = `နောက် VIP: ${formatNumber(need)} ကျပ်`;
        }
        
        // Progress bar
        const progress = (totalDeposit / required) * 100;
        const barEl = document.getElementById('vipProgressBar');
        if (barEl) {
            barEl.style.width = Math.min(progress, 100) + '%';
        }
    } else {
        // Max VIP
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
// LOAD USER FROM FIREBASE (ဆက်သုံး)
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

    // Buffalo Sound ခေါ်မယ် (admin control မပါ)
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
// 23. EXPORT GLOBALS
// ============================================
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
window.buffaloStampede = buffaloStampede;
window.highlightWinsPremium = highlightWinsPremium;
console.log('✅ Game.js ULTIMATE VERSION fully loaded with all features!');

// Ensure function is globally available
if (typeof listenToLossPool !== 'function') {
    window.listenToLossPool = listenToLossPool;
    window.updateJackpotPoolDisplay = updateJackpotPoolDisplay;
}
