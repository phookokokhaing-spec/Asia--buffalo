// ============================================
// game.js - FULL MERGED VERSION
// (Scale Rotation + Auto Spin + Queue + Daily Ch1 + Stats)
// ============================================

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

// ---- Paytable (Real Casino Style - Buffalo starts at 2) ----
const PAYTABLE = {
    // ★ Buffalo က 2 လုံးကနေ စပေးတယ် ★
    'buffalo': {2: 10, 3: 50, 4: 100, 5: 250},
    
    // ကျန်တဲ့ တိရစ္ဆာန်တွေက 3 လုံးကနေ စပေးတယ်
    'lion':    {3: 10, 4: 20, 5: 150},
    'ele':     {3: 5,  4: 20, 5: 100},
    'zebra':   {3: 5,  4: 10, 5: 80},
    'deer':    {3: 3,  4: 10, 5: 80},
    
    // စာလုံးများ (3 လုံးကနေ စ)
    'a':       {3: 5,  4: 10, 5: 80},
    'k':       {3: 5,  4: 10, 5: 60},
    'q':       {3: 5,  4: 10, 5: 60},
    'j':       {3: 3,  4: 4,  5: 50},
    'ten':     {3: 3,  4: 4,  5: 50},
    'coin':    {3: 3,  4: 4,  5: 50},
    'nine':    {3: 3,  4: 4,  5: 50}
};

// ---- Scatter Rewards ----
const SCATTER_REWARDS = {3: {spins: 10, multiplier: 2}, 4: {spins: 15, multiplier: 3}, 5: {spins: 20, multiplier: 5}};

// ---- Bet Table ----
const BET_TABLE = {"1C": [80,160,320,480,800], "5C": [400,800,1600,2400,4000], "10C": [800,1600,3200,4800,8000], "16C": [1280,2560,5120,7680,12800], "20C": [1600,3200,6400,9600,16000], "50C": [4000,8000,16000,24000,40000]};

// ============================================
// STATE
// ============================================
let state = {
    balance: 100000,
    coinValue: "1C", betIndex: 0, bet: 80,
    totalWin: 0, isSpinning: false,
    autoSpin: false, autoSpinTotal: 0, autoSpinRemaining: 0,
    freeSpins: 0, freeSpinTotalWin: 0, freeSpinMultiplier: 1,
    freeSpinBaseWin: 0, isFreeSpin: false,
    reels: [],
    consecutiveWins: 0,
   accumulatedWin: 0,
    scatterQueue: [],
    gameStats: { totalSpins: 0, totalBets: 0, totalWins: 0, winCount: 0, bigWinCount: 0, freeSpinCount: 0, scatterCount: 0, history: [] }
};

const REELS = 5;
const ROWS = 4;


// ============================================
// SCALE ROTATION CONFIG (No Ch1 Limit)
// ============================================
const SCALE_CYCLE = {
    rounds: [
        { normal: 4, ch1: 7, ch2: 10, ch3: 1, ch4: 1 },
        { normal: 3,  ch1: 5, ch2: 10, ch3: 2,  ch4: 2 },
        { normal: 2,  ch1: 4, ch2: 9,  ch3: 3,  ch4: 4 },
        { normal: 1,  ch1: 8, ch2: 8,  ch3: 4,  ch4: 3 },
        { normal: 1,  ch1: 10, ch2: 7,  ch3: 2,  ch4: 2 }
    ],
    currentRound: 0,
    currentPhase: 'normal', // normal → ch1 → ch2 → ch3 → ch4
    phaseSpins: 0
};

const SCALE_CHECKS = {
    Ch1: { name: 'Ch1', reel1: 0, reel2: 1, userCanWin: false },
    Ch2: { name: 'Ch2', reel1: 2, reel2: 3, userCanWin: true },
    Ch3: { name: 'Ch3', reel1: 3, reel2: 4, userCanWin: true },
    Ch4: { name: 'Ch4', reel1: 0, reel2: 4, userCanWin: true }
};

// ============================================
// GET USER WIN REELS (Based on check type)
// ============================================
function getUserWinReels(check) {
    if (check.name === 'Ch4') return [4];
    if (check.name === 'Ch3') return [4];
    if (check.name === 'Ch2') return [0, 1, 2];
    return [];
}

// ============================================
// WEIGHTS
// ============================================
const WEIGHTS = {'buffalo': 1, 'ele': 2, 'lion': 2, 'zebra': 3, 'deer': 3, 'a': 4, 'k': 4, 'q': 4, 'j': 4, 'ten': 5, 'nine': 5, 'coin': 5, 'wild': 2, 'scatter': 1};

const WIN_DURATION = 1000;

