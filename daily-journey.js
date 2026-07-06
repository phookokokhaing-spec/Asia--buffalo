// ============================================
// DAILY GOALS / CASHBACK / JOURNEY SCRIPT
// ============================================

// ===== STATE =====
let dailyGoalsState = {
    streak: 0,
    currentDay: 0,
    deposits: [0, 0, 0, 0, 0],
    claimed: [false, false, false, false, false],
    totalDeposits: 0,
    lastDepositDate: null,
    delayBonus: { totalDeposits: 0, claimed: false }
};

let journeyState = {
    currentWorld: 1,
    worldsUnlocked: 1,
    totalSpins: 0,
    biggestWin: 0,
    worldProgress: { 1: 0, 2: 0, 3: 0, 4: 0 }
};

// ===== TAB SWITCHING =====
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    const selected = document.getElementById(tabId);
    if (selected) selected.style.display = 'block';
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// ===== FORMAT NUMBER =====
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ===== SHOW NOTIFICATION =====
function showLobbyNotification(message) {
    console.log('Notification:', message);
    // Use your existing notification system
}

// ===== LOAD DAILY GOALS =====
async function loadDailyGoals() {
    if (!window.currentUser || !window.db) return;
    
    try {
        const doc = await window.db.collection('users')
            .doc(window.currentUser.id)
            .collection('dailyGoals')
            .doc('progress').get();
        
        if (doc.exists) {
            dailyGoalsState = { ...dailyGoalsState, ...doc.data() };
        }
        
        updateDailyGoalsUI();
        startCountdown();
    } catch (e) {
        console.error('Load daily goals error:', e);
    }
}

// ===== UPDATE DAILY GOALS UI =====
function updateDailyGoalsUI() {
    const streakText = document.getElementById('streakText');
    const totalDeposits = document.getElementById('totalDeposits');
    const cashbackReady = document.getElementById('cashbackReady');
    const currentDay = document.getElementById('currentDay');
    
    if (streakText) streakText.textContent = dailyGoalsState.streak + ' Day Streak';
    if (totalDeposits) totalDeposits.textContent = formatNumber(dailyGoalsState.totalDeposits) + ' KS';
    
    const cashbackAmount = Math.floor(dailyGoalsState.totalDeposits * 0.05);
    if (cashbackReady) cashbackReady.textContent = formatNumber(cashbackAmount) + ' KS';
    if (currentDay) currentDay.textContent = dailyGoalsState.currentDay + ' / 5';
    
    // Day cards
    for (let i = 1; i <= 5; i++) {
        const depositEl = document.getElementById('day' + i + 'Deposit');
        const progressEl = document.getElementById('day' + i + 'Progress');
        const btn = document.getElementById('day' + i + 'Btn');
        const card = document.getElementById('day' + i + 'Card');
        
        if (depositEl) depositEl.textContent = formatNumber(dailyGoalsState.deposits[i-1]) + ' KS';
        if (progressEl) progressEl.style.width = (dailyGoalsState.deposits[i-1] > 0 ? 100 : 0) + '%';
        
        if (btn) {
            if (dailyGoalsState.claimed[i-1]) {
                btn.textContent = 'Claimed';
                btn.disabled = true;
                btn.classList.add('claimed');
            } else if (dailyGoalsState.deposits[i-1] > 0) {
                btn.textContent = 'Claim';
                btn.disabled = false;
                btn.classList.remove('locked');
            } else {
                btn.textContent = 'Locked';
                btn.disabled = true;
            }
        }
        
        if (card) {
            card.classList.remove('completed', 'active');
            if (dailyGoalsState.claimed[i-1]) card.classList.add('completed');
            else if (dailyGoalsState.deposits[i-1] > 0) card.classList.add('active');
        }
    }
    
    // Day 5 cashback
    const day5Btn = document.getElementById('day5Btn');
    const day5Cashback = document.getElementById('day5Cashback');
    if (day5Cashback) day5Cashback.textContent = formatNumber(cashbackAmount) + ' KS';
    
    if (day5Btn) {
        if (dailyGoalsState.currentDay >= 5 && dailyGoalsState.deposits[4] > 0 && !dailyGoalsState.claimed[4]) {
            day5Btn.disabled = false;
            day5Btn.textContent = 'CLAIM CASHBACK';
        } else if (dailyGoalsState.claimed[4]) {
            day5Btn.disabled = true;
            day5Btn.textContent = 'Claimed';
        } else {
            day5Btn.disabled = true;
            day5Btn.textContent = 'Locked';
        }
    }
    
    // Delay bonus
    const delayTotal = document.getElementById('delayTotalDeposits');
    const delayBonus = document.getElementById('delayBonusAmount');
    const delayClaimable = document.getElementById('delayClaimable');
    const delayBtn = document.getElementById('delayClaimBtn');
    
    const delayBonusAmount = Math.floor(dailyGoalsState.delayBonus.totalDeposits * 0.05);
    
    if (delayTotal) delayTotal.textContent = formatNumber(dailyGoalsState.delayBonus.totalDeposits) + ' KS';
    if (delayBonus) delayBonus.textContent = formatNumber(delayBonusAmount) + ' KS';
    if (delayClaimable) delayClaimable.textContent = formatNumber(delayBonusAmount) + ' KS';
    
    if (delayBtn) {
        if (dailyGoalsState.delayBonus.claimed || delayBonusAmount <= 0) {
            delayBtn.disabled = true;
            delayBtn.textContent = dailyGoalsState.delayBonus.claimed ? 'Claimed' : 'No Bonus';
        } else {
            delayBtn.disabled = false;
            delayBtn.textContent = 'Claim Delay Bonus';
        }
    }
}

