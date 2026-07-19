       // ============================================
// LOBBY BALANCE SYNC
// ============================================
function safeNumber(value) {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number' && !isNaN(value)) return value;
    let str = String(value).replace(/,/g, '').trim();
    let num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

function sendToLobby(type, amount) {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: type, amount: amount }, '*');
    }
}

function reportWin(amount) {
    let winAmount = safeNumber(amount);
    if (winAmount > 0) {
        sendToLobby('WIN_AMOUNT', winAmount);
        if (window.gameState) window.gameState.balance = safeNumber(window.gameState.balance) + winAmount;
    }
}

function reportBet(amount) {
    let betAmount = safeNumber(amount);
    if (betAmount > 0) {
        sendToLobby('BET_DEDUCT', betAmount);
        if (window.gameState) window.gameState.balance = safeNumber(window.gameState.balance) - betAmount;
    }
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SYNC_BALANCE') {
        if (window.gameState) window.gameState.balance = safeNumber(event.data.balance);
        updateUI();
    }
});

if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'REQUEST_BALANCE' }, '*');
}



   // ============================================
// INITIALIZE GAME STATE (MUST BE FIRST)
// ============================================
window.gameState = {
    balance: 10000,
    displayBalance: 10000,
    betAmount: 80,
    betType: '1C',
    betIndex: 0,
    isSpinning: false,
    autoSpinActive: false,
    freeSpins: 0,
    isFreeSpinning: false,
    freeSpinTotalWin: 0
};

// ============================================
// SAFE UI UPDATE
// ============================================
function updateUI() {
    if (!window.gameState) {
        console.warn('updateUI: gameState not ready');
        return;
    }
    
    const currentBalance = (window.gameState.balance !== undefined && !isNaN(window.gameState.balance)) 
        ? window.gameState.balance 
        : 0;
    const formattedBalance = currentBalance.toLocaleString();
    
    const gameBalanceEl = document.getElementById('balanceAmount');
    if (gameBalanceEl) gameBalanceEl.innerText = formattedBalance;
    
    const creditEl = document.getElementById('creditValue');
    if (creditEl) creditEl.innerText = formattedBalance;
    
    const betEl = document.getElementById('betValue');
    if (betEl && window.gameState.betAmount) betEl.innerText = window.gameState.betAmount.toLocaleString();
}

// ============================================
// SAFE SET BALANCE
// ============================================
function setBalance(newAmount) {
    if (!window.gameState) {
        window.gameState = { balance: 0, displayBalance: 0 };
    }
    const safeAmount = safeNumber(newAmount);
    window.gameState.balance = safeAmount;
    window.gameState.displayBalance = safeAmount;
    updateUI();
}

// ============================================
// MESSAGE LISTENER (FIXED)
// ============================================
window.addEventListener('message', function(event) {
    const data = event.data;
    if (data && data.type === 'SYNC_BALANCE') {
        if (window.gameState) {
            const newBalance = safeNumber(data.balance);
            window.gameState.balance = newBalance;
            window.gameState.displayBalance = newBalance;
            updateUI();
            console.log('✅ Balance synced from lobby:', newBalance);
        } else {
            console.warn('⚠️ Received SYNC_BALANCE but gameState not ready');
        }
    }
});

// ============================================
// DOM CONTENT LOADED (FIXED ORDER)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Game initializing...');
    
    // Make sure gameState exists
    if (!window.gameState) {
        window.gameState = {
            balance: 10000,
            displayBalance: 10000,
            betAmount: 80,
            betType: '1C',
            betIndex: 0,
            isSpinning: false,
            autoSpinActive: false,
            freeSpins: 0,
            isFreeSpinning: false,
            freeSpinTotalWin: 0
        };
    }
    
    // Initialize UI
    updateUI();
    
    // Initialize components
    if (typeof initSlotGrid === 'function') initSlotGrid();
    if (typeof initBetControls === 'function') initBetControls();
    if (typeof createParticles === 'function') createParticles();
    if (typeof initEventListeners === 'function') initEventListeners();
    
    // Request balance from lobby
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_BALANCE' }, '*');
        console.log('📤 Requested balance from lobby');
    }
    
    console.log('✅ Game initialized with balance:', window.gameState.balance);
});



        const BET_TABLE = {
            "1C": [80, 160, 320, 480, 800],
            "5C": [400, 800, 1600, 2400, 4000],
            "10C": [800, 1600, 3200, 4800, 8000],
            "20C": [1600, 3200, 6400, 9600, 16000],
            "50C": [4000, 8000, 16000, 24000, 40000]
        };

        const PAYTABLE = {
            'buffalo': {3: 1.2, 4: 2.4, 5: 16},
            'ele': {3: 0.1, 4: 1.0, 5: 2.6},
            'lion': {3: 0.4, 4: 1.6, 5: 1.6},
            'zebra': {3: 0.6, 4: 1.2, 5: 1.8},
            'tha': {3: 0.48, 4: 0.36, 5: 1},
            'pig': {3: 0.12, 4: 0.8, 5: 1.2},
            'jack': {3: 0.12, 4: 0.8, 5: 2},
            'queen': {3: 0.6, 4: 0.88, 5: 4.8},
            'nine': {3: 0.4, 4: 0.64, 5: 2.8},
            'ten': {3: 0.2, 4: 0.8, 5: 4},
            'coin': {3: 0.4, 4: 0.6, 5: 2.4},
            'ayeaye': {3: 0.6, 4: 0.4, 5: 2.0}
        };

        const IMAGE_PATHS = {
    'pig': 'images/pig.png',
    'jack': 'images/jack.png',      // အသစ်
    'queen': 'images/queen.png',    // အသစ်
    'nine': 'images/nine.png',      // အသစ်
    'lion': 'images/lion.png',
    'buffalos': 'images/buffalos.png',
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

        const REELS = [
            ['pig', 'jack', 'queen', 'nine', 'lion', 'buffalos', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'ten', 'ten'],
            ['pig', 'jack', 'queen', 'nine', 'tha', 'zebra', 'ayeaye', 'coin', 'bonus', 'ten'],
            ['pig', 'jack', 'queen', 'nine', 'tha', 'zebra', 'buffalos', 'coin', 'ten', 'ten', 'wild'],
            ['pig', 'jack', 'queen', 'bonus', 'lion', 'wild', 'ele', 'tha', 'buffalos', 'ayeaye', 'coin', 'ele', 'ten'],
            ['pig', 'jack', 'queen', 'nine', 'wild', 'tha', 'zebra', 'ayeaye', 'buffalos', 'ele', 'bonus']
        ];

        const FREE_SPIN_REELS = [
            ['pig', 'lion', 'tha', 'ele', 'zebra', 'coin', 'ayeaye', 'ten', 'wild'],
            ['pig', 'lion', 'jack', 'ele', 'zebra', 'coin', 'ayeaye', 'ten', 'wild'],
            ['pig', 'lion', 'buffalos', 'ele', 'zebra', 'coin', 'ayeaye', 'queen', 'wild'],
            ['pig', 'lion', 'buffalos', 'ele', 'zebra', 'coin', 'ayeaye', 'ten', 'wild'],
             ['pig', 'lion', 'tha', 'ele', 'zebra', 'coin', 'ayeaye', 'nine', 'wild']
        ];
        
           function formatNumber(num) { return num.toLocaleString(); }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        function updateBalanceDisplay() {
            const creditEl = document.getElementById('creditValue');
            if (creditEl) creditEl.textContent = formatNumber(gameState.balance);
            const betEl = document.getElementById('betValue');
            if (betEl) betEl.textContent = formatNumber(gameState.betAmount);
        }

        function updateWinDisplay(amount) {
            const winEl = document.getElementById('winValue');
            winEl.textContent = formatNumber(amount);
            winEl.style.animation = 'none';
            winEl.offsetHeight;
            winEl.style.animation = 'winnerPulse 0.5s ease';
            setTimeout(() => winEl.style.animation = '', 500);
        }

       function initSlotGrid() {
    const grid = document.getElementById('slotGrid');
    grid.innerHTML = '';
    for (let col = 0; col < 5; col++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'grid-column';
        for (let row = 0; row < 4; row++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';  // 🔥 reel-cell ကနေ grid-cell ကိုပြောင်း
            cell.id = `cell-${row}-${col}`;
            cell.setAttribute('data-col', col);  // 🔥 data-col ထည့်
            cell.setAttribute('data-row', row);  // 🔥 data-row ထည့်
            const img = document.createElement('img');
            img.src = IMAGE_PATHS.coin;
            cell.appendChild(img);
            colDiv.appendChild(cell);
        }
        grid.appendChild(colDiv);
    }
}

        // ===== ANIMATION =====
        function animateReels(result, onComplete) {
    let completed = 0;
    for (let col = 0; col < 5; col++) {
        setTimeout(() => {
            for (let row = 0; row < 4; row++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                if (!cell) continue;
                
                const img = cell.querySelector('img');
                if (!img) continue;
                
                img.style.transition = 'none';
                img.style.transform = 'translateY(-200px)';
                img.style.opacity = '0';
                
                setTimeout(() => {
                    const symbol = result[col]?.[row];
                    img.src = IMAGE_PATHS[symbol] || IMAGE_PATHS.coin;
                    img.style.transition = 'transform 0.2s, opacity 0.1s';
                    img.style.transform = 'translateY(0)';
                    img.style.opacity = '1';
                    cell.classList.add('animate-drop');
                    
                    setTimeout(() => cell.classList.remove('animate-drop'), 500);
                    
                    setTimeout(() => {
                        completed++;
                        if (completed === 20 && onComplete) onComplete();
                    }, row * 60);
                }, row * 60);
            }
        }, col * 120);
    }
  }
  
   function clearWinHighlights() {
    // 🔥 .reel-cell ကနေ .grid-cell ကိုပြောင်း
    document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('winner'));
  }
  function highlightWins(indices) {
    clearWinHighlights();
    indices.forEach(idx => {
        const row = Math.floor(idx / 5);
        const col = idx % 5;
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) cell.classList.add('winner');
    });
   } 

        // ===== 1024 WAYS WIN CALC =====
        function calculateWinnings(result) {
            let totalWin = 0;
            let winIndices = [];
            let winLines = [];

            for (let r0 = 0; r0 < 4; r0++) {
                const baseSymbol = result[0][r0];
                if (!baseSymbol || baseSymbol === 'bonus') continue;

                for (let r1 = 0; r1 < 4; r1++) {
                    const sym1 = result[1][r1];
                    if (!(sym1 === baseSymbol || sym1 === 'wild')) continue;

                    for (let r2 = 0; r2 < 4; r2++) {
                        const sym2 = result[2][r2];
                        if (!(sym2 === baseSymbol || sym2 === 'wild')) continue;

                        let streak = 3;
                        let indices = [r0*5, r1*5+1, r2*5+2];

                        for (let r3 = 0; r3 < 4; r3++) {
                            const sym3 = result[3][r3];
                            if (sym3 === baseSymbol || sym3 === 'wild') {
                                streak = 4;
                                indices.push(r3*5+3);
                                break;
                            }
                        }

                        if (streak === 4) {
                            for (let r4 = 0; r4 < 4; r4++) {
                                const sym4 = result[4][r4];
                                if (sym4 === baseSymbol || sym4 === 'wild') {
                                    streak = 5;
                                    indices.push(r4*5+4);
                                    break;
                                }
                            }
                        }

                        const multiplier = PAYTABLE[baseSymbol]?.[streak];
                        if (multiplier) {
                            const win = Math.floor(gameState.betAmount * multiplier);
                            totalWin += win;
                            winIndices.push(...indices);
                            winLines.push({ symbol: baseSymbol, count: streak, win });
                        }
                    }
                }
            }
            return { totalWin, winIndices: [...new Set(winIndices)], winLines };
        }

        // ============================================
