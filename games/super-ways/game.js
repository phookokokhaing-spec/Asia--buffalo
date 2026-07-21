// ================================================================
// 1. LOBBY COMMUNICATION
// ================================================================

function sendToLobby(data) {
    if (window.parent) {
        window.parent.postMessage(data, '*');
        console.log('📤 Sent to Lobby:', data);
    } else {
        console.warn('⚠️ No parent window to send message.');
    }
}

function notifyBetToLobby(amount) {
    sendToLobby({ type: 'BET_DEDUCT', amount, game: 'superWays' });
}

function notifyWinToLobby(amount) {
    sendToLobby({ type: 'WIN_AMOUNT', amount, game: 'superWays' });
}

function requestBalanceFromLobby() {
    sendToLobby({ type: 'REQUEST_BALANCE', game: 'superWays' });
}

function syncBalanceToLobby(balance) {
    sendToLobby({ type: 'SYNC_BALANCE', balance, game: 'superWays' });
}

function goToLobby() {
    window.parent.postMessage({ type: 'GO_LOBBY' }, '*');
}

// ================================================================
// 2. CONFIGURATIONS & CONSTANTS
// ================================================================

// ---- Image Paths ----
const IMAGE_PATHS = {
    'k': 'images/sym_k.png', 'j': 'images/sym_j.png', 'q': 'images/sym_q.png',
    'nine': 'images/sym_nine.png', 'lion': 'images/sym_lion.png',
    'buffalo': 'images/sym_buffalo.png', 'ele': 'images/sym_ele.png',
    'deer': 'images/sym_deer.png', 'zebra': 'images/sym_zebra.png',
    'a': 'images/sym_a.png', 'wild': 'images/sym_wild.png',
    'scatter': 'images/sym_scatter.png', 'ten': 'images/sym_ten.png',
    'coin': 'images/sym_coin.png'
};

// ============================================
// PAYTABLE (HARD MODE)
// ============================================
const PAYTABLE = {
    'buffalo': {2: 2,  3: 8,  4: 15, 5: 30},
    'lion':    {3: 2,  4: 5,  5: 15},
    'ele':     {3: 1,  4: 3,  5: 10},
    'zebra':   {3: 1,  4: 2,  5: 8},
    'deer':    {3: 1,  4: 2,  5: 5},
    'a':       {3: 1,  4: 1,  5: 4},
    'k':       {3: 1,  4: 1,  5: 3},
    'q':       {3: 1,  4: 1,  5: 2},
    'j':       {3: 1,  4: 1,  5: 2},
    'ten':     {3: 1,  4: 1,  5: 1},
    'coin':    {3: 1,  4: 1,  5: 1},
    'nine':    {3: 1,  4: 1,  5: 1}
};

// ---- Scatter Rewards ----
const SCATTER_REWARDS = {
    3: { spins: 10, multiplier: 2 },
    4: { spins: 15, multiplier: 3 },
    5: { spins: 20, multiplier: 5 }
};

// ---- Bet Table ----
const BET_TABLE = {
    "1C": [80, 160, 320, 480, 800],
    "5C": [400, 800, 1600, 2400, 4000],
    "10C": [800, 1600, 3200, 4800, 8000],
    "16C": [1280, 2560, 5120, 7680, 12800],
    "20C": [1600, 3200, 6400, 9600, 16000],
    "50C": [4000, 8000, 16000, 24000, 40000]
};

const coinMap = {
    "1C": "images/btn_coin_1c.png",
    "5C": "images/btn_coin_5c.png",
    "10C": "images/btn_coin_10c.png",
    "20C": "images/btn_coin_20c.png",
    "50C": "images/btn_coin_50c.png"
};

// ---- Game Constants ----
const REELS = 5;
const ROWS = 4;

// ---- Symbol Weights ----
const WEIGHTS = {
    'buffalo': 1, 'ele': 1, 'lion': 1, 'zebra': 1,
    'deer': 2, 'a': 2, 'k': 2, 'q': 2,
    'j': 2, 'ten': 2, 'nine': 2, 'coin': 2,
    'wild': 1, 'scatter': 1
};

// ============================================
// SCALE CYCLE (Hard House Edge)
// ============================================
const SCALE_CYCLE = {
    rounds: [
        { normal: 1, ch1: 30, ch2: 1, ch3: 1, ch4: 1 },
        { normal: 1, ch1: 20, ch2: 1, ch3: 1, ch4: 1 },
        { normal: 1, ch1: 18, ch2: 1, ch3: 1, ch4: 1 },
        { normal: 1, ch1: 19, ch2: 1, ch3: 1, ch4: 1 },
        { normal: 1, ch1: 25, ch2: 1, ch3: 1, ch4: 1 }
    ],
    currentRound: 0,
    currentPhase: 'normal',
    phaseSpins: 0
};


const SCALE_CHECKS = {
    Ch1: { name: 'Ch1', reel1: 0, reel2: 1, userCanWin: false },
    Ch2: { name: 'Ch2', reel1: 2, reel2: 3, userCanWin: true },
    Ch3: { name: 'Ch3', reel1: 3, reel2: 4, userCanWin: true },
    Ch4: { name: 'Ch4', reel1: 0, reel2: 4, userCanWin: true }
};

// ================================================================
// 3. GAME STATE
// ================================================================

let state = {
    balance: 0,
    coinValue: "1C",
    betIndex: 0,
    bet: 80,
    totalWin: 0,
    isSpinning: false,
    autoSpin: false,
    autoSpinTotal: 0,
    autoSpinRemaining: 0,
    freeSpins: 0,
    freeSpinTotalWin: 0,
    freeSpinMultiplier: 1,
    freeSpinBaseWin: 0,
    isFreeSpin: false,
    reels: [],
    consecutiveWins: 0,
    accumulatedWin: 0,
    scatterQueue: [],
    isSuspense: false,
    freeSpinOriginalCount: 0,
   scatterAccumulatedWin: 0,
   freeSpinAccumulatedScatterWin: 0,
   freeSpinScatterWinType: '',
    gameStats: {
        totalSpins: 0,
        totalBets: 0,
        totalWins: 0,
        winCount: 0,
        bigWinCount: 0,
        freeSpinCount: 0,
        scatterCount: 0,
        history: []
    }
};

let winAnim = null;