// ============================================
// HELPERS
// ============================================
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function randomSym(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

// ============================================
// SOUND
// ============================================
function playSound(name) { if (typeof SoundManager !== 'undefined' && typeof SoundManager[name] === 'function') SoundManager[name](); }
function playWinSound(type, lines) {
    if (typeof SoundManager === 'undefined') return;
    if (lines) for (const line of lines) if (line.count === 5) { if (line.symbol === 'buffalo') playSound('buffalo'); else if (line.symbol === 'lion') playSound('lion'); }
    if (type === 'mega') { playSound('bsm'); playSound('lion'); playSound('coin'); playSound('buffalo'); }
    else if (type === 'super') { playSound('bsm'); playSound('lion'); playSound('coin'); }
    else if (type === 'big') { playSound('bsm'); playSound('lion'); }
    else playSound('win');
}
function getWinType(amt) { const m = amt / state.bet; if (m >= 50) return {type: 'mega', duration: WIN_DURATION}; if (m >= 20) return {type: 'super', duration: WIN_DURATION}; if (m >= 5) return {type: 'big', duration: WIN_DURATION}; return {type: '', duration: WIN_DURATION}; }

// ============================================
// GENERATE SCALE RULES (Ch1 in cycle)
// ============================================
function generateScaleRules() {
    const stats = state.gameStats;
    stats.totalSpins++;
    
    // Get current round config
    const round = SCALE_CYCLE.rounds[SCALE_CYCLE.currentRound];
    const currentPhase = SCALE_CYCLE.currentPhase;
    
    // Check if we need to advance phase
    if (SCALE_CYCLE.phaseSpins >= round[currentPhase]) {
        SCALE_CYCLE.phaseSpins = 0;
        // Advance to next phase in order: normal → ch1 → ch2 → ch3 → ch4
        const phases = ['normal', 'ch1', 'ch2', 'ch3', 'ch4'];
        const currentIndex = phases.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % phases.length;
        SCALE_CYCLE.currentPhase = phases[nextIndex];
        
        // If we wrap back to normal, advance round
        if (nextIndex === 0) {
            SCALE_CYCLE.currentRound = (SCALE_CYCLE.currentRound + 1) % SCALE_CYCLE.rounds.length;
        }
    }
    SCALE_CYCLE.phaseSpins++;
    
    const phase = SCALE_CYCLE.currentPhase;
    console.log(`🎯 Phase: ${phase}, Round: ${SCALE_CYCLE.currentRound + 1}, Spin: 
${SCALE_CYCLE.phaseSpins}/${round[phase]}`);
    
    // Normal phase - user can win on all reels
    if (phase === 'normal') {
        return {
            activeCheck: { name: 'Normal', userCanWin: true },
            userWinReels: [0, 1, 2, 3, 4],
            houseWin: false,
            crossCheck: null,
            phase: 'Normal'
        };
    }
    
    // Ch1 - House Win (user cannot win)
    if (phase === 'ch1') {
        return {
            activeCheck: { name: 'Ch1', userCanWin: false },
            userWinReels: [],
            houseWin: true,
            crossCheck: { reel1: 0, reel2: 1, mustDiffer: true },
            phase: 'Ch1'
        };
    }
    
    // Ch2, Ch3, Ch4 - Scale checks
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
// ============================================
// BUILD POOL & GENERATE REELS
// ============================================

function buildPool(reelIndex, rules) {
    const pool = [];
    const isCh1 = rules && rules.phase === 'Ch1';
    const isAutoSpin = state.autoSpin;
    
    for (const [sym, count] of Object.entries(WEIGHTS)) {
        if (sym === 'wild' && (reelIndex === 0 || reelIndex === 4)) continue;
        
        if (sym === 'wild' && isCh1 && reelIndex === 1) continue;
        
        if (sym === 'scatter' && isAutoSpin) continue;

        for (let i = 0; i < count; i++) {
            pool.push(sym);
        }
    }
    return pool;
}

// ============================================
// GENERATE REELS (rules ကို ဆက်ပို့တယ်)
// ============================================
function generateReels(rules) {
    if (!rules || !rules.crossCheck) {
        return generateNormalReels(rules);
    }
    let reels = generateNormalReels(rules);
    return applyScaleCheck(reels, rules.crossCheck);
}

// ============================================
// GENERATE NORMAL REELS (rules ကိုပါ ထည့်ပို့မယ်)
// ============================================
function generateNormalReels(rules) {
    const reels = [];
    for (let c = 0; c < REELS; c++) {
        const col = [];
        const pool = buildPool(c, rules);
        const used = {};
        for (let r = 0; r < ROWS; r++) {
            let sym, att = 0;
            do {
                sym = randomSym(pool);
                att++;
            } while (used[sym] > 1 && att < 50);
            col.push(sym);
            used[sym] = (used[sym] || 0) + 1;
        }
        reels.push(col);
    }
    return reels;
}

function applyScaleCheck(reels, crossCheck) {
    const r1 = reels[crossCheck.reel1];
    const r2 = reels[crossCheck.reel2];
    for (let i = 0; i < r2.length; i++) {
        if (r1.includes(r2[i]) && r2[i] !== 'scatter') {
            const pool = buildPool(crossCheck.reel2).filter(s => !r1.includes(s));
            r2[i] = pool.length > 0 ? randomSym(pool) : r2[i];
        }
    }
    return reels;
}

// ============================================
// RENDER & CLEAR EFFECTS
// ============================================
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
            img.src = IMAGE_PATHS[sym]; img.alt = sym;
            img.onerror = function() { this.style.opacity = '0.3'; };
            slot.appendChild(img); el.appendChild(slot);
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
    });
    document.querySelectorAll('.reel').forEach(r => {
        r.classList.remove('suspense-shake', 'win-shake');
    });
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