// LOBBY SOUND HELPER (GLOBAL)
// ============================================
const LobbySound = {
    play: function(soundName) {
        try {
            if (window.parent && window.parent.SoundManager && window.parent.SoundManager[soundName]) {
                window.parent.SoundManager[soundName]();
            } else if (window.SoundManager && window.SoundManager[soundName]) {
                window.SoundManager[soundName]();
            }
        } catch(e) {
            // Silent fail
        }
    },
    coin: function() { this.play('coin'); },
    lion: function() { this.play('lion'); },
    boom: function() { this.play('boom'); },
    win: function() { this.play('win'); },
    spin: function() { this.play('spin'); },
    jackpot: function() { this.play('jackpot'); },
    congratulations: function() { this.play('congratulations'); }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function getColumnCells(col) {
    let cells = [];
    for (let row = 0; row < 4; row++) {
        // Try with id first (most reliable)
        let cell = document.getElementById(`cell-${row}-${col}`);
        // Fallback to data attributes
        if (!cell) cell = document.querySelector(`.grid-cell[data-col="${col}"][data-row="${row}"]`);
        if (!cell) cell = document.querySelector(`.reel-cell[data-col="${col}"][data-row="${row}"]`);
        if (cell) cells.push(cell);
    }
    return cells;
}

function addRedBorderToColumn(col) {
    const cells = getColumnCells(col);
    cells.forEach(cell => {
        cell.classList.add('suspense-glow');
        cell.style.boxShadow = '0 0 0 3px #ff0000, 0 0 20px rgba(255,0,0,0.5)';
        cell.style.border = '2px solid #ff0000';
        cell.style.borderRadius = '8px';
    });
}

function removeRedBorderFromColumn(col) {
    const cells = getColumnCells(col);
    cells.forEach(cell => {
        cell.classList.remove('suspense-glow');
        cell.style.boxShadow = '';
        cell.style.border = '';
        cell.style.borderRadius = '';
    });
}

function lockColumn(col) {
    const cells = getColumnCells(col);
    cells.forEach(cell => {
        cell.classList.add('locked-column');
        cell.style.opacity = '0.9';
        cell.style.filter = 'brightness(1.1)';
    });
}

function removeAllBorders() {
    console.log('🧹 Removing all borders, glows, and bonus effects...');
    const allCells = document.querySelectorAll('.grid-cell, .reel-cell');
    allCells.forEach(cell => {
        cell.classList.remove('suspense-glow', 'locked-column', 'rise-column', 'red-border-line', 'yellow-border-line', 'bonus-glow-cell');
        cell.style.border = '';
        cell.style.borderRadius = '';
        cell.style.boxShadow = '';
        cell.style.transform = '';
        cell.style.transition = '';
        cell.style.backgroundColor = '';
        cell.style.opacity = '';
        cell.style.filter = '';
        cell.dataset.symbol = '';
        const img = cell.querySelector('img');
        if (img) {
            img.style.borderRadius = '';
            img.style.boxShadow = '';
            img.style.padding = '';
            img.style.backgroundColor = '';
            img.style.transform = '';
            img.style.opacity = '';
            img.classList.remove('bonus-glow-img');
        }
    });
    console.log('✅ All borders, glows, and bonus effects removed');
}

function addBonusGlow(cell) {
    const img = cell.querySelector('img');
    if (img) {
        img.style.borderRadius = '50%';
        img.style.boxShadow = '0 0 0 4px #ffd700, 0 0 25px #ffd700';
        img.style.padding = '4px';
        img.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        cell.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
        cell.dataset.symbol = 'bonus';
        cell.classList.add('bonus-glow-cell');
        img.classList.add('bonus-glow-img');
        LobbySound.coin();
    }
}

function fastRandomSpin(col, duration, onComplete) {
    const cells = getColumnCells(col);
    const symbols = ['pig', 'jack', 'queen', 'nine', 'lion', 'buffalo', 'ele', 'tha', 'zebra', 'ayeaye', 'coin', 'ten'];
    const startTime = Date.now();
    const IMG_PATHS = window.IMAGE_PATHS || {
        'pig': 'images/pig.png', 'jack': 'images/jack.png', 'queen': 'images/queen.png',
        'nine': 'images/nine.png', 'lion': 'images/lion.png', 'buffalo': 'images/buffalo.png',
        'ele': 'images/ele.png', 'tha': 'images/tha.png', 'zebra': 'images/zebra.png',
        'ayeaye': 'images/ayeaye.png', 'coin': 'images/coin.png', 'ten': 'images/ten.png'
    };
    
    function spinLoop() {
        if (Date.now() - startTime >= duration) {
            if (onComplete) onComplete();
            return;
        }
        for (let i = 0; i < cells.length; i++) {
            const img = cells[i].querySelector('img');
            if (img) {
                const rand = symbols[Math.floor(Math.random() * symbols.length)];
                img.src = IMG_PATHS[rand] || IMG_PATHS.coin;
            }
        }
        setTimeout(spinLoop, 60);
    }
    spinLoop();
}

function revealColumnInstantly(col, targetSymbols) {
    const cells = getColumnCells(col);
    const IMG_PATHS = window.IMAGE_PATHS || {};
    cells.forEach((cell, row) => {
        const img = cell.querySelector('img');
        const symbol = targetSymbols[row];
        if (img && symbol) {
            img.src = IMG_PATHS[symbol] || `images/${symbol}.png`;
            img.style.opacity = '1';
            cell.dataset.symbol = symbol;
            if (symbol === 'bonus') addBonusGlow(cell);
        }
    });
}

function slowRevealColumn(col, targetSymbols, onComplete) {
    const cells = getColumnCells(col);
    let rowIndex = 0;
    let hasBonus = false;
    const IMG_PATHS = window.IMAGE_PATHS || {};
    
    function revealNextRow() {
        if (rowIndex >= cells.length) {
            setTimeout(() => { if (onComplete) onComplete(hasBonus); }, 300);
            return;
        }
        const cell = cells[rowIndex];
        const img = cell.querySelector('img');
        const symbol = targetSymbols[rowIndex];
        if (img && symbol) {
            img.src = IMG_PATHS[symbol] || `images/${symbol}.png`;
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
                    LobbySound.coin();
                }
            }, 50);
        }
        rowIndex++;
        setTimeout(revealNextRow, 150);
    }
    revealNextRow();
}

function lockAndRevealBonusColumn(col, targetSymbols) {
    const cells = getColumnCells(col);
    const IMG_PATHS = window.IMAGE_PATHS || {};
    cells.forEach((cell, row) => {
        const img = cell.querySelector('img');
        const symbol = targetSymbols[row];
        if (img && symbol) {
            img.src = IMG_PATHS[symbol] || `images/${symbol}.png`;
            img.style.opacity = '1';
            img.style.transition = 'all 0.3s ease';
            cell.dataset.symbol = symbol;
            if (symbol === 'bonus') {
                addBonusGlow(cell);
                LobbySound.coin();
            }
        }
    });
    cells.forEach(cell => {
        cell.classList.add('locked-column');
        cell.style.opacity = '0.9';
        cell.style.filter = 'brightness(1.1)';
    });
    console.log(`🔒 Bonus Column ${col} LOCKED`);
}
function countTotalBonuses(result) {
    let count = 0;
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 4; row++) {
            if (result[col] && result[col][row] === 'bonus') {
                count++;
            }
        }
    }
    console.log(`🔢 countTotalBonuses: ${count} bonuses found`);
    return count;
}