// ================================================================
// 4. UTILITY HELPERS
// ================================================================

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function randomSym(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

function getUserWinReels(check) {
    if (check.name === 'Ch1') return [];
    if (check.name === 'Ch2') return [0, 1];
    if (check.name === 'Ch3') return [4];
    if (check.name === 'Ch4') return [4];
    return [0, 1, 2, 3, 4];
}

function calculateExtraSpins(scatterCount) {
    if (scatterCount >= 6) return 15;
    if (scatterCount >= 5) return 12;
    if (scatterCount >= 4) return 8;
    return 5;
}

function calculateScatterReward(scatterCount) {
    return SCATTER_REWARDS[Math.min(scatterCount, 5)] || SCATTER_REWARDS[3];
}
function getWinType(amt) {
    const bet = Number(state?.bet || 0);
    const winAmount = Number(amt || 0);

    if (bet <= 0 || winAmount <= 0) {
        return {
            type: 'normal',
            duration: 7000
        };
    }

    const multiplier = winAmount / bet;

    if (multiplier >= 15) {
        return {
            type: 'mega',
            duration: 15000
        };
    }

    if (multiplier >= 10) {
        return {
            type: 'super',
            duration: 15000
        };
    }

    if (multiplier >= 5) {
        return {
            type: 'big',
            duration: 15000
        };
    }

    return {
        type: 'normal',
        duration: 7000
    };
}

// ================================================================
// 5. SOUND MANAGER WRAPPER
// Game-side only: local SoundManager → parent Lobby SoundManager
// ================================================================

function getAvailableSoundManager() {
    try {
        // 1. Game iframe အတွင်း SoundManager ရှိရင် အရင်သုံး
        if (
            window.SoundManager &&
            typeof window.SoundManager === 'object'
        ) {
            return window.SoundManager;
        }

        // 2. Parent Lobby ထဲက SoundManager ကို fallback သုံး
        if (
            window.parent &&
            window.parent !== window &&
            window.parent.SoundManager &&
            typeof window.parent.SoundManager === 'object'
        ) {
            return window.parent.SoundManager;
        }
    } catch (error) {
        console.warn('⚠️ SoundManager access error:', error);
    }

    return null;
}


function playSound(name) {
    if (!name || typeof name !== 'string') {
        console.warn('⚠️ Invalid sound name:', name);
        return false;
    }

    try {
        const manager = getAvailableSoundManager();

        if (!manager) {
            console.warn('⚠️ SoundManager not available');
            return false;
        }

        const soundFunction = manager[name];

        if (typeof soundFunction !== 'function') {
            console.warn(`⚠️ Sound function not found: ${name}`);
            return false;
        }

        soundFunction.call(manager);
        return true;

    } catch (error) {
        console.warn(`⚠️ Failed to play sound "${name}":`, error);
        return false;
    }
}


function playWinSound(type, lines) {
    const winType = String(type || 'normal').toLowerCase();
    const winningLines = Array.isArray(lines) ? lines : [];

    console.log('🔊 playWinSound called:', {
        type: winType,
        lines: winningLines.length
    });

    const manager = getAvailableSoundManager();

    if (!manager) {
        console.warn('⚠️ SoundManager not available');
        return;
    }

    // ------------------------------------------------------------
    // Symbol-specific sounds
    // 5 symbols landed ဖြစ်ရင် symbol sound ဖွင့်မယ်
    // ------------------------------------------------------------
    const playedSymbolSounds = new Set();

    for (const line of winningLines) {
        if (!line || Number(line.count) !== 5) continue;

        const symbol = String(line.symbol || '').toLowerCase();

        if (
            symbol === 'buffalo' &&
            !playedSymbolSounds.has('buffalo')
        ) {
            playSound('buffalo');
            playedSymbolSounds.add('buffalo');
            console.log('🔊 Buffalo symbol sound');
        }

        if (
            symbol === 'lion' &&
            !playedSymbolSounds.has('lion')
        ) {
            playSound('lion');
            playedSymbolSounds.add('lion');
            console.log('🔊 Lion symbol sound');
        }
    }

    // ------------------------------------------------------------
    // Win tier sounds
    // ------------------------------------------------------------
    switch (winType) {
        case 'mega':
            console.log('🔊 MEGA WIN sounds');

            playSoundSequence([
                'bsm',
                'lion',
                'coin',
                'congratulations',
                'buffalo'
            ], 120);

            break;

        case 'super':
            console.log('🔊 SUPER WIN sounds');

            playSoundSequence([
                'congratulations',
                'bsm',
                'lion',
                'coin'
            ], 120);

            break;

        case 'big':
            console.log('🔊 BIG WIN sounds');

            playSoundSequence([
                'congratulations',
                'bsm',
                'lion'
            ], 120);

            break;

        case 'jackpot':
            console.log('🔊 JACKPOT sounds');

            playSoundSequence([
                'jackpot',
                'coin',
                'congratulations'
            ], 150);

            break;

        case 'normal':
        default:
            console.log('🔊 NORMAL WIN sounds');

            playSoundSequence([
                'congratulations',
                'win'
            ], 100);

            break;
    }
}


// ================================================================
// SOUND SEQUENCE HELPER
// အသံတွေကို တစ်ပြိုင်တည်းမဖွင့်ဘဲ အနည်းငယ်ခြားပြီးဖွင့်မယ်
// ================================================================

function playSoundSequence(soundNames, delay = 100) {
    if (!Array.isArray(soundNames)) return;

    soundNames.forEach(function (soundName, index) {
        setTimeout(function () {
            playSound(soundName);
        }, index * delay);
    });
}


// ================================================================
// OPTIONAL DIRECT HELPERS
// ================================================================

function playSpinSound() {
    playSound('spin');
}

function playCoinSound() {
    playSound('coin');
}

function playJackpotSound() {
    playSound('jackpot');
}

function playCongratulationsSound() {
    playSound('congratulations');
}


// Global access လိုရင်
window.playSound = playSound;
window.playWinSound = playWinSound;
window.playSoundSequence = playSoundSequence;
// ================================================================
// 6. SCALE RULES GENERATOR
// ================================================================

function generateScaleRules() {
    const stats = state.gameStats;
    stats.totalSpins++;

    const round = SCALE_CYCLE.rounds[SCALE_CYCLE.currentRound];
    const currentPhase = SCALE_CYCLE.currentPhase;

    if (SCALE_CYCLE.phaseSpins >= round[currentPhase]) {
        SCALE_CYCLE.phaseSpins = 0;
        const phases = ['normal', 'ch1', 'ch2', 'ch3', 'ch4'];
        const currentIndex = phases.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % phases.length;
        SCALE_CYCLE.currentPhase = phases[nextIndex];

        if (nextIndex === 0) {
            SCALE_CYCLE.currentRound = (SCALE_CYCLE.currentRound + 1) % SCALE_CYCLE.rounds.length;
        }
    }
    SCALE_CYCLE.phaseSpins++;

    const phase = SCALE_CYCLE.currentPhase;
    console.log(`🎯 Phase: ${phase}, Round: ${SCALE_CYCLE.currentRound + 1}, Spin: ${SCALE_CYCLE.phaseSpins}/${round[phase]}`);

    if (phase === 'normal') {
        return {
            activeCheck: { name: 'Normal', userCanWin: true },
            userWinReels: [0, 1, 2, 3, 4],
            houseWin: false,
            crossCheck: null,
            phase: 'Normal'
        };
    }

    if (phase === 'ch1') {
        return {
            activeCheck: { name: 'Ch1', userCanWin: false },
            userWinReels: [],
            houseWin: true,
            crossCheck: { reel1: 0, reel2: 1, mustDiffer: true },
            phase: 'Ch1'
        };
    }

    let check;
    if (phase === 'ch2') check = SCALE_CHECKS.Ch2;
    else if (phase === 'ch3') check = SCALE_CHECKS.Ch3;
    else if (phase === 'ch4') check = SCALE_CHECKS.Ch4;

    return {
        activeCheck: check,
        userWinReels: getUserWinReels(check),
        houseWin: false,
        crossCheck: { reel1: check.reel1, reel2: check.reel2, mustDiffer: true },
        phase: check.name
    };
}

// ================================================================
// 7. REEL GENERATION
// ================================================================

function buildPool(reelIndex, rules = null) {
    const pool = [];
    const isCh1 = rules?.phase === 'Ch1';
    const isFreeSpin = state.isFreeSpin === true;

    for (const [sym, count] of Object.entries(WEIGHTS)) {
        if (sym === 'wild' && (reelIndex === 0 || reelIndex === 4)) continue;
        if (sym === 'wild' && isCh1 && reelIndex === 1) continue;

        // Free Spin အတွင်း Scatter မထည့်
        if (sym === 'scatter' && isFreeSpin) continue;

        for (let i = 0; i < count; i++) {
            pool.push(sym);
        }
    }

    return pool;
}

function generateOneColumn(colIndex, rules = null) {
    const col = [];
    const pool = buildPool(colIndex, rules);
    const used = {};
    let scatterCount = 0;

    for (let r = 0; r < ROWS; r++) {
        let sym;
        let att = 0;

        do {
            sym = randomSym(pool);
            att++;
        } while ((used[sym] || 0) > 1 && att < 50);

        // Column တစ်ခုထဲမှာ Scatter တစ်ပြားပဲခွင့်ပြု
        if (sym === 'scatter') {
            if (scatterCount >= 1) {
                const nonScatterPool = pool.filter(s => s !== 'scatter');

                sym = nonScatterPool.length > 0
                    ? randomSym(nonScatterPool)
                    : 'nine';
            } else {
                scatterCount++;
            }
        }

        col.push(sym);
        used[sym] = (used[sym] || 0) + 1;
    }

    return col;
}

function generateNormalReels(rules) {
    const reels = [];
    for (let c = 0; c < REELS; c++) {
        reels.push(generateOneColumn(c, rules));
    }
    return reels;
}

function applyScaleCheck(reels, rules) {
    if (!rules || !rules.crossCheck) return reels;

    const crossCheck = rules.crossCheck;
    const r1 = reels[crossCheck.reel1];
    const r2 = reels[crossCheck.reel2];

    for (let i = 0; i < r2.length; i++) {
        if (r2[i] === 'wild' || r2[i] === 'scatter') continue;

        const r1Regular = r1.filter(s => s !== 'wild' && s !== 'scatter');

        if (r1Regular.includes(r2[i])) {
            const pool = buildPool(crossCheck.reel2, rules).filter(s => {
                if (s === 'wild' || s === 'scatter') return true;
                return !r1Regular.includes(s);
            });
            r2[i] = pool.length > 0 ? randomSym(pool) : r2[i];
        }
    }
    return reels;
}

function generateReels(rules) {
    if (!rules || !rules.crossCheck) {
        return generateNormalReels(rules);
    }
    let reels = generateNormalReels(rules);
    return applyScaleCheck(reels, rules);
}

// ================================================================
// 8. RENDER & UI HELPERS
// ================================================================

function renderReels() {
    for (let c = 0; c < REELS; c++) {
        const el = document.getElementById('reel' + c);
        if (!el) continue;
        el.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            const sym = state.reels[c][r];
            const slot = document.createElement('div');
            slot.className = 'symbol-slot';
            if (sym === 'scatter') slot.classList.add('scatter-symbol');
            const img = document.createElement('img');
            img.src = IMAGE_PATHS[sym];
            img.alt = sym;
            img.onerror = function() { this.style.opacity = '0.3'; };
            slot.appendChild(img);
            el.appendChild(slot);
        }
    }
}

function clearReelEffects() {
    const overlay = document.getElementById('win-overlay');
    if (overlay) overlay.classList.remove('active');

    document.querySelectorAll('.symbol-slot').forEach(el => {
        el.classList.remove('winning', 'win-jump', 'scatter-highlight', 'scatter-reveal', 'locked-column', 'suspense-glow', 'rise-column');
        el.style.animation = '';
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.filter = '';
        const border = el.querySelector('.win-run-border');
        if (border) border.remove();
    });

    document.querySelectorAll('.reel').forEach(r => {
        r.classList.remove('suspense-shake', 'win-shake');
    });

    document.querySelectorAll(".orbit").forEach(e => e.remove());
    document.querySelectorAll(".scatter-glow").forEach(e => e.classList.remove("scatter-glow"));
}

function setSpinButtonState(isSpinning) {
    const imgSpin = document.getElementById('img-spin');
    const imgStop = document.getElementById('img-stop');
    if (imgSpin && imgStop) {
        if (isSpinning) {
            imgSpin.classList.add('hidden');
            imgStop.classList.remove('hidden');
        } else {
            imgSpin.classList.remove('hidden');
            imgStop.classList.add('hidden');
        }
    }
}

function disableControls(disable) {
    const buttons = [
        document.getElementById('fb-minus'),
        document.getElementById('fb-plus'),
        document.getElementById('fb-max'),
        document.getElementById('fb-coin')
    ];
    buttons.forEach(btn => {
        if (btn) {
            btn.style.opacity = disable ? '0.4' : '1';
            btn.style.pointerEvents = disable ? 'none' : 'auto';
        }
    });
}

function updateUI() {
    const balanceEl = document.getElementById('balance');
    const betEl = document.getElementById('bet-display');
    const winEl = document.getElementById('win-display');
    const betBottom = document.getElementById('bet-value-1');
    const winBottom = document.getElementById('win-value-1');

    if (balanceEl) balanceEl.textContent = state.balance.toLocaleString();
    if (betEl) betEl.textContent = state.bet;
    if (winEl) winEl.textContent = state.totalWin.toLocaleString();
    if (betBottom) betBottom.textContent = state.bet;
    if (winBottom) winBottom.textContent = state.totalWin.toLocaleString();
}

function updateCoinUI() {
    const img = document.querySelector('#fb-coin img');
    if (!img) return;
    img.src = coinMap[state.coinValue] || coinMap["1C"];
}