// ===== CLAIM DAILY REWARD =====
async function claimDailyReward(day) {
    if (!window.currentUser || !window.db) {
        showLobbyNotification('Please login first!');
        return;
    }
    
    if (dailyGoalsState.claimed[day-1]) {
        showLobbyNotification('Already claimed!');
        return;
    }
    
    if (dailyGoalsState.deposits[day-1] <= 0) {
        showLobbyNotification('No deposit found!');
        return;
    }
    
    const reward = dailyGoalsState.deposits[day-1];
    
    try {
        const newBalance = (window.currentUser.balance || 0) + reward;
        await window.db.collection('users').doc(window.currentUser.id).update({
            balance: newBalance
        });
        
        dailyGoalsState.claimed[day-1] = true;
        
        await window.db.collection('users').doc(window.currentUser.id)
            .collection('dailyGoals').doc('progress').set(dailyGoalsState);
        
        window.currentUser.balance = newBalance;
        updateUserUI(window.currentUser);
        updateDailyGoalsUI();
        
        showLobbyNotification('+' + formatNumber(reward) + ' KS claimed!');
        
    } catch (e) {
        console.error('Claim error:', e);
        showLobbyNotification('Claim failed!');
    }
}

// ===== CLAIM CASHBACK =====
async function claimCashback() {
    if (!window.currentUser || !window.db) {
        showLobbyNotification('Please login first!');
        return;
    }
    
    if (dailyGoalsState.currentDay < 5) {
        showLobbyNotification('Complete 5 days first!');
        return;
    }
    
    const cashbackAmount = Math.floor(dailyGoalsState.totalDeposits * 0.05);
    if (cashbackAmount <= 0) {
        showLobbyNotification('No cashback available!');
        return;
    }
    
    try {
        const newBalance = (window.currentUser.balance || 0) + cashbackAmount;
        await window.db.collection('users').doc(window.currentUser.id).update({
            balance: newBalance
        });
        
        // Reset
        dailyGoalsState = {
            streak: 0,
            currentDay: 0,
            deposits: [0, 0, 0, 0, 0],
            claimed: [false, false, false, false, false],
            totalDeposits: 0,
            lastDepositDate: null,
            delayBonus: dailyGoalsState.delayBonus
        };
        
        await window.db.collection('users').doc(window.currentUser.id)
            .collection('dailyGoals').doc('progress').set(dailyGoalsState);
        
        window.currentUser.balance = newBalance;
        updateUserUI(window.currentUser);
        updateDailyGoalsUI();
        
        showLobbyNotification('5% Cashback: +' + formatNumber(cashbackAmount) + ' KS!');
        
    } catch (e) {
        console.error('Cashback error:', e);
        showLobbyNotification('Cashback failed!');
    }
}