function calculateFreeSpinCount(bonusCount) {
    if (bonusCount >= 10) return 60;
    if (bonusCount >= 9) return 50;
    if (bonusCount >= 8) return 40;
    if (bonusCount >= 7) return 30;
    if (bonusCount >= 6) return 25;
    if (bonusCount >= 5) return 20;
    if (bonusCount >= 4) return 15;
    return 10;
}

function calculateExtraSpins(bonusCount) {
    if (bonusCount >= 6) return 15;
    if (bonusCount >= 5) return 12;
    if (bonusCount >= 4) return 8;
    return 5;
}

function finishFreeSpinSuspense(bonusCount, freeSpinCount) {
    console.log('✅ Free Spin Suspense Finished!');
    removeAllBorders();
    setTimeout(() => removeAllBorders(), 100);
    if (bonusCount >= 3) {
        initializeFreeSpinsDirect(bonusCount, freeSpinCount);
    } else {
        if (typeof disableButtons === 'function') disableButtons(false);
        if (window.gameState) window.gameState.isSpinning = false;
        removeAllBorders();
    }
}

function initializeFreeSpinsDirect(bonusCount, freeSpinCount) {
    if (!window.gameState) return;
    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = freeSpinCount;
    window.gameState.totalFreeSpins = freeSpinCount;
    window.gameState.freeSpinBonusCount = bonusCount;
    if (typeof disableButtons === 'function') disableButtons(true);
    if (typeof showFreeSpinIndicator === 'function') showFreeSpinIndicator();
    if (typeof showFreeSpinStartAnimation === 'function') showFreeSpinStartAnimation(freeSpinCount);
    if (typeof showNotification === 'function') {
        showNotification(`✨ Free Spin ${freeSpinCount} ကြိမ် ရရှိပါသည်။ (Bonus ${bonusCount} လုံး)`, 'success');
    } else if (typeof showToast === 'function') {
        showToast(`✨ Free Spin ${freeSpinCount} ကြိမ် ရရှိပါသည်။`);
    }
    setTimeout(() => { if (typeof spin === 'function') spin(); }, 1500);
}
function startFreeSpinSuspenseSequence(finalResult, columnsToCheck, index, bonusCount, freeSpinCount) {
    console.log(`🔍 Suspense sequence: index=${index}, total=${columnsToCheck.length}`);
    
    // 🔥🔥🔥 ဒါက အရေးကြီးဆုံး - အကုန်စစ်ပြီးရင် သေချာခေါ် 🔥🔥🔥
    if (index >= columnsToCheck.length) {
        console.log('✅✅✅ ALL COLUMNS CHECKED! ✅✅✅');
        let totalBonusCount = countTotalBonuses(finalResult);
        console.log(`📊 Total Bonus Count: ${totalBonusCount}`);
        
        // 🔥 ALWAYS call finishFreeSpinSuspense
        console.log('🎯 Calling finishFreeSpinSuspense NOW...');
        finishFreeSpinSuspense(totalBonusCount, calculateFreeSpinCount(totalBonusCount));
        return;
    }

    let col = columnsToCheck[index];
    let isLastColumn = (index === columnsToCheck.length - 1);
    let targetSymbols = finalResult[col];
    let hasBonusInThisCol = targetSymbols.some(s => s === 'bonus');

    if (hasBonusInThisCol) {
        console.log(`⏩ Column ${col} has Bonus, revealing instantly...`);
        revealColumnInstantly(col, targetSymbols);
        lockColumn(col);
        setTimeout(() => {
            startFreeSpinSuspenseSequence(finalResult, columnsToCheck, index + 1, bonusCount, freeSpinCount);
        }, 400);
    } else {
        console.log(`🔍 Column ${col} suspense check...`);
        addRedBorderToColumn(col);
        let cells = getColumnCells(col);
        cells.forEach(cell => cell.classList.add('rise-column'));

        LobbySound.lion();
        LobbySound.coin();

        let spinDuration = isLastColumn ? 7000 : 5000;
        fastRandomSpin(col, spinDuration, () => {
            slowRevealColumn(col, targetSymbols, (hasBonus) => {
                removeRedBorderFromColumn(col);
                cells.forEach(c => c.classList.remove('rise-column'));
                if (hasBonus) lockColumn(col);
                setTimeout(() => {
                    startFreeSpinSuspenseSequence(finalResult, columnsToCheck, index + 1, bonusCount, freeSpinCount);
                }, 500);
            });
        });
    }
}


function startFreeSpinSuspense(finalResult, bonusColumns, nonBonusColumns, bonusCount) {
    console.log('🎬 FREE SPIN SUSPENSE MODE ACTIVATED!');
    bonusColumns.forEach(col => { lockAndRevealBonusColumn(col, finalResult[col]); });
    if (nonBonusColumns.length > 0) {
        let freeSpinCount = calculateFreeSpinCount(bonusCount);
        startFreeSpinSuspenseSequence(finalResult, nonBonusColumns, 0, bonusCount, freeSpinCount);
    } else {
        initializeFreeSpinsDirect(bonusCount, calculateFreeSpinCount(bonusCount));
    }
}

function checkScatterWithSuspense(result) {
    let bonusColumns = [], nonBonusColumns = [];
    for (let col = 0; col < 5; col++) {
        let hasBonus = false;
        for (let row = 0; row < 4; row++) {
            if (result[col] && result[col][row] === 'bonus') { hasBonus = true; break; }
        }
        if (hasBonus) bonusColumns.push(col);
        else nonBonusColumns.push(col);
    }
    let bonusCount = bonusColumns.length;
    console.log(`📊 Bonus Columns: ${bonusColumns} (Total: ${bonusCount})`);
    
    if (window.gameState && window.gameState.isFreeSpinning && bonusCount >= 2) {
        let extraSpins = calculateExtraSpins(bonusCount);
        window.gameState.freeSpins += extraSpins;
        window.gameState.totalFreeSpins += extraSpins;
        if (typeof updateFreeSpinIndicator === 'function') updateFreeSpinIndicator();
        if (typeof showNotification === 'function') {
            showNotification(`✨ Bonus ${bonusCount} လုံးကျပါသည်။ အပို Free Spin ${extraSpins} ကြိမ် ထပ်ရရှိပါသည်။`, 'success');
        }
        if (typeof showExtraFreeSpinAnimation === 'function') showExtraFreeSpinAnimation(extraSpins);
        return bonusCount;
    }
    
    if (!window.gameState?.isFreeSpinning && bonusCount >= 2) {
        startFreeSpinSuspense(result, bonusColumns, nonBonusColumns, bonusCount);
    }
    return bonusCount;
}


function disableSpinButton() {
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.disabled = true;
        spinBtn.style.opacity = '0.4';
        spinBtn.style.pointerEvents = 'none';
        spinBtn.classList.add('spinning-disabled');
    }
    console.log('🔒 SPIN BUTTON LOCKED');
}