function updateFreeSpinUI() {
    let indicator = document.getElementById('free-spin-indicator');
    if (state.isFreeSpin && state.freeSpins > 0) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'free-spin-indicator';
            indicator.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;background:rgba(8,18,28,0.85);backdrop-filter:blur(14px);border:2px solid #00ffc8;border-radius:60px;padding:10px 22px;box-shadow:0 8px 32px rgba(0,0,0,0.7);display:flex;align-items:center;gap:15px;animation:slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;';
            document.body.appendChild(indicator);
        }
        indicator.innerHTML = '<span style="font-size:28px;font-weight:900;color:#00ffc8;text-shadow:0 0 25px #00ffc866;">' + state.freeSpins + '</span><span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#aaccdd;font-weight:600;">FREE</span>';
    } else {
        if (indicator) {
            indicator.style.animation = 'slideInRight 0.3s ease-in reverse forwards';
            setTimeout(function() { if (indicator.parentNode) indicator.remove(); }, 350);
        }
    }
}

function hideFreeSpinIndicator() {
    const indicator = document.getElementById('free-spin-indicator');
    if (indicator) {
        indicator.style.animation = 'slideInRight 0.3s ease-in reverse forwards';
        setTimeout(function() { if (indicator.parentNode) indicator.remove(); }, 350);
    }
}

function updateAutoSpinUI() {
    let indicator = document.getElementById('auto-spin-indicator');
    if (state.autoSpin && state.autoSpinRemaining > 0) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auto-spin-indicator';
            indicator.className = 'auto-spin-indicator';
            document.body.appendChild(indicator);
        }
        indicator.innerHTML = `<div class="indicator-content"><span class="spin-number">${state.autoSpinRemaining}</span><span class="spin-label">SPINS</span></div><button class="stop-btn" onclick="stopAutoSpin()">⏹ ရပ်</button>`;
        if (!indicator.style.animation) indicator.style.animation = 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    } else {
        if (indicator) {
            indicator.style.animation = 'slideInRight 0.3s ease-in reverse forwards';
            setTimeout(() => { if (indicator.parentNode) indicator.remove(); }, 350);
        }
    }
}

// ================================================================
// 9. SPIN ANIMATION
// ================================================================

async function runSpinAnimation() {
    const intervals = [];
    for (let c = 0; c < REELS; c++) {
        const el = document.getElementById('reel' + c);
        if (!el) continue;
        el.classList.add('spinning');
        const slots = el.querySelectorAll('.symbol-slot img');
        const interval = setInterval(() => {
            slots.forEach(img => {
                const keys = Object.keys(IMAGE_PATHS);
                img.src = IMAGE_PATHS[keys[Math.floor(Math.random() * keys.length)]];
            });
        }, 80);
        intervals.push(interval);
    }
    playSound('spin');
    await delay(500);
    for (let c = 0; c < REELS; c++) {
        const el = document.getElementById('reel' + c);
        if (!el) continue;
        clearInterval(intervals[c]);
        el.classList.remove('spinning');
        const slots = el.querySelectorAll('.symbol-slot');
        slots.forEach((slot, r) => {
            const img = slot.querySelector('img');
            const sym = state.reels[c][r];
            if (img) img.src = IMAGE_PATHS[sym];
        });
        playSound('reelStop');
        if (c < REELS - 1) await delay(200);
    }
}

async function fastSpinSingleReel(colIndex, duration = 4000) {
    return new Promise((resolve) => {
       if (typeof SoundManager !== 'undefined' && typeof SoundManager.check === 'function') {
            SoundManager.check();
        }
        const reelEl = document.getElementById('reel' + colIndex);
        if (!reelEl) { resolve(); return; }

        const slots = reelEl.querySelectorAll('.symbol-slot img');
        const keys = Object.keys(IMAGE_PATHS);

        const interval = setInterval(() => {
            slots.forEach(img => {
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                img.src = IMAGE_PATHS[randomKey];
            });
        }, 100);

     setTimeout(() => {
            clearInterval(interval);
            const reelData = state.reels[colIndex];
            slots.forEach((img, idx) => {
                const sym = reelData[idx];
                if (sym && IMAGE_PATHS[sym]) {
                    img.src = IMAGE_PATHS[sym];
                }
            });
            resolve();
        }, duration);
    });
}

// ================================================================
// 10. WIN DETECTION & HIGHLIGHT
// ================================================================

      function checkWins() {
    let totalWin = 0, winCells = [], winLines = [];

    for (const sym of Object.keys(PAYTABLE)) {
        const reelCounts = [];
        for (let c = 0; c < REELS; c++) {
            const pos = [];
            for (let r = 0; r < ROWS; r++) {
                if (state.reels[c][r] === sym || state.reels[c][r] === 'wild') {
                    pos.push(r);
                }
            }
            reelCounts.push(pos);
        }

        let w5 = 0, w4 = 0, w3 = 0, w2 = 0;

        if (reelCounts[0].length && reelCounts[1].length) {
            w2 = reelCounts[0].length * reelCounts[1].length;
            if (reelCounts[2].length) {
                w3 = w2 * reelCounts[2].length;
                if (reelCounts[3].length) {
                    w4 = w3 * reelCounts[3].length;
                    if (reelCounts[4].length) {
                        w5 = w4 * reelCounts[4].length;
                    }
                }
            }
        }

        const pay = PAYTABLE[sym];
        let win = 0, wc = 0;

        if (w5 > 0) { win = w5 * pay[5]; wc = 5; }
        else if (w4 > 0) { win = w4 * pay[4]; wc = 4; }
        else if (w3 > 0) { win = w3 * pay[3]; wc = 3; }
        else if (w2 > 0 && pay[2]) { win = w2 * pay[2]; wc = 2; }

        if (win > 0) {
            totalWin += win * state.bet;
            winLines.push({
                symbol: sym,
                count: wc,
                ways: w5 || w4 || w3 || w2,
                win: win * state.bet
            });

            const highlightCount = Math.min(wc, REELS);
            for (let i = 0; i < highlightCount; i++) {
                for (const r of reelCounts[i]) {
                    winCells.push({ col: i, row: r });
                }
            }
        }
    }

    return {
        totalWin: Math.floor(totalWin),
        winCells: winCells,
        winLines: winLines
    };
}

function checkScatters() {
    let cnt = 0, pos = [];
    for (let c = 0; c < REELS; c++) {
        for (let r = 0; r < ROWS; r++) {
            if (state.reels[c][r] === 'scatter') {
                cnt++;
                pos.push({ col: c, row: r });
            }
        }
    }
    return { count: cnt, positions: pos };
}

function highlightWins(cells) {
    document.querySelectorAll('.symbol-slot').forEach(slot => {
        slot.classList.remove('winning', 'win-jump');
        slot.style.boxShadow = '';
        slot.style.border = '';
        slot.style.opacity = '0.45';
        slot.style.filter = 'brightness(.55)';
        const border = slot.querySelector('.win-run-border');
        if (border) border.remove();
    });

    for (const { col, row } of cells) {
        const reel = document.getElementById('reel' + col);
        if (reel && reel.children[row]) {
            const slot = reel.children[row];
            slot.classList.add('winning');
            slot.style.opacity = '1';
            slot.style.filter = 'brightness(1.2)';

            const border = document.createElement('div');
            border.className = 'win-run-border';
            border.innerHTML = `<span class="top"></span><span class="right"></span><span class="bottom"></span><span class="left"></span>`;
            slot.appendChild(border);
        }
    }
}

function animateWinLines(cells) {
    document.querySelectorAll('.symbol-slot').forEach(el => el.classList.remove('win-jump'));
    for (const { col, row } of cells) {
        const reel = document.getElementById('reel' + col);
        if (reel && reel.children[row]) {
            const slot = reel.children[row];
            setTimeout(() => {
                slot.classList.add('win-jump');
                setTimeout(() => slot.classList.remove('win-jump'), 1200);
            }, col * 80 + row * 40);
        }
    }
}

function highlightScatters() {
    document.querySelectorAll(".orbit").forEach(e => e.remove());
    document.querySelectorAll(".scatter-glow").forEach(e => e.classList.remove("scatter-glow"));

    let scatterFound = false;
    for (let c = 0; c < REELS; c++) {
        const reel = document.getElementById("reel" + c);
        if (!reel) continue;
        for (let r = 0; r < ROWS; r++) {
            if (state.reels[c][r] === "scatter") {
                const slot = reel.children[r];
                if (!slot) continue;
                slot.classList.add("scatter-glow");
                scatterFound = true;
                const orbit = document.createElement("div");
                orbit.className = "orbit";
                for (let i = 0; i < 4; i++) {
                    orbit.innerHTML += "<span></span>";
                }
                slot.appendChild(orbit);
            }
        }
    }

  if (scatterFound) {
    window.parent?.SoundManager?.boom?.();
}
}

function showWinOverlay(amount, winLines) {
    if (amount <= 0) return;
    const overlay = document.getElementById('win-overlay');
    if (overlay) {
        overlay.classList.add('active');
        const wa = document.getElementById('win-amount');
        const wt = document.getElementById('win-type');
        if (wa) wa.textContent = amount;
        if (wt) wt.textContent = 'WIN';
    }
}


// ============================================
// SAFE NUMBER HELPER
// ============================================