// ============================================
// CHECK WINS & SCATTERS
// ============================================
function checkWins() {
    let totalWin = 0, winCells = [], winLines = [];
    for (const sym of Object.keys(PAYTABLE)) {
        const reelCounts = [];
        for (let c = 0; c < REELS; c++) {
            const pos = [];
            for (let r = 0; r < ROWS; r++) if (state.reels[c][r] === sym || state.reels[c][r] === 'wild') pos.push(r);
            reelCounts.push(pos);
        }
        let w5 = 0, w4 = 0, w3 = 0, w2 = 0;
        if (reelCounts[0].length && reelCounts[1].length) {
            w2 = reelCounts[0].length * reelCounts[1].length;
            if (reelCounts[2].length) { w3 = w2 * reelCounts[2].length; if (reelCounts[3].length) { w4 = w3 * reelCounts[3].length; if (reelCounts[4].length) w5 = w4 * reelCounts[4].length; } }
        }
        const pay = PAYTABLE[sym]; let win = 0, wc = 0;
        if (w5 > 0) { win = w5 * pay[5]; wc = 5; } else if (w4 > 0) { win = w4 * pay[4]; wc = 4; } else if (w3 > 0) { win = w3 * pay[3]; wc = 3; } else if (w2 > 0 && pay[2]) { win = w2 * pay[2]; wc = 2; }
        if (win > 0) {
            totalWin += win * state.bet;
            winLines.push({symbol: sym, count: wc, ways: w5 || w4 || w3 || w2, win: win * state.bet});
            const hc = Math.min(wc, 3);
            for (let i = 0; i < hc; i++) for (const r of reelCounts[i]) winCells.push({col: i, row: r});
        }
    }
    return {totalWin: Math.floor(totalWin), winCells, winLines};
}

function checkScatters() {
    let cnt = 0, pos = [];
    for (let c = 0; c < REELS; c++) for (let r = 0; r < ROWS; r++) if (state.reels[c][r] === 'scatter') { cnt++; pos.push({col: c, row: r}); }
    return {count: cnt, positions: pos};
}

// ============================================
// HIGHLIGHT & ANIMATE WINS
// ============================================
function highlightWins(cells) {
    document.querySelectorAll('.symbol-slot').forEach(el => {
        el.classList.remove('winning', 'win-jump');
        el.style.animation = '';
        el.style.boxShadow = '';
        el.style.border = '';
    });
    for (const {col, row} of cells) {
        const reel = document.getElementById('reel' + col);
        if (reel && reel.children[row]) {
            const slot = reel.children[row];
            slot.classList.add('winning');
            // ★ အနိုင်ရတဲ့အခါ အနီရောင် + ရွှေရောင် ရောစပ်ထားတယ် (အဝါနဲ့ ဆန့်ကျင်ဘက်)
            slot.style.boxShadow = '0 0 30px rgba(255, 50, 50, 0.9), 0 0 60px rgba(255, 215, 0, 0.5)';
            slot.style.border = '3px solid #ff3333';
            slot.style.animation = 'winPulse 0.5s ease-in-out infinite alternate';
        }
    }
}
function animateWinLines(cells) {
    document.querySelectorAll('.symbol-slot').forEach(el => el.classList.remove('win-jump'));
    for (const {col, row} of cells) {
        const reel = document.getElementById('reel' + col);
        if (reel && reel.children[row]) {
            const slot = reel.children[row];
            setTimeout(() => { slot.classList.add('win-jump'); setTimeout(() => slot.classList.remove('win-jump'), 1200); }, col * 80 + row * 40);
        }
    }
}

// ============================================
// WIN ANIMATION TRIGGER
// ============================================
let winAnim = null;
function triggerWinAnimation(winResult) {
    const winInfo = getWinType(winResult.totalWin);
    const winType = winInfo.type;
    const duration = winInfo.duration;
    if (winAnim && winType) { const m = winAnim.play || winAnim.show || winAnim.trigger; if (m) m.call(winAnim, winType, winResult.totalWin); }
    playWinSound(winType, winResult.winLines);
    showWinOverlay(winResult.totalWin, winResult.winLines);
    return duration;
}

// ============================================
// SPIN ANIMATION
// ============================================
async function runSpinAnimation() {
    const intervals = [];
    for (let c = 0; c < REELS; c++) {
        const el = document.getElementById('reel' + c);
        if (!el) continue;
        el.classList.add('spinning');
        const slots = el.querySelectorAll('.symbol-slot img');
        const interval = setInterval(() => { slots.forEach(img => { const keys = Object.keys(IMAGE_PATHS); img.src = IMAGE_PATHS[keys[Math.floor(Math.random() * keys.length)]]; }); }, 80);
        intervals.push(interval);
    }
    playSound('spin');
    await delay(500);
    for (let c = 0; c < REELS; c++) {
        const el = document.getElementById('reel' + c);
        if (!el) continue;
        clearInterval(intervals[c]); el.classList.remove('spinning');
        const slots = el.querySelectorAll('.symbol-slot');
        slots.forEach((slot, r) => { const img = slot.querySelector('img'); const sym = state.reels[c][r]; if (img) img.src = IMAGE_PATHS[sym]; });
        playSound('reelStop');
        if (c < REELS - 1) await delay(200);
    }
}