function enableSpinButton() {
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.disabled = false;
        spinBtn.style.opacity = '1';
        spinBtn.style.pointerEvents = 'auto';
        spinBtn.classList.remove('spinning-disabled');
    }
    console.log('🔓 SPIN BUTTON UNLOCKED');
}
function finishFreeSpinSuspense(bonusCount, freeSpinCount) {
    console.log('🔥🔥🔥 FINISH FREE SPIN SUSPENSE CALLED 🔥🔥🔥');
    console.log('📌 bonusCount:', bonusCount, 'freeSpinCount:', freeSpinCount);
    console.log('📌 autoSpinPaused BEFORE:', autoSpinPaused);

    removeAllBorders();
    setTimeout(() => removeAllBorders(), 100);

    if (bonusCount >= 3) {
        initializeFreeSpinsDirect(bonusCount, freeSpinCount);
    } else {
        enableSpinButton();

        // 🔥🔥🔥 RESET AUTO SPIN PAUSED 🔥🔥🔥
        autoSpinPaused = false;
        console.log('📌 autoSpinPaused AFTER:', autoSpinPaused);
        
        isWaitingForWin = false;
        window.gameState.waitingForWinAnimation = false;
        window.gameState.suspenseMode = false;

        // 🔥🔥🔥 FORCE RESUME AUTO SPIN 🔥🔥🔥
        if (window.gameState.autoSpinActive) {
            console.log('▶️▶️▶️ RESUMING AUTO SPIN ◀️◀️◀️');
            setTimeout(() => {
                console.log('🔄 Calling performAutoSpin()');
                performAutoSpin();
            }, 100);
        }

        if (typeof disableButtons === 'function') disableButtons(false);
        window.gameState.isSpinning = false;
        removeAllBorders();
    }
}
function startFreeSpinSuspense(finalResult, bonusColumns, nonBonusColumns, bonusCount) {
    console.log('🎬 FREE SPIN SUSPENSE MODE ACTIVATED!');

    // 🔥 Pause auto spin if active
    if (window.gameState.autoSpinActive) {
        autoSpinPaused = true;
        console.log('⏸️ Auto spin paused (autoSpinPaused = true)');
    }

    disableSpinButton();

    // Bonus Columns ကို Lock + Reveal
    bonusColumns.forEach(col => {
        lockAndRevealBonusColumn(col, finalResult[col]);
    });

    if (nonBonusColumns.length > 0) {
        let freeSpinCount = calculateFreeSpinCount(bonusCount);
        startFreeSpinSuspenseSequence(finalResult, nonBonusColumns, 0, bonusCount, freeSpinCount);
    } else {
        initializeFreeSpinsDirect(bonusCount, calculateFreeSpinCount(bonusCount));
    }
}
// ============================================
// DISABLE BUTTONS DURING FREE SPIN (COMPLETE)
// ============================================
function disableButtons(disable) {
    // 1. SPIN button
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.disabled = disable;
        spinBtn.style.opacity = disable ? '0.5' : '1';
        spinBtn.style.pointerEvents = disable ? 'none' : 'auto';
        if (disable) spinBtn.classList.add('free-spin-disabled');
        else spinBtn.classList.remove('free-spin-disabled');
    }

    // 2. BET buttons (increase/decrease)
    const betButtons = document.querySelectorAll('#decBet, #incBet, .bet-option');
    betButtons.forEach(btn => {
        if (btn) {
            btn.disabled = disable;
            btn.style.opacity = disable ? '0.5' : '1';
            btn.style.pointerEvents = disable ? 'none' : 'auto';
        }
    });

    // 3. C BUTTON (Unit Select / Coin Value) - 🔥 အရေးကြီးဆုံး
    const unitSelectBtn = document.getElementById('unitSelectBtn');
    if (unitSelectBtn) {
        unitSelectBtn.disabled = disable;
        unitSelectBtn.style.opacity = disable ? '0.5' : '1';
        unitSelectBtn.style.pointerEvents = disable ? 'none' : 'auto';
        if (disable) unitSelectBtn.classList.add('free-spin-disabled');
        else unitSelectBtn.classList.remove('free-spin-disabled');
    }

    // 4. C MODAL (if open, close it)
    const cModal = document.getElementById('cModalOverlay');
    if (cModal && disable) {
        cModal.classList.remove('show');
    }

    // 5. AUTO SPIN button (if separate from spin)
    const autoSpinBtn = document.getElementById('autoSpinBtn');
    if (autoSpinBtn) {
        autoSpinBtn.disabled = disable;
        autoSpinBtn.style.opacity = disable ? '0.5' : '1';
        autoSpinBtn.style.pointerEvents = disable ? 'none' : 'auto';
    }

    // 6. MAX BET button
    const maxBetBtn = document.getElementById('maxBetBtn');
    if (maxBetBtn) {
        maxBetBtn.disabled = disable;
        maxBetBtn.style.opacity = disable ? '0.5' : '1';
        maxBetBtn.style.pointerEvents = disable ? 'none' : 'auto';
    }

    // 7. BET AMOUNT LABEL (visual only, not clickable)
    const betLabel = document.getElementById('betAmountLabel');
    if (betLabel) {
        betLabel.style.opacity = disable ? '0.5' : '1';
    }

    console.log(disable ? '🔒 ALL BUTTONS DISABLED (Free Spin)' : '🔓 ALL BUTTONS ENABLED');
}

// ===== CSS for disabled state =====
if (!document.querySelector('#free-spin-disabled-styles')) {
    const style = document.createElement('style');
    style.id = 'free-spin-disabled-styles';
    style.textContent = `
        .free-spin-disabled {
            cursor: not-allowed !important;
            filter: grayscale(0.5) !important;
            transform: none !important;
        }
        .free-spin-disabled:hover {
            transform: none !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
}

// ===== FREE SPIN POPUP (Complete with countdown) =====
function showFreeSpinPopup(message, type = 'info') {
    // Remove existing popup
    const existingPopup = document.getElementById('free-spin-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'free-spin-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #1a0f0a 0%, #2d1b0e 100%);
        border: 3px solid #ffd700;
        color: #ffd700;
        padding: 40px 60px;
        border-radius: 25px;
        font-size: 28px;
        font-weight: 900;
        text-align: center;
        z-index: 99999;
        box-shadow: 0 0 60px rgba(255, 215, 0, 0.4), 0 15px 50px rgba(0,0,0,0.5);
        min-width: 350px;
        font-family: 'Bangers', cursive;
        letter-spacing: 2px;
        animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    `;

    popup.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 15px; animation: bounce 0.6s infinite alternate;">🎰</div>
        <div style="font-size: 36px; margin-bottom: 10px; color: #fff; text-shadow: 0 0 20px #ffd700;">${message}</div>
        <div id="free-spin-countdown" style="font-size: 20px; color: #00ffaa; margin-top: 15px;"></div>
    `;

    document.body.appendChild(popup);

    // Auto remove
    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => popup.remove(), 500);
    }, 3000);

    return popup;
}

// ===== FREE SPIN START (Complete) =====
function startFreeSpin(spinCount) {
    console.log(`🎰 Starting Free Spins: ${spinCount} spins`);

    // 🔒 Disable ALL buttons immediately
    disableButtons(true);

    // Show popup
    showFreeSpinPopup(`✨ FREE SPIN ${spinCount} ✨`);

    // Add confetti
    createConfetti();

    // Set game state
    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = spinCount;
    window.gameState.totalFreeSpins = spinCount;
    window.gameState.freeSpinTotalWin = 0;

    // Show indicator
    showFreeSpinIndicator();

    // Start countdown
    let remaining = spinCount;
    const countdownEl = document.getElementById('free-spin-countdown');

    function doFreeSpin() {
        if (remaining <= 0) {
            endFreeSpin();
            return;
        }

        if (countdownEl) {
            countdownEl.textContent = `${remaining} spins remaining...`;
        }

        // Perform spin (call your existing spin function)
        if (typeof spin === 'function') {
            spin();
        }

        remaining--;

        // Wait for spin to complete before next (adjust delay as needed)
        setTimeout(doFreeSpin, 2500);
    }

    // Start first spin after popup animation
    setTimeout(doFreeSpin, 1500);
}

// ===== FREE SPIN END (Complete with auto spin resume) =====
function endFreeSpin() {
    console.log('🎰 Free Spins Complete');

    const totalWin = window.gameState.freeSpinTotalWin || 0;

    // Add win to balance
    if (totalWin > 0) {
        window.gameState.balance += totalWin;
        window.gameState.displayBalance += totalWin;
        updateBalanceDisplay();
        updateWinDisplay(totalWin);
        showNotification(`🎉 Free Spin Complete! Total: ${formatNumber(totalWin)} KS`, 'success');
    }

    // Reset state
    window.gameState.isFreeSpinning = false;
    window.gameState.freeSpins = 0;
    window.gameState.totalFreeSpins = 0;
    window.gameState.freeSpinTotalWin = 0;

    // Hide indicator
    hideFreeSpinIndicator();

    // Show end popup
    showFreeSpinPopup(`🎊 ${formatNumber(totalWin)} KS WON! 🎊`);

    // 🔓 Re-enable ALL buttons
    disableButtons(false);

    // Clear win display after delay
    setTimeout(() => {
        updateWinDisplay(0);
    }, 3000);

    // 🔥🔥🔥 CRITICAL: Resume auto spin if it was active before free spin
    if (typeof autoSpinPaused !== 'undefined' && autoSpinPaused === true) {
        autoSpinPaused = false;
        console.log('▶️ Resuming auto spin after free spins');

        setTimeout(() => {
            if (window.gameState.autoSpinActive && !window.gameState.isSpinning) {
                if (typeof performAutoSpin === 'function') {
                    performAutoSpin();
                }
            }
        }, 2000);
    }

    // Update storage
    if (typeof updateUserBalanceInStorage === 'function') {
        updateUserBalanceInStorage();
    }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF00FF', '#00FF00'];

    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${Math.random() * 100}vw;
            width: ${8 + Math.random() * 12}px;
            height: ${8 + Math.random() * 12}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 99998;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
            animation-delay: ${Math.random() * 1.5}s;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 6000);
    }
}

// ===== KEYFRAMES (Complete) =====
if (!document.querySelector('#free-spin-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'free-spin-animation-styles';
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-25px); }
        }
        @keyframes confettiFall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            70% { transform: translate(-50%, -50%) scale(1.15); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
        }
    `;
    document.head.appendChild(style);
}

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

    // 🔥🔥🔥 RESUME AUTO SPIN IF IT WAS PAUSED 🔥🔥🔥
    if (typeof autoSpinPaused !== 'undefined' && autoSpinPaused === true) {
        autoSpinPaused = false;
        console.log('▶️ Resuming auto spin after free spins ended');
        
        // Small delay to let UI settle
        setTimeout(() => {
            if (window.gameState.autoSpinActive === true && window.gameState.isSpinning === false) {
                console.log('🔄 Auto spin resuming now');
                if (typeof performAutoSpin === 'function') {
                    performAutoSpin();
                }
            }
        }, 1500);
    }
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