function safeNumber(value) {
    if (value === undefined || value === null || value === '') {
        return 0;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const cleaned = String(value)
        .replace(/,/g, '')
        .trim();

    const number = Number(cleaned);

    if (!Number.isFinite(number)) {
        console.warn('⚠️ Invalid number:', value);
        return 0;
    }

    return number;
}
// ================================================================
// TRIGGER WIN ANIMATION
// Game iframe → Parent Lobby winAnim
// ================================================================

function triggerWinAnimation(winResult) {
    return new Promise(function (resolve) {
        const totalWin = safeNumber(winResult?.totalWin);
        const winLines = Array.isArray(winResult?.winLines)
            ? winResult.winLines
            : [];

        const winInfo = getWinType(totalWin);
        const winType = winInfo.type;
        const duration = winInfo.duration || 15000;

        const parentWinAnim =
            window.parent &&
            window.parent !== window &&
            window.parent.winAnim &&
            typeof window.parent.winAnim.trigger === 'function'
                ? window.parent.winAnim
                : null;

        console.log('🎬 Win Animation called:', winType, totalWin);

        if (winType && parentWinAnim) {
            try {
                parentWinAnim.trigger(winType, totalWin, {
                    duration: duration,
                    onComplete: function () {
                        console.log('✅ WinAnimation complete');
                        resolve();
                    }
                });
            } catch (error) {
                console.error('❌ WinAnimation trigger error:', error);
                resolve();
            }
        } else {
            console.warn('⚠️ Parent WinAnimation unavailable');
            resolve();
        }

        playWinSound(winType, winLines);
    });
}
// ================================================================
// 11. GAME STATS
// ================================================================

function updateGameStats(winAmt, betAmt) {
    const stats = state.gameStats;
    stats.totalBets += betAmt;
    stats.totalWins += winAmt;
    if (winAmt > 0) stats.winCount++;
    if (winAmt >= betAmt * 5) stats.bigWinCount++;
    stats.history.push({
        spin: stats.totalSpins,
        bet: betAmt,
        win: winAmt,
        rtp: stats.totalBets > 0 ? stats.totalWins / stats.totalBets : 0
    });
    if (stats.history.length > 100) stats.history.shift();
}

function updateConsecutiveWins(winAmt) {
    if (winAmt > 0) {
        state.consecutiveWins++;
        console.log('Consecutive wins:', state.consecutiveWins);
    } else {
        state.consecutiveWins = 0;
    }
}


// ================================================================
// HANDLE SCATTER SUSPENSE (FIXED - With Fire Scatter)
// ================================================================

async function handleScatterSuspense(scatterResult) {
    console.log('🎯 Suspense mode triggered! Initial Scatter count:', scatterResult.count);

    const initialPositions = scatterResult.positions || [];
    const lockedCols = new Set(initialPositions.map(pos => pos.col));

    // ================================================================
    // ★ ★ ★ SCATTER 2 → FIRE SCATTER ★ ★ ★
    // ================================================================
    
    if (scatterResult.count === 2) {
        console.log('🔥 2 Scatters found! Replacing with Fire Scatters...');
        
        for (const pos of initialPositions) {
            const reel = document.getElementById('reel' + pos.col);
            if (!reel || !reel.children[pos.row]) continue;
            
            const slot = reel.children[pos.row];
            const img = slot.querySelector('img');
            if (!img) continue;
            
            // ★ ပုံကို မီးတောက် Scatter နဲ့ အစားထိုး ★
            img.src = 'images/sym_scatter_fire.png';  // ← မီးတောက် Scatter ပုံ
            
            // ★ မီးတောက် Class ထည့် ★
            slot.classList.add('scatter-fire');
            slot.style.cssText = `
                animation: firePulse 0.8s ease-in-out infinite alternate;
                border: 2px solid #FF6B00;
                box-shadow: 0 0 40px rgba(255, 107, 0, 0.8), 0 0 80px rgba(255, 107, 0, 0.4);
                border-radius: 8px;
                transition: all 0.3s ease;
                z-index: 5;
            `;
            
            console.log('🔥 Normal Scatter → Fire Scatter at:', pos.col, pos.row);
        }
    }

    // Highlight existing scatters
    for (const pos of initialPositions) {
        const reel = document.getElementById('reel' + pos.col);
        if (reel && reel.children[pos.row]) {
            const slot = reel.children[pos.row];
            slot.classList.add('scatter-highlight');
        }
    }

    const totalReels = 5;
    const availableCols = [];
    for (let i = 0; i < totalReels; i++) {
        if (!lockedCols.has(i)) {
            availableCols.push(i);
        }
    }

    // Apply fire frames
    if (typeof applySuspenseFireToReels === 'function') {
        applySuspenseFireToReels(availableCols);
    }

    if (window.parent?.SoundManager?.check) window.parent.SoundManager.check();
    await delay(500);

    let totalScatters = scatterResult.count;
    let allPositions = [...initialPositions];
    state.isSuspense = true;
    disableControls(true);

    // Check remaining reels one by one
    for (let i = 0; i < availableCols.length; i++) {
        const colToCheck = availableCols[i];
        state.reels[colToCheck] = generateOneColumn(colToCheck, null);

        const reelEl = document.getElementById('reel' + colToCheck);
        await fastSpinSingleReel(colToCheck);

        const reelData = state.reels[colToCheck];
        let foundScatter = false;
        for (let row = 0; row < reelData.length; row++) {
            if (reelData[row] === 'scatter') {
                totalScatters++;
                allPositions.push({ col: colToCheck, row: row });
                foundScatter = true;

                const slot = reelEl.children[row];
                if (slot) {
                    slot.classList.add('scatter-highlight');
                }
            }
        }

        if (foundScatter) {
            if (window.parent?.SoundManager?.boom) window.parent.SoundManager.boom();
            console.log(`🎉 Reel ${colToCheck} မှာ Scatter တွေ့သွားပြီ! စုစုပေါင်း: ${totalScatters}`);
        }

        await delay(400);
    }

    state.isSuspense = false;

    // Remove fire frames
    if (typeof removeAllFireFrames === 'function') {
        removeAllFireFrames();
    }

    await delay(800);

    // ================================================================
    // ★ ★ ★ SCATTER 3 မပြည့်ရင် မီးတောက် Scatter ကိုပြန်ဖယ် ★ ★ ★
    // ================================================================
    
    if (totalScatters < 3) {
        console.log('🔥 Scatter 3 not reached. Removing fire scatters...');
        document.querySelectorAll('.scatter-fire').forEach(el => {
            el.classList.remove('scatter-fire');
            el.style.cssText = '';
            const img = el.querySelector('img');
            if (img) {
                img.src = 'images/sym_scatter.png';  // ← မူလ Scatter ပုံပြန်
            }
        });
    }

    // Remove highlights
    document.querySelectorAll('.scatter-highlight').forEach(el => {
        el.classList.remove('scatter-highlight');
        el.style.boxShadow = '';
        el.style.border = '';
        el.style.transform = '';
        el.style.transition = '';
    });

    console.log(`✅ Suspense ပြီးဆုံး။ စုစုပေါင်း Scatter: ${totalScatters}`);

   // ================================================================
    // ★ SCATTER WIN HANDLING ★
    // ================================================================

    const betAmount = state.bet || 80;
    console.log('🔍 DEBUG betAmount:', betAmount, 'state.bet:', state.bet);
    let scatterWin = 0;
    let winType = '';

    if (typeof state.scatterAccumulatedWin === 'undefined') {
        state.scatterAccumulatedWin = 0;
    }

    if (totalScatters >= 3) {
        if (totalScatters === 3) {
            scatterWin = betAmount * 3;
            winType = 'big';
        } else if (totalScatters === 4) {
            scatterWin = betAmount * 10;
            winType = 'super';
        } else if (totalScatters >= 5) {
            scatterWin = betAmount * 25;
            winType = 'mega';
        }

        console.log(`🎯 Scatter ${totalScatters} win: ${scatterWin} KS (${winType}) | betAmount: ${betAmount} × ${totalScatters === 3 ? 3 : totalScatters === 4 ? 10 : 25}`);

        // ★★★ Scatter Win ကို Win Box ထဲထား (Balance မပေါင်းဘူး) ★★★
        if (typeof state.freeSpinWinBoxTotal === 'undefined') {
            state.freeSpinWinBoxTotal = 0;
        }
        state.freeSpinWinBoxTotal += scatterWin;

        // ★★★ Win Box UI update ★★★
        updateUI();
        updateWinBox(state.freeSpinWinBoxTotal);

        // ★★★ Scatter Notification ★★★
        showScatterNotification(totalScatters, scatterWin, winType);

        // Scatter Win Data ကို သတ်မှတ်မယ်
        const scatterWinData = {
            count: totalScatters,
            winAmount: scatterWin,
            winType: winType
        };

        // ★★★ Win Animation ခေါ် (Balance မပေါင်းဘူး) ★★★
        if (winType) {
            triggerWinAnimation({
                totalWin: scatterWin,
                winCells: [],
                winLines: [{ 
                    symbol: `SCATTER ${totalScatters}`, 
                    count: totalScatters, 
                    ways: 0, 
                    win: scatterWin 
                }]
            });
        }

        // ★ Free Spin ကိုဆက်သွားမယ် ★
        const reward = SCATTER_REWARDS[Math.min(totalScatters, 5)];
        if (reward) {
            state.scatterQueue.push({
                type: 'freeSpin',
                count: totalScatters,
                reward: reward,
                positions: allPositions,
                scatterWin: scatterWin,
                winType: winType,
                scatterWinData: scatterWinData
            });
        }

    } else {
        console.log(`ℹ️ Scatter ${totalScatters} only - no win, no free spin`);
    }

    // ================================================================
    // ★ ★ ★ CONTINUE - processScatterQueue ကိုခေါ်မယ် ★ ★ ★
    // ================================================================

    if (state.scatterQueue.length > 0) {
        console.log('📦 Processing scatter queue...');
        await processScatterQueue();  // ← ဒီမှာ ခေါ်တယ်
    } else {
        console.log('✅ No queue, continuing...');
        disableControls(false);
        setSpinButtonState(false);

        if (state.autoSpin && state.autoSpinRemaining > 0) {
            console.log('🔄 Resuming Auto Spin. Remaining:', state.autoSpinRemaining);
            setTimeout(() => spin(), 500);
        } else {
            finalizeAutoSpin();
        }
    }
}

 //===================================================
// FIRE FRAME BORDER FOR SUSPENSE COLUMNS (FULL SET)
// ================================================================

let fireFrameImage = null;

function loadFireFrameImage() {
    return new Promise((resolve) => {
        const img = document.getElementById('fire-frame-img');
        if (img && img.complete && img.naturalWidth > 0) {
            fireFrameImage = img;
            resolve(img);
            return;
        }
        
        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        newImg.onload = function() {
            fireFrameImage = this;
            resolve(this);
        };
        newImg.onerror = function() {
            console.warn('Fire frame image not found. Using fallback.');
            fireFrameImage = null;
            resolve(null);
        };
        newImg.src = 'images/fire_frame.png';
    });
}

function applyFireFrameToColumn(colIndex) {
    const reel = document.getElementById('reel' + colIndex);
    if (!reel) return;
    
    removeFireFrameFromColumn(colIndex);
    
    if (!fireFrameImage) {
        reel.classList.add('suspense-column-css');
        return;
    }
    
    const rect = reel.getBoundingClientRect();
    
   
    const reelHeight = rect.height;
    
    const extraHeight = reelHeight;  
    
    const reelWidth = rect.width * 1.1; 
    const totalHeight = reelHeight + extraHeight;
    
    const padding = 20;
    
    const canvas = document.createElement('canvas');
    canvas.className = 'fire-frame-overlay';
    canvas.dataset.col = colIndex;
    
    canvas.width = reelWidth + padding;
    canvas.height = totalHeight + padding;
    
    canvas.style.cssText = `
        position: absolute;
        top: -${(totalHeight - reelHeight) / 2 + padding/2}px;
        left: -${padding/2}px;
        width: ${canvas.width}px;
        height: ${canvas.height}px;
        pointer-events: none;
        z-index: 10;
        border-radius: 10px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    if (getComputedStyle(reel).position === 'static') {
        reel.style.position = 'relative';
    }
    
    reel.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw fire frame image stretched to full canvas
    ctx.drawImage(
        fireFrameImage,
        0, 0,
        canvas.width,
        canvas.height
    );
    
    // Add glow overlay
    const glowGradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height) * 0.7
    );
    glowGradient.addColorStop(0, 'rgba(255, 200, 50, 0.05)');
    glowGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.15)');
    glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
    
    requestAnimationFrame(() => {
        canvas.style.opacity = '1';
    });
    
    console.log(`🔥 Fire frame applied to reel ${colIndex}: ${canvas.width}x${canvas.height}`);
}

function removeFireFrameFromColumn(colIndex) {
    const reel = document.getElementById('reel' + colIndex);
    if (!reel) return;
    
    const canvas = reel.querySelector('.fire-frame-overlay');
    if (canvas) {
        canvas.style.opacity = '0';
        setTimeout(() => {
            if (canvas.parentNode) canvas.remove();
        }, 300);
    }
    
    reel.classList.remove('suspense-column-css');
}

function applySuspenseFireToReels(activeColumns) {
    // If no columns, return
    if (!activeColumns || activeColumns.length === 0) return;
    
    // First, ensure image is loaded
    if (!fireFrameImage) {
        loadFireFrameImage().then(() => {
            applySuspenseFireToReels(activeColumns);
        });
        return;
    }
    
    activeColumns.forEach(colIndex => {
        applyFireFrameToColumn(colIndex);
    });
}

function removeAllFireFrames() {
    document.querySelectorAll('.fire-frame-overlay').forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 300);
    });
    document.querySelectorAll('.suspense-column-css').forEach(el => {
        el.classList.remove('suspense-column-css');
    });
}
// ================================================================
// 13. FREE SPINS
// ================================================================

async function runFreeSpinLoop() {
    while (state.isFreeSpin && state.freeSpins > 0) {
        await runOneFreeSpin();
        state.freeSpins--;
        updateFreeSpinUI();

        const scatterResult = checkScatters();
        if (scatterResult.count >= 2) {
            if (window.parent?.SoundManager?.check) window.parent.SoundManager.check();
            const extra = calculateExtraSpins(scatterResult.count);
            state.freeSpins += extra;
            showExtraFreeSpinAnimation(extra);
            updateFreeSpinUI();
        }

        if (state.freeSpins > 0) {
            await delay(1000);
        }
    }
}


// ================================================================
// RUN ONE FREE SPIN (FIXED - Multiplier Check)
// ================================================================

async function runOneFreeSpin() {
    state.isSpinning = true;
    state.totalWin = 0;
    clearReelEffects();

    const rules = generateScaleRules();
    state.reels = generateReels(rules);

    await runSpinAnimation();
    renderReels();

    const winResult = checkWins();
    updateGameStats(winResult.totalWin, state.bet);
    updateConsecutiveWins(winResult.totalWin);

    if (winResult.totalWin > 0) {
        let winAmount = winResult.totalWin;
        
        // ★ ★ ★ Multiplier ကို checkWins() မှာ မြှောက်ပြီးသားလား စစ် ★ ★ ★
        // checkWins() က multiplier မြှောက်ပြီးသားဆိုရင် ဒီမှာ ထပ်မြှောက်တော့ဘူး
        // checkWins() က multiplier မြှောက်မထားရင် ဒီမှာ မြှောက်
        
        // ★ ★ ★ ဒီမှာ multiplier ထည့်မယ် (checkWins() က မြှောက်မထားရင်) ★ ★ ★
        // if (state.freeSpinMultiplier > 1) {
        //     winAmount = winAmount * state.freeSpinMultiplier;
        //     console.log('💰 Multiplier applied:', state.freeSpinMultiplier, 'x →', winAmount);
        // }

        state.totalWin = winAmount;
        
        // ★ ★ ★ Win Box ထဲမှာ ပေါင်းမယ် ★ ★ ★
        // ★★★ BUG FIX #2: Ensure freeSpinWinBoxTotal is initialized ★★★
        if (typeof state.freeSpinWinBoxTotal === 'undefined') {
            state.freeSpinWinBoxTotal = 0;
        }
        state.freeSpinWinBoxTotal += winAmount;
        state.freeSpinTotalWin += winAmount;

        // ★ ★ ★ UPDATE UI ★ ★ ★
        updateUI();
        updateWinBox(state.freeSpinWinBoxTotal);

        highlightWins(winResult.winCells);
        animateWinLines(winResult.winCells);
    }

    state.isSpinning = false;
}


// ================================================================
// END FREE SPINS (FIXED - Remove duplicate Win Animation)
// ================================================================

async function endFreeSpins() {
    // ★ Win Box ထဲက Total Win ★
    const totalWinAmount = state.freeSpinWinBoxTotal || 0;

    console.log('💰 Free Spin Total Win (from Win Box):', totalWinAmount);

    state.isFreeSpin = false;
    state.freeSpinMultiplier = 1;
    state.freeSpins = 0;

    if (totalWinAmount > 0) {
        // ★★★ Step 1: Show Summary Box first (5 seconds) ★★★
        await delay(300);
        showAutoSpinSummary(totalWinAmount, state.freeSpinOriginalCount);
        await delay(5200);  // Wait for summary to finish

        // ★★★ Step 2: Win Animation ပေါ် (တစ်ခါပဲ) ★★★
        const winInfo = getWinType(totalWinAmount);
        if (winInfo.type) {
            await triggerWinAnimation({
                totalWin: totalWinAmount,
                winCells: [],
                winLines: [{ 
                    symbol: 'FREE SPIN TOTAL', 
                    count: 0, 
                    ways: 0, 
                    win: totalWinAmount 
                }]
            });
        }

        // ★★★ Step 3: Balance ထဲ ငွေပေါင်း (နောက်ဆုံး) ★★★
        state.balance += totalWinAmount;
        notifyWinToLobby(totalWinAmount);
    }

    hideFreeSpinIndicator();

    // ================================================================
    // ★ ★ ★ CLEANUP အားလုံးပြီးမှ UI UPDATE ★ ★ ★
    // ================================================================
    
    state.accumulatedWin = 0;
    state.totalWin = 0;
    state.freeSpinTotalWin = 0;
    state.freeSpinWinBoxTotal = 0;
    state.freeSpinScatterWinType = '';
    state.scatterAccumulatedWin = 0;

    // ★ ★ ★ Win Box ကိုရှင်း ★ ★ ★
    updateWinBox(0);
    updateUI();

    console.log('✅ Free Spins finished. Total won:', totalWinAmount);

    // Auto Spin ကျန်နေသေးရင် ဆက်လည်
    state.isSpinning = false;
    setSpinButtonState(false);
    disableControls(false);

    if (state.autoSpin && state.autoSpinRemaining > 0) {
        console.log('🔄 Resuming Auto Spin. Remaining:', state.autoSpinRemaining);
        setTimeout(() => spin(), 500);
    } else {
        finalizeAutoSpin();
    }
}

// ================================================================
// UPDATE UI (FIXED - Check Free Spin)
// ================================================================
function updateUI() {
    const balanceEl = document.getElementById('balance');
    const betEl = document.getElementById('bet-display');
    const winEl = document.getElementById('win-display');
    const betBottom = document.getElementById('bet-value-1');
    const winBottom = document.getElementById('win-value-1');

    if (balanceEl) balanceEl.textContent = state.balance.toLocaleString();
    if (betEl) betEl.textContent = state.bet;
    if (betBottom) betBottom.textContent = state.bet;

    // ★ ★ ★ WIN BOX - Free Spin စစ်မယ် ★ ★ ★
    if (state.isFreeSpin) {
        // ★★★ BUG FIX #2: Ensure freeSpinWinBoxTotal exists ★★★
        const winAmount = state.freeSpinWinBoxTotal || 0;
        if (winEl) winEl.textContent = winAmount.toLocaleString();
        if (winBottom) winBottom.textContent = winAmount.toLocaleString();
    } else {
        if (winEl) winEl.textContent = state.totalWin.toLocaleString();
        if (winBottom) winBottom.textContent = state.totalWin.toLocaleString();
    }
}

// ================================================================
// START FREE SPIN MODE (FIXED - Show Notification AFTER Animation)
// ================================================================

async function startFreeSpinMode(scatterCount, reward, scatterWinData) {
    console.log('🎰 Starting Free Spin Mode...');

    // Setup state
    state.isFreeSpin = true;
    state.freeSpins = reward.spins;
    state.freeSpinOriginalCount = reward.spins;
    state.freeSpinMultiplier = reward.multiplier;
    state.freeSpinTotalWin = 0;
    state.accumulatedWin = 0;

    // Scatter Win ကို Win Box ထဲ စထည့်
    if (typeof state.freeSpinWinBoxTotal === 'undefined') {
        state.freeSpinWinBoxTotal = 0;
    }
    state.freeSpinWinBoxTotal = state.scatterAccumulatedWin || 0;
    updateWinBox(state.freeSpinWinBoxTotal);
    updateUI();

       if (window.parent?.SoundManager?.noti) window.parent.SoundManager.noti();

    // ================================================================
    // ★ ★ ★ 1. Scatter Animation ကိုအရင်ပြ (၃.၃ စက္ကန့်) ★ ★ ★
    // ================================================================
    await playScatterFreeSpinAnimation();

    // ================================================================
    // ★ ★ ★ 2. Animation ပြီးရင် Notification ကိုပြ (၃ စက္ကန့်) ★ ★ ★
    // ================================================================
    if (scatterWinData && scatterWinData.winAmount > 0) {
        showScatterNotification(
            scatterWinData.count,
            scatterWinData.winAmount,
            scatterWinData.winType,
            3000
        );
    }

    // ★ ★ ★ SHOW POPUP AND WAIT ★ ★ ★
    await showFreeSpinPopupAndWait(reward.spins, reward.multiplier);

    // Run free spin loop
    await runFreeSpinLoop();

    // End and cleanup
    await endFreeSpins();

    state.isSpinning = false;
    disableControls(false);
    setSpinButtonState(false);
}
// ================================================================
// UPDATE WIN BOX (With Animation)
// ================================================================

function updateWinBox(amount) {
    const winEl = document.getElementById('winAmount');
    if (!winEl) return;
    
    winEl.textContent = amount.toLocaleString();
    
    // ★ ငွေပြောင်းတိုင်း လှုပ်ရှားမှု ★
    winEl.style.animation = 'none';
    setTimeout(() => {
        winEl.style.animation = 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 10);
}


// ================================================================
// POPUP WITH PROMISE (WAIT UNTIL CLOSED)
// ================================================================

function showFreeSpinPopupAndWait(spins, multiplier) {
    return new Promise((resolve) => {
        // Remove old popup if exists
        let popup = document.getElementById('free-spin-popup');
        if (popup) popup.remove();

        // Create popup
        popup = document.createElement('div');
        popup.id = 'free-spin-popup';
        popup.style.cssText = `
            position:fixed; top:0; left:0; width:100%; height:100%;
            z-index:999999; display:flex; justify-content:center; align-items:center;
            background:rgba(0,0,0,0.7); backdrop-filter:blur(8px);
            pointer-events:auto;
        `;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position:relative; animation:popUpBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            display:inline-block; cursor:pointer;
        `;

        const img = document.createElement('img');
        img.src = 'images/popup_number.png';
        img.style.cssText = 'max-width:80vw;max-height:80vh;object-fit:contain;display:block;';
        wrapper.appendChild(img);

        const numberDiv = document.createElement('div');
        numberDiv.style.cssText = `
            position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);
            font-family:"Impact","Arial Black",sans-serif; font-weight:900;
            color:#FFD700; font-size:clamp(60px, 15vw, 160px);
            text-shadow:0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4);
            line-height:1;
        `;
        numberDiv.textContent = spins;
        wrapper.appendChild(numberDiv);

        // ★ Close button ★
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position:absolute; top:10px; right:15px;
            background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.3);
            color:white; font-size:24px; border-radius:50%;
            width:44px; height:44px; cursor:pointer;
            transition:all 0.2s; font-weight:bold;
        `;
        closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(255,255,255,0.3)'; };
        closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(255,255,255,0.15)'; };
        wrapper.appendChild(closeBtn);

        popup.appendChild(wrapper);
        document.body.appendChild(popup);

        // ★ Click on popup or close button → close and resolve ★
        const closePopup = () => {
            if (popup.parentNode) {
                popup.style.animation = 'popUpBounce 0.3s ease-in reverse forwards';
                setTimeout(() => {
                    if (popup.parentNode) popup.remove();
                    resolve(); // ★ Allow free spin to start ★
                }, 350);
            } else {
                resolve();
            }
        };

        // Click on wrapper (background) closes it
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });

        // Close button
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });

        // Auto close after 5 seconds (fallback)
        if (window._freePopupTimer) clearTimeout(window._freePopupTimer);
        window._freePopupTimer = setTimeout(() => {
            closePopup();
        }, 5000);
    });
}

function closeFreeSpinPopup() {
    const popup = document.getElementById('free-spin-popup');
    if (popup) popup.remove();
    if (window._freePopupTimer) {
        clearTimeout(window._freePopupTimer);
        window._freePopupTimer = null;
    }
}

function showExtraFreeSpinAnimation(extra) {
    let el = document.getElementById('extra-spin-notification');
    if (el) el.remove();

    el = document.createElement('div');
    el.id = 'extra-spin-notification';
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999998;background:rgba(0,0,0,0.85);border:3px solid #f3b33d;padding:30px 50px;border-radius:30px;color:white;text-align:center;animation:popUpBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;min-width:200px;box-shadow:0 20px 60px rgba(0,0,0,0.9);';
    el.innerHTML = '<div style="font-size:60px;margin-bottom:10px;">🎰</div><div style="font-size:28px;font-weight:900;color:#ffd966;">+' + extra + ' FREE SPINS</div>';
    document.body.appendChild(el);

   setTimeout(function() { if (el.parentNode) el.remove(); }, 1500);
}


// ================================================================
// SHOW SCATTER NOTIFICATION (FIXED - Auto Close)
// ================================================================

function showScatterNotification(count, winAmount, winType, duration) {
    // ★ Default duration 3000ms
    const notiDuration = duration || 8000;

    const popup = document.getElementById('scatterNotiPopup');
    if (!popup) {
        console.warn('⚠️ scatterNotiPopup not found');
        return;
    }

    // Update content
    document.getElementById('scatterCountDisplay').textContent = count;
    document.getElementById('scatterWinAmount').textContent = winAmount.toLocaleString();

    // Win Type
    const badge = document.getElementById('scatterWinBadge');
    const typeText = document.getElementById('scatterWinTypeText');
    const colors = {
        'big': { color: '#00ff88', label: 'BIG WIN' },
        'super': { color: '#ff6600', label: '🔥 SUPER WIN' },
        'mega': { color: '#ff0044', label: '💎 MEGA WIN' }
    };

    if (winType && colors[winType]) {
        badge.style.display = 'inline-block';
        badge.style.borderColor = colors[winType].color;
        badge.style.color = colors[winType].color;
        badge.style.background = `linear-gradient(135deg, ${colors[winType].color}33, ${colors[winType].color}11)`;
        typeText.textContent = colors[winType].label;
    } else {
        badge.style.display = 'none';
    }

    // Reset progress bar
    const progress = document.getElementById('scatterNotiProgress');
    if (progress) {
        progress.style.animation = 'none';
        setTimeout(() => {
            progress.style.animation = `progressShrink ${notiDuration/1000}s linear forwards`;
        }, 10);
    }

    // Show popup
    popup.style.display = 'flex';
    popup.classList.remove('hidden');

    // Play sound
    if (winType === 'mega') {
    playSound('congratulations');
} else {
    playSound('noti');
}

    // ★ ★ ★ AUTO CLOSE AFTER DURATION ★ ★ ★
    clearTimeout(window._scatterNotiTimer);
    window._scatterNotiTimer = setTimeout(function() {
        closeScatterNotification();
    }, notiDuration);
}

function closeScatterNotification() {
    console.log('🔴 closeScatterNotification called');
    const popup = document.getElementById('scatterNotiPopup');
    if (popup) {
        popup.style.display = 'none';
        popup.classList.add('hidden');
    }
    clearTimeout(window._scatterNotiTimer);
}

// ================================================================
// SCATTER FREE SPIN ANIMATION (FIXED - Returns Duration)
// ================================================================

function playScatterFreeSpinAnimation() {
    return new Promise(resolve => {
        const positions = checkScatters().positions;
        const ANIMATION_DURATION = 15000;  // ★ Duration ကိုသိမ်းထား

        const overlay = document.createElement('div');
        overlay.id = 'scatter-pro-overlay';
        document.body.appendChild(overlay);

        const rays = document.createElement('div');
        rays.className = 'scatter-rays';
        overlay.appendChild(rays);

        const flash = document.createElement('div');
        flash.className = 'scatter-flash';
        overlay.appendChild(flash);

        const text = document.createElement('div');
        text.className = 'scatter-free-text';
        text.textContent = 'SCATTER FREE SPIN!';
        overlay.appendChild(text);

        positions.forEach((pos, index) => {
            const reel = document.getElementById('reel' + pos.col);
            if (!reel || !reel.children[pos.row]) return;

            const slot = reel.children[pos.row];
            const img = slot.querySelector('img');
            if (!img) return;

            const rect = slot.getBoundingClientRect();

            const clone = document.createElement('img');
            clone.src = img.src;
            clone.className = 'scatter-fly scatter-fly-' + ((index % 3) + 1);

            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';

            clone.style.setProperty('--startLeft', rect.left + 'px');
            clone.style.setProperty('--startTop', rect.top + 'px');

            overlay.appendChild(clone);
            slot.classList.add('scatter-highlight');
        });

        createScatterParticles();

        // ★ ★ ★ ANIMATION_DURATION ကိုသုံးပြီး resolve ★ ★ ★
        setTimeout(() => {
            overlay.remove();
            document.querySelectorAll('.scatter-highlight').forEach(el => {
                el.classList.remove('scatter-highlight');
            });
            resolve(ANIMATION_DURATION);  // ← Duration ကိုပြန်ပေး
        }, ANIMATION_DURATION);
    });
}
function createScatterParticles() {
    for (let i = 0; i < 90; i++) {
        const p = document.createElement('div');
        p.className = 'scatter-particle';

        const angle = Math.random() * Math.PI * 2;
        const distance = 90 + Math.random() * 280;

        p.style.setProperty('--x', Math.cos(angle) * distance + 'px');
        p.style.setProperty('--y', Math.sin(angle) * distance + 'px');

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}


// ================================================================
// PROCESS SCATTER QUEUE (FIXED - Handle freeSpin)
// ================================================================

async function processScatterQueue() {
    console.log('📦 Processing scatter queue. Size:', state.scatterQueue.length);
    
    if (state.scatterQueue.length === 0) {
        console.log('✅ Queue empty, finalizing...');
        if (state.autoSpin && state.autoSpinRemaining > 0) {
            console.log('🔄 Resuming Auto Spin. Remaining:', state.autoSpinRemaining);
            state.isSpinning = false;
            setSpinButtonState(false);
            disableControls(false);
            setTimeout(() => spin(), 500);
            return;
        }
        finalizeAutoSpin();
        return;
    }

    const item = state.scatterQueue.shift();
    console.log('📦 Processing item:', item.type);

    state.isSpinning = true;
    setSpinButtonState(true);
    disableControls(true);

    try {
        if (item.type === 'freeSpin' || item.type === 'scatter3') {
            console.log('🎰 Starting free spin mode...');
            await startFreeSpinMode(item.count, item.reward, item.scatterWinData);
        } else if (item.type === 'scatter2') {
            console.log('🔍 Handling scatter suspense...');
            await handleScatterSuspense(item);
        }
    } catch (error) {
        console.error('Queue processing error:', error);
    }

    // Queue မှာ ကျန်နေသေးရင် ဆက်လုပ်
    if (state.scatterQueue.length > 0) {
        console.log('📦 More items in queue, continuing...');
        setTimeout(() => processScatterQueue(), 500);
        return;
    }

    // Queue ကုန်ပြီ
    console.log('✅ Queue done.');
    state.isSpinning = false;
    setSpinButtonState(false);
    disableControls(false);

    if (state.autoSpin && state.autoSpinRemaining > 0) {
        console.log('🔄 Resuming Auto Spin. Remaining:', state.autoSpinRemaining);
        setTimeout(() => spin(), 500);
    } else {
        finalizeAutoSpin();
    }
}

// ================================================================
// 16. AUTO SPIN
// ================================================================

function showAutoSpinPopup() {
    if (state.isSpinning) {
        console.log('Spin running, popup blocked');
        return;
    }

    let popup = document.getElementById('auto-spin-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'auto-spin-popup';
        popup.className = 'popup-overlay';
        document.body.appendChild(popup);
    }

    popup.innerHTML = `
        <div class="popup-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:2px dashed #3f5b6b; padding-bottom:15px;">
                <div class="popup-title">🎰 AUTO SPIN</div>
                <button class="popup-close" onclick="closeAutoSpinPopup()">✕</button>
            </div>
            <div class="option-grid">
                <button class="auto-option" data-value="10">10</button>
                <button class="auto-option" data-value="20">20</button>
                <button class="auto-option" data-value="30">30</button>
                <button class="auto-option" data-value="50">50</button>
                <button class="auto-option" data-value="70">70</button>
                <button class="auto-option" data-value="100">100</button>
            </div>
            <div class="popup-hint">👆 Click outside to close</div>
        </div>
    `;

    popup.querySelectorAll('.auto-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = parseInt(this.dataset.value, 10);
            closeAutoSpinPopup();
            startAutoSpin(val);
        });
    });

    popup.classList.add('active');
    popup.style.display = 'flex';
    console.log('Popup opened');
}

function closeAutoSpinPopup() {
    const popup = document.getElementById('auto-spin-popup');
    if (popup) {
        popup.classList.remove('active');
        popup.style.display = 'none';
        console.log('Popup closed');
    }
}

function startAutoSpin(count) {
    state.autoSpin = true;
    state.autoSpinTotal = count;
    state.autoSpinRemaining = count;
    updateAutoSpinUI();
    disableControls(true);
    spin();
}

function stopAutoSpin() {
    state.scatterQueue = [];
    finalizeAutoSpin();
}

function finalizeAutoSpin() {
     if (state.scatterQueue.length > 0) {
        console.log('📦 Scatter Queue pending. Processing first...');
        processScatterQueue();
        return;
    }

     
    // ★★★ BUG FIX #3: Save totalSpins BEFORE resetting state ★★★
    var totalWinAmount = state.accumulatedWin;
    var totalSpins = state.autoSpinTotal;

    if (state.accumulatedWin > 0) {
        state.balance += state.accumulatedWin;
        notifyWinToLobby(state.accumulatedWin);
    }

    state.isSpinning = false;
    setSpinButtonState(false);
    state.autoSpin = false;
    state.autoSpinTotal = 0;
    state.autoSpinRemaining = 0;

    updateAutoSpinUI();
    disableControls(false);
    closeAutoSpinPopup();
    updateUI();

    // ★★★ Show Auto Spin Summary popup (Total box) ★★★
    // Summary ပြီးရင် Win Animation ခေါ်မယ်
    if (totalWinAmount > 0) {
        showAutoSpinSummary(totalWinAmount, totalSpins);

        // Summary 5s ပြီးရင် Win Animation
        const winInfo = getWinType(totalWinAmount);
        if (winInfo.type) {
            setTimeout(() => {
                triggerWinAnimation({
                    totalWin: totalWinAmount,
                    winCells: [],
                    winLines: [{ 
                        symbol: 'AUTO SPIN TOTAL', 
                        count: 0, 
                        ways: 0, 
                        win: totalWinAmount 
                    }]
                });
            }, 5200);  // Summary 5s + 200ms buffer
        }
    }

    state.accumulatedWin = 0;
    state.totalWin = 0;
    updateUI();

    console.log('✅ Auto Spin finalized. Total accumulated:', totalWinAmount);
}

function toggleAutoSpin() {
    console.log("Auto =", state.autoSpin);
    if (state.autoSpin) {
        console.log("STOP");
        stopAutoSpin();
    } else {
        console.log("POPUP");
        showAutoSpinPopup();
    }
}

// ================================================================
// 17. AUTO SPIN SUMMARY
// ================================================================

function showAutoSpinSummary(totalWin, totalSpins) {
    const oldBox = document.getElementById('auto-summary-box');
    if (oldBox) oldBox.remove();

    let styleTag = document.getElementById('summary-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'summary-style';
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
        @keyframes summaryPopIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes summaryPopOut {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
    `;

    const box = document.createElement('div');
    box.id = 'auto-summary-box';
    box.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; justify-content: center; align-items: center;
        z-index: 9999999; background: rgba(0, 0, 0, 0.65);
        pointer-events: none; animation: fadeIn 0.3s ease-out;
    `;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        position: relative; display: inline-block;
        animation: summaryPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        max-width: 90vw; max-height: 85vh;
    `;

    const img = document.createElement('img');
    img.src = 'images/total_box.png';
    img.style.cssText = `
        display: block; max-width: 90vw; max-height: 80vh;
        width: auto; height: auto; object-fit: contain; margin: 0 auto;
    `;
    wrapper.appendChild(img);

    const textOverlay = document.createElement('div');
    textOverlay.style.cssText = `
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        text-align: center; width: 80%; pointer-events: none;
    `;

    const amountSpan = document.createElement('div');
    amountSpan.style.cssText = `
        font-family: "Impact", "Arial Black", sans-serif; font-weight: 900;
        color: #FFD700; text-shadow: 0 0 20px rgba(255,215,0,0.9), 0 0 40px rgba(255,215,0,0.5), 0 4px 8px rgba(0,0,0,0.8);
        font-size: clamp(40px, 12vw, 120px); line-height: 1.2;
    `;
    amountSpan.textContent = totalWin.toLocaleString();
    textOverlay.appendChild(amountSpan);

    const spinsSpan = document.createElement('div');
    spinsSpan.style.cssText = `
        font-family: "Segoe UI", sans-serif; font-weight: 600;
        color: #aaccdd; font-size: clamp(14px, 3vw, 28px);
        margin-top: 8px; text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        letter-spacing: 2px;
    `;
    spinsSpan.textContent = `🎰 ${totalSpins} SPINS`;
    textOverlay.appendChild(spinsSpan);

    wrapper.appendChild(textOverlay);
    box.appendChild(wrapper);
    document.body.appendChild(box);

    img.onerror = function() {
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.style.cssText = `
            background: linear-gradient(145deg, #1a2f44, #0b1a2e);
            border: 4px solid #f3b33d; padding: 40px 60px; border-radius: 30px;
            text-align: center; color: white; min-width: 320px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9);
        `;
        fallback.innerHTML = `
            <div style="font-size:16px;color:#aaccdd;text-transform:uppercase;letter-spacing:4px;margin-bottom:10px;">🎰 AUTO SPIN COMPLETE</div>
            <div style="font-size:20px;color:#c0d4df;margin-bottom:10px;">Total Spins <span style="color:#f3b33d;font-weight:bold;">${totalSpins}</span></div>
            <div style="font-size:48px;font-weight:900;color:#ffd966;text-shadow:0 0 30px #ffd96666;">${totalWin.toLocaleString()} <span style="font-size:20px;color:#aaccdd;">WIN</span></div>
        `;
        wrapper.appendChild(fallback);
    };

    setTimeout(function() {
        if (wrapper) {
            wrapper.style.animation = 'summaryPopOut 0.4s ease-in forwards';
            setTimeout(function() { if (box.parentNode) box.remove(); }, 400);
        }
    }, 5000);
}