// ============================================
// MAIN SPIN FUNCTION
// ============================================
async function spin() {
    if (state.isSpinning) return;
    if (!state.isFreeSpin && state.balance < state.bet) { if (state.autoSpin) stopAutoSpin(); return; }
    
    state.isSpinning = true;
    if (!state.isFreeSpin) state.balance -= state.bet;
    state.totalWin = 0;
    updateUI();
    setSpinButtonState(true);
    clearReelEffects();
    
    const rules = generateScaleRules();
    console.log('🎰 Phase:', rules.phase, 'Round:', SCALE_CYCLE.currentRound + 1, 'Spin:', SCALE_CYCLE.phaseSpins);
    
    state.reels = generateReels(rules);
    await runSpinAnimation();
    renderReels();
    
    const winResult = checkWins();
    const scatterResult = checkScatters();
    
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
        highlightWins(winResult.winCells);
        animateWinLines(winResult.winCells);
        winDuration = triggerWinAnimation(winResult);
        updateUI();
        await delay(winDuration);
    }
} else if (rules.houseWin) {
    console.log('💀 HOUSE WIN (Ch1) - Phase triggered!');
}
    
    if (scatterResult.count >= 3 && !state.isFreeSpin) {
        SoundManager.noti();
        const reward = SCATTER_REWARDS[Math.min(scatterResult.count, 5)];
        if (state.autoSpin) {
            state.scatterQueue.push({type: 'scatter3', count: scatterResult.count, reward: reward, positions: scatterResult.positions});
            console.log('📦 Scatter 3 queued. Size:', state.scatterQueue.length);
        } else {
            await handleFreeSpinTrigger(scatterResult.count, reward);
            state.isSpinning = false;
            setSpinButtonState(false);
            return;
        }
    }
    if (scatterResult.count === 2 && !state.isFreeSpin) {
       SoundManager.boom();
        if (state.autoSpin) {
            state.scatterQueue.push({type: 'scatter2', count: scatterResult.count, positions: scatterResult.positions});
            console.log('📦 Scatter 2 queued. Size:', state.scatterQueue.length);
        } else {
            await handleScatterSuspense(scatterResult);
            state.isSpinning = false;
            setSpinButtonState(false);
            return;
        }
    }
    if (scatterResult.count === 1 && !state.isFreeSpin) {
        SoundManager.boom();
    }

    if (state.isFreeSpin) {
        state.freeSpinTotalWin += state.totalWin;
        state.freeSpins--;
        updateFreeSpinUI();
        if (state.freeSpins <= 0) {
            await endFreeSpins();
            if (state.autoSpin && state.autoSpinRemaining > 0) {
                state.isSpinning = false;
                setSpinButtonState(false);
                setTimeout(() => spin(), 500);
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
    
    if (state.autoSpin && state.autoSpinRemaining > 0) {
        state.autoSpinRemaining--;
        updateAutoSpinUI();
        if (state.autoSpinRemaining > 0) {
            const waitTime = winDuration > 0 ? winDuration + 500 : 1000;
            await delay(waitTime);
            state.isSpinning = false;
            setSpinButtonState(false);
            setTimeout(() => spin(), 50);
            return;
        } else {
            if (state.scatterQueue.length > 0) {
                state.isSpinning = false;
                setSpinButtonState(false);
                console.log('🎉 Processing Scatter Queue. Size:', state.scatterQueue.length);
                processScatterQueue();
                return;
            }
            stopAutoSpin();
        }
    }
    
    state.isSpinning = false;
    setSpinButtonState(false);
}

// ============================================
// STATS & CONSECUTIVE WINS
// ============================================
function updateGameStats(winAmt, betAmt) {
    const stats = state.gameStats;
    stats.totalBets += betAmt;
    stats.totalWins += winAmt;
    if (winAmt > 0) stats.winCount++;
    if (winAmt >= betAmt * 5) stats.bigWinCount++;
    stats.history.push({spin: stats.totalSpins, bet: betAmt, win: winAmt, rtp: stats.totalBets > 0 ? stats.totalWins / stats.totalBets : 0});
    if (stats.history.length > 100) stats.history.shift();
}
function updateConsecutiveWins(winAmt) {
    if (winAmt > 0) { state.consecutiveWins++; console.log('Consecutive wins:', state.consecutiveWins); }
    else { state.consecutiveWins = 0; }
}


// ============================================
// HANDLE SCATTER SUSPENSE (Scatter 2 ပြား)
// ============================================
async function handleScatterSuspense(scatterResult) {
    console.log('🎯 Suspense mode triggered! Scatter count:', scatterResult.count);
    
    SoundManager.scatter();
    
    // ★ Scatter ၂ ပြား Suspense Effect (အပြာရောင်)
const positions = scatterResult.positions || [];
for (const pos of positions) {
    const reel = document.getElementById('reel' + pos.col);
    if (reel && reel.children[pos.row]) {
        const slot = reel.children[pos.row];
        slot.classList.add('scatter-highlight');
        slot.style.boxShadow = '0 0 40px rgba(0, 150, 255, 0.9), 0 0 80px rgba(0, 100, 255, 0.6)';
        slot.style.border = '3px solid #00aaff';
        slot.style.transition = 'all 0.3s';
        slot.style.transform = 'scale(1.15)';
    }
}

// ★ Reel Shake Effect ကို ပိုပြင်းအောင်လုပ်
document.querySelectorAll('.reel').forEach(el => {
    el.classList.add('suspense-shake');
    el.style.animation = 'suspenseShake 0.3s ease-in-out infinite alternate';
}); 
    await delay(2500);
    
    document.querySelectorAll('.symbol-slot').forEach(el => {
        el.classList.remove('scatter-highlight');
        el.style.boxShadow = '';
        el.style.transition = '';
    });
    document.querySelectorAll('.reel').forEach(el => {
        el.classList.remove('suspense-shake');
        el.style.animation = '';
    });
    
    state.isSpinning = false;
    setSpinButtonState(false);
}

// ============================================
// SCATTER QUEUE PROCESSING
// ============================================
async function processScatterQueue() {
    // Queue ထဲမှာ ဘာမှမရှိရင် Auto Spin ကိုအဆုံးသတ်မယ်
    if (state.scatterQueue.length === 0) {
        finalizeAutoSpin();
        return;
    }
    
    // Queue ထဲက ပထမဆုံးဟာကို ယူမယ်
    const item = state.scatterQueue.shift();
    state.isSpinning = true;
    setSpinButtonState(true);
    
    try {
        if (item.type === 'scatter3') {
            await handleFreeSpinTrigger(item.count, item.reward);
        } else if (item.type === 'scatter2') {
            await handleScatterSuspense(item);
        }
    } catch (error) {
        console.error('Queue processing error:', error);
    }
    
    state.isSpinning = false;
    setSpinButtonState(false);
    
    // Queue ထဲမှာ ကျန်ရှိသေးရင် ဆက်ခေါ်မယ်
    if (state.scatterQueue.length > 0) {
        setTimeout(() => {
            processScatterQueue();
        }, 500);
    } else {
        // အကုန်ပြီးရင် Auto Spin ကိုအဆုံးသတ်မယ်
        finalizeAutoSpin();
    }
}


// ============================================
// FINALIZE AUTO SPIN (Show Box + Add Money)
// ============================================
function finalizeAutoSpin() {
    if (state.accumulatedWin > 0) {
        state.balance += state.accumulatedWin;
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
    
    var totalWinAmount = state.accumulatedWin;
    var totalSpins = state.autoSpinTotal;
    
    if (totalWinAmount > 0) {
        showAutoSpinSummary(totalWinAmount, totalSpins);
        
        setTimeout(function() {
            if (totalWinAmount > 0) {
                triggerWinAnimation({
                    totalWin: totalWinAmount,
                    winCells: [],
                    winLines: []
                });
            }
        }, 600);
    }
    
    state.accumulatedWin = 0;
    state.totalWin = 0;
    updateUI();
    
    var statusMsg = document.getElementById('statusMsg');
    if (statusMsg) {
        statusMsg.textContent = '✅ Auto Spin ပြီးပါပြီ!';
        statusMsg.className = '';
    }
    
    console.log('✅ Auto Spin finalized. Total accumulated:', totalWinAmount);
}
// ============================================
// UI
// ============================================
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
// ============================================
// POPUPS & OVERLAYS
// ============================================
function showWinOverlay(amount, winLines) { if (amount <= 0) return; const overlay = document.getElementById('win-overlay'); if (overlay) { overlay.classList.add('active'); const wa = document.getElementById('win-amount'); const wt = document.getElementById('win-type'); if (wa) wa.textContent = amount; if (wt) wt.textContent = 'WIN'; } }
// ============================================
// HANDLE FREE SPIN TRIGGER (Popup auto-closes after 5s)
// ============================================
async function handleFreeSpinTrigger(scatterCount, reward) {
    state.isFreeSpin = true;
    state.freeSpins = reward.spins;
    state.freeSpinMultiplier = reward.multiplier;
    state.freeSpinTotalWin = 0;
    state.freeSpinBaseWin = 0;
    state.accumulatedWin = 0; // Free spin အတွင်း အနိုင်ငွေစုဖို့

    SoundManager.scatter();

    showFreeSpinPopup(reward.spins, reward.multiplier);
}
// ======================
// Run Free spin
// ======================
async function runFreeSpins() {
    while (state.freeSpins > 0) {
        await freeSpin();

        const winResult = checkWins();
        const multipliedWin = winResult.totalWin * state.freeSpinMultiplier;

        if (multipliedWin > 0) {
            state.accumulatedWin += multipliedWin;
        }

        if (winResult.totalWin > 0) {
            highlightWins(winResult.winCells);
            animateWinLines(winResult.winLines);
        }

        const scatterResult = checkScatters();
        if (scatterResult.count >= 2) {
           SoundManager.scatter();
            const extra = calculateExtraSpins(scatterResult.count);
            state.freeSpins += extra;

            showExtraFreeSpinAnimation(extra);
            updateFreeSpinUI();
        }

        state.freeSpins--;
        updateFreeSpinUI();

        await delay(500);
    }

    await endFreeSpins();
}

function freeSpin() {
    return new Promise(async (resolve) => {
        state.reels = generateReels(generateScaleRules());
        const intervals = [];
        for (let c = 0; c < REELS; c++) {
            const el = document.getElementById('reel' + c);
            if (!el) continue;
            el.classList.add('spinning');
            const slots = el.querySelectorAll('.symbol-slot img');
            const interval = setInterval(() => { slots.forEach(img => { const keys = Object.keys(IMAGE_PATHS); img.src = IMAGE_PATHS[keys[Math.floor(Math.random() * keys.length)]]; }); }, 80);
            intervals.push(interval);
        }
        SoundManager.noti();
        await delay(700);
        for (let c = 0; c < REELS; c++) {
            const el = document.getElementById('reel' + c);
            if (!el) continue;
            clearInterval(intervals[c]); el.classList.remove('spinning');
            const slots = el.querySelectorAll('.symbol-slot');
            slots.forEach((slot, r) => { const img = slot.querySelector('img'); const sym = state.reels[c][r]; if (img) img.src = IMAGE_PATHS[sym]; });
            playSound('reelStop');
            if (c < REELS - 1) await delay(200);
        }
        resolve();
    });
}

// ======================
// Free spin & Popup
// ======================
function showFreeSpinPopup(spins, multiplier) {
    // အဟောင်းရှိရင် ဖယ်မယ်
    let popup = document.getElementById('free-spin-popup');
    if (popup) popup.remove();
    
    popup = document.createElement('div');
    popup.id = 'free-spin-popup';
    popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;display:flex;justify-content:center;align-items:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;animation:popUpBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;display:inline-block;';
    
    const img = document.createElement('img');
    img.src = 'images/popup_number.png';
    img.style.cssText = 'max-width:80vw;max-height:80vh;object-fit:contain;display:block;';
    wrapper.appendChild(img);
    
    // ★ အဝိုင်းထဲမှာ အကြိမ်ရေကိုပြမယ် ★
    const numberDiv = document.createElement('div');
    numberDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);font-family:"Impact","Arial Black",sans-serif;font-weight:900;color:#FFD700;font-size:clamp(60px, 15vw, 160px);text-shadow:0 0 30px rgba(255,215,0,0.8),0 0 60px rgba(255,215,0,0.4);line-height:1;';
    numberDiv.textContent = spins;
    wrapper.appendChild(numberDiv);
    
    popup.appendChild(wrapper);
    document.body.appendChild(popup);
    
    if (window._freePopupTimer) clearTimeout(window._freePopupTimer);
    window._freePopupTimer = setTimeout(function() {
        closeFreeSpinPopup();
        startFreeSpins();
    }, 5000);
}

// ======================
//  Close Free spin & Popup
// ======================
function closeFreeSpinPopup() {
    const popup = document.getElementById('free-spin-popup');
    if (popup) popup.remove();
    if (window._freePopupTimer) {
        clearTimeout(window._freePopupTimer);
        window._freePopupTimer = null;
    }
}

function startFreeSpins() {
    runFreeSpins();
}

//ExtareFreespin

function showExtraFreeSpinAnimation(extra) {
    let el = document.getElementById('extra-spin-notification');
    if (el) el.remove();
    
    el = document.createElement('div');
    el.id = 'extra-spin-notification';
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999998;background:rgba(0,0,0,0.85);border:3px solid #f3b33d;padding:30px 50px;border-radius:30px;color:white;text-align:center;animation:popUpBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;min-width:200px;box-shadow:0 20px 60px rgba(0,0,0,0.9);';
    el.innerHTML = '<div style="font-size:60px;margin-bottom:10px;">🎰</div><div style="font-size:28px;font-weight:900;color:#ffd966;">+' + extra + ' FREE SPINS</div>';
    document.body.appendChild(el);
    
    setTimeout(function() {
        if (el.parentNode) el.remove();
    }, 1500);
}

//End Freespin
async function endFreeSpins() {
    const totalSpins = state.freeSpinTotalWin;
    const totalWinAmount = state.accumulatedWin;
    
    state.isFreeSpin = false;
    state.freeSpinMultiplier = 1;
    state.freeSpinTotalWin = 0;
    
    if (totalWinAmount > 0) {
        state.balance += totalWinAmount;
    }
    
    updateUI();
    hideFreeSpinIndicator();
    
    if (totalWinAmount > 0) {
        var totalFreeSpins = state.freeSpinTotalWin > 0 ? state.freeSpinTotalWin : 1; // fallback
        showAutoSpinSummary(totalWinAmount, totalFreeSpins);
        
        await delay(800);
        if (totalWinAmount > 0) {
            triggerWinAnimation({
                totalWin: totalWinAmount,
                winCells: [],
                winLines: []
            });
        }
    }
    
    state.accumulatedWin = 0;
    state.totalWin = 0;
    updateUI();
    state.isSpinning = false;
    setSpinButtonState(false);
    
    console.log('✅ Free Spins finished. Total won:', totalWinAmount);
}

// ============================================
// HIDE FREE SPIN INDICATOR
// ============================================
function hideFreeSpinIndicator() {
    const indicator = document.getElementById('free-spin-indicator');
    if (indicator) {
        indicator.style.animation = 'slideInRight 0.3s ease-in reverse forwards';
        setTimeout(function() {
            if (indicator.parentNode) indicator.remove();
        }, 350);
    }
}
// ============================================
// WIN ANIMATION INIT
// ============================================
function initWinAnimation() { if (typeof WinAnimation === 'undefined') { console.warn('WinAnimation class not found'); return; } winAnim = new WinAnimation('winCanvas'); winAnim.loadImages({winBig: 'images/win_big.png', winMega: 'images/win_mega.png', winSuper: 'images/win_super.png', starGreen: 'images/star_green.png', starRed: 'images/star_red.png', starBlue: 'images/star_blue.png', coins: 'images/coins.png', scoreBox: 'images/score_box.png'}).then(() => console.log('Win animation ready!')).catch(err => console.error('Win animation load failed:', err)); }

// ============================================
// BUTTON ACTIONS
// ============================================
function decreaseBet() { if (state.betIndex > 0) { state.betIndex--; state.bet = BET_TABLE[state.coinValue][state.betIndex]; updateUI(); } }
function increaseBet() { if (state.betIndex < 4) { state.betIndex++; state.bet = BET_TABLE[state.coinValue][state.betIndex]; updateUI(); } }
function maxBet() { state.betIndex = 4; state.bet = BET_TABLE[state.coinValue][4]; updateUI(); }
function changeCoin() { toggleCoinStrip(); }

// ============================================
// COIN SELECTOR
// ============================================
let coinStripOpen = false;
function toggleCoinStrip() { const strip = document.getElementById('coin-strip'); if (!strip) return; if (coinStripOpen) { strip.classList.add('hidden'); coinStripOpen = false; } else { strip.querySelectorAll('.coin-option').forEach(opt => opt.classList.toggle('active', opt.dataset.coin === state.coinValue)); strip.classList.remove('hidden'); coinStripOpen = true; } }
function selectCoin(coin) { state.coinValue = coin; state.betIndex = 0; state.bet = BET_TABLE[state.coinValue][0]; const strip = document.getElementById('coin-strip'); if (strip) strip.querySelectorAll('.coin-option').forEach(opt => opt.classList.toggle('active', opt.dataset.coin === coin)); setTimeout(() => { strip.classList.add('hidden'); coinStripOpen = false; }, 300); updateUI(); }
document.addEventListener('click', (e) => { if (!coinStripOpen) return; const strip = document.getElementById('coin-strip'); const coinBtn = document.getElementById('fb-coin'); if (strip && !strip.contains(e.target) && !coinBtn.contains(e.target)) { strip.classList.add('hidden'); coinStripOpen = false; } });

// ============================================
// AUTO SPIN UI
// ============================================
function updateAutoSpinUI() {
    let indicator = document.getElementById('auto-spin-indicator');
    if (state.autoSpin && state.autoSpinRemaining > 0) {
        if (!indicator) { indicator = document.createElement('div'); indicator.id = 'auto-spin-indicator'; indicator.className = 'auto-spin-indicator'; document.body.appendChild(indicator); }
        indicator.innerHTML = `<div class="indicator-content"><span class="spin-number">${state.autoSpinRemaining}</span><span class="spin-label">SPINS</span></div><button class="stop-btn" onclick="stopAutoSpin()">⏹ ရပ်</button>`;
        if (!indicator.style.animation) indicator.style.animation = 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    } else {
        if (indicator) { indicator.style.animation = 'slideInRight 0.3s ease-in reverse forwards'; setTimeout(() => { if (indicator.parentNode) indicator.remove(); }, 350); }
    }
}

function showAutoSpinPopup() {
    if (state.isSpinning) { console.log('Spin running, popup blocked'); return; }
    let popup = document.getElementById('auto-spin-popup');
    if (!popup) { popup = document.createElement('div'); popup.id = 'auto-spin-popup'; popup.className = 'popup-overlay'; document.body.appendChild(popup); }
    popup.innerHTML = `<div class="popup-content"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:2px dashed #3f5b6b; padding-bottom:15px;"><div class="popup-title">🎰 AUTO SPIN</div><button class="popup-close" onclick="closeAutoSpinPopup()">✕</button></div><div class="option-grid"><button class="auto-option" data-value="10">10</button><button class="auto-option" data-value="20">20</button><button class="auto-option" data-value="30">30</button><button class="auto-option" data-value="50">50</button><button class="auto-option" data-value="70">70</button><button class="auto-option" data-value="100">100</button></div><div class="popup-hint">👆 Click outside to close</div></div>`;
    popup.querySelectorAll('.auto-option').forEach(btn => { btn.addEventListener('click', function() { const val = parseInt(this.dataset.value, 10); closeAutoSpinPopup(); startAutoSpin(val); }); });
    popup.classList.add('active'); popup.style.display = 'flex'; console.log('Popup opened');
}
function closeAutoSpinPopup() { const popup = document.getElementById('auto-spin-popup'); if (popup) { popup.classList.remove('active'); popup.style.display = 'none'; console.log('Popup closed'); } }
function startAutoSpin(count) { state.autoSpin = true; state.autoSpinTotal = count; state.autoSpinRemaining = count; updateAutoSpinUI(); disableControls(true); spin(); }
function stopAutoSpin() {
    state.scatterQueue = [];
    finalizeAutoSpin();
}

// ============================================
// DISABLE CONTROLS
// ============================================
function disableControls(disable) { const buttons = [document.getElementById('fb-minus'), document.getElementById('fb-plus'), document.getElementById('fb-max'), document.getElementById('fb-coin')]; buttons.forEach(btn => { if (btn) { btn.style.opacity = disable ? '0.4' : '1'; btn.style.pointerEvents = disable ? 'none' : 'auto'; } }); }

// ============================================
// BUTTON SOUNDS
// ============================================
function initButtonSounds() { const buttonIds = ['btn_spin', 'btn_max', 'btn_minus', 'btn_plus', 'btn_coin', 'btn_stop', 'btn_auto']; buttonIds.forEach(id => { const btn = document.getElementById(id); if (btn) btn.addEventListener('click', () => { playSound('button'); playSound('pop'); }); }); }

// ============================================
// EXTRA HELPERS
// ============================================
function calculateExtraSpins(scatterCount) { if (scatterCount >= 6) return 15; if (scatterCount >= 5) return 12; if (scatterCount >= 4) return 8; return 5; }

// ============================================
// AUTO SPIN SUMMARY BOX (total_box.png)
// ============================================
function showAutoSpinSummary(totalWin, totalSpins) {
    // အဟောင်းရှိရင် ဖယ်မယ်
    const oldBox = document.getElementById('auto-summary-box');
    if (oldBox) oldBox.remove();

    // Background Overlay
    const box = document.createElement('div');
    box.id = 'auto-summary-box';
    box.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;z-index:9999999;pointer-events:none;background:rgba(0,0,0,0.6);';

    // Wrapper (Image + Text Overlay)
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;animation:summaryPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;display:inline-block;';

    // ★ ၁။ ပုံ (total_box.png) ★
    const img = document.createElement('img');
    img.src = 'images/total_box.png';
    img.style.cssText = 'max-width:85vw;max-height:80vh;object-fit:contain;display:block;';
    wrapper.appendChild(img);

    // ★ ၂။ ငွေပမာဏကို ပုံပေါ်မှာ ထပ်ခိုးပြမယ် ★
    const textOverlay = document.createElement('div');
    textOverlay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;width:80%;pointer-events:none;';
    
    // ငွေပမာဏ (ကြီးကြီးမားမား ပြမယ်)
    const amountSpan = document.createElement('div');
    amountSpan.style.cssText = 'font-family:"Impact","Arial Black",sans-serif;font-weight:900;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.9),0 0 40px rgba(255,215,0,0.5),0 4px 8px rgba(0,0,0,0.8);font-size:clamp(40px, 12vw, 120px);line-height:1.2;';
    amountSpan.textContent = totalWin.toLocaleString();
    textOverlay.appendChild(amountSpan);


    wrapper.appendChild(textOverlay);

    // ★ ၃။ ပုံမပါရင် Fallback (စာသားပြမယ်) ★
    img.onerror = function() {
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.style.cssText = 'background:linear-gradient(145deg,#1a2f44,#0b1a2e);border:4px solid #f3b33d;padding:40px 60px;border-radius:30px;text-align:center;color:white;min-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.9);';
        fallback.innerHTML = '<div style="font-size:16px;color:#aaccdd;text-transform:uppercase;letter-spacing:4px;margin-bottom:10px;">🎰 AUTO SPIN COMPLETE</div><div style="font-size:20px;color:#c0d4df;margin-bottom:10px;">Total Spins <span style="color:#f3b33d;font-weight:bold;">' + totalSpins + '</span></div><div style="font-size:48px;font-weight:900;color:#ffd966;text-shadow:0 0 30px #ffd96666;">' + totalWin.toLocaleString() + ' <span style="font-size:20px;color:#aaccdd;">WIN</span></div>';
        wrapper.appendChild(fallback);
    };

    box.appendChild(wrapper);
    document.body.appendChild(box);

    // ★ ၅ စက္ကန့်ကြာရင် ပျောက်မယ် ★
    setTimeout(function() {
        if (wrapper) {
            wrapper.style.animation = 'summaryPopOut 0.4s ease-in forwards';
            setTimeout(function() {
                if (box.parentNode) box.remove();
            }, 400);
        }
    }, 5000);
}
// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const frameImg = document.querySelector('#slot-frame img');
    function initGame() { state.reels = generateReels(generateScaleRules()); renderReels(); updateUI(); initWinAnimation(); if (typeof SoundManager !== 'undefined') { SoundManager.init(); SoundManager.playBGM(); } initButtonSounds(); }
    if (frameImg && !frameImg.complete) { frameImg.onload = initGame; frameImg.onerror = initGame; } else initGame();
});