// ===== FREE SPIN POPUP (Complete with countdown) =====
function showFreeSpinPopup(message, type = 'info') {
    // Remove existing popup
    const existingPopup = document.getElementById('free-spin-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'free-spin-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #1a0f0a 0%, #2d1b0e 100%);
        border: 3px solid #ffd700;
        color: #ffd700;
        padding: 40px 60px;
        border-radius: 25px;
        font-size: 28px;
        font-weight: 900;
        text-align: center;
        z-index: 99999;
        box-shadow: 0 0 60px rgba(255, 215, 0, 0.4), 0 15px 50px rgba(0,0,0,0.5);
        min-width: 350px;
        font-family: 'Bangers', cursive;
        letter-spacing: 2px;
        animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    `;

    popup.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 15px; animation: bounce 0.6s infinite alternate;">🎰</div>
        <div style="font-size: 36px; margin-bottom: 10px; color: #fff; text-shadow: 0 0 20px #ffd700;">${message}</div>
        <div id="free-spin-countdown" style="font-size: 20px; color: #00ffaa; margin-top: 15px;"></div>
    `;

    document.body.appendChild(popup);

    // Auto remove
    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => popup.remove(), 500);
    }, 3000);

    return popup;
}

// ===== FREE SPIN START (Complete) =====
function startFreeSpin(spinCount) {
    console.log(`🎰 Starting Free Spins: ${spinCount} spins`);

    // 🔒 Disable ALL buttons immediately
    disableButtons(true);

    // Show popup
    showFreeSpinPopup(`✨ FREE SPIN ${spinCount} ✨`);

    // Add confetti
    createConfetti();

    // Set game state
    window.gameState.isFreeSpinning = true;
    window.gameState.freeSpins = spinCount;
    window.gameState.totalFreeSpins = spinCount;
    window.gameState.freeSpinTotalWin = 0;

    // Show indicator
    showFreeSpinIndicator();

    // Start countdown
    let remaining = spinCount;
    const countdownEl = document.getElementById('free-spin-countdown');

    function doFreeSpin() {
        if (remaining <= 0) {
            endFreeSpin();
            return;
        }

        if (countdownEl) {
            countdownEl.textContent = `${remaining} spins remaining...`;
        }

        // Perform spin (call your existing spin function)
        if (typeof spin === 'function') {
            spin();
        }

        remaining--;

        // Wait for spin to complete before next (adjust delay as needed)
        setTimeout(doFreeSpin, 2500);
    }

    // Start first spin after popup animation
    setTimeout(doFreeSpin, 1500);
}

// ===== FREE SPIN END (Complete with auto spin resume) =====
function endFreeSpin() {
    console.log('🎰 Free Spins Complete');

    const totalWin = window.gameState.freeSpinTotalWin || 0;

    // Add win to balance
    if (totalWin > 0) {
        window.gameState.balance += totalWin;
        window.gameState.displayBalance += totalWin;
        updateBalanceDisplay();
        updateWinDisplay(totalWin);
        showNotification(`🎉 Free Spin Complete! Total: ${formatNumber(totalWin)} KS`, 'success');
    }

    // Reset state
    window.gameState.isFreeSpinning = false;
    window.gameState.freeSpins = 0;
    window.gameState.totalFreeSpins = 0;
    window.gameState.freeSpinTotalWin = 0;

    // Hide indicator
    hideFreeSpinIndicator();

    // Show end popup
    showFreeSpinPopup(`🎊 ${formatNumber(totalWin)} KS WON! 🎊`);

    // 🔓 Re-enable ALL buttons
    disableButtons(false);

    // Clear win display after delay
    setTimeout(() => {
        updateWinDisplay(0);
    }, 3000);

    // 🔥🔥🔥 CRITICAL: Resume auto spin if it was active before free spin
    if (typeof autoSpinPaused !== 'undefined' && autoSpinPaused === true) {
        autoSpinPaused = false;
        console.log('▶️ Resuming auto spin after free spins');

        setTimeout(() => {
            if (window.gameState.autoSpinActive && !window.gameState.isSpinning) {
                if (typeof performAutoSpin === 'function') {
                    performAutoSpin();
                }
            }
        }, 2000);
    }

    // Update storage
    if (typeof updateUserBalanceInStorage === 'function') {
        updateUserBalanceInStorage();
    }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF00FF', '#00FF00'];

    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${Math.random() * 100}vw;
            width: ${8 + Math.random() * 12}px;
            height: ${8 + Math.random() * 12}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 99998;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
            animation-delay: ${Math.random() * 1.5}s;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 6000);
    }
}

// ===== KEYFRAMES (Complete) =====
if (!document.querySelector('#free-spin-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'free-spin-animation-styles';
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-25px); }
        }
        @keyframes confettiFall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            70% { transform: translate(-50%, -50%) scale(1.15); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
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


    function showNotification(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    } else {
        console.log('📢 Notification:', msg);
    }
}
        // ===== SPIN RESULT GENERATION =====
        function generateSpinResult() {
            const result = [[],[],[],[],[]];
            const reels = gameState.isFreeSpinning ? FREE_SPIN_REELS : REELS;
            for (let col = 0; col < 5; col++) {
                const reel = reels[col];
                const start = Math.floor(Math.random() * reel.length);
                for (let row = 0; row < 4; row++) {
                    result[col][row] = reel[(start + row) % reel.length];
                }
            }
            return result;
        }

        // ===== ADD HISTORY =====
        function addWinToHistory(winAmount, winLines) {
            const historyList = document.getElementById('historyList');
            const div = document.createElement('div');
            div.className = 'history-item win';
            div.innerHTML = `🎉 +${formatNumber(winAmount)} KS (${winLines.length} lines)`;
            historyList.prepend(div);
            if (historyList.children.length > 10) historyList.removeChild(historyList.lastChild);
        }

        
// ===== MAIN SPIN (FIXED WITH LOBBY SYNC & ANIMATION CALLBACK) =====
function spin() {
    if (gameState.isSpinning) return;
    if (gameState.balance < gameState.betAmount && !gameState.isFreeSpinning) {
        showToast('လက်ကျန်ငွေ မလုံလောက်ပါ!');
        return;
    }

    gameState.isSpinning = true;
    clearWinHighlights();

    // 🔥 Spin sound
    const parentSound = (window.parent && window.parent.SoundManager) ? window.parent.SoundManager : null;
    if (parentSound && parentSound.spin) {
        parentSound.spin();
    }

    if (!gameState.isFreeSpinning) {
        gameState.balance -= gameState.betAmount;
        reportBet(gameState.betAmount);
        updateBalanceDisplay();
    }

    const result = generateSpinResult();
    animateReels(result, () => {
        const { totalWin, winIndices, winLines } = calculateWinnings(result);

        if (totalWin > 0) {
            const winPercentage = (totalWin / gameState.betAmount) * 100;

            // 🔥 Get parent objects
            const parentSound = (window.parent && window.parent.SoundManager) ? window.parent.SoundManager : null;
            const parentWinAnim = (window.parent && window.parent.WinAnimation) ? window.parent.WinAnimation : null;
            const parentGlobalTop = (window.parent && window.parent.GlobalTopManager) ? window.parent.GlobalTopManager : null;

            // ===== SOUNDS =====
            if (parentSound) {
                try {
                    if (winPercentage >= 1500) {
                        parentSound.congratulations();
                        parentSound.lion();
                        parentSound.coin();
                        console.log('🔊 Mega win sounds (from lobby)');
                    } else if (winPercentage >= 1000) {
                        parentSound.congratulations();
                        parentSound.lion();
                        parentSound.coin();
                        console.log('🔊 Super win sounds (from lobby)');
                    } else if (winPercentage >= 500) {
                        parentSound.congratulations();
                        parentSound.lion();
                        parentSound.coin();
                        console.log('🔊 Big win sounds (from lobby)');
                    } else if (totalWin > 0) {
                        parentSound.win();
                        parentSound.coin();
                        console.log('🔊 Normal win sounds (from lobby)');
                    }
                } catch(e) {
                    console.warn('Sound error:', e);
                }
            }

            // ===== BALANCE & UI UPDATE =====
            if (gameState.isFreeSpinning) {
                gameState.freeSpinTotalWin += totalWin;
                updateWinDisplay(gameState.freeSpinTotalWin);
            } else {
                const oldBalance = gameState.balance;
                const newBalance = oldBalance + totalWin;
                gameState.balance = newBalance;
                reportWin(totalWin);
                updateBalanceDisplay();
                updateWinDisplay(totalWin);
                
                // Get elements for coin animation
                const winEl = document.getElementById('winDisplay') || document.getElementById('winAmount');
                const balanceEl = document.getElementById('balanceDisplay') || document.getElementById('balanceAmount');
                
                // 🔥 COIN ANIMATION (if function exists)
                if (typeof animateWinCoins === 'function' && winEl && balanceEl && !gameState.isFreeSpinning) {
                    // Don't show win number yet, let coins fly first
                    // But we need to update balance after animation
                    const finalBalance = newBalance;
                    const finalWin = totalWin;
                    
                    animateWinCoins(totalWin, winEl, balanceEl, function() {
                        // After coins fly, update balance number
                        if (typeof animateNumber === 'function' && balanceEl) {
                            animateNumber(balanceEl, oldBalance, finalBalance, 500, function() {
                                console.log('✅ Balance animation completed');
                            });
                        } else {
                            balanceEl.textContent = formatNumber(finalBalance);
                        }
                        if (winEl) {
                            winEl.textContent = formatNumber(finalWin);
                        }
                    });
                }
            }

            highlightWins(winIndices);
            addWinToHistory(totalWin, winLines);
            showToast(`🎉 WIN! +${formatNumber(totalWin)} KS`);

           // ===== WIN ANIMATION (WITH CALLBACK FOR AUTO SPIN) =====
if (parentWinAnim && winPercentage >= 500) {
    try {
        window.gameState.waitingForWinAnimation = true;
        
        const onAnimationComplete = () => {
            console.log('🎬 Animation finished');
            window.gameState.waitingForWinAnimation = false;
            
            // 🔥 NEW: Animate coins from winning symbols
            const winlineData = [{ symbol: 'win', indices: winIndices }];
            
            if (typeof animateWinCoinsFromSymbols === 'function' && winIndices.length > 0) {
                animateWinCoinsFromSymbols(totalWin, winlineData, () => {
                    console.log('✅ Coin animation completed');
                    if (window.gameState.autoSpinActive && !window.gameState.isSpinning) {
                        setTimeout(() => performAutoSpin(), 500);
                    }
                });
            } else {
                if (window.gameState.autoSpinActive && !window.gameState.isSpinning) {
                    setTimeout(() => performAutoSpin(), 500);
                }
            }
        };
        
        if (winPercentage >= 1500) {
            parentWinAnim.mega(totalWin, onAnimationComplete);
        } else if (winPercentage >= 1000) {
            parentWinAnim.super(totalWin, onAnimationComplete);
        } else if (winPercentage >= 500) {
            parentWinAnim.big(totalWin, onAnimationComplete);
        }
        
    } catch(e) {
        console.warn('Animation error:', e);
        window.gameState.waitingForWinAnimation = false;
    }
}

            // ===== GLOBAL TOP MANAGER =====
            if (parentGlobalTop && totalWin >= 50000) {
                try {
                    let globalWinType = 'big';
                    if (winPercentage >= 1500) globalWinType = 'mega';
                    else if (winPercentage >= 1000) globalWinType = 'super';
                    parentGlobalTop.submitWin(totalWin, globalWinType);
                    console.log(`🏆 Submitted to Global Top: ${totalWin} (${globalWinType})`);
                } catch(e) {
                    console.warn('GlobalTop error:', e);
                }
            }

        } else {
            updateWinDisplay(0);

            // 🔥 No win sound
            const parentSound = (window.parent && window.parent.SoundManager) ? window.parent.SoundManager : null;
            if (parentSound && parentSound.noWin) {
                parentSound.noWin();
                console.log('🔊 No win sound');
            }
            // No win means no animation waiting
            window.gameState.waitingForWinAnimation = false;
        }

        checkScatterWithSuspense(result);
        gameState.isSpinning = false;

        if (gameState.isFreeSpinning && gameState.freeSpins > 0) {
            gameState.freeSpins--;
            const freeSpinsEl = document.getElementById('freeSpinsCount');
            if (freeSpinsEl) freeSpinsEl.textContent = gameState.freeSpins;
            if (gameState.freeSpins > 0) {
                setTimeout(() => spin(), 1000);
            } else {
                endFreeSpins();
            }
        }

        // 🔥 CRITICAL: Auto spin completion handler
        if (window.gameState.autoSpinActive) {
            console.log('🔄 Auto spin: spin completed, win:', totalWin);
            if (typeof handleAutoSpinComplete === 'function') {
                // Pass the win amount and let auto spin decide when to continue
                handleAutoSpinComplete(totalWin);
            }
        }
    });
}