// ================================================================
// MAIN SPIN FUNCTION (FIXED - async)
// ================================================================

async function spin() {   // ← ★ ADD 'async' HERE ★
    if (state.isSpinning) return;
    if (!state.isFreeSpin && state.balance < state.bet) {
        if (state.autoSpin) stopAutoSpin();
        return;
    }
    if (window.parent?.SoundManager?.spin) window.parent.SoundManager.spin();
    state.isSpinning = true;
    if (!state.isFreeSpin) state.balance -= state.bet;
    notifyBetToLobby(state.bet);
    state.totalWin = 0;
    updateUI();
    disableControls(true);
    setSpinButtonState(true);
    clearReelEffects();

    const rules = generateScaleRules();
    console.log('🎰 Phase:', rules.phase, 'Round:', SCALE_CYCLE.currentRound + 1, 'Spin:', SCALE_CYCLE.phaseSpins);

    state.reels = generateReels(rules);
    await runSpinAnimation();
    renderReels();

    const winResult = checkWins();
    const scatterResult = checkScatters();

    highlightScatters();

    updateGameStats(winResult.totalWin, state.bet);
    updateConsecutiveWins(winResult.totalWin);

    let winDuration = 0;
    if (winResult.totalWin > 0 && !rules.houseWin) {
        state.totalWin = winResult.totalWin;

        if (state.autoSpin) {
            state.accumulatedWin += winResult.totalWin;
            updateUI();
            winDuration = 0;
            highlightWins(winResult.winCells);
            animateWinLines(winResult.winCells);
        } else {
            state.balance += winResult.totalWin;
            notifyWinToLobby(winResult.totalWin);
            highlightWins(winResult.winCells);
            animateWinLines(winResult.winCells);
            // ★★★ BUG FIX #1: triggerWinAnimation returns Promise, must await it ★★★
            await triggerWinAnimation(winResult);
            updateUI();
        }
    } else if (rules.houseWin) {
        console.log('💀 HOUSE WIN (Ch1) - Phase triggered!');
    }

    // ============================================================
    // SCATTER HANDLING (FIXED - No await inside non-async)
    // ==============================================
         // ---- SCATTER 3+ (ချက်ချင်းပေးမယ်) ----
if (scatterResult.count >= 3 && !state.isFreeSpin) {
    console.log('🎯 Scatter 3+ detected! Count:', scatterResult.count);
    
    // ★ Scatter Win တွက်
    const betAmount = state.bet || 80;
    let scatterWin = 0;
    let winType = '';
    
    if (scatterResult.count === 3) {
        scatterWin = betAmount * 3;
        winType = 'big';
    } else if (scatterResult.count === 4) {
        scatterWin = betAmount * 10;
        winType = 'super';
    } else if (scatterResult.count >= 5) {
        scatterWin = betAmount * 25;
        winType = 'mega';
    }
    
    console.log(`🎯 Scatter ${scatterResult.count} win: ${scatterWin} KS (${winType})`);
    
    // ★ ★ ★ Scatter Win ကို Win Box ထဲထည့် (Balance မပေါင်းရသေး) ★ ★ ★
    if (typeof state.freeSpinWinBoxTotal === 'undefined') {
        state.freeSpinWinBoxTotal = 0;
    }
    state.freeSpinWinBoxTotal += scatterWin;
    updateWinBox(state.freeSpinWinBoxTotal);
    updateUI();
    
    // ★ Scatter Notification ပြ
    showScatterNotification(scatterResult.count, scatterWin, winType);
    
    // ★ Win Animation ပြ (Balance မပေါင်းဘူး)
    if (winType) {
        triggerWinAnimation({
            totalWin: scatterWin,
            winCells: [],
            winLines: [{ 
                symbol: `SCATTER ${scatterResult.count}`, 
                count: scatterResult.count, 
                ways: 0, 
                win: scatterWin 
            }]
        });
    }
    
    // ★ Free Spin ကိုဆက်သွား
    const reward = SCATTER_REWARDS[Math.min(scatterResult.count, 5)];
    if (reward) {
        state.scatterQueue.push({
            type: 'freeSpin',
            count: scatterResult.count,
            reward: reward,
            positions: scatterResult.positions,
            scatterWin: scatterWin,
            winType: winType,
            scatterWinData: {
                count: scatterResult.count,
                winAmount: scatterWin,
                winType: winType
            }
        });
    }
    
    state.isSpinning = false;
    setSpinButtonState(false);
    await processScatterQueue();
    return;
}

    // ---- SCATTER 2+ (Suspense) ----
    if (scatterResult.count >= 2 && !state.isFreeSpin) {
           if (window.parent?.SoundManager?.check) window.parent.SoundManager.check(); 

        state.scatterQueue.push({
            type: 'scatter2',
            count: scatterResult.count,
            positions: scatterResult.positions
        });
        console.log('📦 Scatter 2+ queued. Size:', state.scatterQueue.length);

        // ★ Process queue and RETURN ★
        state.isSpinning = false;
        setSpinButtonState(false);
        await processScatterQueue();  // ← await ကို async function ထဲမှာသုံးလို့ရပြီ
        return;
    }

    // ---- FREE SPIN CONTINUATION ----
    if (state.isFreeSpin) {
        state.freeSpinTotalWin += state.totalWin;
        state.freeSpins--;
        updateFreeSpinUI();

        if (state.freeSpins <= 0) {
            await endFreeSpins();
            if (state.autoSpin && state.autoSpinRemaining > 0) {
                state.isSpinning = false;
                setSpinButtonState(false);
                setTimeout(() => spin(), 1000);
                return;
            }
            state.isSpinning = false;
            setSpinButtonState(false);
            return;
        }
        state.isSpinning = false;
        setSpinButtonState(false);
        return;
    }

    // ---- AUTO SPIN CONTINUATION ----
    if (state.autoSpin && state.autoSpinRemaining > 0) {
        state.autoSpinRemaining--;
        updateAutoSpinUI();

        if (state.autoSpinRemaining > 0) {
            // ★ Check if queue has items ★
            if (state.scatterQueue.length > 0) {
                state.isSpinning = false;
                setSpinButtonState(false);
                console.log('🎉 Processing Scatter Queue first. Size:', state.scatterQueue.length);
                await processScatterQueue();
                // Queue ပြီးရင် ကျန်တဲ့ Auto Spin ဆက်လည်
                if (state.autoSpin && state.autoSpinRemaining > 0) {
                    state.isSpinning = false;
                    setSpinButtonState(false);
                    setTimeout(() => spin(), 500);
                }
                return;
            }

            const waitTime = winDuration > 0 ? winDuration + 500 : 800;
            await delay(waitTime);
            state.isSpinning = false;
            setSpinButtonState(false);
            setTimeout(() => spin(), 50);
            return;
        } else {
            // ★ Auto Spin ကုန်ပြီ၊ Scatter Queue ရှိရင် process လုပ် ★
            if (state.scatterQueue.length > 0) {
                state.isSpinning = false;
                setSpinButtonState(false);
                console.log('🎉 Processing Scatter Queue (Auto Spin ended). Size:', state.scatterQueue.length);
                await processScatterQueue();
                return;
            }
            stopAutoSpin();
        }
    }

    disableControls(false);
    state.isSpinning = false;
    setSpinButtonState(false);
}