// ===== CLAIM DELAY BONUS =====
async function claimDelayBonus() {
    if (!window.currentUser || !window.db) {
        showLobbyNotification('Please login first!');
        return;
    }
    
    if (dailyGoalsState.delayBonus.claimed) {
        showLobbyNotification('Already claimed!');
        return;
    }
    
    const bonusAmount = Math.floor(dailyGoalsState.delayBonus.totalDeposits * 0.05);
    if (bonusAmount <= 0) {
        showLobbyNotification('No bonus available!');
        return;
    }
    
    try {
        const newBalance = (window.currentUser.balance || 0) + bonusAmount;
        await window.db.collection('users').doc(window.currentUser.id).update({
            balance: newBalance
        });
        
        dailyGoalsState.delayBonus.claimed = true;
        dailyGoalsState.delayBonus.totalDeposits = 0;
        
        await window.db.collection('users').doc(window.currentUser.id)
            .collection('dailyGoals').doc('progress').set(dailyGoalsState);
        
        window.currentUser.balance = newBalance;
        updateUserUI(window.currentUser);
        updateDailyGoalsUI();
        
        showLobbyNotification('Delay Bonus: +' + formatNumber(bonusAmount) + ' KS!');
        
    } catch (e) {
        console.error('Delay bonus error:', e);
        showLobbyNotification('Claim failed!');
    }
}

// ===== COUNTDOWN TIMER =====
function startCountdown() {
    const nextReset = document.getElementById('nextReset');
    if (!nextReset) return;
    
    function update() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        nextReset.textContent = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }
    
    update();
    setInterval(update, 1000);
}

// ===== RECORD DEPOSIT =====
async function recordDeposit(amount) {
    if (!window.currentUser || !window.db) return;
    
    const now = new Date();
    const today = now.toDateString();
    
    if (dailyGoalsState.lastDepositDate !== today) {
        dailyGoalsState.currentDay = Math.min(dailyGoalsState.currentDay + 1, 5);
        dailyGoalsState.lastDepositDate = today;
        
        if (dailyGoalsState.currentDay === 1) {
            dailyGoalsState.streak = 0;
            dailyGoalsState.deposits = [0, 0, 0, 0, 0];
            dailyGoalsState.claimed = [false, false, false, false, false];
            dailyGoalsState.totalDeposits = 0;
        }
    }
    
    const dayIndex = dailyGoalsState.currentDay - 1;
    if (dayIndex >= 0 && dayIndex < 5) {
        dailyGoalsState.deposits[dayIndex] += amount;
        dailyGoalsState.totalDeposits += amount;
        dailyGoalsState.streak = dailyGoalsState.currentDay;
        dailyGoalsState.delayBonus.totalDeposits += amount;
    }
    
    try {
        await window.db.collection('users').doc(window.currentUser.id)
            .collection('dailyGoals').doc('progress').set(dailyGoalsState);
        updateDailyGoalsUI();
    } catch (e) {
        console.error('Record deposit error:', e);
    }
}

// ===== JOURNEY FUNCTIONS =====
async function loadJourney() {
    if (!window.currentUser || !window.db) return;
    
    try {
        const doc = await window.db.collection('users').doc(window.currentUser.id)
            .collection('journey').doc('progress').get();
        
        if (doc.exists) {
            journeyState = { ...journeyState, ...doc.data() };
        }
        
        updateJourneyUI();
    } catch (e) {
        console.error('Load journey error:', e);
    }
}