// ============================================
// WINNING SYMBOLS ကိုရှာယူရန်
// ============================================
function getWinningSymbols(winlineData) {
    const symbols = [];
    const processedCells = new Set();
    
    for (const line of winlineData) {
        if (line.indices && line.indices.length > 0) {
            for (const idx of line.indices) {
                if (processedCells.has(idx)) continue;
                processedCells.add(idx);
                
                const row = Math.floor(idx / 5);
                const col = idx % 5;
                let cell = document.getElementById(`cell-${row}-${col}`);
                if (!cell) cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                if (!cell) continue;
                
                const rect = cell.getBoundingClientRect();
                let glowColor = '#FFD700';
                if (line.symbol === 'buffalo') glowColor = '#8B4513';
                else if (line.symbol === 'lion') glowColor = '#FF6600';
                else if (line.symbol === 'ele') glowColor = '#00BFFF';
                
                symbols.push({
                    element: cell,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    symbol: line.symbol,
                    glow: glowColor
                });
            }
        }
    }
    
    return symbols;
}

// ============================================
// COIN ANIMATION FROM WINNING SYMBOLS (for creditValue)
// ============================================
function animateWinCoinsFromSymbols(winAmount, winlineData, onComplete) {
    // 🔥 balanceElement က creditValue ဖြစ်တယ်
    const balanceElement = document.getElementById('creditValue');
    if (!balanceElement || !winlineData?.length) {
        if (onComplete) onComplete();
        return;
    }

    const startBalance = parseInt(balanceElement.innerText.replace(/[^0-9]/g, '')) || 0;
    const finalBalance = startBalance + winAmount;
    const balanceRect = balanceElement.getBoundingClientRect();
    const endX = balanceRect.left + balanceRect.width / 2;
    const endY = balanceRect.top + balanceRect.height / 2;
    const winningSymbols = getWinningSymbols(winlineData);

    let coinsPerSymbol = Math.min(Math.floor(winAmount / 500) + 5, 20);
    let currentSymbolIndex = 0;
    let completedCoins = 0;
    const totalCoins = winningSymbols.length * coinsPerSymbol;

    const applyGlowStyle = (active) => {
        if (active) {
            balanceElement.style.color = '#FFD700';
            balanceElement.style.textShadow = '0 0 15px #FF8C00, 0 0 25px #FF4500';
            balanceElement.style.transition = 'all 0.2s';
        } else {
            balanceElement.style.color = '';
            balanceElement.style.textShadow = '';
        }
    };

    const updateWinValue = (amount) => {
        const winEl = document.getElementById('winValue');
        if (winEl) winEl.textContent = amount.toLocaleString();
    };

    const countUpBalance = () => {
        applyGlowStyle(true);
        updateWinValue(winAmount);
        
        let startTime = null;
        const duration = 1500;
        
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentVal = Math.floor(startBalance + (winAmount * progress));
            balanceElement.innerText = currentVal.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                balanceElement.innerText = finalBalance.toLocaleString();
                applyGlowStyle(false);
                balanceElement.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 300 });
                
                // Update gameState balance
                if (window.gameState) window.gameState.balance = finalBalance;
                if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay();
                
                if (onComplete) onComplete();
            }
        }
        requestAnimationFrame(step);
    };

    const createTrail = (x, y) => {
        const trail = document.createElement('div');
        trail.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; width: 4px; height: 4px; background: gold; border-radius: 50%; pointer-events: none; z-index: 9998;`;
        document.body.appendChild(trail);
        trail.animate([{ opacity: 0.5 }, { opacity: 0, transform: 'scale(0)' }], { duration: 300 }).onfinish = () => trail.remove();
    };

    function createCoin(symbol, onDone) {
        const coin = document.createElement('div');
        const coinImg = document.createElement('img');
        coinImg.src = 'images/coin.png';
        coinImg.style.cssText = 'width: 30px; height: 30px; display: block;';
        coin.appendChild(coinImg);
        
        coinImg.onerror = () => {
            coinImg.remove();
            coin.innerHTML = '🪙';
            coin.style.fontSize = '28px';
        };
        
        coin.style.cssText = `position: fixed; left: ${symbol.x}px; top: ${symbol.y}px; z-index: 9999; pointer-events: none; transition: transform 0.1s linear;`;
        document.body.appendChild(coin);

        const startX = symbol.x, startY = symbol.y;
        const targetX = endX + (Math.random() - 0.5) * 40;
        const targetY = endY + (Math.random() - 0.5) * 20;
        const midX = (startX + targetX) / 2;
        const midY = Math.min(startY, targetY) - 150;

        let progress = 0;
        const duration = 500 + Math.random() * 300;

        function update() {
            progress += 16 / duration;
            if (progress > 1) {
                coin.remove();
                if (onDone) onDone();
                return;
            }
            const x = Math.pow(1 - progress, 2) * startX + 2 * (1 - progress) * progress * midX + Math.pow(progress, 2) * targetX;
            const y = Math.pow(1 - progress, 2) * startY + 2 * (1 - progress) * progress * midY + Math.pow(progress, 2) * targetY;
            coin.style.left = `${x}px`;
            coin.style.top = `${y}px`;
            coin.style.transform = `rotate(${progress * 720}deg)`;
            if (progress > 0.2 && Math.random() > 0.7) createTrail(x, y);
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function processSymbols() {
        if (currentSymbolIndex >= winningSymbols.length) {
            countUpBalance();
            return;
        }

        const symbol = winningSymbols[currentSymbolIndex];
        let coinCount = 0;
        
        function createNextCoin() {
            if (coinCount >= coinsPerSymbol) {
                currentSymbolIndex++;
                setTimeout(processSymbols, 150);
                return;
            }
            createCoin(symbol, () => {
                completedCoins++;
            });
            coinCount++;
            setTimeout(createNextCoin, 60);
        }
        
        createNextCoin();
    }
    
    processSymbols();
}
 // ============================================
// NO WIN CYCLE (Normal 2 → No Win 2)
// ============================================
const noWinCycle = {
    enabled: true,
    currentPhase: 'normal',      // 'normal' or 'nowin'
    normalSpins: 0,
    noWinSpins: 0,
    normalPhaseLength: 2,        // 2 ကြိမ် normal
    noWinPhaseLength: 4          // 2 ကြိမ် no win
};

function shouldForceNoWin() {
    if (!noWinCycle.enabled) return false;
    
    const cycle = noWinCycle;
    
    if (cycle.currentPhase === 'nowin') {
        // No win phase မှာ ရှိနေရင်
        cycle.noWinSpins++;
        console.log(`🔴 No win phase: spin ${cycle.noWinSpins}/${cycle.noWinPhaseLength}`);
        
        if (cycle.noWinSpins >= cycle.noWinPhaseLength) {
            // No win phase ပြီးရင် normal phase ကိုပြောင်း
            cycle.currentPhase = 'normal';
            cycle.normalSpins = 0;
            cycle.noWinSpins = 0;
            console.log('🟢 Switching to NORMAL phase');
        }
        return true;  // Force no win
    } 
    else {
        // Normal phase
        cycle.normalSpins++;
        console.log(`🟢 Normal phase: spin ${cycle.normalSpins}/${cycle.normalPhaseLength}`);
        
        if (cycle.normalSpins >= cycle.normalPhaseLength) {
            // Normal phase ပြီးရင် no win phase ကိုပြောင်း
            cycle.currentPhase = 'nowin';
            cycle.normalSpins = 0;
            cycle.noWinSpins = 0;
            console.log('🔴 Switching to NO WIN phase');
        }
        return false;  // Normal spin
    }
}

// ============================================
// FORCE TRUE NO WIN (Col 0 vs Col 1 မတူ)
// ============================================
function forceTrueNoWin(result) {
    // Wild မပါတဲ့ symbol pool
    const symbolsNoWild = ['lion', 'buffalo', 'ele', 'zebra', 'tha', 'pig', 'jack', 'queen', 'nine', 'ten', 'coin'];
    
    // === COL 0 (Wild မပါ) ===
    for (let row = 0; row < 4; row++) {
        result[0][row] = symbolsNoWild[Math.floor(Math.random() * symbolsNoWild.length)];
    }
    
    // Col 0 မှာပါတဲ့ symbol တွေကို မှတ်ထား
    const usedInCol0 = new Set(result[0]);
    
    // Col 0 မှာမပါတဲ့ symbol တွေ
    let availableForCol1 = symbolsNoWild.filter(s => !usedInCol0.has(s));
    
    // === COL 1 (Col 0 နဲ့ လုံးဝမတူ) ===
    for (let row = 0; row < 4; row++) {
        const randomIndex = Math.floor(Math.random() * availableForCol1.length);
        result[1][row] = availableForCol1[randomIndex];
    }
    
    // Col 2,3,4 ကို ပုံမှန်အတိုင်း (ဘာမှမထိ)
    // ဒါပေမယ့် Wild မပါအောင် လုပ်ချင်ရင် အောက်ပါအတိုင်းလည်း လုပ်နိုင်တယ်
    for (let col = 2; col < 5; col++) {
        for (let row = 0; row < 4; row++) {
            // Wild မပါအောင် သေချာချင်ရင်
            if (result[col][row] === 'wild') {
                result[col][row] = symbolsNoWild[Math.floor(Math.random() * symbolsNoWild.length)];
            }
        }
    }
    
    return result;
}

// ============================================
// GENERATE SPIN RESULT (WITH NO WIN CYCLE)
// ============================================
function generateSpinResult() {
    const result = [[],[],[],[],[]];
    const reels = gameState.isFreeSpinning ? FREE_SPIN_REELS : REELS;
    
    for (let col = 0; col < 5; col++) {
        const reel = reels[col];
        const start = Math.floor(Math.random() * reel.length);
        
        for (let row = 0; row < 4; row++) {
            let symbol = reel[(start + row) % reel.length];
            
            // COL 0 မှာ Wild မကျရ
            if (col === 0 && symbol === 'wild') {
                const safeSymbols = reel.filter(s => s !== 'wild');
                symbol = safeSymbols[Math.floor(Math.random() * safeSymbols.length)];
            }
            
            result[col][row] = symbol;
        }
    }
    
    // 🔥 Check if we need to force no win
    if (shouldForceNoWin()) {
        console.log('🎯 FORCING TRUE NO WIN');
        forceTrueNoWin(result);
    }
    
    return result;
}

// ============================================
// RESET NO WIN CYCLE (ပြန်စချင်ရင်)
// ============================================
function resetNoWinCycle() {
    noWinCycle.currentPhase = 'normal';
    noWinCycle.normalSpins = 0;
    noWinCycle.noWinSpins = 0;
    console.log('🔄 No win cycle reset to NORMAL phase');
}

// ============================================
// TOGGLE NO WIN CYCLE (ပိတ်/ဖွင့်)
// ============================================
function toggleNoWinCycle() {
    noWinCycle.enabled = !noWinCycle.enabled;
    console.log(`🎮 No win cycle ${noWinCycle.enabled ? 'ENABLED' : 'DISABLED'}`);
    return noWinCycle.enabled;
}
       
        // ===== BET CONTROLS =====
        function initBetControls() {
            const dec = document.getElementById('decBet');
            const inc = document.getElementById('incBet');
            const unitBtn = document.getElementById('unitSelectBtn');
            const betLabel = document.getElementById('betAmountLabel');

            dec.onclick = () => {
                if (gameState.betIndex > 0) {
                    gameState.betIndex--;
                    gameState.betAmount = BET_TABLE[gameState.betType][gameState.betIndex];
                    betLabel.textContent = gameState.betAmount;
                    updateBalanceDisplay();
                }
            };
            inc.onclick = () => {
                if (gameState.betIndex < BET_TABLE[gameState.betType].length - 1) {
                    gameState.betIndex++;
                    gameState.betAmount = BET_TABLE[gameState.betType][gameState.betIndex];
                    betLabel.textContent = gameState.betAmount;
                    updateBalanceDisplay();
                }
            };
            unitBtn.onclick = () => openCModal();
        }

        function openCModal() {
            const modal = document.getElementById('cModalOverlay');
            const optionsDiv = document.getElementById('cOptions');
            optionsDiv.innerHTML = '';
            ['1C', '5C', '10C', '20C', '50C'].forEach(c => {
                const btn = document.createElement('div');
                btn.className = 'c-option';
                if (gameState.betType === c) btn.classList.add('active');
                btn.textContent = c;
                btn.onclick = () => {
                    gameState.betType = c;
                    gameState.betIndex = 0;
                    gameState.betAmount = BET_TABLE[c][0];
                    document.getElementById('betAmountLabel').textContent = gameState.betAmount;
                    document.getElementById('unitSelectBtn').textContent = c;
                    updateBalanceDisplay();
                    closeCModal();
                };
                optionsDiv.appendChild(btn);
            });
            modal.classList.add('show');
        }

        function closeCModal() {
            document.getElementById('cModalOverlay').classList.remove('show');
        }

     // ============================================
// 20. AUTO SPIN (LONG PRESS) WITH INDICATOR (FIXED)
// ============================================
let pressTimer = null;
let isLongPress = false;
let autoSpinCount = 0;
let autoSpinMax = 0;
let autoSpinInterval = null;
let autoSpinPaused = false; 
let isWaitingForWin = false;
const longPressDuration = 500;

// ===== SAFE NOTIFICATION =====
function safeShowNotification(msg, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(msg, type);
    } else if (typeof showToast === 'function') {
        showToast(msg);
    } else {
        console.log(`🔔 ${msg}`);
        alert(msg);
    }
}

// ===== SETUP LONG PRESS =====
function setupLongPress(btn) {
    if (!btn) {
        console.error('❌ Button not found for long press');
        return;
    }
    
    console.log('✅ Setting up long press on button');
    
    // Remove existing listeners
    btn.removeEventListener('mousedown', startPress);
    btn.removeEventListener('mouseup', cancelPress);
    btn.removeEventListener('mouseleave', cancelPress);
    btn.removeEventListener('touchstart', startPress);
    btn.removeEventListener('touchend', cancelPress);
    btn.removeEventListener('touchcancel', cancelPress);
    
    // Add fresh listeners
    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', cancelPress);
    btn.addEventListener('mouseleave', cancelPress);
    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', cancelPress);
    btn.addEventListener('touchcancel', cancelPress);
}

function startPress(e) {
    e.preventDefault();
    
    console.log('🖱️ Press started');
    
    if (window.gameState.autoSpinActive) {
        console.log('Auto spin already active');
        return;
    }
    if (window.gameState.isSpinning) {
        console.log('Game is spinning');
        return;
    }
    
    isLongPress = false;
    
    if (pressTimer) clearTimeout(pressTimer);
    
    pressTimer = setTimeout(() => {
        console.log('⏰ Long press detected!');
        isLongPress = true;
        
        // Vibration feedback
        if (navigator.vibrate) navigator.vibrate(50);
        
        // Check balance
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.balance < window.gameState.betAmount) {
            safeShowNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
            return;
        }
        
        if (window.gameState.isFreeSpinning) {
            safeShowNotification('Free Spin အတွင်း Auto Spin မရပါ။', 'error');
            return;
        }
        
        showAutoSpinModal();
        
    }, longPressDuration);
}

function cancelPress(e) {
    clearTimeout(pressTimer);
    
    if (!isLongPress && !window.gameState.autoSpinActive && !window.gameState.isSpinning && !isWaitingForWin) {
        console.log('👉 Short press - starting spin');
        if (typeof spin === 'function') spin();
    }
    
    isLongPress = false;
}

// ===== SHOW AUTO SPIN MODAL (FIXED) =====
function showAutoSpinModal() {
    console.log('🎯 Showing auto spin modal');
    
    let modal = document.getElementById('autoSpinModal');
    
    if (!modal) {
        console.log('Creating new modal');
        modal = document.createElement('div');
        modal.id = 'autoSpinModal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            z-index: 100000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(145deg, #1a0f0a, #0d0705); border: 2px solid #ffd700; border-radius: 30px; padding: 25px 30px; text-align: center; min-width: 280px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #ffd700; margin:0;"><i class="fas fa-sync-alt"></i> Auto Spin</h3>
                    <button onclick="closeAutoSpinModal()" style="background: none; border: none; color: #ffd700; font-size: 28px; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 20px;">
                    <p style="color: white; margin-bottom: 15px;">အကြိမ်ရေ ရွေးချယ်ပါ</p>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <button onclick="startAutoSpin(10)" style="padding: 12px; background: #ffd700; border: none; border-radius: 15px; font-weight: bold; cursor: pointer;">၁၀ ကြိမ်</button>
                        <button onclick="startAutoSpin(25)" style="padding: 12px; background: #ffd700; border: none; border-radius: 15px; font-weight: bold; cursor: pointer;">၂၅ ကြိမ်</button>
                        <button onclick="startAutoSpin(50)" style="padding: 12px; background: #ffd700; border: none; border-radius: 15px; font-weight: bold; cursor: pointer;">၅၀ ကြိမ်</button>
                        <button onclick="startAutoSpin(100)" style="padding: 12px; background: #ffd700; border: none; border-radius: 15px; font-weight: bold; cursor: pointer;">၁၀၀ ကြိမ်</button>
                    </div>
                </div>
                <button onclick="closeAutoSpinModal()" style="background: transparent; border: 1px solid #ffd700; padding: 8px 20px; border-radius: 20px; color: #ffd700; cursor: pointer; width: 100%;">မလုပ်တော့ပါ</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
    console.log('✅ Modal display set to flex');
}

function closeAutoSpinModal() {
    const modal = document.getElementById('autoSpinModal');
    if (modal) modal.style.display = 'none';
}

// ===== START AUTO SPIN =====
function startAutoSpin(count) {
    console.log('🎯 startAutoSpin called with count:', count);
    
    closeAutoSpinModal();
    
    if (window.gameState.autoSpinActive) {
        console.log('Auto spin already active');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.balance < window.gameState.betAmount) {
        safeShowNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။', 'error');
        return;
    }
    
    window.gameState.autoSpinActive = true;
    autoSpinCount = 0;
    autoSpinMax = count;
    isWaitingForWin = false;
    
    // Change spin button to STOP mode
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.innerHTML = '<i class="fas fa-stop"></i> STOP';
        spinBtn.classList.add('stop-mode');
        spinBtn.onclick = () => stopAutoSpin();
    }
    
    showAutoSpinIndicator(count);
    safeShowNotification(`Auto Spin စတင်ပါပြီ။ (${count} ကြိမ်)`, 'info');
    
    performAutoSpin();
}

// ===== AUTO SPIN INDICATOR =====
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

function hideAutoSpinIndicator() {
    const indicator = document.getElementById('autoSpinIndicator');
    if (indicator) indicator.remove();
}


function performAutoSpin() {
    console.log('🔄🔁 performAutoSpin CALLED at:', new Date().toLocaleTimeString());
    console.log('   autoSpinActive:', window.gameState.autoSpinActive);
    console.log('   autoSpinPaused:', autoSpinPaused);
    console.log('   isSpinning:', window.gameState.isSpinning);
    console.log('   waitingForWinAnimation:', window.gameState.waitingForWinAnimation);
    console.log('   isWaitingForWin:', isWaitingForWin);
    console.log('   suspenseMode:', window.gameState.suspenseMode);
    console.log('   isFreeSpinning:', window.gameState.isFreeSpinning);
    
    if (!window.gameState.autoSpinActive) {
        console.log('❌ Auto spin not active, exiting');
        return;
    }

    // 🔥 Auto spin paused စစ်ဆေး
    if (autoSpinPaused === true) {
        console.log('⏸️ Auto spin is paused, waiting 500ms...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.balance < window.gameState.betAmount) {
        console.log('💰 Balance insufficient, stopping auto spin');
        stopAutoSpin('balance');
        showNotification('လက်ကျန်ငွေ မလုံလောက်ပါ။ Auto Spin ရပ်ဆိုင်းလိုက်သည်။', 'error');
        return;
    }

    if (window.gameState.isSpinning) {
        console.log('🎰 Game is spinning, waiting...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    if (window.gameState.waitingForWinAnimation || isWaitingForWin) {
        console.log('🎬 Win animation playing, waiting...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    if (window.gameState.suspenseMode === true) {
        console.log('⏳ Suspense mode active, waiting...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    if (window.gameState.isFreeSpinning === true) {
        console.log('🎰 Free spin mode active, waiting...');
        setTimeout(performAutoSpin, 500);
        return;
    }

    console.log('✅ ALL CONDITIONS CLEAR! Starting next auto spin...');
    clearAllWinHighlights();
    isWaitingForWin = true;
    spin();
}


function clearAllWinHighlights() {
    // Clear win highlights from grid cells
    const cells = document.querySelectorAll('.reel-cell, .grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('winner', 'win', 'win-pulse', 'buffalo-win', 'mega-win');
        
        // Remove win overlay if exists
        const overlay = cell.querySelector('.win-overlay');
        if (overlay) overlay.style.opacity = '0';
        
        // Remove corner sparkles
        const sparkles = cell.querySelectorAll('.corner-sparkle');
        sparkles.forEach(s => {
            s.style.opacity = '0';
            s.style.animation = 'none';
        });
    });
    
    // Remove floating win numbers
    const floatingNumbers = document.querySelectorAll('.floating-win-number');
    floatingNumbers.forEach(el => el.remove());
    
    console.log('🧹 All win highlights cleared');
}
// ===== HANDLE AUTO SPIN COMPLETE =====

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
        // 🔥 Animation ရဲ့ အတိအကျကြာချိန်အတိုင်း delay ထားမယ်
        let delay = 2000; // default

        if (winAmount >= 50000) {
            delay = 11000;  // Mega win → 11 စက္ကန့်
        } else if (winAmount >= 15000) {
            delay = 11000;   // Super win → 9 စက္ကန့်
        } else if (winAmount >= 5000) {
            delay = 11000;   // Big win → 7 စက္ကန့်
        } else if (winAmount > 0) {
            delay = 4000;   // Normal win → 4 စက္ကန့်
        }

        console.log(`💰 Win amount: ${winAmount}, delay: ${delay}ms (animation duration)`);

        if (autoSpinInterval) clearTimeout(autoSpinInterval);
        autoSpinInterval = setTimeout(() => {
            console.log('▶️ Animation delay completed, resuming auto spin');
            isWaitingForWin = false;
            performAutoSpin();
        }, delay);
    }
} 
// ===== STOP AUTO SPIN =====
function stopAutoSpin(reason = 'manual') {
    console.log('🛑 Stopping auto spin, reason:', reason);
    
    window.gameState.autoSpinActive = false;
    isWaitingForWin = false;
    
    if (autoSpinInterval) {
        clearTimeout(autoSpinInterval);
        autoSpinInterval = null;
    }
    
    hideAutoSpinIndicator();
    
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN';
        spinBtn.classList.remove('stop-mode');
        spinBtn.onclick = () => {
            if (!window.gameState.isSpinning && !window.gameState.autoSpinActive) {
                if (typeof spin === 'function') spin();
            }
        };
    }
    
    if (reason === 'manual') {
        safeShowNotification('Auto Spin ရပ်ဆိုင်းလိုက်သည်။', 'info');
    }
}

// ===== RESET AUTO SPIN =====
function resetAutoSpin() {
    if (window.gameState.autoSpinActive) {
        stopAutoSpin('reset');
    }
    autoSpinCount = 0;
    autoSpinMax = 0;
    if (autoSpinInterval) {
        clearTimeout(autoSpinInterval);
        autoSpinInterval = null;
    }
    isWaitingForWin = false;
}

// Make functions global
window.startAutoSpin = startAutoSpin;
window.stopAutoSpin = stopAutoSpin;
window.closeAutoSpinModal = closeAutoSpinModal;
window.handleAutoSpinComplete = handleAutoSpinComplete;
window.resetAutoSpin = resetAutoSpin;
window.setupLongPress = setupLongPress;

console.log('✅ Auto Spin module loaded');
        // ===== PARTICLES =====
        function createParticles() {
            const container = document.getElementById('bgParticles');
            for (let i = 0; i < 50; i++) {
                const p = document.createElement('div');
                p.className = 'bg-particle';
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDelay = Math.random() * 8 + 's';
                p.style.animationDuration = (6 + Math.random() * 4) + 's';
                container.appendChild(p);
            }
        }

        // ===== INIT =====
        window.onload = () => {
            initSlotGrid();
            initBetControls();
            updateBalanceDisplay();
             updateUI();
            createParticles();
            document.getElementById('waysNumber').innerText = '1024';
            
            const spinBtn = document.getElementById('spinBtn');
            spinBtn.onclick = () => {
                if (!gameState.isSpinning && !autoSpinActive) spin();
            };
            setupLongPress(spinBtn);
        };