// ================================================================
// 19. BET CONTROLS
// ================================================================

function decreaseBet() {
    if (state.betIndex > 0) {
        state.betIndex--;
        state.bet = BET_TABLE[state.coinValue][state.betIndex];
        updateUI();
    }
}

function increaseBet() {
    if (state.betIndex < 4) {
        state.betIndex++;
        state.bet = BET_TABLE[state.coinValue][state.betIndex];
        updateUI();
    }
}

function maxBet() {
    state.betIndex = 4;
    state.bet = BET_TABLE[state.coinValue][4];
    updateUI();
}

// ================================================================
// 20. COIN SELECTOR
// ================================================================

let coinStripOpen = false;

function toggleCoinStrip() {
    const strip = document.getElementById('coin-strip');
    if (!strip) return;

    if (coinStripOpen) {
        strip.classList.add('hidden');
        coinStripOpen = false;
    } else {
        strip.querySelectorAll('.coin-option').forEach(opt =>
            opt.classList.toggle('active', opt.dataset.coin === state.coinValue)
        );
        strip.classList.remove('hidden');
        coinStripOpen = true;
    }
}

function selectCoin(coin) {
    state.coinValue = coin;
    state.betIndex = 0;
    state.bet = BET_TABLE[state.coinValue][0];

    const strip = document.getElementById('coin-strip');
    if (strip) {
        strip.querySelectorAll('.coin-option').forEach(opt =>
            opt.classList.toggle('active', opt.dataset.coin === coin)
        );
    }

    updateCoinUI();
    setTimeout(() => {
        if (strip) {
            strip.classList.add('hidden');
            coinStripOpen = false;
        }
    }, 300);
    updateUI();
}