function updateJourneyUI() {
    const worldsUnlocked = document.getElementById('worldsUnlocked');
    const totalSpins = document.getElementById('totalSpins');
    const biggestWin = document.getElementById('journeyBiggestWin');
    
    if (worldsUnlocked) worldsUnlocked.textContent = journeyState.worldsUnlocked + ' / 4';
    if (totalSpins) totalSpins.textContent = formatNumber(journeyState.totalSpins);
    if (biggestWin) biggestWin.textContent = formatNumber(journeyState.biggestWin) + ' KS';
    
    const world1Progress = document.getElementById('world1Progress');
    if (world1Progress) world1Progress.textContent = (journeyState.worldProgress[1] || 0) + '/20';
    
    // Path nodes
    for (let i = 1; i <= 4; i++) {
        const node = document.getElementById('pathNode' + i);
        const line = document.getElementById('pathLine' + i);
        const worldCard = document.getElementById('world' + i);
        
        if (node) {
            if (i <= journeyState.worldsUnlocked) {
                node.classList.remove('locked');
                node.classList.add('active');
                node.innerHTML = i;
            } else {
                node.classList.add('locked');
                node.classList.remove('active');
                node.innerHTML = '<i class="fas fa-lock"></i>';
            }
        }
        
        if (line) {
            line.classList.toggle('locked', i >= journeyState.worldsUnlocked);
        }
        
        if (worldCard) {
            worldCard.classList.toggle('locked', i > journeyState.worldsUnlocked);
        }
    }
    
    // Rewards
    for (let i = 1; i <= 4; i++) {
        const reward = document.getElementById('reward' + i);
        if (reward) {
            reward.classList.toggle('locked', i >= journeyState.worldsUnlocked);
        }
    }
}

function enterWorld(worldId) {
    if (worldId > journeyState.worldsUnlocked) {
        showLobbyNotification('World locked! Complete previous world first.');
        return;
    }
    
    showGameContainer();
    journeyState.currentWorld = worldId;
    
    if (window.currentUser && window.db) {
        window.db.collection('users').doc(window.currentUser.id)
            .collection('journey').doc('progress').set(journeyState)
            .catch(e => console.error('Save journey error:', e));
    }
    
    showLobbyNotification('Entering World ' + worldId + '...');
}

async function updateWorldProgress(winAmount) {
    journeyState.totalSpins++;
    
    if (winAmount > journeyState.biggestWin) {
        journeyState.biggestWin = winAmount;
    }
    
    const worldId = journeyState.currentWorld;
    journeyState.worldProgress[worldId] = (journeyState.worldProgress[worldId] || 0) + 1;
    
    const requiredSpins = { 1: 20, 2: 15, 3: 25, 4: 30 };
    if (journeyState.worldProgress[worldId] >= requiredSpins[worldId]) {
        if (worldId < 4 && journeyState.worldsUnlocked === worldId) {
            journeyState.worldsUnlocked++;
            
            const rewards = { 1: 10000, 2: 100, 3: 500000, 4: 1000000 };
            showLobbyNotification('World ' + worldId + ' Complete! +' + formatNumber(rewards[worldId]) + ' reward!');
        }
    }
    
    if (window.currentUser && window.db) {
        try {
            await window.db.collection('users').doc(window.currentUser.id)
                .collection('journey').doc('progress').set(journeyState);
        } catch (e) {
            console.error('Save journey error:', e);
        }
    }
    
    updateJourneyUI();
}

// ===== INITIALIZE =====
// Call these in your login success handler:
// loadDailyGoals();
// loadJourney();

// Export for global access
window.showTab = showTab;
window.claimDailyReward = claimDailyReward;
window.claimCashback = claimCashback;
window.claimDelayBonus = claimDelayBonus;
window.enterWorld = enterWorld;
window.recordDeposit = recordDeposit;
window.updateWorldProgress = updateWorldProgress;
window.loadDailyGoals = loadDailyGoals;
window.loadJourney = loadJourney;