// Close coin strip on outside click
document.addEventListener('click', (e) => {
    if (!coinStripOpen) return;
    const strip = document.getElementById('coin-strip');
    const coinBtn = document.getElementById('fb-coin');
    if (strip && !strip.contains(e.target) && !coinBtn.contains(e.target)) {
        strip.classList.add('hidden');
        coinStripOpen = false;
    }
});

// ================================================================
// 22. BUTTON SOUNDS
// ================================================================

function initButtonSounds() {
    const buttonIds = ['btn_spin', 'btn_max', 'btn_minus', 'btn_plus', 'btn_coin', 'btn_stop', 'btn_auto'];
    buttonIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                playSound('button');
                playSound('pop');
            });
        }
    });
}

// ============================================
// EVENT LISTENERS (FIXED)
// ============================================

// ---- (၁) Lobby မှ လာတဲ့ Message တွေကို လက်ခံတဲ့ Listener ----
window.addEventListener('message', function(event) {
    const data = event.data;
    if (!data || !data.type) return;

    // Lobby က SYNC_BALANCE လက်ခံရင် balance ကို update လုပ်
    if (data.type === 'SYNC_BALANCE' && data.game === 'superWays') {
        state.balance = data.balance;
        updateUI();
        console.log('✅ Balance synced from Lobby:', state.balance);
    }

    // Lobby က REQUEST_BALANCE ပို့ရင် ပြန်ပို့ပေး
    if (data.type === 'REQUEST_BALANCE' && data.game === 'superWays') {
        syncBalanceToLobby(state.balance);
    }
});

// ===== DOMContentLoaded - ALL IN ONE =====
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. ANTI-COPY PROTECTION
    // ============================================
    
    // Anti-Copy
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, false);

    // Anti-Cut
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, false);

    // Anti-Right Click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // Anti-Drag Images
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // Anti-Double Click
    document.addEventListener('mousedown', function(e) {
        if (e.detail > 1) e.preventDefault();
    }, false);

    // Anti-Key Combo
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && ['c','x','a','s','p'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);

    // Disable draggable on all existing images
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
    });


// ============================================
// 2. GAME INITIALIZATION
// ============================================

const frameImg = document.querySelector('#slot-frame img');

function initGame() {
    state.reels = generateReels();
    renderReels();
    updateUI();
   

    // Lobby က balance တောင်းမယ်
    requestBalanceFromLobby();

    // Lobby SoundManager ကိုပဲ အသုံးပြုမယ်
    try {
        const soundManager = window.parent.SoundManager;

        if (!soundManager) {
            console.warn('⚠️ Lobby SoundManager not found');
        } else {
            if (typeof soundManager.init === 'function') {
                soundManager.init();
            }

            if (typeof soundManager.playBGM === 'function') {
                soundManager.playBGM();
            }
        }
    } catch (error) {
        console.warn('⚠️ Lobby SoundManager access error:', error);
    }

    initButtonSounds();
}

if (frameImg && !frameImg.complete) {
    frameImg.addEventListener('load', initGame, { once: true });
    frameImg.addEventListener('error', initGame, { once: true });
} else {
    initGame();
   }
});
// ============================================
// ORIENTATION WARNING (Landscape Mode)
// ============================================
(function() {
    const warning = document.getElementById('orientationWarning');
    if (!warning) return;

    function checkOrientation() {
        // Landscape mode ဖြစ်ရင် hide၊ Portrait ဖြစ်ရင် show
        if (window.innerHeight > window.innerWidth) {
            warning.classList.add('active');
        } else {
            warning.classList.remove('active');
        }
    }

    // စပြီးတာနဲ့ တစ်ခါစစ်
    checkOrientation();

    // Window ပြောင်းတိုင်း စစ်
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', function() {
        setTimeout(checkOrientation, 300);
    });

    console.log('✅ Orientation Warning ready!');
})();
